'use client'

import { useState, useEffect } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Brain,
  Download, RefreshCw, X
} from 'lucide-react'

export default function UltimateStockAnalyzer() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [watchlist, setWatchlist] = useState(['AAPL','TSLA','NVDA'])
  const [newSymbol, setNewSymbol] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/stocks?symbols=${watchlist.join(',')}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error||'No data')
      setStocks(json.data)
    } catch (e:any) {
      setError(e.message)
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData,60000)
    return ()=>clearInterval(iv)
  },[watchlist])

  const addStock = () => {
    const s = newSymbol.toUpperCase().trim()
    if (s && !watchlist.includes(s)) setWatchlist([...watchlist,s])
    setNewSymbol('')
  }
  const removeStock = (s:string) => setWatchlist(watchlist.filter(x=>x!==s))

  if (loading && stocks.length===0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between p-4 bg-gray-800">
        <h1 className="text-xl font-bold">Real-Time Stock Analysis System</h1>
        <button onClick={fetchData} className="flex items-center gap-1">
          <RefreshCw/> Refresh
        </button>
      </header>
      <main className="p-4">
        {error && (
          <div className="mb-4 p-2 bg-red-800">{error}</div>
        )}
        <div className="mb-4 flex gap-2">
          <input
            value={newSymbol}
            onChange={e=>setNewSymbol(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addStock()}
            placeholder="Symbol"
            className="px-2 py-1 bg-gray-800"
          />
          <button onClick={addStock} className="px-3 py-1 bg-gray-700">Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stocks.map(s=>(
            <div key={s.symbol} className="p-4 bg-gray-800 rounded">
              <div className="flex justify-between">
                <h2 className="font-bold">{s.symbol}</h2>
                <button onClick={()=>removeStock(s.symbol)}>
                  <X/>
                </button>
              </div>
              <p>Price: ${s.price.toFixed(2)}</p>
              <p>Change: {s.changePercent.toFixed(2)}%</p>
              <p>AI Score: {s.aiScore}/10</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
