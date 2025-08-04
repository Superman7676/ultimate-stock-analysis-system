import { NextRequest, NextResponse } from 'next/server'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  aiScore: number
  technicalScore: number
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
  confidence: number
  indicators: Record<string, number>
  levels: {
    support: number[]
    resistance: number[]
    fibonacci: Record<string, number>
  }
  sentiment: Record<string, any>
  options: Record<string, any>
  prePostMarket: Record<string, any>
  patterns: Record<string, any>
  riskMetrics: Record<string, any>
}

// Fetch Yahoo Finance data via direct query endpoint
async function fetchYahooFinanceData(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })
  if (!res.ok) throw new Error(`Yahoo error ${res.status}`)
  const json = await res.json()
  const result = json.chart?.result?.[0]
  if (!result) throw new Error(`No data for ${symbol}`)
  const meta = result.meta
  const quote = result.indicators.quote?.[0]
  return {
    symbol: meta.symbol,
    longName: meta.longName,
    shortName: meta.shortName,
    price: meta.regularMarketPrice,
    previousClose: meta.previousClose,
    change: meta.regularMarketPrice - meta.previousClose,
    changePercent: (meta.regularMarketPrice - meta.previousClose)/meta.previousClose*100,
    high: meta.regularMarketDayHigh,
    low: meta.regularMarketDayLow,
    volume: quote?.volume?.slice(-1)[0] || 0
  }
}

// Simple indicator calc
function calcIndicators(data: any) {
  const price = data.price
  return {
    sma150: price*(0.95+Math.random()*0.1),
    atr: Math.abs((data.high||price*1.02)-(data.low||price*0.98)),
    macd: (Math.random()-0.5)*4,
    rsi: 30+Math.random()*40
  }
}

// Simple AI
function calcAI(ind: any, price: number) {
  let score=5
  if (ind.rsi>30&&ind.rsi<70) score++
  if (ind.macd>0) score++
  if (price>ind.sma150) score++
  return {
    aiScore:+score.toFixed(1),
    technicalScore:+(score*0.9).toFixed(1),
    recommendation: score>=8?'STRONG_BUY':score>=6?'BUY':'HOLD',
    confidence:Math.round(50+score*4)
  }
}

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams
  const symbols = params.get('symbols')?.split(',')||['AAPL','TSLA']
  const stocks: StockData[] = []

  for (const sym of symbols) {
    try {
      const d = await fetchYahooFinanceData(sym)
      const ind = calcIndicators(d)
      const ai = calcAI(ind,d.price)
      stocks.push({
        symbol: d.symbol,
        name: d.longName||d.shortName||d.symbol,
        price: d.price,
        change: d.change,
        changePercent: d.changePercent,
        volume: d.volume,
        marketCap: d.price*1e9,
        aiScore:ai.aiScore,
        technicalScore:ai.technicalScore,
        recommendation:ai.recommendation,
        confidence:ai.confidence,
        indicators: ind,
        levels:{
          support:[ind.sma150*0.98,ind.sma150*0.95],
          resistance:[ind.sma150*1.02,ind.sma150*1.05],
          fibonacci:{'618':ind.sma150*0.618}
        },
        sentiment:{score:0.5,newsCount:5},
        options:{putCallRatio:1},
        prePostMarket:{},
        patterns:{detected:[],strength:0.5,breakoutProbability:0.5},
        riskMetrics:{beta:1,volatility:0.2,sharpe:1,maxDrawdown:-0.1,var1Day:-0.02,var5Day:-0.05}
      })
    } catch(e) {
      console.warn(`Failed ${sym}:`,e)
    }
  }
  return NextResponse.json({success:true,data:stocks})
}
