import pandas as pd
from scipy.stats import false_discovery_control

from strategies.base import Strategy

class MeanReversionStrategy(Strategy):
    def __init__(self, mean_window: int, entry_distance: float, exit_distance: float):
        """ Initializes the mean reversion strategy with given values. """

        if mean_window or entry_distance or exit_distance <= 0:
            raise ValueError("The mean window and distance values must be positive and non-zero")

        if entry_distance or exit_distance > 1:
            raise ValueError("The asset cannot average to a negative value")

        if exit_distance >= entry_distance:
            raise ValueError("Exit distance cannot be greater than entry distance")

        self.mean_window = mean_window
        self.entry_distance = entry_distance
        self.exit_distance = exit_distance

    def generate_signals(self, data: pd.DataFrame) -> pd.Series:
        """ Generates the signals based on the mean reversion. """

        mean = data["Close"].rolling(self.mean_window).mean()
        signals = pd.Series(0, index=data.index, dtype=int)
        in_position = False

        for i in range(len(data)):
            close = data["Close"].iloc[i]
            current_mean = mean.iloc[i]

            if pd.isna(current_mean):
                continue

            entry_threshold = current_mean * (1 - self.entry_distance)
            exit_threshold = current_mean * (1 - self.exit_distance)

            if not in_position and close <= entry_threshold:
                in_position = True

            elif in_position and close >= exit_threshold:
                in_position = False

            signals.iloc[i] = int(in_position)

        return signals