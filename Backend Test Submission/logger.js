// logger.js
// Helper to import the reusable Logging Middleware for backend use

const path = require('path');
const { Log } = require(path.join(__dirname, '../Logging Middleware/logger'));
 
module.exports = { Log }; 