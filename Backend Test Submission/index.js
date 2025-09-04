// index.js
// Main entry point for the URL Shortener backend microservice
// This server will handle URL shortening, redirection, and statistics as per the assessment spec.

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());
// Enable CORS for all routes (for frontend integration)
app.use(cors());

// Import and initialize the database
const { initDB } = require('./db');
initDB().then(() => {
  console.log('Database initialized.');
});

// Import helpers for database and logging
const {
  generateShortcode,
  isShortcodeTaken,
  addShortUrl,
  getUrlByShortcode,
  logClick,
  getStats
} = require('./db');
const { Log } = require('./logger');

// Helper: Validate URL format (simple regex)
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// POST /shorturls - Create a new shortened URL
app.post('/shorturls', async (req, res) => {
  try {
    // Extract fields from request body
    const { url, validity, shortcode } = req.body;
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

    // Validate presence of Bearer token
    if (!token) {
      try { await Log('backend', 'error', 'middleware', 'Missing Bearer token', ''); } catch (e) { console.error('Log error:', e.message); }
      return res.status(401).json({ error: 'Authorization token required' });
    }

    // Validate URL
    if (!url || !isValidUrl(url)) {
      try { await Log('backend', 'error', 'handler', 'Invalid or missing URL', token); } catch (e) { console.error('Log error:', e.message); }
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    // Validate validity (optional, must be positive integer if present)
    let minutes = 30; // default
    if (validity !== undefined) {
      if (!Number.isInteger(validity) || validity <= 0) {
        try { await Log('backend', 'error', 'handler', 'Invalid validity value', token); } catch (e) { console.error('Log error:', e.message); }
        return res.status(400).json({ error: 'Validity must be a positive integer (minutes)' });
      }
      minutes = validity;
    }

    // Handle shortcode (optional)
    let finalShortcode = shortcode;
    if (shortcode) {
      // Must be alphanumeric and reasonable length
      if (!/^[a-zA-Z0-9]{3,16}$/.test(shortcode)) {
        try { await Log('backend', 'error', 'handler', 'Invalid shortcode format', token); } catch (e) { console.error('Log error:', e.message); }
        return res.status(400).json({ error: 'Shortcode must be alphanumeric and 3-16 chars' });
      }
      if (isShortcodeTaken(shortcode)) {
        try { await Log('backend', 'error', 'handler', 'Shortcode already taken', token); } catch (e) { console.error('Log error:', e.message); }
        return res.status(409).json({ error: 'Shortcode already in use' });
      }
    } else {
      // Generate a unique shortcode
      let tries = 0;
      do {
        finalShortcode = generateShortcode();
        tries++;
        if (tries > 10) {
          try { await Log('backend', 'fatal', 'middleware', 'Failed to generate unique shortcode', token); } catch (e) { console.error('Log error:', e.message); }
          return res.status(500).json({ error: 'Could not generate unique shortcode' });
        }
      } while (isShortcodeTaken(finalShortcode));
    }

    // Calculate expiry timestamp (ISO 8601)
    const expiry = new Date(Date.now() + minutes * 60000).toISOString();

    // Store the mapping
    await addShortUrl({ url, shortcode: finalShortcode, expiry });
    try { await Log('backend', 'info', 'handler', `Short URL created for ${url} as ${finalShortcode}`, token); } catch (e) { console.error('Log error:', e.message); }

    // Respond with the short link and expiry
    const host = req.headers.host || 'localhost';
    const protocol = req.protocol || 'http';
    const shortLink = `${protocol}://${host}/${finalShortcode}`;
    res.status(201).json({ shortLink, expiry });
  } catch (err) {
    console.error('POST /shorturls error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Root route for sanity check
app.get('/', (req, res) => {
  res.send('URL Shortener Backend is up and running! 🚀');
});

// GET /:shortcode - Redirect to the original URL
app.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  // No Bearer token required for redirect

  // Look up the shortcode
  const urlObj = getUrlByShortcode(shortcode);
  if (!urlObj) {
    // No logging since no token
    return res.status(404).json({ error: 'Shortcode does not exist' });
  }

  // Check expiry
  const now = new Date();
  if (new Date(urlObj.expiry) < now) {
    return res.status(410).json({ error: 'Shortcode has expired' });
  }

  // Log the click (timestamp, referrer, geo placeholder)
  await logClick(shortcode, req);
  // No logging to AffordMed server since no token

  // Redirect to the original URL
  res.redirect(urlObj.url);
});

// GET /shorturls/:shortcode - Retrieve statistics for a short URL
app.get('/shorturls/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  // No Bearer token required for stats

  // Gather stats for the shortcode
  const stats = getStats(shortcode);
  if (!stats) {
    return res.status(404).json({ error: 'Shortcode does not exist' });
  }

  // No logging to AffordMed server since no token
  res.json(stats);
});

// TODO: Implement /shorturls, /shorturls/:shortcode, and /:shortcode routes

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
}); 