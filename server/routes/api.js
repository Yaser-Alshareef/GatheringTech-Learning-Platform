const express = require('express');
const Course = require('../models/Course');
const Note = require('../models/Notes');
const { ensureAuthenticated, ensureInstructor } = require('../middleware/auth');
const { validateCourse } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected routes
router.post('/courses', ensureAuthenticated, ensureInstructor, validateCourse, async (req, res) => {
    try {
        const course = new Course({
            ...req.body,
            instructor: req.user._id
        });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/courses/:id', ensureAuthenticated, ensureInstructor, validateCourse, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        Object.assign(course, req.body);
        await course.save();
        res.json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/courses/:id', ensureAuthenticated, ensureInstructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await course.remove();
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enrollment routes
router.post('/courses/:id/enroll', ensureAuthenticated, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (course.enrolledStudents.includes(req.user._id)) {
            return res.status(400).json({ error: 'Already enrolled' });
        }
        course.enrolledStudents.push(req.user._id);
        await course.save();
        res.json({ message: 'Successfully enrolled' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Notes API Routes
router.get('/notes', ensureAuthenticated, async (req, res) => {
    try {
        const query = { user: req.user._id };
        
        // Add search functionality
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { body: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Add date range filter
        if (req.query.startDate && req.query.endDate) {
            query.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const notes = await Note.find(query)
            .sort({ updatedAt: -1 })
            .lean();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/notes/:id', ensureAuthenticated, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).lean();
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/notes', ensureAuthenticated, async (req, res) => {
    try {
        const note = new Note({
            ...req.body,
            user: req.user._id
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/notes/:id', ensureAuthenticated, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        Object.assign(note, {
            ...req.body,
            updatedAt: Date.now()
        });
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/notes/:id', ensureAuthenticated, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        await note.deleteOne();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk operations
router.post('/notes/bulk', ensureAuthenticated, async (req, res) => {
    try {
        const { notes } = req.body;
        if (!Array.isArray(notes)) {
            return res.status(400).json({ error: 'Notes must be an array' });
        }

        const notesWithUser = notes.map(note => ({
            ...note,
            user: req.user._id
        }));

        const createdNotes = await Note.insertMany(notesWithUser);
        res.status(201).json(createdNotes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/notes/bulk', ensureAuthenticated, async (req, res) => {
    try {
        const { noteIds } = req.body;
        if (!Array.isArray(noteIds)) {
            return res.status(400).json({ error: 'Note IDs must be an array' });
        }

        const result = await Note.deleteMany({
            _id: { $in: noteIds },
            user: req.user._id
        });

        res.json({ 
            message: 'Notes deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router; 