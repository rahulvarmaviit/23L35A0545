# Logging Middleware

Reusable logging middleware for AffordMed assessment.

## Purpose
This package provides a function to log significant application events to the AffordMed test server, as required by the assessment. It is compatible with both backend and frontend applications.

## Usage
- Import the package and call the `Log` function:

```js
const { Log } = require('./logger');

// Example usage:
Log('backend', 'error', 'handler', 'received string, expected bool', '<BEARER_TOKEN>')
  .then(console.log)
  .catch(console.error);
```

## Function Signature
```
Log(stack, level, package, message, token)
```
- `stack`: 'backend' or 'frontend'
- `level`: 'debug', 'info', 'warn', 'error', 'fatal'
- `package`: see allowed list in `logger.js`
- `message`: descriptive log message
- `token`: Bearer token for authentication

## Requirements
- All fields must be lowercase and valid as per the assessment spec.
- The function sends a POST request to the test server logging API.
- Requires `axios` (already included in package dependencies).

## Note
- Do not use console logging or built-in loggers for assessment logs.
- This package is for assessment use only. 