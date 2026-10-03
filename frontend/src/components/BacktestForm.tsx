import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { submitBacktest } from '../lib/api'
import type { CompletedRun, StrategyConfig, BacktestRequest } from '../types/experiment'
type Props = { disabled?: boolean; initialRequest?: BacktestRequest; onResult: (run: CompletedRun) => void; onEdit: () => void; onRunning: (running: boolean) => void }
export default function BacktestForm({ disabled = false, initialRequest: r, onResult, onEdit, onRunning }: Props) {
  const [fields, setFields] = useState({ symbol: r?.symbol ?? 'AAPL', start: r?.start ?? '2020-01-01', end: r?.end ?? '2026-01-01', strategy: r?.strategy.name ?? 'moving_average', short: String(r?.strategy.name === 'moving_average' ? r.strategy.short_window : 20), long: String(r?.strategy.name === 'moving_average' ? r.strategy.long_window : 50), lookback: String(r?.strategy.name === 'momentum' ? r.strategy.lookback : 20), mean: String(r?.strategy.name === 'mean_reversion' ? r.strategy.mean_window : 20), entry: String(r?.strategy.name === 'mean_reversion' ? r.strategy.entry_distance * 100 : 5), exit: String(r?.strategy.name === 'mean_reversion' ? r.strategy.exit_distance * 100 : 1), cash: String(r?.initial_cash ?? 10000), costs: String(r?.cost_bps ?? 5), periods: String(r?.periods_per_year ?? 252), riskFree: String((r?.risk_free_rate ?? .04) * 100) })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  function update(key: keyof typeof fields, value: string) { setFields(old => ({ ...old, [key]: value })); setError(''); onEdit() }
  function numeric(key: keyof typeof fields, label: string, min: number, step = '1') {
    return <label>{label}<input type="number" required min={min} step={step} value={fields[key]} onChange={e => update(key, e.target.value)} /></label>
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (controller.current || disabled) return
    setError('')
    const integer = (v: string) => v.trim() !== '' && Number.isInteger(Number(v)) && Number(v) > 0
    if (!fields.symbol.trim() || !fields.start || !fields.end || fields.start >= fields.end) { setError('Enter a symbol and a start date before the end date.'); return }
    let strategy: StrategyConfig
    if (fields.strategy === 'moving_average') {
      if (!integer(fields.short) || !integer(fields.long) || +fields.short >= +fields.long) { setError('Use positive whole-number windows; the short window must be smaller.'); return }
      strategy = { name: 'moving_average', short_window: +fields.short, long_window: +fields.long }
    } else if (fields.strategy === 'momentum') {
      if (!integer(fields.lookback)) { setError('Lookback must be a positive whole number.'); return }
      strategy = { name: 'momentum', lookback: +fields.lookback }
    } else {
      if (!integer(fields.mean) || !Number.isFinite(+fields.entry) || !Number.isFinite(+fields.exit) || fields.entry === '' || fields.exit === '' || +fields.entry <= 0 || +fields.entry >= 100 || +fields.exit < 0 || +fields.exit >= +fields.entry) { setError('Use a positive mean window, entry between 0% and 100%, and a nonnegative exit below entry.'); return }
      strategy = { name: 'mean_reversion', mean_window: +fields.mean, entry_distance: +fields.entry / 100, exit_distance: +fields.exit / 100 }
    }
    if (![fields.cash, fields.costs, fields.riskFree].every(v => v.trim() !== '' && Number.isFinite(+v)) || +fields.cash <= 0 || +fields.costs < 0 || +fields.riskFree <= -100 || !integer(fields.periods)) { setError('Check capital, costs, annualization, and risk-free rate.'); return }
    const request: BacktestRequest = { symbol: fields.symbol.trim().toUpperCase(), start: fields.start, end: fields.end, strategy, initial_cash: +fields.cash, cost_bps: +fields.costs, periods_per_year: +fields.periods, risk_free_rate: +fields.riskFree / 100 }
    const abort = new AbortController()
    controller.current = abort
    setLoading(true); onRunning(true)
    try {
      const result = await submitBacktest(request, abort.signal)
      onResult({ id: result.run_id, request, result, completedAt: result.completed_at ?? new Date().toISOString() })
    } catch (err) {
      setError(abort.signal.aborted ? 'Stopped waiting. The server may still finish its calculation.' : err instanceof Error ? err.message : 'Backtest failed.')
    } finally { controller.current = null; setLoading(false); onRunning(false) }
  }
  return <form className="settings-panel panel" onSubmit={handleSubmit}>
    <div className="panel-heading"><span className="eyebrow">CONFIGURATION</span><h2>Backtest parameters</h2></div>
    <fieldset disabled={loading || disabled}>
      <label>Symbol<input required maxLength={30} value={fields.symbol} onChange={e => update('symbol', e.target.value)} autoCapitalize="characters" spellCheck={false} /></label>
      <div className="field-pair"><label>Start date<input type="date" required value={fields.start} onChange={e => update('start', e.target.value)} /></label><label>End date<input type="date" required value={fields.end} onChange={e => update('end', e.target.value)} /></label></div>
      <p className="field-help">Daily prices · end date is exclusive</p>
      <label>Strategy<select value={fields.strategy} onChange={e => update('strategy', e.target.value)}><option value="moving_average">Moving average crossover</option><option value="momentum">Momentum</option><option value="mean_reversion">Mean reversion</option></select></label>
      <div className="parameter-box">
        {fields.strategy === 'moving_average' ? <><p>Invest when the short average is above the long average.</p><div className="field-pair">{numeric('short', 'Short window', 1)}{numeric('long', 'Long window', 1)}</div></> : fields.strategy === 'momentum' ? <><p>Invest when price exceeds its value one lookback ago.</p>{numeric('lookback', 'Lookback · trading periods', 1)}</> : <><p>Buy below the rolling mean; exit as price recovers toward it.</p>{numeric('mean', 'Mean window · trading periods', 1)}<div className="field-pair">{numeric('entry', 'Entry distance %', 0, 'any')}{numeric('exit', 'Exit distance %', 0, 'any')}</div></>}
      </div>
      <div className="field-pair">{numeric('cash', 'Initial capital · USD', 0.01, 'any')}{numeric('costs', 'Cost · basis points', 0, 'any')}</div>
      <p className="field-help">5 bps = 0.05% per unit of turnover.</p>
      <details><summary>Annualization settings</summary><div className="field-pair">{numeric('periods', 'Periods / year', 1)}{numeric('riskFree', 'Risk-free rate %', -99.99, 'any')}</div></details>
      <button className="primary-button" type="submit">{loading ? 'Running experiment…' : 'Run backtest'} <span aria-hidden="true">↗</span></button>
    </fieldset>
    {loading && <button type="button" className="quiet-button" onClick={() => controller.current?.abort()}>Stop waiting</button>}
    <div role="status" className="form-status">{loading ? 'Downloading prices and calculating performance…' : 'Ready for your next hypothesis.'}</div>
    {error && <p role="alert" className="error-message">{error}</p>}
    <div className="assumptions"><strong>Simulation assumptions</strong><p>Long or flat · one-period signal delay · close-to-close returns. Strategy costs included; buy-and-hold shown before costs.</p></div>
  </form>
}
