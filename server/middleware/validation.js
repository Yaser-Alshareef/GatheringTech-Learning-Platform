const Joi = require('joi');
const ExpressError = require('../../utils/ExpressError');

// Course Validation Schema
const courseSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Course title is required',
            'string.min': 'Course title must be at least 3 characters',
            'string.max': 'Course title cannot exceed 100 characters'
        }),
    description: Joi.string()
        .required()
        .min(10)
        .max(1000)
        .messages({
            'string.empty': 'Course description is required',
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 1000 characters'
        }),
    price: Joi.number()
        .required()
        .min(0)
        .messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price cannot be negative'
        }),
    category: Joi.string()
        .required()
        .valid('programming', 'design', 'business', 'marketing', 'music', 'other')
        .messages({
            'any.only': 'Invalid category selected'
        }),
    level: Joi.string()
        .required()
        .valid('beginner', 'intermediate', 'advanced')
        .messages({
            'any.only': 'Invalid level selected'
        }),
    image: Joi.string()
        .uri()
        .messages({
            'string.uri': 'Invalid image URL'
        })
});

// User Validation Schema
const userSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required'
        }),
    name: Joi.string()
        .required()
        .min(2)
        .max(50)
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters'
        }),
    password: Joi.string()
        .required()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'string.min': 'Password must be at least 6 characters'
        }),
    role: Joi.string()
        .valid('student', 'instructor', 'admin')
        .default('student')
        .messages({
            'any.only': 'Invalid role selected'
        })
});

// Video Validation Schema
const videoSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Video title is required',
            'string.min': 'Video title must be at least 3 characters',
            'string.max': 'Video title cannot exceed 100 characters'
        }),
    description: Joi.string()
        .required()
        .min(10)
        .max(500)
        .messages({
            'string.empty': 'Video description is required',
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 500 characters'
        }),
    videoUrl: Joi.string()
        .required()
        .uri()
        .messages({
            'string.uri': 'Invalid video URL',
            'string.empty': 'Video URL is required'
        }),
    duration: Joi.string()
        .required()
        .pattern(new RegExp('^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$'))
        .messages({
            'string.pattern.base': 'Duration must be in format HH:MM:SS or MM:SS'
        }),
    order: Joi.number()
        .required()
        .min(0)
        .messages({
            'number.base': 'Order must be a number',
            'number.min': 'Order cannot be negative'
        })
});

// Section Validation Schema
const sectionSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Section title is required',
            'string.min': 'Section title must be at least 3 characters',
            'string.max': 'Section title cannot exceed 100 characters'
        }),
    description: Joi.string()
        .max(500)
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
    order: Joi.number()
        .required()
        .min(0)
        .messages({
            'number.base': 'Order must be a number',
            'number.min': 'Order cannot be negative'
        }),
    videos: Joi.array()
        .items(videoSchema)
        .min(1)
        .messages({
            'array.min': 'Section must contain at least one video'
        })
});

// Validation Middleware Functions
const validateCourse = (req, res, next) => {
    const { error } = courseSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.status(400).json({ error: msg });
        }
        throw new ExpressError(msg, 400);
    }
    next();
};

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.status(400).json({ error: msg });
        }
        throw new ExpressError(msg, 400);
    }
    next();
};

const validateSection = (req, res, next) => {
    const { error } = sectionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.status(400).json({ error: msg });
        }
        throw new ExpressError(msg, 400);
    }
    next();
};

const validateVideo = (req, res, next) => {
    const { error } = videoSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.status(400).json({ error: msg });
        }
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports = {
    validateCourse,
    validateUser,
    validateSection,
    validateVideo,
    schemas: {
        course: courseSchema,
        user: userSchema,
        section: sectionSchema,
        video: videoSchema
    }
}; 