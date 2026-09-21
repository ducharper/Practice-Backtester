import { useState } from 'react'

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

    return (
        <section className="settings-panel">
            <h2>Experiment settings</h2>

            <label>
                Symbol
                <input
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                />
            </label>

            <label>
                Start date
                <input
                    type="date"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                />
            </label>

            <label>
                End date
                <input
                    type="date"
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

            <p>Selected symbol: {symbol}</p>
        </section>
    )
}