import { useState } from 'react'
import type { FormEvent } from 'react'

type StrategyConfig =
    | {
        name: 'moving_average'
        short_window: number
        long_window: number
      }
    | {
      name: 'momentum'
      lookback: number
      }
    | {
      name: 'mean_reversion'
      mean_window: number
      entry_distance: number
      exit_distance: number
      }

export default function BacktestForm() {
    const [symbol, setSymbol] = useState('AAPL')
    const [start, setStart] = useState('2020-01-01')
    const [end, setEnd] = useState('2026-01-01')
    const [strategy, setStrategy] = useState('moving_average')
    const [shortWindow, setShortWindow] = useState('20')
    const [longWindow, setLongWindow] = useState('50')
    const [lookback, setLookback] = useState('20')
    const [meanWindow, setMeanWindow] = useState('20')
    const [entryDistance, setEntryDistance] = useState('5')
    const [exitDistance, setExitDistance] = useState('1')
    const [error, setError] = useState('')

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')

        if (!symbol.trim()) {
            setError('Enter a symbol.')
            return
        }

        if (start >= end) {
            setError('Start date must be before end date.')
            return
        }

        let strategyConfig: StrategyConfig

        if (strategy === 'moving_average') {
            const short = Number(shortWindow)
            const long = Number(longWindow)

            if (short >= long) {
                setError('Short window must be less than long window.')
                return
            }

            strategyConfig = {
                name: 'moving_average',
                short_window: short,
                long_window: long,
            }
        } else if (strategy === 'momentum') {
            strategyConfig = {
                name: 'momentum',
                lookback: Number(lookback),
            }
        } else if (strategy === 'mean_reversion') {
            const entry = Number(entryDistance) / 100
            const exit = Number(exitDistance) / 100

            if (entry <= 0 || entry >= 1 || exit < 0 || exit >= entry) {
                setError(
                    'Entry distance must be between 0% and 100%, ' +
                    'and exit distance must be nonnegative and below entry distance.'
                )
                return
            }

            strategyConfig = {
                name: 'mean_reversion',
                mean_window: Number(meanWindow),
                entry_distance: entry,
                exit_distance: exit,
            }
        } else {
            setError('Choose a supported strategy.')
            return
        }

        const request = {
            symbol: symbol.trim().toUpperCase(),
            start,
            end,
            strategy: strategyConfig,
        }

        console.log(JSON.stringify(request, null, 2))
    }

    return (
        <form className="settings-panel" onSubmit={handleSubmit}>
            <h2>Experiment settings</h2>

            <label>
                Symbol
                <input
                    required
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                />
            </label>

            <label>
                Start date
                <input
                    type="date"
                    required
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                />
            </label>

            <label>
                End date
                <input
                    type="date"
                    required
                    value={end}
                    onChange={(event) => setEnd(event.target.value)}
                />
            </label>

            <label>
                Strategy
                <select
                    value={strategy}
                    onChange={(event) => setStrategy(event.target.value)}
                >
                    <option value="moving_average">Moving Average</option>
                    <option value="momentum">Momentum</option>
                    <option value="mean_reversion">Mean Reversion</option>
                </select>
            </label>
            {strategy === 'moving_average' && (
                    <div>
                        <label>
                            Short window (days)
                            <input
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={shortWindow}
                                onChange={(event) => setShortWindow(event.target.value)}
                            />
                        </label>

                        <label>
                            Long window (days)
                            <input
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={longWindow}
                                onChange={(event) => setLongWindow(event.target.value)}
                            />
                        </label>
                    </div>
                )}

                {strategy === 'momentum' && (
                    <div>
                        <label>
                            Lookback (days)
                            <input
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={lookback}
                                onChange={(event) => setLookback(event.target.value)}
                            />
                        </label>
                    </div>
                )}

                {strategy === 'mean_reversion' && (
                    <div>
                        <label>
                            Mean window (days)
                            <input
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={meanWindow}
                                onChange={(event) => setMeanWindow(event.target.value)}
                            />
                        </label>

                        <label>
                            Entry distance (%)
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                required
                                value={entryDistance}
                                onChange={(event) => setEntryDistance(event.target.value)}
                            />
                        </label>

                        <label>
                            Exit distance (%)
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                required
                                value={exitDistance}
                                onChange={(event) => setExitDistance(event.target.value)}
                            />
                        </label>
                    </div>
                )}

            {error && <p role="alert">{error}</p>}

             <button type="submit">
                Run Backtest
             </button>
        </form>
    )
}