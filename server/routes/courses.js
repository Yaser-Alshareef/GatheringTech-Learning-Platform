const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { isAuthenticated } = require('../middleware/checkAuth');

// List all courses
router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const courses = await Course.find().lean();
        res.render('courses/index', {
            title: 'Available Courses',
            description: 'Browse our collection of expert-led courses',
            courses,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

// Show course details and videos
router.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).render('error', {
                message: 'Course not found',
                error: {}
            });
        }

        // Check if user is enrolled
        const isEnrolled = course.students.some(student => 
            student.userId.toString() === req.user._id.toString()
        );

        let progress = 0;
        let completedVideos = [];
        let completed = 0;
        let total = course.videos.length;

        if (isEnrolled) {
            const studentProgress = course.getStudentProgress(req.user._id);
            if (studentProgress) {
                progress = studentProgress.progress;
                completedVideos = studentProgress.completedVideos;
                completed = completedVideos.length;
            }
        }

        res.render('courses/show', {
            title: course.title,
            description: course.description,
            course,
            isEnrolled,
            progress,
            completed,
            total,
            completedVideos,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

// Mark video as complete
router.post('/:id/complete', isAuthenticated, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const isEnrolled = course.students.some(student => 
            student.userId.toString() === req.user._id.toString()
        );

        if (!isEnrolled) {
            return res.status(403).json({ error: 'Not enrolled in course' });
        }

        const success = await course.markVideoCompleted(req.user._id, req.body.videoId);
        if (!success) {
            return res.status(400).json({ error: 'Invalid video ID' });
        }

        res.redirect(`/courses/${course._id}`);
    } catch (error) {
        console.error('Error completing video:', error);
        res.status(500).json({ error: 'Error completing video' });
    }
});

// Enroll in course
router.post('/:id/enroll', isAuthenticated, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).render('error', {
                message: 'Course not found',
                error: {}
            });
        }

        // Check if already enrolled
        const isAlreadyEnrolled = course.students.some(student => 
            student.userId.toString() === req.user._id.toString()
        );

        if (!isAlreadyEnrolled) {
            course.students.push({
                userId: req.user._id,
                enrolledAt: new Date(),
                progress: {
                    completedVideos: [],
                    lastAccessedVideo: null,
                    lastAccessedAt: new Date()
                }
            });
            await course.save();
        }

        res.redirect(`/courses/${course._id}`);
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).render('error', {
            message: 'Error enrolling in course',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

module.exports = router;
