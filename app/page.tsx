'use client'

import { useState, useEffect } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Brain,
  Download, RefreshCw, Target, X
} from 'lucide-react'

// פונקציית קריאה ל-API Route שלנו
async function fetchStockData(symbols: string[]) {
  const res = await fetch('/api/stocks?symbols=' + symbols.join(','))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'No data')
  return json.data
}

export default function UltimateStockAnalyzer() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [watchlist, setWatchlist] = useState(['AAPL','TSLA','NVDA','MSFT','GOOGL'])
  const [newSymbol, setNewSymbol] = useState('')
  const [activeTab, setActiveTab] = useState<'overview'|'technical'|'ai'|'reports'>('overview')
  const [selectedStock, setSelectedStock] = useState<string>(watchlist[0])

  // פונקציית לטעינת נתונים
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchStockData(watchlist)
      setStocks(data)
    } catch (e: any) {
      setError(e.message)
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  // קרא לטעינת נתונים ב-mount ובכל שינוי ב-watchlist
  useEffect(() => {
    loadData()
    const iv = setInterval(loadData, 60000)
    return () => clearInterval(iv)
  }, [watchlist])

  // הוסף מניה ל-watchlist
  const addStock = () => {
    const sym = newSymbol.toUpperCase().trim()
    if (sym && !watchlist.includes(sym)) setWatchlist([...watchlist, sym])
    setNewSymbol('')
  }

  // הסר מניה מה-watchlist
  const removeStock = (sym: string) => {
    setWatchlist(watchlist.filter(s => s !== sym))
    setStocks(stocks.filter(s => s.symbol !== sym))
  }

  // צבעי המלצות
  const getRecColor = (rec: string) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <RefreshCw className="animate-spin w-8 h-8" />
        <span className="ml-2">טוען נתונים...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800 p-4 flex justify-between">
        <h1 className="text-xl font-bold">Real-Time Stock Analysis System</h1>
        <button onClick={loadData} className="flex items-center gap-1 bg-blue-600 px-3 py-1 rounded">
          <RefreshCw /> Refresh
        </button>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-800 p-2 rounded flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Stock Selection */}
        <section>
          <h2 className="mb-2 font-semibold">Stock Selection</h2>
          <div className="flex gap-2 mb-4">
            <input
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addStock()}
              placeholder="Enter symbol (e.g. AAPL)"
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded"
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

        {/* Market Overview */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'S&P 500', value: '5,617.85', change: '-1.64%' },
              { label: 'NASDAQ', value: '18,682.21', change: '-1.97%' },
              { label: 'DOW JONES', value: '40,347.97', change: '-1.27%' },
              { label: 'VIX', value: '23.42', change: '+12.3%', green: true }
            ].map((idx, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded">
                <div className="text-sm text-gray-400">{idx.label}</div>
                <div className="text-xl font-bold">{idx.value}</div>
                <div className={`text-sm ${idx.green ? 'text-green-400' : 'text-red-400'}`}>
                  {idx.change}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="flex gap-2 mb-4">
            {['overview','technical','ai','reports'].map(id => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-3 py-1 rounded ${activeTab===id?'bg-blue-600':'bg-gray-700'}`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map(s => (
                <div key={s.symbol} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{s.symbol}</h3>
                      <p className="text-gray-400 text-sm">{s.name}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs ${getRecColor(s.recommendation)}`}>
                      {s.recommendation}
                    </div>
                  </div>
                  <p className="text-2xl">
                    ${s.price.toFixed(2)}{' '}
                    <span className={`${s.changePercent>=0?'text-green-400':'text-red-400'}`}>
                      {s.changePercent>=0?'+':''}{s.changePercent.toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm">Volume: {s.volume.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Technical Tab */}
          {activeTab === 'technical' && (
            <div>
              <h2 className="mb-2 font-semibold">Technical Analysis - {selectedStock}</h2>
              {stocks.filter(s => s.symbol === selectedStock).map(s => (
                <div key={s.symbol} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">ATR</h4>
                    <p>${s.indicators.atr.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">SMA150</h4>
                    <p>${s.indicators.sma150.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">MACD</h4>
                    <p>{s.indicators.macd.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded">
                    <h4 className="text-sm text-gray-400 mb-1">RSI</h4>
                    <p>{s.indicators.rsi.toFixed(1)}</p>
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
