const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseGroup',
        required: true
    },
    grade: {
        type: String,
        required: [true, 'Grade is required'],
        enum: ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF', 'NA'],
        trim: true
    }
}, {
    timestamps: true
});

// Compound index to ensure a student can only have one grade per course group
gradeSchema.index(
    { student: 1, courseGroup: 1 },
    { unique: true }
);

module.exports = mongoose.model('Grade', gradeSchema); 