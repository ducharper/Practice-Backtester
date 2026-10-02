import type { BacktestResponse } from './backtest'
export type StrategyConfig =
  | { name: 'moving_average'; short_window: number; long_window: number }
  | { name: 'momentum'; lookback: number }
  | { name: 'mean_reversion'; mean_window: number; entry_distance: number; exit_distance: number }
export type BacktestRequest = {
  symbol: string; start: string; end: string; strategy: StrategyConfig
  initial_cash: number; cost_bps: number; periods_per_year: number; risk_free_rate: number
}
export type CompletedRun = { request: BacktestRequest; result: BacktestResponse; completedAt: string }
export const strategyNames = { moving_average: 'Moving average', momentum: 'Momentum', mean_reversion: 'Mean reversion' }
