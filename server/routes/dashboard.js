const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/checkAuth');
const dashboardController = require('../controllers/dashboardController');

/**
 * Dashboard Routes 
*/
router.get('/dashboard', isAuthenticated, dashboardController.dashboard);
router.get('/dashboard/item/:id', isAuthenticated, dashboardController.dashboardViewNote);
router.put('/dashboard/item/:id', isAuthenticated, dashboardController.dashboardUpdateNote);
router.delete('/dashboard/item-delete/:id', isAuthenticated, dashboardController.dashboardDeleteNote);
router.get('/dashboard/add', isAuthenticated, dashboardController.dashboardAddNote);
router.post('/dashboard/add', isAuthenticated, dashboardController.dashboardAddNoteSubmit);
router.get('/dashboard/search', isAuthenticated, dashboardController.dashboardSearch);
router.post('/dashboard/search', isAuthenticated, dashboardController.dashboardSearchSubmit);

module.exports = router;