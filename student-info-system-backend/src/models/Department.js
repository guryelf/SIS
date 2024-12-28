const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true
    },
    departmentCode: {
        type: String,
        required: [true, 'Department code is required'],
        unique: true,
        trim: true
    },
    officeNumber: {
        type: String,
        required: [true, 'Office number is required'],
        trim: true
    },
    officePhone: {
        type: String,
        required: [true, 'Office phone is required'],
        trim: true
    },
    faculty: {
        type: String,
        required: [true, 'Faculty is required'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema); 