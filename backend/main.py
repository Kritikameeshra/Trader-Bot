import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import json
import logging
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store API key in memory (in production, use a secure storage)
api_key = None

class ApiKeyRequest(BaseModel):
    api_key: str

@app.post("/test-api-key")
async def test_api_key(request: ApiKeyRequest):
    try:
        genai.configure(api_key=request.api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Test the API key with a simple request
        response = model.generate_content("Test")
        global api_key
        api_key = request.api_key
        return {"status": "success"}
    except Exception as e:
        logger.error(f"API key test failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.get("/")
async def root():
    return {"message": "Trading Bot API is running"}

@app.get("/analyze/{symbol}")
async def analyze_stock(symbol: str):
    if not api_key:
        raise HTTPException(status_code=401, detail="API key not set")
        
    try:
        logger.info(f"Analyzing stock: {symbol}")
        
        # Fetch stock data
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1mo")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Prepare data for analysis
        data = {
            "current_price": float(hist['Close'].iloc[-1]),
            "price_change": float(hist['Close'].iloc[-1] - hist['Close'].iloc[0]),
            "volume": int(hist['Volume'].iloc[-1]),
            "high": float(hist['High'].max()),
            "low": float(hist['Low'].min())
        }
        
        # Create prompt for Gemini
        prompt = f"""
        Analyze the following stock data for {symbol}:
        Current Price: ${data['current_price']:.2f}
        Price Change: ${data['price_change']:.2f}
        Volume: {data['volume']}
        30-day High: ${data['high']:.2f}
        30-day Low: ${data['low']:.2f}
        
        Please provide:
        1. A brief market analysis
        2. Key trends and patterns
        3. Potential trading signals
        4. Risk assessment
        """
        
        # Get analysis from Gemini
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            analysis = response.text
        except Exception as e:
            logger.error(f"Gemini AI error: {str(e)}")
            analysis = "Unable to generate AI analysis at this time."
        
        return {
            "symbol": symbol,
            "data": data,
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Error analyzing stock {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/historical-data/{symbol}")
async def get_historical_data(symbol: str):
    try:
        logger.info(f"Fetching historical data for: {symbol}")
        
        # Fetch historical data
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1mo")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Format data for the chart
        data = []
        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime("%Y-%m-%d"),
                "price": float(row['Close']),
                "volume": int(row['Volume'])
            })
        
        return data
        
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market-insights")
async def get_market_insights():
    if not api_key:
        raise HTTPException(status_code=401, detail="API key not set")
        
    try:
        logger.info("Fetching market insights")
        
        # Create prompt for Gemini
        prompt = """
        Provide a detailed market overview in the following format:

        1. Current Market Trends:
        [List key trends]

        2. Key Economic Indicators:
        [List important indicators]

        3. Notable Market Events:
        [List significant events]

        4. Trading Opportunities:
        [List potential opportunities]

        Make it concise but informative.
        """
        
        # Get insights from Gemini
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            insights_text = response.text
            
            # Parse the response into sections
            sections = {}
            current_section = None
            current_content = []
            
            for line in insights_text.split('\n'):
                if line.strip().startswith(('1.', '2.', '3.', '4.')):
                    if current_section:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = line.split('.')[1].strip().lower().replace(':', '')
                    current_content = []
                elif line.strip() and current_section:
                    current_content.append(line.strip())
            
            if current_section:
                sections[current_section] = '\n'.join(current_content)
            
            return {
                "timestamp": datetime.now().isoformat(),
                "trends": sections.get('current market trends', ''),
                "indicators": sections.get('key economic indicators', ''),
                "events": sections.get('notable market events', ''),
                "opportunities": sections.get('trading opportunities', '')
            }
            
        except Exception as e:
            logger.error(f"Gemini AI error: {str(e)}")
            return {
                "timestamp": datetime.now().isoformat(),
                "trends": "Unable to generate market trends at this time.",
                "indicators": "Unable to generate economic indicators at this time.",
                "events": "Unable to generate market events at this time.",
                "opportunities": "Unable to generate trading opportunities at this time."
            }
        
    except Exception as e:
        logger.error(f"Error fetching market insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 