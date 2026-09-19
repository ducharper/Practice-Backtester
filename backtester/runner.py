import pandas as pd
import yfinance as yf

from backtester.engine import BackTestEngine
from backtester.report import summarize_backtest
from backtester.trades import build_trade_ledger
from strategies.base import Strategy

def run_backtest(
        symbol: str,
        start: str,
        end: str,
        strategy: Strategy,
        initial_cash: float,
        cost_bps: float,
        periods_per_year: int,
        risk_free_rate: float,
) -> tuple[pd.DataFrame, dict[str, float | int], pd.DataFrame]:
    """ Reusable function that runs the backtest """

    data = yf.download(
        symbol,
        start=start,
        end=end,
        multi_level_index=False
    )

    bt = BackTestEngine(data, strategy, initial_cash, cost_bps)
    result = bt.run()
    summary = summarize_backtest(result, periods_per_year, risk_free_rate)
    ledger = build_trade_ledger(result)

    return result, summary, ledger