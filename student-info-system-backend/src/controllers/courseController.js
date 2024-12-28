const Course = require('../models/Course');
const CourseGroup = require('../models/CourseGroup');
const Student = require('../models/Student');

// @desc    Get course schedule for the current semester
// @route   GET /api/courses/schedule
// @access  Public
exports.getCourseSchedule = async (req, res) => {
    try {
        const currentSemester = 'Fall'; // This should be dynamic in a real app
        const currentYear = new Date().getFullYear();

        const courseGroups = await CourseGroup.find({
            semester: currentSemester,
            year: currentYear
        }).populate({
            path: 'course',
            populate: {
                path: 'department'
            }
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
            capacity: group.capacity,
            enrolledStudents: group.enrolledStudents,
            day: group.day,
            startTime: group.startTime,
            endTime: group.endTime,
            department: group.course.department,
            classroom: group.classroom
        }));

        res.json(schedule);
    } catch (error) {
        console.error('Error fetching course schedule:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Private
exports.searchCourses = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search directly in courses collection
        const courses = await Course.find({
            $or: [
                { courseNumber: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        }).populate('department');

        // Transform the data for the frontend
        const results = courses.map(course => ({
            _id: course._id,
            courseNumber: course.courseNumber,
            name: course.name,
            description: course.description,
            level: course.level,
            semesterHours: course.semesterHours,
            department: course.department.name
        }));

        res.json(results);
    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add course to schedule
// @route   POST /api/courses/schedule
// @access  Private (Secretary only)
exports.addCourseToSchedule = async (req, res) => {
    try {
        const { courseId, day, startTime, classroom, instructor } = req.body;
        const currentSemester = 'Fall';
        const currentYear = new Date().getFullYear();

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Validate time format
        if (!/^\d{1,2}:00$/.test(startTime)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:00' });
        }

        // Calculate end time (assuming 1-hour courses for simplicity)
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = startHour + 1;
        const endTime = `${endHour}:00`;

        // Check if the same course is already scheduled for this day
        const existingSameCourse = await CourseGroup.findOne({
            course: courseId,
            semester: currentSemester,
            year: currentYear,
            day
        });

        if (existingSameCourse) {
            return res.status(400).json({ 
                message: 'This course is already scheduled for this day' 
            });
        }

        // Get all courses for this day
        const existingCourses = await CourseGroup.find({
            semester: currentSemester,
            year: currentYear,
            day,
            classroom // Only check conflicts for the same classroom
        }).populate('course');

        // Check for time conflicts in the same classroom
        for (const existing of existingCourses) {
            const existingStartHour = parseInt(existing.startTime.split(':')[0]);
            const existingEndHour = parseInt(existing.endTime.split(':')[0]);

            // Check for any overlap
            if ((startHour >= existingStartHour && startHour < existingEndHour) ||
                (endHour > existingStartHour && endHour <= existingEndHour) ||
                (startHour <= existingStartHour && endHour >= existingEndHour)) {
                
                return res.status(400).json({ 
                    message: `Time conflict: ${existing.course.courseNumber} is already scheduled in room ${classroom} from ${existing.startTime} to ${existing.endTime}` 
                });
            }
        }

        // Find the highest group number for this course
        const highestGroup = await CourseGroup.findOne({
            course: courseId,
            semester: currentSemester,
            year: currentYear
        }).sort('-groupNumber');

        const nextGroupNumber = highestGroup ? highestGroup.groupNumber + 1 : 1;

        // Create new course group
        const courseGroup = new CourseGroup({
            course: courseId,
            semester: currentSemester,
            year: currentYear,
            day,
            startTime,
            endTime,
            classroom,
            instructor: instructor || 'TBD',
            capacity: 30, // Default capacity
            enrolledStudents: [],
            groupNumber: nextGroupNumber
        });

        await courseGroup.save();
        res.status(201).json({ message: 'Course added to schedule successfully' });
    } catch (error) {
        console.error('Error adding course to schedule:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove course from schedule
// @route   DELETE /api/courses/schedule/:id
// @access  Private (Secretary only)
exports.removeCourseFromSchedule = async (req, res) => {
    try {
        const courseGroupId = req.params.id;
        
        // Find and delete the course group
        const courseGroup = await CourseGroup.findById(courseGroupId);
        
        if (!courseGroup) {
            return res.status(404).json({ message: 'Course group not found' });
        }

        // Check if there are any enrolled students
        if (courseGroup.enrolledStudents && courseGroup.enrolledStudents.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot remove course with enrolled students. Please remove students first.' 
            });
        }

        await CourseGroup.findByIdAndDelete(courseGroupId);
        res.json({ message: 'Course removed from schedule successfully' });
    } catch (error) {
        console.error('Error removing course from schedule:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:courseId/enroll
// @access  Private (Secretary only)
exports.enrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const courseGroupId = req.params.courseId;

        // Find the student
        const student = await Student.findOne({ studentNumber: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find the course group
        const courseGroup = await CourseGroup.findById(courseGroupId).populate('course');
        if (!courseGroup) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is already enrolled
        if (courseGroup.enrolledStudents.includes(student._id)) {
            return res.status(400).json({ message: 'Student is already enrolled in this course' });
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
            return res.status(400).json({ message: 'Time conflict with another course' });
        }

        // Add student to course
        courseGroup.enrolledStudents.push(student._id);
        await courseGroup.save();

        res.json({ 
            message: 'Student enrolled successfully',
            courseNumber: courseGroup.course.courseNumber,
            courseName: courseGroup.course.name
        });
    } catch (error) {
        console.error('Error enrolling student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};