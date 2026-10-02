// Run against the Vite dev server with Playwright available in NODE_PATH.
// All market responses are intercepted; no live provider is contacted.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')

async function main() {
  const browser = await chromium.launch({ headless: true, channel: process.env.BACKTEST_BROWSER || 'msedge' })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    let status = 200, emptyTrades = false, submitted
    await page.route('**/api/backtests', async route => {
      submitted = route.request().postDataJSON()
      await new Promise(resolve => setTimeout(resolve, 150))
      if (status !== 200) return route.fulfill({ status, json: { detail: 'No price data was returned for this symbol.' } })
      const cash = submitted.initial_cash
      await route.fulfill({ json: {
        summary: { 'Total Return': .16, 'Benchmark Return': .08, 'Sharpe Ratio': null, 'Max Drawdown': -.05, 'Annualized Return': .12, 'Time in Market': .65, 'Annualized Volatility': .1, 'Number of Market Entries': 2, 'Sortino Ratio': 1.4 },
        equity: Array.from({ length: 40 }, (_, i) => ({ date: new Date(Date.UTC(2025, 0, i + 1)).toISOString().slice(0, 10), strategy: cash * (1 + i * .004 + Math.sin(i / 4) * .03), benchmark: cash * (1 + i * .002) })),
        trades: emptyTrades ? [] : [
          { entry_date: '2025-01-02', exit_date: '2025-01-09', entry_price: 100, exit_price: 105, holding_period: 5, net_return: .049 },
          { entry_date: '2025-01-12', exit_date: '2025-01-20', entry_price: 105, exit_price: 100, holding_period: 6, net_return: -.049 }
        ]
      } })
    })
    await page.goto(process.env.BACKTEST_URL || 'http://127.0.0.1:5175')
    await page.getByRole('heading', { name: 'An idea, measured.' }).waitFor()
    const run = page.getByRole('button', { name: 'Run backtest' })
    await run.click()
    await page.getByText('LAST SUCCESSFUL RUN').waitFor()
    assert.equal(submitted.strategy.name, 'moving_average')
    assert.equal(submitted.initial_cash, 10000)
    await page.getByRole('img', { name: /equity chart/ }).waitFor()
    await page.getByRole('button', { name: 'Drawdown', exact: true }).click()
    await page.getByRole('img', { name: /drawdown chart/ }).waitFor()
    await page.getByRole('slider').fill('5')
    await page.getByLabel('Chart start date').fill('2025-01-10')
    await page.getByRole('button', { name: 'Full range' }).click()
    if (process.env.BACKTEST_SCREENSHOT) await page.screenshot({ path: process.env.BACKTEST_SCREENSHOT, fullPage: true })
    await page.getByRole('tab', { name: /Trade ledger/ }).click()
    assert.equal(await page.locator('tbody tr').count(), 2)
    await page.getByRole('button', { name: /Net return/ }).click()
    assert.match(await page.locator('tbody tr').first().innerText(), /-4.90%/)
    await page.getByLabel(/^Show/).selectOption('wins')
    assert.equal(await page.locator('tbody tr').count(), 1)
    const downloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: /Export CSV/ }).click()
    const download = await downloadEvent
    assert.equal(download.suggestedFilename(), 'AAPL-trades.csv')
    await page.getByLabel('Symbol', { exact: true }).fill('MSFT')
    await page.getByText('Settings changed.', { exact: false }).waitFor()
    await page.getByLabel(/^Strategy/).selectOption('mean_reversion')
    await page.getByLabel('Entry distance %').fill('6')
    await run.click()
    await page.getByRole('heading', { name: /MSFT/ }).waitFor()
    assert.equal(submitted.strategy.entry_distance, .06)
    await page.getByLabel(/^Strategy/).selectOption('momentum')
    emptyTrades = true
    await run.click()
    await page.getByText('No completed trades.', { exact: false }).waitFor()
    assert.equal(submitted.strategy.name, 'momentum')
    status = 502
    await run.click()
    await page.getByRole('alert').filter({ hasText: 'No price data' }).waitFor()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('tab', { name: 'Performance overview' }).click()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
    if (process.env.BACKTEST_SCREENSHOT) await page.screenshot({ path: process.env.BACKTEST_SCREENSHOT.replace('.png', '-mobile.png'), fullPage: true })
    assert.deepEqual(errors, [])
    console.log('PASS: three strategies, request values, charts, date range, slider, null metric, sorting, filter, export, empty ledger, failed run, stale notice, mobile layout; no browser runtime errors.')
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
