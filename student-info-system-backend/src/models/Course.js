const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true
    },
    courseNumber: {
        type: String,
        required: [true, 'Course number is required'],
        unique: true,
        trim: true
    },
    semesterHours: {
        type: Number,
        required: [true, 'Semester hours are required'],
        min: 1
    },
    level: {
        type: String,
        required: [true, 'Course level is required'],
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema); 