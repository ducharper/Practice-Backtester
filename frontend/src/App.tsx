import { useState } from 'react'
import BacktestForm from './components/BacktestForm'
import PerformanceChart from './components/PerformanceChart'
import TradeTable from './components/TradeTable'
import { strategyNames } from './types/experiment'
import type { CompletedRun } from './types/experiment'
import { metric, money } from './lib/format'
import './workspace.css'
export default function App() {
  const [run, setRun] = useState<CompletedRun | null>(null)
  const [dirty, setDirty] = useState(false)
  const [running, setRunning] = useState(false)
  const [tab, setTab] = useState<'overview' | 'trades'>('overview')
  const primaryMetrics = ['Total Return', 'Benchmark Return', 'Sharpe Ratio', 'Max Drawdown']
  function receive(completed: CompletedRun) { setRun(completed); setDirty(false) }
  return <div className="app-shell">
    <header className="topbar"><a href="#" className="brand">practice<span> / BACKTESTER</span></a><span className="topbar-section">RESEARCH WORKSPACE</span><span className="local-badge">LOCAL / PYTHON ENGINE</span></header>
    <main className="workspace"><div className="workspace-header"><div><span className="eyebrow">RESEARCH / 01</span><h1>Strategy <em>analysis.</em></h1></div><div className="workspace-description">Historical simulation<br /><span>Daily observations · Long / flat</span></div></div>
      <div className="workspace-body"><BacktestForm onResult={receive} onEdit={() => setDirty(true)} onRunning={setRunning} />
        <div className="results-panel" aria-busy={running}>
          {!run ? <section className="panel welcome-panel"><div className="empty-toolbar"><span>PERFORMANCE</span><span>NO RUN SELECTED</span></div><div className="empty-content"><span className="eyebrow">BACKTEST / NEW</span><h2>{running ? 'Calculating results.' : <>An idea, <em>measured.</em></>}</h2><p>{running ? 'Fetching historical prices and calculating returns.' : 'Set the parameters on the left and run a simulation to inspect performance, drawdowns, and completed trades.'}</p><span className="empty-instruction">{running ? 'CALCULATION IN PROGRESS' : '← CONFIGURE YOUR FIRST RUN'}</span></div><div className="empty-features"><div><b>01 / PERFORMANCE</b><span>Strategy vs. buy-and-hold</span></div><div><b>02 / RISK</b><span>Returns and drawdowns</span></div><div><b>03 / EXECUTION</b><span>Completed trade ledger</span></div></div></section> : <>
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
