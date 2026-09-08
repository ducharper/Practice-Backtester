import pandas as pd

from backtester.friction import calculate_transaction_costs
from strategies.base import Strategy

class BackTestEngine:
    def __init__(self, data: pd.DataFrame, strategy: Strategy, initial_cash: float, cost_bps: float):
        if data.empty:
            raise ValueError("The DataFrame cannot empty")

        if initial_cash <= 0:
            raise ValueError("The principle must be positive and nonzero")

        if cost_bps < 0:
            raise ValueError("The transaction cost cannot be negative")

        self.data = data.copy()
        self.strategy = strategy
        self.initial_cash = initial_cash
        self.cost_bps = cost_bps

    def run(self) -> pd.DataFrame:
        signals = self.strategy.generate_signals(self.data)
        positions = signals.shift(1).fillna(0)
        asset_returns = self.data["Close"].pct_change().fillna(0)
        gross_strategy_returns = positions * asset_returns
        strategy_returns = gross_strategy_returns - calculate_transaction_costs(positions, self.cost_bps)
        equity_curve = self.initial_cash * (1 + strategy_returns).cumprod()
        benchmark_equity_curve = 100 * (1 + strategy_returns).cumprod()

        results = pd.DataFrame({
            "Close": self.data["Close"],
            "Signals": signals,
            "Positions": positions,
            "Asset Returns": asset_returns,
            "Strategy Returns": strategy_returns,
            "Equity Curve": equity_curve,
            "Benchmark Equity Curve": benchmark_equity_curve
        })

        return results
