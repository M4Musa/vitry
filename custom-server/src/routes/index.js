const express = require('express');
const router = express.Router();

// Example route for the home page
router.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Example route for another endpoint
router.get('/about', (req, res) => {
    res.send('About this API');
});

// Example route with a parameter
router.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`User ID: ${userId}`);
});

module.exports = router;
