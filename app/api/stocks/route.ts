import { NextRequest, NextResponse } from 'next/server'

const API_KEYS = {
  ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_API_KEY,
  FINNHUB: process.env.FINNHUB_API_KEY,
  POLYGON: process.env.POLYGON_API_KEY,
  TWELVE_DATA: process.env.TWELVE_DATA_API_KEY,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || ['AAPL', 'TSLA', 'NVDA', 'MSFT']

  try {
    const stocksData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          // קריאה ל-Alpha Vantage לנתונים בסיסיים
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE}`,
            { next: { revalidate: 60 } }
          )
          
          const data = await response.json()
          const quote = data["Global Quote"]
          
          if (!quote || !quote["05. price"]) {
            throw new Error(`No data for ${symbol}`)
          }

          // קריאה ל-Finnhub לנתונים נוספים
          const finnhubResponse = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEYS.FINNHUB}`,
            { next: { revalidate: 60 } }
          )
          const finnhubData = await finnhubResponse.json()

          const price = parseFloat(quote["05. price"])
          const change = parseFloat(quote["09. change"])
          const changePercent = parseFloat(quote["10. change percent"].replace('%', ''))
          const volume = parseInt(quote["06. volume"] || "0")

          // חישוב אינדיקטורים טכניים מדומים (או קריאות API נוספות)
          const indicators = {
            rsi: 30 + Math.random() * 40,
            macd: (Math.random() - 0.5) * 4,
            sma150: price * (0.90 + Math.random() * 0.10),
            sma200: price * (0.85 + Math.random() * 0.12),
            atr: price * (0.02 + Math.random() * 0.03),
            adx: 15 + Math.random() * 50,
            vwap: price * (0.998 + Math.random() * 0.004)
          }

          // חישוב AI Score
          let aiScore = 5.0
          if (indicators.rsi > 30 && indicators.rsi < 70) aiScore += 1
          if (indicators.macd > 0) aiScore += 1
          if (price > indicators.sma150) aiScore += 1
          if (price > indicators.sma200) aiScore += 1
          if (changePercent > 0) aiScore += 0.5

          let recommendation = 'HOLD'
          if (aiScore >= 8) recommendation = 'STRONG_BUY'
          else if (aiScore >= 7) recommendation = 'BUY'
          else if (aiScore <= 3) recommendation = 'SELL'

          return {
            symbol,
            name: `${symbol} Corporation`,
            price,
            change,
            changePercent,
            volume,
            aiScore: Number(aiScore.toFixed(1)),
            recommendation,
            confidence: Math.round(60 + Math.random() * 30),
            indicators: {
              rsi: indicators.rsi.toFixed(1),
              macd: indicators.macd.toFixed(2),
              sma150: indicators.sma150.toFixed(2),
              sma200: indicators.sma200.toFixed(2),
              atr: indicators.atr.toFixed(2),
              adx: indicators.adx.toFixed(1),
              vwap: indicators.vwap.toFixed(2),
            }
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
          return null
        }
      })
    )

    const validStocks = stocksData.filter(stock => stock !== null)
    
    return NextResponse.json({ 
      success: true, 
      data: validStocks,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
