require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('../utils/seedData');

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected...');
        return seedData();
    })
    .catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    }); 