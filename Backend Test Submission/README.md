# Backend Test Submission

This is the backend microservice for the URL Shortener project.

## Purpose
Implements the required API endpoints for URL shortening, redirection, and statistics, as per the assessment specification.

## How to Run
```
npm install
npm run dev
```

## Endpoints (to be implemented)
- `POST /shorturls` - Create a new shortened URL
- `GET /shorturls/:shortcode` - Retrieve statistics for a short URL
- `GET /:shortcode` - Redirect to the original URL

## Notes
- Integrates with the custom Logging Middleware for all significant events.
- Uses Express and CORS for backend API. 