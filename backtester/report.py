import pandas as pd

from backtester.metrics import total_return, annualized_volatility, sharpe_ratio, max_drawdown


def summarize_backtest(results: pd.DataFrame, periods_per_year: int, risk_free_rate: float) -> dict[str, float]:
    """ Uses the result dataframe to calculate performance metrics and package them in a readable format. """

    summary = {
        'Total Return': total_return(results["Strategy Returns"]),
        'Annualized Volatility': annualized_volatility(results["Strategy Returns"], periods_per_year),
        'Sharpe Ratio': sharpe_ratio(results["Strategy Returns"], periods_per_year, risk_free_rate),
        'Max Drawdown':  max_drawdown(results["Equity Curve"])
    }

    return summary

def format_summary(summary: dict[str, float]) -> str:
    """ Makes the summary more readable when printed. """

    return (
        "Backtest Summary:\n"
        "---------------------------\n"
        f"Total Return:          {summary['Total Return']:>8.2%}\n"
        f"Annualized Volatility: {summary['Annualized Volatility']:>8.2%}\n"
        f"Sharpe Ratio:          {summary['Sharpe Ratio']:>8.2f}\n"
        f"Max Drawdown:          {summary['Max Drawdown']:>8.2%}\n"
    )
