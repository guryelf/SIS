const mongoose = require('mongoose');

const courseGroupSchema = new mongoose.Schema({
    instructor: {
        type: String,
        required: [true, 'Instructor name is required']
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        enum: ['Fall', 'Spring', 'Summer']
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course reference is required']
    },
    groupNumber: {
        type: Number,
        required: [true, 'Group number is required']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    day: {
        type: String,
        required: [true, 'Day is required'],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        validate: {
            validator: function(v) {
                return /^([0-9]|1[0-9]|2[0-3]):00$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:00`
        }
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        validate: {
            validator: function(v) {
                return /^([0-9]|1[0-9]|2[0-3]):00$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:00`
        }
    },
    classroom: {
        type: String,
        required: [true, 'Classroom is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CourseGroup', courseGroupSchema); 