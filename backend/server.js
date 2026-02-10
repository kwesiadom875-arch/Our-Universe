const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/our-universe')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        // process.exit(1); // Optional: exit if DB fails
    });

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/library', require('./routes/library'));
app.use('/api/events', require('./routes/events'));
app.use('/api/memories', require('./routes/memories'));
app.use('/api/upload', require('./routes/upload'));


// The API Route
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from Node.js!" });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});