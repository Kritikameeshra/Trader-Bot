# AI Trading Bot with Gemini

**Author:** Arastu Thakur

This project implements a visually-rich trading bot dashboard that uses Google's Gemini AI for market analysis and insights. It features a modern, interactive dashboard for visualizing data, technical indicators, and controlling the bot.

---

## Features

- **AI-Powered Market Insights:** Real-time market analysis using Gemini AI, formatted in markdown for clarity.
- **Stock Price Analysis:** Interactive charts with price, volume, SMA, EMA, RSI, and MACD.
- **Modern React Dashboard:** Responsive, visually appealing UI with Material-UI and Recharts.
- **FastAPI Backend:** Handles AI, data fetching, and technical analysis.
- **User-Friendly Onboarding:** Enter your Google API key directly in the dashboard.

---

## Prerequisites

- Python 3.8+
- Node.js 14+
- Google API Key for Gemini AI ([Get one here](https://makersuite.google.com/app/apikey))

---

## Setup

1. **Clone the repository**
2. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

---

## Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   ```
3. **Open your browser and navigate to** `http://localhost:3000`

---

## Usage

1. **Enter your Google API key** when prompted in the dashboard.
2. **Enter a stock symbol** (e.g., AAPL, GOOGL, MSFT) and click "Analyze".
3. **View AI-powered insights, technical analysis, and interactive charts.**
4. **Switch between Price/Volume and Technical Indicators tabs** for deeper analysis.

---

## API Endpoints

- `POST /test-api-key` - Set and test your Google API key
- `GET /analyze/{symbol}` - Get AI analysis for a specific stock
- `GET /historical-data/{symbol}` - Get historical price and volume data
- `GET /market-insights` - Get general market insights

---

## Technical Indicators

- **SMA (20):** 20-day Simple Moving Average
- **EMA (20):** 20-day Exponential Moving Average
- **RSI:** Relative Strength Index (momentum)
- **MACD:** Moving Average Convergence Divergence (trend)
- **Volume:** Trading volume

---

## Disclaimer

This is a dummy trading bot for educational purposes. It does not execute real trades but provides analysis and insights using Gemini AI. Market data and AI insights are for informational purposes only. Always consult a financial advisor before making investment decisions.

---

**Made with ❤️ by Arastu Thakur** 