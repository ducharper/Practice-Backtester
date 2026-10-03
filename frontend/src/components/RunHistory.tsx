import { useEffect, useState } from 'react'
import type { CompletedRun } from '../types/experiment'
import { strategyNames } from '../types/experiment'
import { isBacktestResponse } from '../lib/api'

type SavedRun = Omit<CompletedRun, 'result'> & { id: string }
async function historyRequest(path: string, method = 'GET') {
  const response = await fetch(`/api/runs${path}`, { method })
  if (!response.ok) throw new Error('Could not access saved runs. Check that the application is running, then refresh history.')
  return response.status === 204 ? null : response.json()
}
export default function RunHistory({ revision, busy, activeId, onOpen, onDelete, onWorking }: { revision: number; busy: boolean; activeId?: string; onOpen: (run: CompletedRun) => void; onDelete: (id: string) => void; onWorking: (busy: boolean) => void }) {
  const [items, setItems] = useState<SavedRun[]>([])
  const [page, setPage] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let current = true
    // This effect synchronizes loading state with the database request.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true); setError('')
    historyRequest(`?limit=30&offset=${page * 30}`).then(rows => { if (current) setItems(rows) }).catch(err => { if (current) setError(err.message) }).finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [revision, page, refresh])
  async function open(id: string) {
    setWorking(true); onWorking(true); setError('')
    try {
      const run = await historyRequest(`/${id}`)
      if (!isBacktestResponse(run.result)) throw new Error('This saved result is not readable by this version.')
      onOpen(run)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not open run.') }
    finally { setWorking(false); onWorking(false) }
  }
  async function remove(item: SavedRun) {
    if (!window.confirm(`Remove ${item.request.symbol} run from ${new Date(item.completedAt).toLocaleString()} from history?`)) return
    setWorking(true); onWorking(true); setError('')
    try { await historyRequest(`/${item.id}`, 'DELETE'); onDelete(item.id); if (items.length === 1 && page > 0) setPage(page - 1); else setRefresh(n => n + 1) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not remove run.') }
    finally { setWorking(false); onWorking(false) }
  }
  return <section className="panel history-panel" aria-label="Saved backtests">
    <div className="section-heading"><div><span className="eyebrow">LOCAL DATABASE</span><h2>Saved runs</h2></div><button disabled={loading || working || busy} onClick={() => { setPage(0); setRefresh(n => n + 1) }}>Refresh</button></div>
    {error && <p role="alert" className="error-message">{error}</p>}
    {loading ? <p role="status">Loading history…</p> : <>
      {!items.length && !error && <p>No saved runs{page ? ' on this page' : ' yet'}.</p>}
      <ul>{items.map(item => <li key={item.id} className={activeId === item.id ? 'active-run' : ''}>
        <button className="history-open" disabled={busy || working} onClick={() => open(item.id)}><strong>{item.request.symbol} <span>{strategyNames[item.request.strategy.name]}</span></strong><span>{item.request.start} → {item.request.end}</span><small>{new Date(item.completedAt).toLocaleString()}</small></button>
        <button className="history-delete" disabled={busy || working} aria-label={`Delete ${item.request.symbol} saved run`} onClick={() => remove(item)}>×</button>
      </li>)}</ul>
    </>}
    <div className="history-pagination"><button disabled={!page || loading || working || busy} onClick={() => setPage(page - 1)}>Newer</button><span>Page {page + 1}</span><button disabled={items.length < 30 || loading || working || busy} onClick={() => setPage(page + 1)}>Older</button></div>
    <p className="footnote">Successful runs save automatically. Reopening restores their settings and results without rerunning.</p>
  </section>
}
