import { ArrowRight, BookOpen, Bot, Braces, Check, ClipboardPaste, Code2, KeyRound, Layers3, LockKeyhole, Play, ShieldCheck, Workflow } from 'lucide-react'

const sections = [
  ['start', 'Quick start'],
  ['workflow', 'Core workflow'],
  ['providers', 'Providers'],
  ['safety', 'Safety model'],
  ['architecture', 'Architecture'],
  ['roadmap', 'Roadmap'],
]

function Documentation() {
  const appUrl = import.meta.env.BASE_URL

  return (
    <div className="docs-shell">
      <header className="docs-topbar">
        <a className="docs-brand" href={appUrl}><span><Braces size={19} /></span>AwareDeck</a>
        <div className="docs-topbar-links">
          <a href={appUrl}><Play size={15} /> Open app</a>
          <a href="https://github.com/sajeetharan/awaredeck"><Code2 size={16} /> GitHub</a>
        </div>
      </header>

      <aside className="docs-sidebar">
        <div className="docs-sidebar-title"><BookOpen size={16} /> Documentation</div>
        <nav aria-label="Documentation sections">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <div className="docs-version"><span /> Prototype · v0.1</div>
      </aside>

      <main className="docs-content">
        <section className="docs-intro" id="start">
          <div className="docs-kicker">Context in. Guarded action out.</div>
          <h1>AwareDeck documentation</h1>
          <p>Build fast AI workflows around the content already in front of you, while keeping prompts, effects, and approvals visible.</p>
          <div className="docs-actions"><a className="primary-docs-action" href={appUrl}>Try the prototype <ArrowRight size={16} /></a><a href="https://github.com/sajeetharan/awaredeck#run-locally">Run locally</a></div>
        </section>

        <section className="docs-section docs-quickstart">
          <div className="section-number">01</div><div><h2>Quick start</h2><p>Start the browser prototype with Node.js 22 or later.</p>
          <pre><code>git clone https://github.com/sajeetharan/awaredeck.git{`\n`}cd awaredeck{`\n`}npm install{`\n`}npm run dev</code></pre>
          <p>Open <code>http://localhost:5173</code>, copy code or prose, then choose <strong>Capture clipboard</strong>.</p></div>
        </section>

        <section className="docs-section" id="workflow">
          <div className="section-number">02</div><div><h2>Core workflow</h2><p>AwareDeck keeps the useful part of automation short without hiding consequential decisions.</p>
          <div className="workflow-track">
            <div><span><ClipboardPaste size={18} /></span><strong>Capture</strong><p>Read clipboard text under an explicit user gesture.</p></div>
            <ArrowRight className="track-arrow" size={18} />
            <div><span><Workflow size={18} /></span><strong>Rank</strong><p>Match actions to content type and active application.</p></div>
            <ArrowRight className="track-arrow" size={18} />
            <div><span><ShieldCheck size={18} /></span><strong>Review</strong><p>Inspect the prompt, effect, and risk before running.</p></div>
            <ArrowRight className="track-arrow" size={18} />
            <div><span><Bot size={18} /></span><strong>Generate</strong><p>Display provider output without applying it automatically.</p></div>
          </div></div>
        </section>

        <section className="docs-section" id="providers">
          <div className="section-number">03</div><div><h2>Providers</h2><div className="docs-grid two">
            <article><Bot size={20} /><h3>Local preview</h3><p>Default mode. It validates the complete interaction locally and never sends context over the network.</p><span className="availability ready"><Check size={13} /> Available</span></article>
            <article><KeyRound size={20} /><h3>OpenAI compatible</h3><p>Configure an endpoint, model, and key at runtime. Values remain in memory and disappear when the tab closes.</p><span className="availability guarded"><LockKeyhole size={13} /> Session only</span></article>
          </div><div className="docs-callout"><LockKeyhole size={18} /><div><strong>Production credential storage</strong><p>The web prototype cannot provide OS-backed secret storage. The desktop shell will own credentials before provider integration is considered production-ready.</p></div></div></div>
        </section>

        <section className="docs-section" id="safety">
          <div className="section-number">04</div><div><h2>Safety model</h2><div className="risk-table" role="table" aria-label="Action risk levels">
            <div role="row"><strong role="cell">Read only</strong><span role="cell">Generates output without changing source content.</span><em role="cell">No approval</em></div>
            <div role="row"><strong role="cell">Write</strong><span role="cell">Produces content intended to replace or create data.</span><em role="cell">Approval required</em></div>
            <div role="row"><strong role="cell">External</strong><span role="cell">Sends data or triggers an outside effect.</span><em role="cell">Approval + destination</em></div>
            <div role="row"><strong role="cell">Destructive</strong><span role="cell">Deletes data or performs irreversible work.</span><em role="cell">Not supported</em></div>
          </div></div>
        </section>

        <section className="docs-section" id="architecture">
          <div className="section-number">05</div><div><h2>Architecture</h2><p>Product rules remain independent from React and replaceable integrations.</p><div className="architecture-stack">
            <div><Code2 size={18} /><span><strong>Interface</strong>React workbench and documentation</span></div>
            <div><Layers3 size={18} /><span><strong>Domain</strong>Context ranking, action risk, and approval invariants</span></div>
            <div><Workflow size={18} /><span><strong>Services</strong>Context sources and provider adapters</span></div>
          </div></div>
        </section>

        <section className="docs-section" id="roadmap">
          <div className="section-number">06</div><div><h2>Roadmap</h2><ul className="roadmap-list">
            <li className="done"><Check size={15} /><span><strong>Browser workflow</strong>Context ranking, guarded execution, provider output</span></li>
            <li><span className="roadmap-dot" /><span><strong>Desktop shell</strong>Tauri, native context capture, secure credentials</span></li>
            <li><span className="roadmap-dot" /><span><strong>Editor writes</strong>Diff preview, reversible application, durable history</span></li>
            <li><span className="roadmap-dot" /><span><strong>Action ecosystem</strong>Custom action packs, shortcuts, hardware integrations</span></li>
          </ul></div>
        </section>

        <footer className="docs-footer"><span>AwareDeck is an early prototype.</span><a href="https://github.com/sajeetharan/awaredeck/issues">Questions and feedback <ArrowRight size={14} /></a></footer>
      </main>
    </div>
  )
}

export default Documentation