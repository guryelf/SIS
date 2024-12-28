const express = require('express');
const router = express.Router();
const { 
    getCourseSchedule, 
    searchCourses,
    addCourseToSchedule,
    removeCourseFromSchedule,
    enrollStudent
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/schedule', getCourseSchedule);

// Protected routes
router.get('/search', protect, authorize('student', 'department_secretary'), searchCourses);

// Secretary-only routes
router.post('/schedule', protect, authorize('department_secretary'), addCourseToSchedule);
router.delete('/schedule/:id', protect, authorize('department_secretary'), removeCourseFromSchedule);
router.post('/:courseId/enroll', protect, authorize('department_secretary'), enrollStudent);

module.exports = router; 