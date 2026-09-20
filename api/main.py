from math import isfinite

from fastapi import FastAPI

from api.schemas import BacktestRequest
from api.strategy_factory import create_strategy
from backtester.runner import run_backtest

app = FastAPI(title="Practice Backtester")

@app.post("/backtests")
def create_backtest(request: BacktestRequest) -> dict:
    strategy = create_strategy(request.strategy)

    result, summary, ledger = run_backtest(
        symbol=request.symbol,
        start=request.start.isoformat(),
        end=request.end.isoformat(),
        strategy=strategy,
        initial_cash=request.initial_cash,
        cost_bps=request.cost_bps,
        periods_per_year=request.periods_per_year,
        risk_free_rate=request.risk_free_rate,
    )

    clean_summary = {}

    for name, value in summary.items():
        numeric_value = float(value)
        clean_summary[name] = (numeric_value if isfinite(numeric_value) else None)

    return {"summary": clean_summary}