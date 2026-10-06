# One-click startup

Double-click **Start Backtester.vbs** in this folder. A small launcher window starts the app and opens your browser. Keep the launcher open; use **Stop & close** when finished. You can create a Windows shortcut to that file on your desktop.

The app runs only on this computer at http://127.0.0.1:8765. No hosting account or separate terminals are needed. First startup (and startup after frontend changes) builds the website; subsequent launches reuse the build. Starting a second launcher opens the existing app instead of starting another server. Closing an extra launcher does not stop the original one.

Prerequisites: the project's `.venv` with its existing Python dependencies, Node.js, and installed frontend dependencies. If dependencies are missing, run `npm install` inside `frontend` once. The launcher never installs software automatically. Startup failures are reported in its window; details are in `data/launcher.log`.

## Saved results

Every successful API backtest automatically saves its request settings, summary, equity observations and completed trades in **data/backtests.sqlite3**. Use **Saved runs** to reopen one after restarting or refreshing. Opening a run restores the form settings too. Reopening does not contact the market-data provider.

Runs created before this feature cannot be recovered from past browser sessions. If you stop waiting for a request, the server may still complete and save it; use **Refresh** in history to check.

Delete removes a run from the visible history after confirmation. Records are soft-deleted in SQLite, not physically erased. There is currently no restore button.

The `data` folder is ignored by Git. To back up saved runs, stop the launcher and copy `data/backtests.sqlite3` somewhere safe. GitHub backups of code do **not** include these results. Do not put the local app directly on the public internet: authentication is not implemented.

## IBKR historical prices

In **Edit parameters**, select **Interactive Brokers · TWS** (default for new forms). Keep paper TWS logged in with socket clients enabled on **7497** and **Read-Only API** checked. The app uses localhost and client ID **49**; it never submits orders. Yahoo remains an explicit alternative. Failed IBKR requests never fall back silently.

Initially supported: daily regular-session prices for USD stocks and ETFs via SMART. For ambiguous symbols, specify the primary exchange (NASDAQ, NYSE, etc.). Other currencies, futures, options and intraday bars are not supported. Historical availability depends on permissions, subscriptions and instrument history; it is not guaranteed.

IBKR TRADES prices adjust for splits but **exclude dividends**; Yahoo adjusts for both. Compare results using the same provider. Actual coverage, bar count, retrieval time, price basis and warnings are saved with each run. Today's unfinished session is excluded. Ranges download in overlapping yearly segments (maximum 20 years). Errors or empty segments prevent partial backtests. Only one IBKR download runs at a time. No credentials are stored.

Restart the launcher after updating. Old saved runs remain readable and default to Yahoo when reopened. Saved results work without TWS; new calculations do not use cached prices.

## Development

### Optional IBKR connection check

The standalone TWS connectivity check is `check_ibkr.py`. It connects only to local port 7497 with client ID 47, requests server time, then disconnects. Keep **Read-Only API** checked. This check does not verify historical-data permissions; choose IBKR in the app to run a historical-data backtest.

Install the Python library from the official IBKR API installer, not the unrelated PyPI download. For the locally installed version:

```powershell
.\.venv\Scripts\python.exe -m pip install "C:/TWS API 1051.01/source/pythonclient"
.\.venv\Scripts\python.exe check_ibkr.py
```

This SDK installs `ibapi==1051.1` and requires `protobuf==5.29.5`. The latter replaces the previously installed protobuf version in this project's environment. Adjust the source path if you install another SDK version. No account credentials are stored by the check.

### Frontend and backend

The previous two-terminal Vite/API workflow still works on ports 5173/8000. The launcher instead serves the built frontend and API together on port 8765. Stop and restart the launcher after changing Python code; frontend changes are rebuilt on the next launch.

Storage tests: `.venv\Scripts\python.exe -m unittest discover -s tests -p test_saved_runs.py` (uses temporary databases and synthetic prices, not your saved runs).
