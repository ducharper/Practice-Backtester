import yfinance as yf
import pandas as pd

from backtester.engine import BackTestEngine
from backtester.plotting import plot_backtest
from backtester.report import summarize_backtest, format_summary
from backtester.trades import build_trade_ledger
from strategies.base import Strategy
from strategies.moving_average_strategy import MovingAverageStrategy

def main() -> None:
    result, summary, ledger = run_backtest(
        symbol="AAPL",
        start="2020-01-01",
        end="2026-01-01",
        strategy=MovingAverageStrategy(20, 50),
        initial_cash=10_000,
        cost_bps=5,
        periods_per_year=252,
        risk_free_rate=0.04,
    )

    print(format_summary(summary))
    print(ledger.to_string(index=False))
    plot_backtest(result)



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

    symbol = yf.download(
        symbol,
        start,
        end,
        multi_level_index=False
    )

    bt = BackTestEngine(symbol, strategy, initial_cash, cost_bps)
    result = bt.run()
    summary = summarize_backtest(result, periods_per_year, risk_free_rate)
    ledger = build_trade_ledger(result)

    return result, summary, ledger

if __name__ == "__main__":
    main()