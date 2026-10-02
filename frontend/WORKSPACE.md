# Backtester workspace

Start the API from the repository root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api.main:app --reload --port 8000
```

In a second terminal:

```powershell
cd frontend
npm run dev
```

Open the address printed by Vite. The development proxy forwards `/api/backtests` to Python on port 8000. Production hosting needs equivalent routing; the development proxy is not part of the build.

The dashboard supports all three strategies, summary metrics, value/return/drawdown charts, date filtering, and sortable/filterable completed trades with CSV export. Calculations still run in Python. Results retain the exact submitted settings, so editing the form does not silently change the displayed run.

Results live only in the current tab and disappear on refresh. Open trades are excluded from the closed-trade ledger. Benchmark returns are before costs. Stopping a request stops waiting in the browser, not necessarily the Python calculation.

## Verification

Use `npm run build` and `npm run lint` for static checks.

`scripts/smoke.cjs` checks browser interactions with intercepted test responses, not live market data. It requires Playwright resolvable by Node and installed Microsoft Edge. Start Vite on port 5175 and run `node scripts/smoke.cjs`. Set `BACKTEST_URL` for another address, `BACKTEST_BROWSER` for another installed browser channel, or `BACKTEST_SCREENSHOT` to an absolute PNG output path. Playwright is not a production dependency.
