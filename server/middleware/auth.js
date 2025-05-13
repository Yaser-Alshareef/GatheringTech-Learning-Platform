const ExpressError = require('../../utils/ExpressError');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.flash('error', 'You must be logged in to access this page');
    res.redirect('/login');
};

const ensureInstructor = (req, res, next) => {
    if (req.user && req.user.role === 'instructor') {
        return next();
    }
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(403).json({ error: 'Instructor access required' });
    }
    req.flash('error', 'You must be an instructor to access this page');
    res.redirect('/');
};

const ensureAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    req.flash('error', 'You must be an admin to access this page');
    res.redirect('/');
};

module.exports = {
    ensureAuthenticated,
    ensureInstructor,
    ensureAdmin
}; 