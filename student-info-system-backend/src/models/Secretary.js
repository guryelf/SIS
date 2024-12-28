const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const secretarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    idNumber: {
        type: String,
        required: [true, 'ID number is required'],
        unique: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    }
}, {
    timestamps: true
});

// Method to check password
secretarySchema.methods.matchPassword = async function(enteredPassword) {
    const user = await this.model('User').findById(this.user);
    return await bcrypt.compare(enteredPassword, user.password);
};

module.exports = mongoose.model('Secretary', secretarySchema); 