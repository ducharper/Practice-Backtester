import yfinance as yf

from backtester.engine import BackTestEngine
from backtester.plotting import plot_backtest
from backtester.report import summarize_backtest, format_summary
from strategies.moving_average_strategy import MovingAverageStrategy

def main() -> None:
    apple = yf.download(
        "AAPL",
        start="2020-01-01",
        end="2026-01-01",
        multi_level_index=False
    )
    strat = MovingAverageStrategy(20, 50)
    bt = BackTestEngine(apple, strat, 10000, 5)
    result = bt.run()
    summary = summarize_backtest(result, 252, 0.04)

    print(format_summary(summary))
    plot_backtest(result)

if __name__ == "__main__":
    main()