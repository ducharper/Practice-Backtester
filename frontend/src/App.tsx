import { useRef, useState } from 'react'
import ChromeLogo from './components/ChromeLogo'
import BacktestForm from './components/BacktestForm'
import PerformanceChart from './components/PerformanceChart'
import TradeTable from './components/TradeTable'
import RunHistory from './components/RunHistory'
import RunSettings from './components/RunSettings'
import { strategyNames } from './types/experiment'
import type { CompletedRun } from './types/experiment'
import { metric, money } from './lib/format'
import './workspace.css'
export default function App() {
  const drawer = useRef<HTMLDialogElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  function openParameters() { setEditing(true); drawer.current?.showModal() }
  function closeParameters() { drawer.current?.close(); setEditing(false); editButton.current?.focus() }
  const [run, setRun] = useState<CompletedRun | null>(null)
  const [dirty, setDirty] = useState(false)
  const [running, setRunning] = useState(false)
  const [historyWorking, setHistoryWorking] = useState(false)
  const [historyRevision, setHistoryRevision] = useState(0)
  const [formRevision, setFormRevision] = useState(0)
  const [formRequest, setFormRequest] = useState<CompletedRun['request']>()
  const [tab, setTab] = useState<'overview' | 'trades' | 'details'>('overview')
  const [workspaceTab, setWorkspaceTab] = useState<'backtest' | 'saved'>('backtest')
  const primaryMetrics = ['Total Return', 'Benchmark Return', 'Sharpe Ratio', 'Max Drawdown']
  function receive(completed: CompletedRun) { setRun(completed); closeParameters(); setDirty(false); setHistoryRevision(n => n + 1) }
  function openSaved(saved: CompletedRun) { setRun(saved); setFormRequest(saved.request); setFormRevision(n => n + 1); setDirty(false); setWorkspaceTab('backtest') }
  return <div className="app-shell">
    <header className="topbar"><a href="#main-content" className="skip-link">Skip to results</a><ChromeLogo /><div className="header-controls">
      <div className="tabs workspace-tabs" role="tablist" aria-label="Workspace">
        {(['backtest', 'saved'] as const).map(name => <button className="parameter-orb nav-orb" aria-label={name === 'backtest' ? 'Backtest' : 'Saved runs'} data-tooltip={name === 'backtest' ? 'Backtest' : 'Saved runs'} key={name} id={`workspace-${name}-tab`} role="tab" aria-controls={`workspace-${name}-panel`} aria-selected={workspaceTab === name} tabIndex={workspaceTab === name ? 0 : -1} onClick={() => setWorkspaceTab(name)} onKeyDown={event => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            const next = event.key === 'Home' ? 'backtest' : event.key === 'End' ? 'saved' : name === 'backtest' ? 'saved' : 'backtest'
            setWorkspaceTab(next)
            document.getElementById(`workspace-${next}-tab`)?.focus()
          }
        }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'backtest' ? <><path d="M4 4v16h16" /><path d="m7 14 4-5 4 3 5-7" /></> : <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M3 4h18v4H3zM9 12h6" /></>}</svg></button>)}
      </div>
      <button ref={editButton} className="edit-parameters parameter-orb" aria-label="Edit parameters" data-tooltip="Edit parameters" aria-haspopup="dialog" aria-expanded={editing} onClick={openParameters}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z" /></svg></button></div></header>
    <main className="workspace">
      <div id="workspace-saved-panel" role="tabpanel" aria-labelledby="workspace-saved-tab" hidden={workspaceTab !== 'saved'}>
        {workspaceTab === 'saved' && <RunHistory key={`history-${historyRevision}`} revision={historyRevision} busy={running} activeId={run?.id} onWorking={setHistoryWorking} onOpen={openSaved} onDelete={id => { if (run?.id === id) setRun(null) }} />}
      </div>
      <div id="workspace-backtest-panel" role="tabpanel" aria-labelledby="workspace-backtest-tab" hidden={workspaceTab !== 'backtest'}>
      <div className="workspace-body">
        <div id="main-content" tabIndex={-1} className="results-panel" aria-label="Backtest results" aria-busy={running}>
          {!run ? <section className="panel welcome-panel"><div className="empty-toolbar"><span>PERFORMANCE</span><span>NO RUN SELECTED</span></div><div className="empty-content"><span className="eyebrow">BACKTEST / NEW</span><h2>{running ? 'Calculating results.' : <>An idea, <em>measured.</em></>}</h2><p>{running ? 'Fetching historical prices and calculating returns.' : 'Choose a symbol, date range, and strategy. Run a backtest to inspect performance, drawdowns, and completed trades.'}</p><button className="empty-instruction quiet-button" onClick={openParameters}>Configure backtest ↗</button></div><div className="empty-features"><div><b>01 / PERFORMANCE</b><span>Strategy vs. buy-and-hold</span></div><div><b>02 / RISK</b><span>Returns and drawdowns</span></div><div><b>03 / EXECUTION</b><span>Completed trade ledger</span></div></div></section> : <>
            <div className="run-heading"><div><span className="eyebrow">RUN RESULTS</span><h2>{run.request.symbol} <span> / {strategyNames[run.request.strategy.name]}</span></h2><p>{run.request.start} → {run.request.end} · {money(run.request.initial_cash)} capital · {run.request.cost_bps} bps</p></div><span className="complete-badge">Completed {new Date(run.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></div>
            {(dirty || running) && <p className="notice" role="status">{running ? 'A new run is in progress. The results below belong to your last successful run.' : 'Settings changed. Run again to update the results below.'}</p>}
            <dl className="metrics-grid">{primaryMetrics.map(name => <div className="metric-card" key={name}><dt>{name}</dt><dd>{metric(name, run.result.summary[name])}</dd><span>{name === 'Total Return' ? 'After strategy costs' : name === 'Benchmark Return' ? 'Buy-and-hold · before costs' : name === 'Sharpe Ratio' ? 'Risk-adjusted performance' : 'Largest peak-to-trough decline'}</span></div>)}</dl>
            <div className="tabs" role="tablist" aria-label="Backtest results">{(['overview', 'trades', 'details'] as const).map(t => <button id={`${t}-tab`} role="tab" aria-controls={`${t}-panel`} aria-selected={tab === t} tabIndex={tab === t ? 0 : -1} onKeyDown={event => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                event.preventDefault()
                const order = ['overview', 'trades', 'details'] as const
                const next = event.key === 'Home' ? 'overview' : event.key === 'End' ? 'details' : order[(order.indexOf(t) + (event.key === 'ArrowRight' ? 1 : 2)) % 3]
                setTab(next)
                document.getElementById(`${next}-tab`)?.focus()
              }
            }} key={t} onClick={() => setTab(t)}>{t === 'overview' ? 'Performance overview' : t === 'details' ? 'Run details' : `Trade ledger (${run.result.trades.length})`}</button>)}</div>
            <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab" hidden={tab !== 'overview'}>
              {tab === 'overview' && <PerformanceChart key={run.completedAt} equity={run.result.equity} initialCash={run.request.initial_cash} />}

            </div>
            <div id="trades-panel" role="tabpanel" aria-labelledby="trades-tab" hidden={tab !== 'trades'}>{tab === 'trades' && <TradeTable key={run.completedAt} trades={run.result.trades} symbol={run.request.symbol} />}</div>
            <div id="details-panel" role="tabpanel" aria-labelledby="details-tab" hidden={tab !== 'details'}>              <section className="panel secondary-metrics"><h2>Performance details</h2><dl>{Object.entries(run.result.summary).filter(([name]) => !primaryMetrics.includes(name)).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{metric(name, value)}</dd></div>)}</dl></section><RunSettings request={run.request} /></div>
          </>}
        </div>
      </div></div><footer className="workspace-footer">Practice Backtester <span>Daily prices · Results saved locally</span></footer>
    </main>
    <dialog ref={drawer} className="parameter-drawer parameter-popover" aria-label="Edit backtest parameters" onClose={() => setEditing(false)} onCancel={event => { event.preventDefault(); closeParameters() }} onClick={event => { const bounds = event.currentTarget.getBoundingClientRect(); if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeParameters() }}>
      <div className="drawer-heading"><div><span className="eyebrow">BACKTEST SETUP</span><span className="editor-hint">Adjust your inputs. Keep your place.</span></div><button className="parameter-orb close-orb" onClick={closeParameters} aria-label="Close parameters" title="Close parameters"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
      <BacktestForm key={`form-${formRevision}`} disabled={historyWorking} initialRequest={formRequest} onResult={receive} onEdit={() => setDirty(true)} onRunning={setRunning} />
    </dialog>
  </div>
}
