from math import isfinite

from fastapi import FastAPI, HTTPException

from api.schemas import BacktestRequest, BacktestResponse
from api.strategy_factory import create_strategy
from backtester.runner import run_backtest
from backtester.errors import MarketDataUnavailableError

app = FastAPI(title="Practice Backtester")

@app.post("/backtests", response_model=BacktestResponse)
def create_backtest(request: BacktestRequest) -> dict:
    strategy = create_strategy(request.strategy)

    try:
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
    except MarketDataUnavailableError as exception:
        raise HTTPException(
            status_code=502,
            detail=str(exception),
        ) from exception

    clean_summary = {}
    benchmark_equity = (
        request.initial_cash * (1 + result["Asset Returns"]).cumprod()
    )

    equity = []
    for row_number, (timestamp, row) in enumerate(result.iterrows()):
        equity.append({
            "date": timestamp.date().isoformat(),
            "strategy": float(row["Equity Curve"]),
            "benchmark": float(benchmark_equity.iloc[row_number]),
        })

    trades = []
    for _, row in ledger.iterrows():
        trades.append({
            "entry_date": row["Entry Date"].date().isoformat(),
            "exit_date": row["Exit Date"].date().isoformat(),
            "entry_price": float(row["Entry Price"]),
            "exit_price": float(row["Exit Price"]),
            "holding_period": int(row["Holding Period"]),
            "net_return": float(row["Net Return"]),
        })

    for name, value in summary.items():
        numeric_value = float(value)
        clean_summary[name] = (numeric_value if isfinite(numeric_value) else None)

    return {
        "summary": clean_summary,
        "equity": equity,
        "trades": trades,
    }