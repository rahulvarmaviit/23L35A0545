import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

// Helper to create a blank URL entry
const blankEntry = () => ({ url: '', validity: '', shortcode: '' });

// UrlShortenerForm lets users input up to 5 URLs with optional validity and shortcode
const UrlShortenerForm = ({ onSubmit, loading }) => {
  // State: array of up to 5 URL entries
  const [entries, setEntries] = useState([
    blankEntry(),
  ]);
  // State: validation errors
  const [errors, setErrors] = useState([]);

  // Add a new blank entry (up to 5)
  const addEntry = () => {
    if (entries.length < 5) {
      setEntries([...entries, blankEntry()]);
    }
  };

  // Remove an entry by index
  const removeEntry = (idx) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  // Handle input change
  const handleChange = (idx, field, value) => {
    const updated = entries.map((entry, i) =>
      i === idx ? { ...entry, [field]: value } : entry
    );
    setEntries(updated);
  };

  // Simple URL validation
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate all entries before submit
  const validate = () => {
    const errs = entries.map((entry) => {
      const entryErr = {};
      if (!entry.url || !isValidUrl(entry.url)) {
        entryErr.url = 'Please enter a valid URL.';
      }
      if (entry.validity && (!/^[0-9]+$/.test(entry.validity) || parseInt(entry.validity) <= 0)) {
        entryErr.validity = 'Validity must be a positive integer (minutes).';
      }
      if (entry.shortcode && !/^[a-zA-Z0-9]{3,16}$/.test(entry.shortcode)) {
        entryErr.shortcode = 'Shortcode must be alphanumeric (3-16 chars).';
      }
      return entryErr;
    });
    setErrors(errs);
    // Return true if no errors
    return errs.every((e) => Object.keys(e).length === 0);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Only submit non-empty entries
      onSubmit(entries.filter((entry) => entry.url.trim() !== ''));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shorten up to 5 URLs
      </Typography>
      <form onSubmit={handleSubmit}>
        {entries.map((entry, idx) => (
          <Box key={idx} display="flex" alignItems="center" mb={2}>
            <TextField
              label="Long URL"
              value={entry.url}
              onChange={(e) => handleChange(idx, 'url', e.target.value)}
              error={!!(errors[idx] && errors[idx].url)}
              helperText={errors[idx] && errors[idx].url}
              fullWidth
              sx={{ mr: 1 }}
              required
            />
            <TextField
              label="Validity (min)"
              value={entry.validity}
              onChange={(e) => handleChange(idx, 'validity', e.target.value)}
              error={!!(errors[idx] && errors[idx].validity)}
              helperText={errors[idx] && errors[idx].validity}
              sx={{ width: 120, mr: 1 }}
            />
            <TextField
              label="Shortcode (optional)"
              value={entry.shortcode}
              onChange={(e) => handleChange(idx, 'shortcode', e.target.value)}
              error={!!(errors[idx] && errors[idx].shortcode)}
              helperText={errors[idx] && errors[idx].shortcode}
              sx={{ width: 180, mr: 1 }}
            />
            {entries.length > 1 && (
              <Button
                onClick={() => removeEntry(idx)}
                color="error"
                variant="outlined"
                sx={{ minWidth: 40 }}
                tabIndex={-1}
              >
                X
              </Button>
            )}
          </Box>
        ))}
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            onClick={addEntry}
            disabled={entries.length >= 5}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            + Add URL
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            Shorten
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default UrlShortenerForm; 