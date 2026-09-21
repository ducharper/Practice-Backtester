import { useState } from 'react'

export default function BacktestForm() {
    const [symbol, setSymbol] = useState('AAPL')
    const [start, setStart] = useState('2020-01-01')
    const [end, setEnd] = useState('2026-01-01')
    const [strategy, setStrategy] = useState('moving_average')

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
                    <option value="moving_average">Moving average</option>
                    <option value="momentum">Momentum</option>
                    <option value="mean_reversion">Mean reversion</option>
                </select>
            </label>

            <p>Selected symbol: {symbol}</p>
        </section>
    )
}