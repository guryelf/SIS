const Student = require('../models/Student');
const CourseGroup = require('../models/CourseGroup');
const User = require('../models/User');
const mongoose = require('mongoose');
const Secretary = require('../models/Secretary');

// @desc    Get student's course schedule
// @route   GET /api/students/my-schedule
// @access  Private (Student only)
exports.getMySchedule = async (req, res) => {
    try {
        // Find the student using the authenticated user's ID
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find all course groups where the student is enrolled
        const courseGroups = await CourseGroup.find({
            enrolledStudents: student._id,
            semester: 'Fall', // This should be dynamic in a real app
            year: new Date().getFullYear()
        }).populate({
            path: 'course',
            select: 'name courseNumber description level semesterHours'
        });

        // Transform the data for the frontend
        const schedule = courseGroups.map(group => ({
            _id: group._id,
            courseNumber: group.course.courseNumber,
            name: group.course.name,
            description: group.course.description,
            instructor: group.instructor,
            level: group.course.level,
            semesterHours: group.course.semesterHours,
            day: group.day,
            startTime: group.startTime,
            endTime: group.endTime
        }));

        res.json(schedule);
    } catch (error) {
        console.error('Error fetching student schedule:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get student's enrolled courses
// @route   GET /api/students/my-courses
// @access  Private (Student only)
exports.getMyCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const courseGroups = await CourseGroup.find({
            enrolledStudents: student._id,
            semester: 'Fall',
            year: new Date().getFullYear()
        }).populate('course');

        const courses = courseGroups.map(group => ({
            _id: group._id,
            courseNumber: group.course.courseNumber,
            name: group.course.name,
            description: group.course.description,
            instructor: group.instructor,
            day: group.day,
            startTime: group.startTime,
            endTime: group.endTime
        }));

        res.json(courses);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add course to student's schedule
// @route   POST /api/students/my-courses/:courseGroupId
// @access  Private (Student and Secretary)
exports.addCourse = async (req, res) => {
    try {
        let student;
        
        // If secretary is adding course for a student
        if (req.user.role === 'department_secretary') {
            student = await Student.findOne({ studentNumber: req.params.studentId });
        } else {
            // If student is adding course for themselves
            student = await Student.findOne({ user: req.user._id });
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const courseGroup = await CourseGroup.findById(req.params.courseGroupId)
            .populate('course');

        if (!courseGroup) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is already enrolled
        if (courseGroup.enrolledStudents.includes(student._id)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Check if course is full
        if (courseGroup.enrolledStudents.length >= courseGroup.capacity) {
            return res.status(400).json({ message: 'Course is full' });
        }

        // Check for time conflicts
        const existingCourses = await CourseGroup.find({
            enrolledStudents: student._id,
            semester: courseGroup.semester,
            year: courseGroup.year,
            day: courseGroup.day
        });

        const hasConflict = existingCourses.some(existing => {
            const newStart = parseInt(courseGroup.startTime.split(':')[0]);
            const newEnd = parseInt(courseGroup.endTime.split(':')[0]);
            const existingStart = parseInt(existing.startTime.split(':')[0]);
            const existingEnd = parseInt(existing.endTime.split(':')[0]);

            return (newStart >= existingStart && newStart < existingEnd) ||
                   (newEnd > existingStart && newEnd <= existingEnd) ||
                   (newStart <= existingStart && newEnd >= existingEnd);
        });

        if (hasConflict) {
            return res.status(400).json({ message: 'Time conflict with existing course' });
        }

        // Add student to course
        courseGroup.enrolledStudents.push(student._id);
        await courseGroup.save();

        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove course from student's schedule
// @route   DELETE /api/students/my-courses/:courseGroupId
// @access  Private (Student only)
exports.removeCourse = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const courseGroup = await CourseGroup.findById(req.params.courseGroupId);
        if (!courseGroup) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is enrolled
        if (!courseGroup.enrolledStudents.includes(student._id)) {
            return res.status(400).json({ message: 'Not enrolled in this course' });
        }

        // Remove student from course
        courseGroup.enrolledStudents = courseGroup.enrolledStudents.filter(
            id => !id.equals(student._id)
        );
        await courseGroup.save();

        res.json({ message: 'Successfully removed from course' });
    } catch (error) {
        console.error('Error removing course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get student's courses (for secretary)
// @route   GET /api/students/:studentId/courses
// @access  Private (Secretary only)
exports.getStudentCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ studentNumber: req.params.studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const courseGroups = await CourseGroup.find({
            enrolledStudents: student._id,
            semester: 'Fall',
            year: new Date().getFullYear()
        }).populate('course');

        const courses = courseGroups.map(group => ({
            _id: group._id,
            courseNumber: group.course.courseNumber,
            name: group.course.name,
            description: group.course.description,
            instructor: group.instructor,
            day: group.day,
            startTime: group.startTime,
            endTime: group.endTime
        }));

        res.json(courses);
    } catch (error) {
        console.error('Error fetching student courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add new student
// @route   POST /api/students
// @access  Private (Secretary only)
exports.addStudent = async (req, res) => {
    try {
        console.log('Request user:', req.user);
        console.log('Received student data:', req.body);

        const {
            name, studentNumber, idNumber, currentAddress,
            permanentAddress, dateOfBirth, gender, class: classYear,
            program, password, email
        } = req.body;

        // Validate required fields
        if (!name || !studentNumber || !idNumber || !email) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: 'Name, student number, ID number, and email are required'
            });
        }

        // Check for existing student number or ID
        const existingStudent = await Student.findOne({
            $or: [
                { studentNumber },
                { idNumber }
            ]
        });

        if (existingStudent) {
            return res.status(400).json({
                message: 'Student number or ID number already exists'
            });
        }

        // Check for existing email in User collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }

        // Find the secretary's department
        const secretary = await Secretary.findOne({ user: req.user._id })
            .populate('department');

        if (!secretary) {
            return res.status(400).json({
                message: 'Secretary not found or not properly associated with a department'
            });
        }

        if (!secretary.department) {
            return res.status(400).json({
                message: 'Secretary is not associated with any department'
            });
        }

        console.log('Secretary found:', secretary);
        console.log('Department found:', secretary.department);

        // Create user account first
        const user = new User({
            username: studentNumber,
            email,
            password: req.body.password, // Use password directly from request body
            role: 'student'
        });

        await user.save();
        console.log('Created user:', { ...user.toObject(), password: '[HIDDEN]' });

        // Create student record without password (password is stored in User model)
        const student = new Student({
            name,
            studentNumber,
            idNumber,
            currentAddress: currentAddress || 'Not Provided',
            permanentAddress: permanentAddress || 'Not Provided',
            currentPhone: req.body.currentPhone || 'Not Provided',
            permanentPhone: req.body.permanentPhone || 'Not Provided',
            dateOfBirth: dateOfBirth || new Date(),
            gender: gender || 'Not Specified',
            class: classYear || 'first year',
            mainDepartment: secretary.department._id,
            program: program || 'undergraduate',
            user: user._id
        });

        console.log('Attempting to save student:', student);
        await student.save();
        console.log('Student saved successfully');

        res.status(201).json({ 
            message: 'Student added successfully', 
            student: {
                name: student.name,
                studentNumber: student.studentNumber,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error adding student:', error);
        
        // If user was created but student creation failed, clean up the user
        if (error.student && error.user) {
            try {
                await User.findByIdAndDelete(error.user._id);
            } catch (cleanupError) {
                console.error('Error cleaning up user:', cleanupError);
            }
        }
        
        let errorMessage = 'Failed to add student';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
        } else if (error.code === 11000) {
            errorMessage = 'Duplicate key error. Student number, ID number, or email already exists.';
        }

        res.status(500).json({ 
            message: errorMessage,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Search students
// @route   GET /api/students/search
// @access  Private (Secretary only)
exports.searchStudents = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const students = await Student.find({
            $or: [
                { name: { $regex: String(q), $options: 'i' } },
                { studentNumber: { $regex: String(q), $options: 'i' } },
                { idNumber: { $regex: String(q), $options: 'i' } }
            ]
        }).populate('user');

        res.json(students);
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get student details
// @route   GET /api/students/:studentId/details
// @access  Private (Secretary only)
exports.getStudentDetails = async (req, res) => {
    try {
        const student = await Student.findOne({ studentNumber: req.params.studentId })
            .populate('user', '-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const enrolledCourses = await CourseGroup.find({
            enrolledStudents: student._id,
            semester: 'Fall',
            year: new Date().getFullYear()
        }).populate('course');

        res.json({
            student,
            enrolledCourses: enrolledCourses.map(group => ({
                _id: group._id,
                courseNumber: group.course.courseNumber,
                name: group.course.name,
                day: group.day,
                startTime: group.startTime,
                endTime: group.endTime
            }))
        });
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:studentId
// @access  Private (Secretary only)
exports.deleteStudent = async (req, res) => {
    try {
        // Find the student first
        const student = await Student.findOne({ studentNumber: req.params.studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find and update all course groups where student is enrolled
        await CourseGroup.updateMany(
            { enrolledStudents: student._id },
            { $pull: { enrolledStudents: student._id } }
        );

        // Delete user account
        await User.findByIdAndDelete(student.user);

        // Delete student record
        await Student.findByIdAndDelete(student._id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 