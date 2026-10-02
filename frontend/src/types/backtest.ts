export type BacktestResponse = {
    summary: Record<string, number | null>
    equity: {
        date: string
        strategy: number
        benchmark: number
    }[]
    trades: {
        entry_date: string
        exit_date: string
        entry_price: number
        exit_price: number
        holding_period: number
        net_return: number
    }[]
}