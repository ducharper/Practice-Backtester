import pandas as pd

def total_return(strategy_returns: pd.Series) -> float:
    """ Returns the total percentage return of the strategy. """

    return float((1 + strategy_returns).prod() - 1)

def annualized_volatility(strategy_returns: pd.Series, periods_per_year: int) -> float:
    """ Returns the annualized volatility of the strategy. """

    return float(strategy_returns.std() * (periods_per_year ** 0.5))

def sharpe_ratio(strategy_returns: pd.Series, periods_per_year: int, risk_free_rate: float) -> float:
    """ Returns the Sharpe ratio of the strategy. """

    daily_rfr = (1 + risk_free_rate) ** (1 / periods_per_year) - 1
    excess_return = strategy_returns - daily_rfr

    return float((excess_return.mean() / excess_return.std()) * (periods_per_year ** 0.5))

def max_drawdown(equity_curve: pd.Series) -> float:
    """ Uses the equity curve to calculate the maximum drawdown. """

    rolling_max = equity_curve.cummax()
    drawdown = (equity_curve / rolling_max) - 1

    return float(drawdown.min())