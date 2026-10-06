import { JournalIcon, PencilIcon } from './WorkspaceIcons'

type Props = { running: boolean; onConfigure: () => void; onSaved: () => void; onJournal: () => void }

export default function StartScreen({ running, onConfigure, onSaved, onJournal }: Props) {
  return <section className="start-screen" aria-label="Backtest workspace">
    <div className="start-main">
      <div className="start-copy">
        <h2>{running ? 'Running your backtest.' : <>Start with<br /><em>a question.</em></>}</h2>
        <p>{running ? 'Fetching prices and calculating results.' : 'Turn a strategy idea into a backtest.'}</p>
        <button className="start-button" onClick={onConfigure}><PencilIcon />{running ? 'View progress' : 'Set up backtest'}<span aria-hidden="true">↗</span></button>
      </div>
      <div className="start-art" aria-hidden="true">
        <svg viewBox="0 0 320 320" fill="none">
          <path d="M40 80h240M40 160h240M40 240h240M80 40v240M160 40v240M240 40v240" className="draft-grid" />
          <rect x="68" y="68" width="184" height="184" rx="6" transform="rotate(-12 160 160)" className="draft-back" />
          <rect x="76" y="76" width="184" height="184" rx="6" className="draft-front" />
          <path d="M105 112h54M105 126h88M105 206h40M105 220h96" className="draft-rule" />
          <path d="m188 196 10-34 48-48 24 24-48 48-34 10Zm12-32 22 22m-34 10 10-10" className="draft-pencil" />
          <path d="M40 40h12m-12 0v12m228-12h12v12M40 268v12h12m216 0h12v-12" className="draft-rule" />
        </svg>
      </div>
    </div>
    <div className="start-shortcuts">
      <button onClick={onSaved}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M3 4h18v4H3zM9 12h6" /></svg><span><strong>Saved runs</strong><small>Open a previous result.</small></span><span className="shortcut-arrow" aria-hidden="true">↗</span></button>
      <button onClick={onJournal}><JournalIcon /><span><strong>Journal</strong><small>Read or write an idea.</small></span><span className="shortcut-arrow" aria-hidden="true">↗</span></button>
    </div>
  </section>
}
