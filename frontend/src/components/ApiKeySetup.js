import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const GradientPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  borderRadius: 15,
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
}));

const ApiKeySetup = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Test the API key with a simple request
      const response = await fetch('http://localhost:8000/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      onApiKeySet(apiKey);
    } catch (err) {
      setError('Invalid API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <GradientPaper elevation={3}>
          <Typography variant="h4" gutterBottom align="center">
            Welcome to AI Trading Bot
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Enter your Google API key to get started with AI-powered market analysis
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Google API Key"
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{
                mb: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1,
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || !apiKey}
              sx={{
                py: 1.5,
                backgroundColor: 'white',
                color: '#2196F3',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Started'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2, opacity: 0.8 }}>
            Don't have an API key?{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white', textDecoration: 'underline' }}
            >
              Get one here
            </a>
          </Typography>
        </GradientPaper>
      </Box>
    </Container>
  );
};

export default ApiKeySetup; 