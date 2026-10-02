import { useState } from 'react'
import BacktestForm from './components/BacktestForm'
import type { BacktestResponse } from './types/backtest'
import './App.css'

const percentageMetrics = new Set([
  'Time in Market',
  'Total Return',
  'Annualized Return',
  'Benchmark Return',
  'Annualized Volatility',
  'Max Drawdown',
])

function formatMetric(name: string, value: number | null): string {
  if (value === null) return 'N/A'

  if (percentageMetrics.has(name)) {
    return `${(value * 100).toFixed(2)}%`
  }

  if (name === 'Number of Market Entries') {
    return value.toFixed(0)
  }

  return value.toFixed(2)
}

export default function App() {
  const [completedRun, setCompletedRun] = useState<{
    symbol: string
    result: BacktestResponse
  } | null>(null)

  function handleResult(result: BacktestResponse, symbol: string) {
    setCompletedRun({ symbol, result })
  }

  return (
    <main className="workspace">
      <header className="workspace-header">
        <h1>Practice Backtester</h1>
        <p>Configure an experiment and inspect its performance.</p>
      </header>

      <div className="workspace-body">
        <BacktestForm onResult={handleResult} />

        <section className="results-panel">
          <h2>Results</h2>

          {completedRun === null ? (
            <p>Run a backtest to see its results.</p>
          ) : (
            <>
              <p>Last successful run: {completedRun.symbol}</p>

              <dl className="metrics-grid">
                {Object.entries(completedRun.result.summary).map(
                  ([name, value]) => (
                    <div className="metric-card" key={name}>
                      <dt>{name}</dt>
                      <dd>{formatMetric(name, value)}</dd>
                    </div>
                  )
                )}
              </dl>
            </>
          )}
        </section>
      </div>
    </main>
  )
}