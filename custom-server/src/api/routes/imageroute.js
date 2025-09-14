const express = require('express');
const multer = require('multer');
const router = express.Router();
const { classifyImage } = require('../controllers/imageController');

// Configure Multer for file uploads with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });  // Store the file in memory


// POST route for image classification
router.post('/detect-clothes', upload.single('image'), classifyImage);

module.exports = router;
