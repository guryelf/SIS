const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    studentNumber: {
        type: String,
        required: [true, 'Student number is required'],
        unique: true,
        trim: true
    },
    idNumber: {
        type: String,
        required: [true, 'ID number is required'],
        unique: true,
        trim: true
    },
    currentAddress: {
        type: String,
        required: [true, 'Current address is required'],
        trim: true
    },
    currentPhone: {
        type: String,
        required: [true, 'Current phone is required'],
        trim: true
    },
    permanentAddress: {
        type: String,
        required: [true, 'Permanent address is required'],
        trim: true
    },
    permanentPhone: {
        type: String,
        required: [true, 'Permanent phone is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        trim: true
    },
    class: {
        type: String,
        required: [true, 'Class is required'],
        enum: ['first year', 'second year', 'third year', 'fourth year', 'graduate'],
        trim: true
    },
    mainDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Main department is required']
    },
    minorDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    program: {
        type: String,
        required: [true, 'Program is required'],
        enum: ['undergraduate', 'master\'s', 'PhD'],
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema); 