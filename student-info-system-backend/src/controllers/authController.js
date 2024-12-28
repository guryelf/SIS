const Student = require('../models/Student');
const Secretary = require('../models/Secretary');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { idNumber, password, role } = req.body;

        let user;
        let userData;

        if (role === 'department_secretary') {
            // Find secretary by ID number
            const secretary = await Secretary.findOne({ idNumber }).populate('user');
            if (!secretary) {
                return res.status(401).json({ message: 'Invalid ID number or password' });
            }

            user = secretary.user;
            // Check password using User model
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid ID number or password' });
            }

            userData = {
                _id: secretary._id,
                name: secretary.name,
                idNumber: secretary.idNumber,
                role: secretary.user.role
            };
        } else {
            // Find student by ID number
            const student = await Student.findOne({ idNumber }).populate('user');
            if (!student) {
                return res.status(401).json({ message: 'Invalid ID number or password' });
            }

            user = student.user;
            // Check password using User model
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid ID number or password' });
            }

            userData = {
                _id: student._id,
                name: student.name,
                idNumber: student.idNumber,
                studentNumber: student.studentNumber,
                role: student.user.role
            };
        }

        // Create token
        const token = generateToken(user._id);

        res.json({
            ...userData,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 