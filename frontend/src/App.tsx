import BacktestForm from './components/BacktestForm'
import './App.css'

export default function App() {
  return (
    <main className="workspace">
      <header className="workspace-header">
        <h1>Practice Backtester</h1>
        <p>Configure an experiment and inspect its performance.</p>
      </header>

      <div className="workspace-body">
        <BacktestForm />

        <section className="results-panel">
          <h2>Results</h2>
          <p>Your backtest results will appear here.</p>
        </section>
      </div>
    </main>
  )
}