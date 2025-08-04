'use client'

import { useState, useEffect } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Brain, Download, RefreshCw, X
} from 'lucide-react'

export default function UltimateStockAnalyzer() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [watchlist, setWatchlist] = useState(['AAPL','TSLA','NVDA','MSFT','GOOGL','AMZN','META','NFLX'])
  const [newSymbol, setNewSymbol] = useState('')

  async function fetchRealStockData() {
    try {
      setLoading(true)
      setError(null)
      const symbols = watchlist.join(',')
      const res = await fetch(`/api/stocks?symbols=${symbols}`)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'No data')
      setStocks(json.data)
    } catch (e: any) {
      setError(e.message)
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealStockData()
    const iv = setInterval(fetchRealStockData, 60000)
    return () => clearInterval(iv)
  }, [watchlist])

  const addStock = () => {
    const sym = newSymbol.toUpperCase().trim()
    if (sym && !watchlist.includes(sym)) {
      setWatchlist([...watchlist, sym])
    }
    setNewSymbol('')
  }

  const removeStock = (sym: string) => {
    setWatchlist(watchlist.filter(s => s !== sym))
    setStocks(stocks.filter(s => s.symbol !== sym))
  }

  const generateExcelReport = () => {
    // Implementation omitted for brevity
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY': return 'bg-green-600 text-white'
      case 'BUY': return 'bg-green-500 text-white'
      case 'HOLD': return 'bg-yellow-500 text-black'
      case 'SELL': return 'bg-red-500 text-white'
      case 'STRONG_SELL': return 'bg-red-600 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (loading && stocks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">Real-Time Stock Analysis System</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchRealStockData} className="flex items-center gap-1 bg-blue-600 px-3 py-1 rounded">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="flex items-center gap-1">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>AI Analysis Active</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-800 p-2 rounded">
            <AlertTriangle className="inline w-4 h-4 mr-2 text-red-400" />
            {error}
          </div>
        )}

        <section className="mb-6">
          <h2 className="mb-2 font-semibold">Stock Selection</h2>
          <div className="flex gap-2 mb-2">
            <input
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addStock()}
              placeholder="Enter symbol"
              className="px-2 py-1 bg-gray-800 rounded"
            />
            <button onClick={addStock} className="px-3 py-1 bg-gray-700 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchlist.map(sym => (
              <div key={sym} className="bg-gray-700 px-3 py-1 rounded flex items-center gap-1">
                {sym}
                <button onClick={() => removeStock(sym)} className="hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[ 'S&P 500', 'NASDAQ', 'DOW JONES', 'VIX' ].map((idx, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded">
                <div className="text-sm text-gray-400">{idx}</div>
                <div className="text-xl font-bold">{['5617.85','18682.21','40347.97','23.42'][i]}</div>
                <div className={`${i===3 ? 'text-green-400' : 'text-red-400'} text-sm`}>
                  {i===3?'+12.3%':'-1.64%'}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-2 mb-4">
            {['overview','technical','ai','reports'].map(id => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1 rounded ${activeTab===id?'bg-blue-600':'bg-gray-700'}`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map(stock => (
                <div key={stock.symbol} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{stock.symbol}</h3>
                      <p className="text-gray-400 text-sm">{stock.name}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs ${getRecommendationColor(stock.recommendation)}`}>
                      {stock.recommendation}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl">${stock.price}</span>
                    <span className={`${stock.changePercent>=0?'text-green-400':'text-red-400'} ml-2`}>
                      {stock.changePercent>=0?'+':''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">Volume: {stock.volume.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'technical' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Technical Analysis - {selectedStock}</h2>
              {stocks.filter(s => s.symbol === selectedStock).map(stock => (
                <div key={stock.symbol} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">ATR</h4>
                    <p className="text-white">{stock.indicators.atr.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">SMA150</h4>
                    <p className="text-white">{stock.indicators.sma150.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">MACD</h4>
                    <p className="text-white">{stock.indicators.macd.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">RSI</h4>
                    <p className="text-white">{stock.indicators.rsi.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
