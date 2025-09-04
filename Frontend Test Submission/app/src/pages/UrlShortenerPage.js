import React, { useState } from 'react';
import UrlShortenerForm from '../components/UrlShortenerForm';
import { Box, Typography, Alert, CircularProgress, Paper, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { logEvent } from '../utils/logger';

// URL Shortener Page
// This page lets users shorten up to 5 URLs at once, shows results, and handles errors.

const BACKEND_URL = 'http://localhost:5000/shorturls'; // Change if backend runs elsewhere

const UrlShortenerPage = () => {
  // State for API results and errors
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for form submission
  const handleShorten = async (entries) => {
    setLoading(true);
    setError('');
    setResults([]);
    const token = localStorage.getItem('bearerToken') || '';
    const newResults = [];
    try {
      // Log user action
      await logEvent('info', 'component', 'User submitted URL(s) for shortening', token);
      // Call backend for each entry (sequentially for simplicity)
      for (const entry of entries) {
        const payload = {
          url: entry.url,
        };
        if (entry.validity) payload.validity = parseInt(entry.validity);
        if (entry.shortcode) payload.shortcode = entry.shortcode;
        const res = await axios.post(BACKEND_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        newResults.push({
          originalUrl: entry.url,
          shortLink: res.data.shortLink,
          expiry: res.data.expiry,
        });
        // Log successful shorten
        await logEvent('info', 'component', `Shortened URL: ${entry.url} as ${res.data.shortLink}`, token);
      }
      setResults(newResults);
    } catch (err) {
      // Log error
      await logEvent('error', 'component', `Shorten error: ${err.response?.data?.error || err.message}`, token);
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <UrlShortenerForm onSubmit={handleShorten} loading={loading} />
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {results.length > 0 && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Shortened URLs</Typography>
          <List>
            {results.map((res, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={<>
                    <strong>Original:</strong> <a href={res.originalUrl} target="_blank" rel="noopener noreferrer">{res.originalUrl}</a><br />
                    <strong>Short Link:</strong> <a href={res.shortLink} target="_blank" rel="noopener noreferrer">{res.shortLink}</a><br />
                    <strong>Expires:</strong> {new Date(res.expiry).toLocaleString()}
                  </>}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default UrlShortenerPage; 