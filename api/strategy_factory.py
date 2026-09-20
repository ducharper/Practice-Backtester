from api.schemas import MovingAverageConfig, MomentumConfig
from strategies.base import Strategy
from strategies.moving_average_strategy import MovingAverageStrategy
from strategies.momentum_strategy import MomentumStrategy

def create_strategy(config: MovingAverageConfig | MomentumConfig) -> Strategy:
    """ Builds a strategy from validated API settings """

    if isinstance(config, MovingAverageConfig):
        return MovingAverageStrategy(
            short_window=config.short_window,
            long_window=config.long_window,
        )

    if isinstance(config, MomentumConfig):
        return MomentumStrategy(
            lookback=config.lookback,
        )

    raise ValueError("Unsupported strategy configuration")