import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import axios from 'axios';
import ApiKeySetup from './components/ApiKeySetup';
import MarketInsights from './components/MarketInsights';
import ReactMarkdown from 'react-markdown';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: 15,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey'));
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [activeTab, setActiveTab] = useState(0);
  const [technicalIndicators, setTechnicalIndicators] = useState({
    data: [],
    sma: [],
    ema: [],
    rsi: [],
    macd: [],
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleApiKeySet = (key) => {
    setApiKey(key);
    localStorage.setItem('apiKey', key);
    showSnackbar('API key set successfully', 'success');
  };

  const analyzeStock = async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8000/analyze/${symbol}`);
      setAnalysis(response.data);
      showSnackbar(`Analysis completed for ${symbol}`, 'success');
      
      // Fetch historical data for the chart
      const stock = await axios.get(`http://localhost:8000/historical-data/${symbol}`);
      setPriceHistory(stock.data);
    } catch (error) {
      console.error('Error analyzing stock:', error);
      const message = error.response?.data?.detail || 'Failed to analyze stock. Please try again.';
      setError(message);
      showSnackbar(message, 'error');
    }
    setLoading(false);
  };

  const fetchMarketInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/market-insights');
      setMarketInsights(response.data);
      showSnackbar('Market insights updated', 'success');
    } catch (error) {
      console.error('Error fetching market insights:', error);
      const message = error.response?.data?.detail || 'Failed to fetch market insights. Please try again.';
      setError(message);
      showSnackbar(message, 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (apiKey) {
      fetchMarketInsights();
      const interval = setInterval(fetchMarketInsights, 300000); // Update every 5 minutes
      return () => clearInterval(interval);
    }
  }, [apiKey]);

  useEffect(() => {
    if (priceHistory && priceHistory.length > 0) {
      try {
        const sma = calculateSMA(priceHistory);
        const ema = calculateEMA(priceHistory);
        const rsi = calculateRSI(priceHistory);
        const macd = calculateMACD(priceHistory);

        // Merge all indicators with price data
        const mergedData = priceHistory.map(item => {
          const smaItem = sma.find(s => s.date === item.date);
          const emaItem = ema.find(e => e.date === item.date);
          const rsiItem = rsi.find(r => r.date === item.date);
          const macdItem = macd.find(m => m.date === item.date);

          return {
            ...item,
            sma: smaItem?.sma,
            ema: emaItem?.ema,
            rsi: rsiItem?.rsi,
            macd: macdItem?.macd
          };
        });

        setTechnicalIndicators({
          data: mergedData,
          sma,
          ema,
          rsi,
          macd
        });
      } catch (error) {
        console.error('Error calculating technical indicators:', error);
        setTechnicalIndicators({
          data: [],
          sma: [],
          ema: [],
          rsi: [],
          macd: []
        });
      }
    }
  }, [priceHistory]);

  const getPriceChangeColor = (change) => {
    return change >= 0 ? 'success.main' : 'error.main';
  };

  const getPriceChangeIcon = (change) => {
    return change >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const calculateSMA = (data, period = 20) => {
    if (!data || data.length < period) return [];
    
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + (curr?.price || 0), 0);
      sma.push({ date: data[i].date, sma: sum / period });
    }
    return sma;
  };

  const calculateEMA = (data, period = 20) => {
    if (!data || data.length < 2) return [];
    
    const ema = [];
    const multiplier = 2 / (period + 1);
    let prevEMA = data[0]?.price || 0;

    for (let i = 1; i < data.length; i++) {
      const currentPrice = data[i]?.price || 0;
      const currentEMA = (currentPrice - prevEMA) * multiplier + prevEMA;
      ema.push({ date: data[i].date, ema: currentEMA });
      prevEMA = currentEMA;
    }
    return ema;
  };

  const calculateRSI = (data, period = 14) => {
    if (!data || data.length < period + 1) return [];
    
    const rsi = [];
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = (data[i]?.price || 0) - (data[i - 1]?.price || 0);
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    // Calculate first RSI value
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / (avgLoss || 1); // Prevent division by zero
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push({ date: data[period].date, rsi: rsiValue });

    // Calculate remaining RSI values
    for (let i = period + 1; i < data.length; i++) {
      const change = (data[i]?.price || 0) - (data[i - 1]?.price || 0);
      const oldChange = (data[i - period]?.price || 0) - (data[i - period - 1]?.price || 0);

      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }

      if (oldChange >= 0) {
        gains -= oldChange;
      } else {
        losses += oldChange;
      }

      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / (avgLoss || 1); // Prevent division by zero
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push({ date: data[i].date, rsi: rsiValue });
    }
    return rsi;
  };

  const calculateMACD = (data) => {
    if (!data || data.length < 26) return [];
    
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const macd = [];

    for (let i = 0; i < ema26.length; i++) {
      const macdValue = (ema12[i]?.ema || 0) - (ema26[i]?.ema || 0);
      macd.push({ date: ema26[i].date, macd: macdValue });
    }
    return macd;
  };

  const renderPriceChart = () => {
    if (!technicalIndicators.data || technicalIndicators.data.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={technicalIndicators.data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
          <RechartsTooltip />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="price"
            stroke="#2196F3"
            fillOpacity={1}
            fill="url(#colorPrice)"
            name="Price"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sma"
            stroke="#FF9800"
            dot={false}
            name="SMA (20)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="ema"
            stroke="#4CAF50"
            dot={false}
            name="EMA (20)"
          />
          <Bar
            yAxisId="right"
            dataKey="volume"
            fill="#90CAF9"
            opacity={0.5}
            name="Volume"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderTechnicalIndicators = () => {
    if (!technicalIndicators.data || technicalIndicators.data.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={technicalIndicators.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="rsi"
            stroke="#F44336"
            name="RSI"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="macd"
            stroke="#9C27B0"
            name="MACD"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  if (!apiKey) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ShowChartIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                AI Trading Bot Dashboard
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Stock Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                variant="outlined"
                fullWidth
                onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="contained"
                onClick={analyzeStock}
                disabled={loading || !symbol}
                startIcon={loading ? <CircularProgress size={20} /> : <AssessmentIcon />}
                sx={{
                  minWidth: 120,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  },
                }}
              >
                Analyze
              </Button>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Market Insights */}
        <Grid item xs={12}>
          <MarketInsights
            insights={marketInsights}
            onRefresh={fetchMarketInsights}
            loading={loading}
          />
        </Grid>

        {/* Price Chart */}
        {priceHistory.length > 0 && (
          <Grid item xs={12}>
            <StyledPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Technical Analysis
                </Typography>
              </Box>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
              >
                <Tab icon={<ShowChartIcon />} label="Price & Volume" />
                <Tab icon={<TimelineIcon />} label="Technical Indicators" />
              </Tabs>
              {activeTab === 0 ? renderPriceChart() : renderTechnicalIndicators()}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<TrendingUpIcon />}
                  label="SMA (20)"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<TrendingUpIcon />}
                  label="EMA (20)"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<VolumeUpIcon />}
                  label="Volume"
                  color="info"
                  variant="outlined"
                />
                <Chip
                  icon={<TimelineIcon />}
                  label="RSI"
                  color="error"
                  variant="outlined"
                />
                <Chip
                  icon={<TimelineIcon />}
                  label="MACD"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </StyledPaper>
          </Grid>
        )}

        {/* Stock Analysis */}
        {analysis && (
          <Grid item xs={12}>
            <StyledPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssessmentIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Stock Analysis
                </Typography>
              </Box>
              <Card sx={{ mb: 3, background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {analysis.symbol}
                    </Typography>
                    {getPriceChangeIcon(analysis.data.price_change)}
                    <Typography
                      variant="h5"
                      color={getPriceChangeColor(analysis.data.price_change)}
                      sx={{ fontWeight: 'bold' }}
                    >
                      ${analysis.data.current_price.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${analysis.data.price_change >= 0 ? '+' : ''}${analysis.data.price_change.toFixed(2)} (${((analysis.data.price_change / analysis.data.current_price) * 100).toFixed(2)}%)`}
                      color={analysis.data.price_change >= 0 ? 'success' : 'error'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Volume</Typography>
                        <Typography variant="h6">{analysis.data.volume.toLocaleString()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">30-day High</Typography>
                        <Typography variant="h6">${analysis.data.high.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">30-day Low</Typography>
                        <Typography variant="h6">${analysis.data.low.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Price Change</Typography>
                        <Typography variant="h6" color={getPriceChangeColor(analysis.data.price_change)}>
                          ${analysis.data.price_change.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <Divider sx={{ mb: 3 }} />
              <StyledMarkdown>{analysis.analysis}</StyledMarkdown>
            </StyledPaper>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}

export default App; 