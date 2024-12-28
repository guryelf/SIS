const mongoose = require('mongoose');
const Department = require('../models/Department');
const Student = require('../models/Student');
const Course = require('../models/Course');
const CourseGroup = require('../models/CourseGroup');
const Grade = require('../models/Grade');
const User = require('../models/User');
const Secretary = require('../models/Secretary');

const seedData = async () => {
    try {
        // Get current year
        const currentYear = new Date().getFullYear();

        // Clear existing data
        await Department.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
        await CourseGroup.deleteMany({});
        await Grade.deleteMany({});
        await User.deleteMany({});
        await Secretary.deleteMany({});

        // Create departments
        const departments = await Department.create([
            {
                name: 'Computer Science',
                departmentCode: 'CS',
                officeNumber: 'A-101',
                officePhone: '(555) 123-4567',
                faculty: 'Engineering'
            },
            {
                name: 'Mathematics',
                departmentCode: 'MATH',
                officeNumber: 'B-201',
                officePhone: '(555) 123-4568',
                faculty: 'Science'
            },
            {
                name: 'Physics',
                departmentCode: 'PHYS',
                officeNumber: 'C-301',
                officePhone: '(555) 123-4569',
                faculty: 'Science'
            }
        ]);

        // Create users first
        const users = await User.create([
            {
                username: 'john.doe',
                email: 'john.doe@example.com',
                password: 'password123',
                role: 'student'
            },
            {
                username: 'jane.smith',
                email: 'jane.smith@example.com',
                password: 'password123',
                role: 'student'
            },
            {
                username: 'cs.secretary',
                email: 'cs.secretary@example.com',
                password: 'password123',
                role: 'department_secretary',
                department: departments[0]._id
            }
        ]);

        // Create secretary
        const secretary = await Secretary.create({
            name: 'CS Secretary',
            idNumber: '12345678902',
            department: departments[0]._id,
            user: users[2]._id
        });

        // Create students with user references
        const students = await Student.create([
            {
                name: 'John Doe',
                studentNumber: '2024001',
                idNumber: '12345678901',
                password: 'password123',
                currentAddress: '123 Main St, City',
                currentPhone: '(555) 111-2233',
                permanentAddress: '123 Main St, City',
                permanentPhone: '(555) 111-2233',
                dateOfBirth: new Date('1998-01-15'),
                gender: 'Male',
                class: 'third year',
                mainDepartment: departments[0]._id,
                program: 'undergraduate',
                user: users[0]._id
            },
            {
                name: 'Jane Smith',
                studentNumber: '2024002',
                idNumber: '12345678902',
                password: 'password123',
                currentAddress: '456 Oak St, City',
                currentPhone: '(555) 111-4455',
                permanentAddress: '456 Oak St, City',
                permanentPhone: '(555) 111-4455',
                dateOfBirth: new Date('1999-03-20'),
                gender: 'Female',
                class: 'second year',
                mainDepartment: departments[1]._id,
                program: 'undergraduate',
                user: users[1]._id
            }
        ]);

        // Create courses
        const courses = await Course.create([
            {
                name: 'Introduction to Programming',
                description: 'Basic programming concepts using Python',
                courseNumber: 'CS101',
                semesterHours: 3,
                level: 'Undergraduate',
                department: departments[0]._id
            },
            {
                name: 'Data Structures',
                description: 'Fundamental data structures and algorithms',
                courseNumber: 'CS201',
                semesterHours: 4,
                level: 'Undergraduate',
                department: departments[0]._id
            },
            {
                name: 'Database Systems',
                description: 'Introduction to database design and SQL',
                courseNumber: 'CS301',
                semesterHours: 3,
                level: 'Undergraduate',
                department: departments[0]._id
            },
            {
                name: 'Web Development',
                description: 'Modern web development technologies and practices',
                courseNumber: 'CS401',
                semesterHours: 3,
                level: 'Undergraduate',
                department: departments[0]._id
            },
            {
                name: 'Calculus I',
                description: 'Introduction to differential calculus',
                courseNumber: 'MATH101',
                semesterHours: 4,
                level: 'Undergraduate',
                department: departments[1]._id
            },
            {
                name: 'Physics I',
                description: 'Classical mechanics',
                courseNumber: 'PHYS101',
                semesterHours: 4,
                level: 'Undergraduate',
                department: departments[2]._id
            }
        ]);

        // Create course groups
        const courseGroups = await CourseGroup.create([
            {
                course: courses[0]._id, // CS101
                instructor: 'Dr. Robert Brown',
                semester: 'Fall',
                year: currentYear,
                groupNumber: 1,
                capacity: 30,
                day: 'Monday',
                startTime: '9:00',
                endTime: '10:00',
                classroom: '101',
                enrolledStudents: []
            },
            {
                course: courses[2]._id, // CS301
                instructor: 'Dr. Sarah Wilson',
                semester: 'Fall',
                year: currentYear,
                groupNumber: 1,
                capacity: 25,
                day: 'Wednesday',
                startTime: '10:00',
                endTime: '11:00',
                classroom: '102',
                enrolledStudents: []
            },
            {
                course: courses[1]._id, // CS201
                instructor: 'Dr. Emily Chen',
                semester: 'Fall',
                year: currentYear,
                groupNumber: 1,
                capacity: 30,
                day: 'Wednesday',
                startTime: '10:00',
                endTime: '11:00',
                classroom: '103',
                enrolledStudents: []
            },
            {
                course: courses[5]._id, // PHYS101
                instructor: 'Dr. Michael Chen',
                semester: 'Fall',
                year: currentYear,
                groupNumber: 1,
                capacity: 35,
                day: 'Wednesday',
                startTime: '10:00',
                endTime: '11:00',
                classroom: '201',
                enrolledStudents: []
            }
        ]);

        // Create grades
        const grades = await Grade.create([
            {
                student: students[0]._id,
                courseGroup: courseGroups[0]._id,
                grade: 'AA'
            },
            {
                student: students[0]._id,
                courseGroup: courseGroups[1]._id,
                grade: 'BA'
            }
        ]);

        console.log('Seed data created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

module.exports = seedData; 