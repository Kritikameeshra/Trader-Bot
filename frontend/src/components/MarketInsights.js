import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventIcon from '@mui/icons-material/Event';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReactMarkdown from 'react-markdown';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: 15,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const InsightCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'white',
  borderRadius: 10,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
  },
  '& p': {
    marginBottom: theme.spacing(2),
  },
  '& strong': {
    color: theme.palette.primary.dark,
  },
}));

const MarketInsights = ({ insights, onRefresh, loading }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSection = (title, content, icon, color) => (
    <InsightCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <StyledMarkdown>{content}</StyledMarkdown>
      </CardContent>
    </InsightCard>
  );

  if (!insights) return null;

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShowChartIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Market Insights
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton 
            onClick={onRefresh} 
            disabled={loading}
            sx={{
              backgroundColor: 'primary.light',
              '&:hover': { backgroundColor: 'primary.main', color: 'white' },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="subtitle2" color="text.secondary">
          Last updated: {formatDate(insights.timestamp)}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderSection(
            'Current Market Trends',
            insights.trends,
            <TrendingUpIcon sx={{ color: 'success.main' }} />,
            'success'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(
            'Key Economic Indicators',
            insights.indicators,
            <AssessmentIcon sx={{ color: 'info.main' }} />,
            'info'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(
            'Notable Market Events',
            insights.events,
            <EventIcon sx={{ color: 'warning.main' }} />,
            'warning'
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(
            'Trading Opportunities',
            insights.opportunities,
            <EmojiEventsIcon sx={{ color: 'secondary.main' }} />,
            'secondary'
          )}
        </Grid>
      </Grid>

      <Box 
        sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: 'grey.100', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Disclaimer:</strong> This is a simplified overview and should not be considered investment advice.
          Market conditions change rapidly, and this information may become outdated quickly.
          Conduct thorough research and consult with a financial advisor before making any investment decisions.
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default MarketInsights; 