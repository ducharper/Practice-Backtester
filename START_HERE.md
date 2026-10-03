# One-click startup

Double-click **Start Backtester.vbs** in this folder. A small launcher window starts the app and opens your browser. Keep the launcher open; use **Stop & close** when finished. You can create a Windows shortcut to that file on your desktop.

The app runs only on this computer at http://127.0.0.1:8765. No hosting account or separate terminals are needed. First startup (and startup after frontend changes) builds the website; subsequent launches reuse the build. Starting a second launcher opens the existing app instead of starting another server. Closing an extra launcher does not stop the original one.

Prerequisites: the project's `.venv` with its existing Python dependencies, Node.js, and installed frontend dependencies. If dependencies are missing, run `npm install` inside `frontend` once. The launcher never installs software automatically. Startup failures are reported in its window; details are in `data/launcher.log`.

## Saved results

Every successful API backtest automatically saves its request settings, summary, equity observations and completed trades in **data/backtests.sqlite3**. Use **Saved runs** to reopen one after restarting or refreshing. Opening a run restores the form settings too. Reopening does not contact the market-data provider.

Runs created before this feature cannot be recovered from past browser sessions. If you stop waiting for a request, the server may still complete and save it; use **Refresh** in history to check.

Delete removes a run from the visible history after confirmation. Records are soft-deleted in SQLite, not physically erased. There is currently no restore button.

The `data` folder is ignored by Git. To back up saved runs, stop the launcher and copy `data/backtests.sqlite3` somewhere safe. GitHub backups of code do **not** include these results. Do not put the local app directly on the public internet: authentication is not implemented.

## Development

The previous two-terminal Vite/API workflow still works on ports 5173/8000. The launcher instead serves the built frontend and API together on port 8765. Stop and restart the launcher after changing Python code; frontend changes are rebuilt on the next launch.

Storage tests: `.venv\Scripts\python.exe -m unittest discover -s tests -p test_saved_runs.py` (uses temporary databases and synthetic prices, not your saved runs).
