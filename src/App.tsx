import { useState } from 'react'
import { Activity, AppWindow, ArrowRight, BookOpen, Bot, Braces, Check, ChevronDown, ClipboardPaste, Clock3, Eye, FileCode2, History, KeyRound, LockKeyhole, Play, RefreshCw, Settings2, ShieldCheck, Sparkles, TriangleAlert, X } from 'lucide-react'
import { executeAction, suggestActions, type DeckAction } from './domain/actions'
import { contextFromClipboard, mockContext } from './services/contextSource'
import { OpenAICompatibleProvider, PreviewProvider } from './services/provider'
import './App.css'

interface HistoryEntry {
  id: string
  label: string
  time: string
  status: 'Completed' | 'Cancelled'
}

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
  const [context, setContext] = useState(mockContext)
  const actions = suggestActions(context)
  const [selectedId, setSelectedId] = useState(actions[0].id)
  const [approved, setApproved] = useState(false)
  const [history, setHistory] = useState(initialHistory)
  const [notice, setNotice] = useState('')
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [providerMode, setProviderMode] = useState<'preview' | 'openai-compatible'>('preview')
  const [endpoint, setEndpoint] = useState('https://api.openai.com/v1')
  const [model, setModel] = useState('gpt-4.1-mini')
  const [apiKey, setApiKey] = useState('')
  const selected = actions.find((action) => action.id === selectedId) ?? actions[0]

  const selectAction = (action: DeckAction) => {
    setSelectedId(action.id)
    setApproved(false)
    setNotice('')
    setResult('')
  }

  const setActiveContext = (nextContext: typeof context, message: string) => {
    setContext(nextContext)
    setSelectedId(suggestActions(nextContext)[0].id)
    setApproved(false)
    setResult('')
    setNotice(message)
  }

  const captureClipboard = async () => {
    try {
      const selection = await navigator.clipboard.readText()
      if (!selection.trim()) throw new Error('Clipboard does not contain text.')
      setActiveContext(contextFromClipboard(selection), 'Clipboard context captured.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Clipboard access was not available.')
    }
  }

  const runAction = async () => {
    try {
      executeAction(selected, approved)
      if (providerMode === 'openai-compatible' && !apiKey.trim()) {
        throw new Error('Add a provider API key in settings before running.')
      }

      setRunning(true)
      setNotice('')
      const provider = providerMode === 'preview'
        ? new PreviewProvider()
        : new OpenAICompatibleProvider({ endpoint, model, apiKey })
      const response = await provider.run({ prompt: selected.prompt, context: context.selection })
      setResult(response.content)
      setHistory((entries) => [{ id: crypto.randomUUID(), label: selected.label, time: 'just now', status: 'Completed' }, ...entries])
      setNotice(`${selected.label} completed with ${provider.name}.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Action could not be completed.')
    } finally {
      setRunning(false)
    }
  }

  const warningNotice = notice.includes('required') || notice.includes('key') || notice.includes('Clipboard')

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="AwareDeck workspace">
          <span className="brand-mark"><Braces size={20} /></span>
          <span>AwareDeck</span><span className="prototype">Prototype</span>
        </a>
        <div className="topbar-actions">
          <span className="status"><span className="status-dot" /> Context live</span>
          <a className="docs-link" href={`${import.meta.env.BASE_URL}docs/`}><BookOpen size={16} /> Docs</a>
          <button className="provider-button" type="button" onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen}>
            <Bot size={16} /> {providerMode === 'preview' ? 'Preview provider' : model} <ChevronDown size={15} />
          </button>
        </div>
      </header>

      {settingsOpen && <section className="provider-settings" aria-label="Provider settings">
        <div className="settings-heading"><div><span className="eyebrow">Runtime configuration</span><strong>AI provider</strong></div><button className="close-button" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close provider settings"><X size={18} /></button></div>
        <label><span>Mode</span><select value={providerMode} onChange={(event) => setProviderMode(event.target.value as typeof providerMode)}><option value="preview">Local preview</option><option value="openai-compatible">OpenAI compatible</option></select></label>
        {providerMode === 'openai-compatible' && <>
          <label><span>Endpoint</span><input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} /></label>
          <label><span>Model</span><input value={model} onChange={(event) => setModel(event.target.value)} /></label>
          <label><span><KeyRound size={13} /> API key</span><input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} autoComplete="off" placeholder="Held in memory only" /></label>
        </>}
        <p>Configuration is kept in this tab and is never written to disk.</p>
      </section>}

      <section className="context-strip" aria-label="Active application context">
        <div className="context-icon"><FileCode2 size={22} /></div>
        <div className="context-title"><span className="eyebrow">Active context</span><strong>{context.application}</strong><span>{context.title}</span></div>
        <div className="context-meta">
          <span>{context.language}</span><span>{context.selection.split(/\r?\n/).length} lines selected</span>
          <button className="capture-button" type="button" onClick={captureClipboard}><ClipboardPaste size={16} /> Capture clipboard</button>
          <button className="icon-button" type="button" title="Reset context" aria-label="Reset context" onClick={() => setActiveContext(mockContext, 'Context reset.')}><RefreshCw size={17} /></button>
        </div>
      </section>

      <div className="workspace" id="workspace">
        <section className="action-column" aria-labelledby="actions-title">
          <div className="section-heading"><div><span className="eyebrow">Suggested for this selection</span><h1 id="actions-title">Choose an action</h1></div><span className="count">{actions.length}</span></div>
          <div className="action-list">{actions.map((action, index) => <button className={`action-item ${selectedId === action.id ? 'selected' : ''}`} type="button" key={action.id} onClick={() => selectAction(action)}>
            <span className="shortcut">{index + 1}</span><span className="action-copy"><strong>{action.label}</strong><span>{action.description}</span></span><RiskBadge action={action} /><ArrowRight className="action-arrow" size={17} />
          </button>)}</div>
          <div className="selection-block"><div className="selection-heading"><span><Braces size={15} /> Current selection</span><span>{context.language}</span></div><pre><code>{context.selection}</code></pre></div>
        </section>

        <section className="review-column" aria-labelledby="review-title">
          <div className="section-heading review-heading"><div><span className="eyebrow">Review before running</span><h2 id="review-title">{selected.label}</h2></div><RiskBadge action={selected} /></div>
          <div className="review-body">
            <div className="review-section"><div className="review-label"><Sparkles size={15} /> Prompt sent to provider</div><p className="prompt-preview">{selected.prompt}</p></div>
            <div className="review-section"><div className="review-label"><Activity size={15} /> Proposed effect</div><div className="effect-preview"><div className="effect-icon"><ShieldCheck size={20} /></div><div><strong>{selected.risk === 'read' ? 'No workspace changes' : 'Selection replacement'}</strong><p>{selected.preview}</p></div></div></div>
            {selected.risk !== 'read' && <label className="approval-row"><input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} /><span className="checkmark"><Check size={14} /></span><span><strong>I approve this workspace change</strong><small>Execution generates a result but does not apply it automatically.</small></span></label>}
            {notice && <div className={`notice ${warningNotice ? 'warning' : ''}`} role="status">{warningNotice ? <TriangleAlert size={17} /> : <Check size={17} />}{notice}</div>}
            {result && <div className="result-section"><div className="review-label"><Bot size={15} /> Generated result</div><pre>{result}</pre></div>}
          </div>
          <footer className="review-footer"><div className="safety-note"><LockKeyhole size={14} /> Nothing runs without review</div><button className="run-button" type="button" onClick={runAction} disabled={running}>{running ? <><Settings2 className="spin" size={17} /> Running</> : <><Play size={17} fill="currentColor" /> Run action</>}</button></footer>
        </section>

        <aside className="history-column" aria-labelledby="history-title">
          <div className="section-heading compact"><div><span className="eyebrow">Local activity</span><h2 id="history-title">Recent</h2></div><History size={18} /></div>
          <div className="history-list">{history.map((entry) => <div className="history-item" key={entry.id}><span className={`history-status ${entry.status.toLowerCase()}`}>{entry.status === 'Completed' ? <Check size={13} /> : <span />}</span><div><strong>{entry.label}</strong><span><Clock3 size={12} /> {entry.time}</span></div></div>)}</div>
          <div className="history-footer"><AppWindow size={15} /> Stored on this device</div>
        </aside>
      </div>
    </main>
  )
}

export default App
