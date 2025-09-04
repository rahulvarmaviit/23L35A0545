// logger.js
// Utility to use the Logging Middleware from the backend in the React frontend
// This allows us to log frontend events to the AffordMed test server as required

// Note: In a real-world app, you would publish the middleware as an npm package or use a REST API for logging.
// For this assessment, we use dynamic import to reuse the backend's logger.js.

// Usage: logEvent(level, pkg, message, token)
export async function logEvent(level, pkg, message, token) {
  // Only log in production or when token is present
  if (!token) return;
  try {
    // Dynamically import the backend logger
    const { Log } = await import('../../../../Backend Test Submission/logger');
    await Log('frontend', level, pkg, message, token);
  } catch (err) {
    // Silently ignore logging errors in the frontend
    // (In real apps, you might want to report this elsewhere)
  }
} 