// logger.js
// Reusable Logging Middleware for AffordMed Assessment
// Usage: Log(stack, level, package, message, token)

const axios = require('axios');

// Allowed values as per the spec
defineAllowed = () => ({
  stack: ['backend', 'frontend'],
  level: ['debug', 'info', 'warn', 'error', 'fatal'],
  package: [
    // Backend only
    'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
    // Frontend only
    'api', 'component', 'hook', 'page', 'state', 'style',
    // Both
    'auth', 'config', 'middleware', 'utils'
  ]
});

/**
 * Log significant events to the AffordMed test server.
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} pkg - package name (see allowed list)
 * @param {string} message - descriptive log message
 * @param {string} token - Bearer token for authentication
 */
async function Log(stack, level, pkg, message, token) {
  const allowed = defineAllowed();
  // Validate inputs
  if (!allowed.stack.includes(stack)) throw new Error('Invalid stack');
  if (!allowed.level.includes(level)) throw new Error('Invalid level');
  if (!allowed.package.includes(pkg)) throw new Error('Invalid package');
  if (typeof message !== 'string' || !message.trim()) throw new Error('Invalid message');
  if (!token) throw new Error('Bearer token required');

  const url = 'http://20.244.56.144/evaluation-service/logs';
  const data = {
    stack,
    level,
    package: pkg,
    message
  };
  try {
    const res = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (err) {
    // Optionally, handle/log error locally
    throw err;
  }
}

module.exports = { Log };

// Example usage (uncomment and replace <TOKEN> to test):
// Log('backend', 'error', 'handler', 'received string, expected bool', '<TOKEN>')
//   .then(console.log)
//   .catch(console.error); 