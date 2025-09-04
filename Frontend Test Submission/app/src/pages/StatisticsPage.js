import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import axios from 'axios';
import { logEvent } from '../utils/logger';

// Statistics Page
// This page lets users enter a shortcode and view analytics for that shortened URL.

const BACKEND_STATS_URL = 'http://localhost:5000/shorturls'; // Change if backend runs elsewhere

const StatisticsPage = () => {
  const [shortcode, setShortcode] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler to fetch stats from backend
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    setStats(null);
    const token = localStorage.getItem('bearerToken') || '';
    try {
      // Log user action
      await logEvent('info', 'component', `User requested stats for shortcode: ${shortcode}`, token);
      const res = await axios.get(`${BACKEND_STATS_URL}/${shortcode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
      // Log successful stats fetch
      await logEvent('info', 'component', `Fetched stats for shortcode: ${shortcode}`, token);
    } catch (err) {
      // Log error
      await logEvent('error', 'component', `Stats fetch error: ${err.response?.data?.error || err.message}`, token);
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          View URL Statistics
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Shortcode"
            value={shortcode}
            onChange={e => setShortcode(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={fetchStats} disabled={!shortcode || loading}>
            Fetch Stats
          </Button>
        </Box>
      </Paper>
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {stats && (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Statistics for <code>{shortcode}</code></Typography>
          <Typography><strong>Original URL:</strong> <a href={stats.originalUrl} target="_blank" rel="noopener noreferrer">{stats.originalUrl}</a></Typography>
          <Typography><strong>Created At:</strong> {new Date(stats.createdAt).toLocaleString()}</Typography>
          <Typography><strong>Expires:</strong> {new Date(stats.expiry).toLocaleString()}</Typography>
          <Typography><strong>Total Clicks:</strong> {stats.totalClicks}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Click Details:</Typography>
          <List>
            {stats.clickDetails.length === 0 && <ListItem><ListItemText primary="No clicks yet." /></ListItem>}
            {stats.clickDetails.map((click, idx) => (
              <ListItem key={idx} divider>
                <ListItemText
                  primary={<>
                    <strong>Time:</strong> {new Date(click.timestamp).toLocaleString()}<br />
                    <strong>Referrer:</strong> {click.referrer}<br />
                    <strong>Geo:</strong> {click.geo}
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

export default StatisticsPage; 