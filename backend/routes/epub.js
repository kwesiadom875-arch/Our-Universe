const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const fs = require('fs');

// Configure multer storage for eBooks
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'books');
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Sanitize filename and add timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'ebook-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Basic check for epub mime type or extension
    // Mime type for epub can vary: application/epub+zip
    if (file.mimetype === 'application/epub+zip' || file.originalname.endsWith('.epub')) {
        cb(null, true);
    } else {
        cb(new Error('Only .epub files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit (some heavy epubs)
});

// POST /api/epub/upload - Upload an epub file (authenticated)
router.post('/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded or invalid format' });
    }

    const fileUrl = `http://localhost:${process.env.PORT || 5000}/uploads/books/${req.file.filename}`;
    res.json({ url: fileUrl });
});

module.exports = router;
