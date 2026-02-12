const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, p) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.set('trust proxy', 1); // Trust first proxy
app.use(cors());
app.use(express.json());
const compression = require('compression');
app.use(compression());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/our-universe')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
    });

// Define Routes
// Define Routes
app.use('/api/auth', apiLimiter, require('./routes/auth')); // Flow 1 & 2
app.use('/api/memories', apiLimiter, require('./routes/memories')); // Check if this exists? user didn't show it but it was in previous verify.
// Actually, looking at file list, memories.js exists in routes.
app.use('/api/events', apiLimiter, require('./routes/events'));
app.use('/api/timetable', apiLimiter, require('./routes/timetable'));
app.use('/api/movies', apiLimiter, require('./routes/movies'));
app.use('/api/media', apiLimiter, require('./routes/media'));
app.use('/api/scents', apiLimiter, require('./routes/scents'));
app.use('/api/milestones', apiLimiter, require('./routes/milestones')); // New route
app.use('/api/library', apiLimiter, require('./routes/library'));
app.use('/api/upload', apiLimiter, require('./routes/upload'));
app.use('/api/epub', apiLimiter, require('./routes/epub'));

// The API Route
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from Node.js!" });
});

// --- Serve React Frontend in Production ---
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'Universe', 'dist');
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');


if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));

    // Catch-all: serve index.html for any non-API route (React Router support)
    app.get(/.*/, (req, res) => {
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