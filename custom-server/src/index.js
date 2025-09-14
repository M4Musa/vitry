const express = require('express');
const { checkMongoDBConnection } = require('./config/mongodbConnect'); // Import MongoDB connection
const { checkFirebaseConnection } = require('./config/firebaseConnect'); // Import Firebase connection
const routes = require('./routes'); // Import routes
const cors = require('cors');
const imageroutes = require('./api/routes/imageroute');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware setup
app.use(cors()); // Enable CORS

// Use the routes
app.use('/', routes); // Prefix all routes with '/api'
// Use image routes
app.use('/api', imageroutes);

// Check connections when the server starts
const checkConnections = async () => {
    await checkMongoDBConnection(); // Check MongoDB connection
    await checkFirebaseConnection();  // Check Firebase connection
};

checkConnections().then(() => {
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Error checking connections:', error);
});
