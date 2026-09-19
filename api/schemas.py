from datetime import date
from typing import Self, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

class MovingAverageConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Literal["moving_average"]
    short_window: int = Field(default=20, gt=0, strict=True)
    long_window: int = Field(default=50, gt=0, strict=True)

    @model_validator(mode="after")
    def validate_windows(self) -> Self:
        if self.short_window >= self.long_window:
            raise ValueError("Short window must be less than long window")

        return self

class MomentumConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Literal["momentum"]
    lookback: int = Field(default=20, gt=0, strict=True)

class BacktestRequest(BaseModel):

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        allow_inf_nan=False,
    )

    symbol: str = Field(min_length=1)
    start: date
    end: date

    initial_cash: float = Field(default=10_000, gt=0)
    cost_bps: float = Field(default=5, ge=0)
    periods_per_year: int = Field(default=252, gt=0)
    risk_free_rate: float = Field(default=0.04, gt=-1)

    strategy: MovingAverageConfig | MomentumConfig = Field(
        discriminator="name"
    )

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.start >= self.end:
            raise ValueError("Start date must be before end")

        return self