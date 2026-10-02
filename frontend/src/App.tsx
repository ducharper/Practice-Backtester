import { useState } from 'react'
import BacktestForm from './components/BacktestForm'
import PerformanceChart from './components/PerformanceChart'
import TradeTable from './components/TradeTable'
import { strategyNames } from './types/experiment'
import type { CompletedRun } from './types/experiment'
import { metric, money } from './lib/format'
import './App.css'
export default function App() {
  const [run, setRun] = useState<CompletedRun | null>(null)
  const [dirty, setDirty] = useState(false)
  const [running, setRunning] = useState(false)
  const [tab, setTab] = useState<'overview' | 'trades'>('overview')
  const primaryMetrics = ['Total Return', 'Benchmark Return', 'Sharpe Ratio', 'Max Drawdown']
  function receive(completed: CompletedRun) { setRun(completed); setDirty(false) }
  return <div className="app-shell">
    <header className="topbar"><a href="#" className="brand"><span className="brand-mark" aria-hidden="true">∿</span>Practice<span> / Research</span></a><span className="local-badge"><i /> LOCAL WORKSPACE</span></header>
    <main className="workspace"><div className="workspace-header"><div><span className="eyebrow">STRATEGY LAB</span><h1>Turn a hypothesis into evidence.</h1><p>Configure, run, and understand your next experiment.</p></div><span className="version-label">01 / BACKTEST</span></div>
      <div className="workspace-body"><BacktestForm onResult={receive} onEdit={() => setDirty(true)} onRunning={setRunning} />
        <div className="results-panel" aria-busy={running}>
          {!run ? <section className="panel welcome-panel"><span className="eyebrow">YOUR RESEARCH STARTS HERE</span><div className="empty-mark" aria-hidden="true">↗</div><h2>{running ? 'Your experiment is running.' : 'One idea. A clearer picture.'}</h2><p>{running ? 'Fetching historical prices and calculating returns. Your results will appear here.' : 'Choose a strategy and a date range, then run your first backtest. Explore performance, risk, and the trades behind the result.'}</p><div className="empty-features"><div><b>01</b><strong>Compare performance</strong><span>Strategy alongside buy-and-hold.</span></div><div><b>02</b><strong>Understand the risk</strong><span>Inspect drawdowns over time.</span></div><div><b>03</b><strong>Review every trade</strong><span>Sort, filter, and export the ledger.</span></div></div><p className="footnote">Results will use your Python backtester. No simulated demo results.</p></section> : <>
            <div className="run-heading"><div><span className="eyebrow">LAST SUCCESSFUL RUN</span><h2>{run.request.symbol} <span> / {strategyNames[run.request.strategy.name]}</span></h2><p>{run.request.start} → {run.request.end} · {money(run.request.initial_cash)} capital · {run.request.cost_bps} bps</p></div><span className="complete-badge">Completed {new Date(run.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            {(dirty || running) && <p className="notice" role="status">{running ? 'A new run is in progress. The results below belong to your last successful run.' : 'Settings changed. Run again to update the results below.'}</p>}
            <dl className="metrics-grid">{primaryMetrics.map(name => <div className="metric-card" key={name}><dt>{name}</dt><dd>{metric(name, run.result.summary[name])}</dd><span>{name === 'Total Return' ? 'After strategy costs' : name === 'Benchmark Return' ? 'Buy-and-hold · before costs' : name === 'Sharpe Ratio' ? 'Risk-adjusted performance' : 'Largest peak-to-trough decline'}</span></div>)}</dl>
            <div className="tabs" role="tablist" aria-label="Backtest results">{(['overview', 'trades'] as const).map(t => <button id={`${t}-tab`} role="tab" aria-controls={`${t}-panel`} aria-selected={tab === t} key={t} onClick={() => setTab(t)}>{t === 'overview' ? 'Performance overview' : `Trade ledger (${run.result.trades.length})`}</button>)}</div>
            <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab" hidden={tab !== 'overview'}>
              {tab === 'overview' && <PerformanceChart key={run.completedAt} equity={run.result.equity} initialCash={run.request.initial_cash} />}
              <section className="panel secondary-metrics"><h2>Performance details</h2><dl>{Object.entries(run.result.summary).filter(([name]) => !primaryMetrics.includes(name)).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{metric(name, value)}</dd></div>)}</dl></section>
            </div>
            <div id="trades-panel" role="tabpanel" aria-labelledby="trades-tab" hidden={tab !== 'trades'}>{tab === 'trades' && <TradeTable key={run.completedAt} trades={run.result.trades} symbol={run.request.symbol} />}</div>
            <details className="panel run-details"><summary>Exact settings for this result</summary><pre>{JSON.stringify(run.request, null, 2)}</pre></details>
          </>}
        </div>
      </div><footer className="workspace-footer">Practice Backtester <span>Research workspace · results remain in this tab until refreshed</span></footer>
    </main>
  </div>
}
