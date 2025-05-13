const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('students.userId', 'firstName lastName')
            .lean();
            
        res.render('courses/index', {
            title: 'Available Courses',
            description: 'Browse our collection of expert-led courses',
            courses,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).render('error', {
            message: 'Error fetching courses',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).render('error', {
                message: 'Course not found',
                error: {}
            });
        }

        const isEnrolled = course.students.some(
            student => student.userId.toString() === req.user._id.toString()
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
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).render('error', {
            message: 'Error fetching course',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
};

exports.enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            req.flash('error_msg', 'Course not found');
            return res.redirect('/courses');
        }

        // Check if user is already enrolled
        const isAlreadyEnrolled = course.students.some(
            student => student.userId.toString() === req.user._id.toString()
        );

        if (isAlreadyEnrolled) {
            req.flash('info_msg', 'You are already enrolled in this course');
            return res.redirect(`/courses/${course._id}`);
        }

        // Add user to course students
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
        req.flash('success_msg', 'Successfully enrolled in course!');
        res.redirect(`/courses/${course._id}`);

    } catch (error) {
        console.error('Error enrolling in course:', error);
        req.flash('error_msg', 'Error enrolling in course. Please try again.');
        res.redirect('/courses');
    }
};

exports.completeVideo = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const isEnrolled = course.students.some(
            student => student.userId.toString() === req.user._id.toString()
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
}; 