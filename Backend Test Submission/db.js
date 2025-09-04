// db.js
// Simple data persistence and model logic for the URL Shortener microservice
// Uses lowdb for lightweight JSON storage (suitable for coding assessments)

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the JSON database file
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { urls: [], clicks: [] });

// Initialize the database with default structure if empty
async function initDB() {
  await db.read();
  await db.write();
}

// Generate a random, short, alphanumeric code (6 chars)
function generateShortcode() {
  return uuidv4().replace(/-/g, '').slice(0, 6);
}

// Check if a shortcode is already in use
function isShortcodeTaken(shortcode) {
  return db.data.urls.some(u => u.shortcode === shortcode);
}

// Add a new shortened URL
async function addShortUrl({ url, shortcode, expiry }) {
  const now = new Date();
  db.data.urls.push({
    url,
    shortcode,
    createdAt: now.toISOString(),
    expiry,
    clicks: 0
  });
  await db.write();
}

// Get URL mapping by shortcode
function getUrlByShortcode(shortcode) {
  return db.data.urls.find(u => u.shortcode === shortcode);
}

// Increment click count and log click details
async function logClick(shortcode, req) {
  const now = new Date();
  // For demo: use req.headers['referer'] and a placeholder for geo-location
  const referrer = req.headers['referer'] || 'direct';
  const geo = 'unknown'; // In real app, use IP geolocation
  db.data.clicks.push({
    shortcode,
    timestamp: now.toISOString(),
    referrer,
    geo
  });
  // Increment click count in URL record
  const urlObj = db.data.urls.find(u => u.shortcode === shortcode);
  if (urlObj) urlObj.clicks++;
  await db.write();
}

// Get stats for a shortcode
function getStats(shortcode) {
  const urlObj = db.data.urls.find(u => u.shortcode === shortcode);
  if (!urlObj) return null;
  const clicks = db.data.clicks.filter(c => c.shortcode === shortcode);
  return {
    originalUrl: urlObj.url,
    createdAt: urlObj.createdAt,
    expiry: urlObj.expiry,
    totalClicks: urlObj.clicks,
    clickDetails: clicks
  };
}

module.exports = {
  db,
  initDB,
  generateShortcode,
  isShortcodeTaken,
  addShortUrl,
  getUrlByShortcode,
  logClick,
  getStats
}; 