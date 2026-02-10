const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

// --- Serve React Frontend in Production ---
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'Universe', 'dist');
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');

// DEBUG: Log directory contents to verify path on server
console.log('--- DEBUG: Checking Frontend Build Path ---');
console.log('Seeking:', frontendBuildPath);
const universePath = path.join(__dirname, '..', 'frontend', 'Universe');
if (fs.existsSync(universePath)) {
    console.log(`Contents of ${universePath}:`, fs.readdirSync(universePath));
    if (fs.existsSync(frontendBuildPath)) {
        console.log(`Contents of ${frontendBuildPath}:`, fs.readdirSync(frontendBuildPath));
    } else {
        console.log('dist/ folder is MISSING inside Universe/');
    }
} else {
    console.log('Universe/ folder is MISSING!');
}
console.log('-------------------------------------------');

if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));

    // Catch-all: serve index.html for any non-API route (React Router support)
    app.get('/{*splat}', (req, res) => {
        res.sendFile(indexHtmlPath);
    });
    console.log('Serving frontend from:', frontendBuildPath);
} else {
    console.warn('Frontend build not found at:', frontendBuildPath);
}

// Start the Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});