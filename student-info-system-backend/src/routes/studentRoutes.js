const express = require('express');
const router = express.Router();
const {
    getMySchedule,
    getMyCourses,
    addCourse,
    removeCourse,
    getStudentCourses,
    addStudent,
    searchStudents,
    getStudentDetails,
    deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (require authentication)
router.use(protect);

// Student-only routes
router.get('/my-schedule', authorize('student'), getMySchedule);
router.get('/my-courses', authorize('student'), getMyCourses);
router.post('/my-courses/:courseGroupId', authorize('student'), addCourse);
router.delete('/my-courses/:courseGroupId', authorize('student'), removeCourse);

// Secretary-only routes
router.post('/', authorize('department_secretary'), addStudent);
router.get('/search', authorize('department_secretary'), searchStudents);
router.get('/:studentId/details', authorize('department_secretary'), getStudentDetails);
router.delete('/:studentId', authorize('department_secretary'), deleteStudent);
router.get('/:studentId/courses', authorize('department_secretary'), getStudentCourses);
router.post('/:studentId/courses/:courseGroupId', authorize('department_secretary'), addCourse);
router.delete('/:studentId/courses/:courseGroupId', authorize('department_secretary'), removeCourse);

module.exports = router; 