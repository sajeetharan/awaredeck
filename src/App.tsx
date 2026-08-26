import { useState } from 'react'
import { Activity, AppWindow, ArrowRight, Bot, Braces, Check, ChevronDown, Clock3, Eye, FileCode2, History, LockKeyhole, Play, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react'
import { executeAction, suggestActions, type DeckAction } from './domain/actions'
import { mockContext } from './services/contextSource'
import './App.css'

interface HistoryEntry {
  id: string
  label: string
  time: string
  status: 'Completed' | 'Cancelled'
}

const actions = suggestActions(mockContext)
const initialHistory: HistoryEntry[] = [
  { id: '1', label: 'Explain code', time: '2 min ago', status: 'Completed' },
  { id: '2', label: 'Draft tests', time: '18 min ago', status: 'Cancelled' },
]

function RiskBadge({ action }: { action: DeckAction }) {
  return action.risk === 'read'
    ? <span className="risk safe"><Eye size={13} /> Read only</span>
    : <span className="risk guarded"><LockKeyhole size={13} /> Approval</span>
}

function App() {
  const [selectedId, setSelectedId] = useState(actions[0].id)
  const [approved, setApproved] = useState(false)
  const [history, setHistory] = useState(initialHistory)
  const [notice, setNotice] = useState('')
  const selected = actions.find((action) => action.id === selectedId) ?? actions[0]

  const selectAction = (action: DeckAction) => {
    setSelectedId(action.id)
    setApproved(false)
    setNotice('')
  }

  const runAction = () => {
    try {
      executeAction(selected, approved)
      setHistory((entries) => [{ id: crypto.randomUUID(), label: selected.label, time: 'just now', status: 'Completed' }, ...entries])
      setNotice(`${selected.label} completed in preview mode.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Action could not be completed.')
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="AwareDeck workspace">
          <span className="brand-mark"><Braces size={20} /></span>
          <span>AwareDeck</span><span className="prototype">Prototype</span>
        </a>
        <div className="topbar-actions">
          <span className="status"><span className="status-dot" /> Context live</span>
          <button className="provider-button" type="button"><Bot size={16} /> Preview provider <ChevronDown size={15} /></button>
        </div>
      </header>

      <section className="context-strip" aria-label="Active application context">
        <div className="context-icon"><FileCode2 size={22} /></div>
        <div className="context-title">
          <span className="eyebrow">Active context</span>
          <strong>{mockContext.application}</strong><span>{mockContext.title}</span>
        </div>
        <div className="context-meta">
          <span>{mockContext.language}</span><span>3 lines selected</span>
          <button className="icon-button" type="button" title="Refresh context" aria-label="Refresh context"><RefreshCw size={17} /></button>
        </div>
      </section>

      <div className="workspace" id="workspace">
        <section className="action-column" aria-labelledby="actions-title">
          <div className="section-heading">
            <div><span className="eyebrow">Suggested for this selection</span><h1 id="actions-title">Choose an action</h1></div>
            <span className="count">{actions.length}</span>
          </div>
          <div className="action-list">
            {actions.map((action, index) => (
              <button className={`action-item ${selectedId === action.id ? 'selected' : ''}`} type="button" key={action.id} onClick={() => selectAction(action)}>
                <span className="shortcut">{index + 1}</span>
                <span className="action-copy"><strong>{action.label}</strong><span>{action.description}</span></span>
                <RiskBadge action={action} /><ArrowRight className="action-arrow" size={17} />
              </button>
            ))}
          </div>
          <div className="selection-block">
            <div className="selection-heading"><span><Braces size={15} /> Current selection</span><span>{mockContext.language}</span></div>
            <pre><code>{mockContext.selection}</code></pre>
          </div>
        </section>

        <section className="review-column" aria-labelledby="review-title">
          <div className="section-heading review-heading">
            <div><span className="eyebrow">Review before running</span><h2 id="review-title">{selected.label}</h2></div>
            <RiskBadge action={selected} />
          </div>
          <div className="review-body">
            <div className="review-section">
              <div className="review-label"><Sparkles size={15} /> Prompt sent to provider</div>
              <p className="prompt-preview">{selected.prompt}</p>
            </div>
            <div className="review-section">
              <div className="review-label"><Activity size={15} /> Proposed effect</div>
              <div className="effect-preview"><div className="effect-icon"><ShieldCheck size={20} /></div><div>
                <strong>{selected.risk === 'read' ? 'No workspace changes' : 'Selection replacement'}</strong><p>{selected.preview}</p>
              </div></div>
            </div>
            {selected.risk !== 'read' && <label className="approval-row">
              <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} />
              <span className="checkmark"><Check size={14} /></span><span><strong>I approve this workspace change</strong><small>Execution remains local and simulated in this prototype.</small></span>
            </label>}
            {notice && <div className={`notice ${notice.includes('required') ? 'warning' : ''}`} role="status">
              {notice.includes('required') ? <TriangleAlert size={17} /> : <Check size={17} />}{notice}
            </div>}
          </div>
          <footer className="review-footer">
            <div className="safety-note"><LockKeyhole size={14} /> Nothing runs without review</div>
            <button className="run-button" type="button" onClick={runAction}><Play size={17} fill="currentColor" /> Run action</button>
          </footer>
        </section>

        <aside className="history-column" aria-labelledby="history-title">
          <div className="section-heading compact"><div><span className="eyebrow">Local activity</span><h2 id="history-title">Recent</h2></div><History size={18} /></div>
          <div className="history-list">{history.map((entry) => <div className="history-item" key={entry.id}>
            <span className={`history-status ${entry.status.toLowerCase()}`}>{entry.status === 'Completed' ? <Check size={13} /> : <span />}</span>
            <div><strong>{entry.label}</strong><span><Clock3 size={12} /> {entry.time}</span></div>
          </div>)}</div>
          <div className="history-footer"><AppWindow size={15} /> Stored on this device</div>
        </aside>
      </div>
    </main>
  )
}

export default App