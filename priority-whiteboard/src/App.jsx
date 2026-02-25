import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { hasSupabase, supabase } from './supabase'

const COLUMNS = ['Do Now', 'Do Next', 'Later', 'Done']
const SCORE_WEIGHTS = {
  impact: 0.35,
  revenue: 0.3,
  urgency: 0.2,
  confidence: 0.15,
  effortPenalty: 0.25,
}

const TEAM_MEMBERS = [
  { name: 'Unassigned', email: '' },
  { name: 'Chea', email: 'cromine@rhwcpas.com' },
  { name: 'Cory', email: 'Cc2enterprises@gmail.com' },
  { name: 'Anthony', email: 'anthony.depassio@gmail.com' },
  { name: 'Chadd', email: 'Chaddjpierce@gmail.com' },
  { name: 'Zack', email: 'Zbyers07@gmail.com' },
]

const ASSIGNMENT_WEBHOOK = import.meta.env.VITE_ASSIGNMENT_WEBHOOK_URL || ''

const localSeedIdeas = [
  {
    id: crypto.randomUUID(),
    title: 'AI phone answering with calendar scheduling',
    notes: 'Answer calls, qualify lead/client need, and book directly on calendar.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 5, urgency: 5, confidence: 4, effort: 3 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Upload bank/credit card statements and auto-post to QuickBooks',
    notes: 'Auto-categorize transactions and generate entries with review queue.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 5, urgency: 4, confidence: 4, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Extract W-2/1099 data and enter into UltraTax',
    notes: 'Document intake + structured extraction + prefill workflow.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 4, urgency: 4, confidence: 3, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Search master Excel list and add custom fields into GoFileRoom',
    notes: 'Fields: tax preparer, staff preparer, entity type, tax software.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 4, urgency: 4, confidence: 4, effort: 3 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Check UltraTax for events and move project along in GoFileRoom',
    notes: 'Event-triggered workflow automation between UltraTax and GFR.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 4, urgency: 4, confidence: 3, effort: 3 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Sort emails automatically',
    notes: 'Route by urgency/type/owner and create follow-up tasks where needed.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 3, urgency: 4, confidence: 4, effort: 2 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Monthly podcast/business article digest to client list',
    notes: 'Curate content and email by segment each month.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 3, revenue: 3, urgency: 2, confidence: 4, effort: 2 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Build social media for brand',
    notes: 'Content pipeline, posting cadence, and lead capture hooks.',
    column: 'Later',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 3, revenue: 3, urgency: 2, confidence: 3, effort: 3 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Client Intake Bot for Tax/Accounting Firms',
    notes:
      'Automated intake across web/voice/chat. Creates client record, uploads docs, validates completeness.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 4, urgency: 4, confidence: 4, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Appointment Reminder + No-Show Reduction Agent',
    notes:
      'Automated SMS/email reminders, confirmations, rescheduling, and calendar updates.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 4, urgency: 4, confidence: 4, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Client Status Update Agent',
    notes:
      'Clients ask for return status; AI checks GoFileRoom/UltraTax and replies with current stage + next steps.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 3, urgency: 3, confidence: 3, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Deadline & Compliance Monitoring Agent',
    notes:
      'Monitors deadlines, missing docs, overdue tasks; triggers alerts to staff and clients.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 3, urgency: 3, confidence: 3, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Internal Firm Knowledge Base Agent',
    notes: 'AI trained on SOPs, policies, and tax workflows for staff self-service support.',
    column: 'Later',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 2, revenue: 2, urgency: 2, confidence: 2, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Vendor Sourcing & Quoting Agent',
    notes:
      'AI agent sources paper, envelopes, ink, and consumables across vendors. Compares pricing, lead times, alternates, and generates RFQs/POs.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 4, urgency: 4, confidence: 4, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Mailing Project Intake & Application Builder Agent',
    notes:
      'Ingests sample mail pieces, validates machinability, mocks up barcode-ready layouts, and estimates internal production costs.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 4, urgency: 4, confidence: 5, effort: 4 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Production File Ingestion & Client Reporting Agent',
    notes:
      'Ingests machine job files/logs and auto-generates client-facing production and SLA reports.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 4, revenue: 4, urgency: 3, confidence: 4, effort: 4 },
  },
]

function mergeSeedIdeas(existingIdeas) {
  const existingTitles = new Set(existingIdeas.map((idea) => idea.title.trim().toLowerCase()))
  const missingSeeds = localSeedIdeas.filter(
    (idea) => !existingTitles.has(idea.title.trim().toLowerCase()),
  )
  return [...missingSeeds, ...existingIdeas]
}

function rowToIdea(row) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes || '',
    column: row.column_name,
    votes: row.votes,
    owner: row.owner || '',
    dueDate: row.due_date || '',
    metrics: {
      impact: row.impact,
      revenue: row.revenue,
      urgency: row.urgency,
      confidence: row.confidence,
      effort: row.effort,
    },
  }
}

function ideaToRow(idea) {
  return {
    title: idea.title,
    notes: idea.notes || '',
    column_name: idea.column,
    votes: idea.votes,
    owner: idea.owner || '',
    due_date: idea.dueDate || null,
    impact: idea.metrics.impact,
    revenue: idea.metrics.revenue,
    urgency: idea.metrics.urgency,
    confidence: idea.metrics.confidence,
    effort: idea.metrics.effort,
  }
}

function priorityScore(idea) {
  const { impact, revenue, urgency, confidence, effort } = idea.metrics
  return (
    impact * SCORE_WEIGHTS.impact +
    revenue * SCORE_WEIGHTS.revenue +
    urgency * SCORE_WEIGHTS.urgency +
    confidence * SCORE_WEIGHTS.confidence -
    effort * SCORE_WEIGHTS.effortPenalty +
    idea.votes * 0.4
  )
}

function App() {
  const [ideas, setIdeas] = useState(() => {
    const raw = localStorage.getItem('priority-whiteboard-ideas')
    if (!raw) return localSeedIdeas

    try {
      return mergeSeedIdeas(JSON.parse(raw))
    } catch {
      return localSeedIdeas
    }
  })
  const [status, setStatus] = useState(hasSupabase ? 'Connecting to realtime…' : 'Local mode')

  const [newIdea, setNewIdea] = useState({
    title: '',
    notes: '',
    column: 'Do Next',
    metrics: { impact: 3, revenue: 3, urgency: 3, confidence: 3, effort: 3 },
  })

  const [draggedId, setDraggedId] = useState(null)
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [myTasksFor, setMyTasksFor] = useState('Chea')
  const [editingIdeaId, setEditingIdeaId] = useState(null)
  const [editDraft, setEditDraft] = useState({ title: '', notes: '', column: 'Do Next' })

  useEffect(() => {
    if (!hasSupabase) {
      localStorage.setItem('priority-whiteboard-ideas', JSON.stringify(ideas))
      return
    }

    let ignore = false

    async function loadIdeas() {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        setStatus('Realtime error (using local cache)')
        return
      }
      if (!ignore) {
        setIdeas((data || []).map(rowToIdea))
        setStatus('Realtime connected')
      }
    }

    loadIdeas()

    const channel = supabase
      .channel('ideas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        () => loadIdeas(),
      )
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') setStatus('Realtime connected')
      })

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [])

  const groupedIdeas = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map((column) => [column, []]))
    ideas
      .map((idea) => ({ ...idea, score: priorityScore(idea) }))
      .filter((idea) => assigneeFilter === 'All' || (idea.owner || 'Unassigned') === assigneeFilter)
      .sort((a, b) => b.score - a.score)
      .forEach((idea) => grouped[idea.column].push(idea))
    return grouped
  }, [ideas, assigneeFilter])

  const myTasks = useMemo(
    () => ideas.filter((idea) => idea.owner === myTasksFor).sort((a, b) => priorityScore(b) - priorityScore(a)),
    [ideas, myTasksFor],
  )

  async function notifyAssignment(idea, assigneeName) {
    if (!ASSIGNMENT_WEBHOOK || !assigneeName || assigneeName === 'Unassigned') return
    const member = TEAM_MEMBERS.find((m) => m.name === assigneeName)
    if (!member?.email) return

    await fetch(ASSIGNMENT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: member.email,
        subject: `New whiteboard assignment: ${idea.title}`,
        body: `Hi ${assigneeName},\n\nYou were assigned a task in Priority Whiteboard.\n\nTask: ${idea.title}\nColumn: ${idea.column}\nDue date: ${idea.dueDate || 'Not set'}\n\nOpen board: https://priority-whiteboard.vercel.app\n`,
      }),
    })
  }

  async function addIdea(e) {
    e.preventDefault()
    if (!newIdea.title.trim()) return

    const idea = {
      id: crypto.randomUUID(),
      title: newIdea.title.trim(),
      notes: newIdea.notes.trim(),
      column: newIdea.column,
      votes: 0,
      owner: '',
      dueDate: '',
      metrics: newIdea.metrics,
    }

    if (hasSupabase) {
      const { error } = await supabase.from('ideas').insert(ideaToRow(idea))
      if (error) return setStatus(`Insert failed: ${error.message}`)
    } else {
      setIdeas((prev) => [idea, ...prev])
    }

    setNewIdea({
      title: '',
      notes: '',
      column: 'Do Next',
      metrics: { impact: 3, revenue: 3, urgency: 3, confidence: 3, effort: 3 },
    })
  }

  async function updateIdea(id, updateFn) {
    const current = ideas.find((idea) => idea.id === id)
    if (!current) return

    const updated = updateFn(current)

    if (hasSupabase) {
      const { error } = await supabase.from('ideas').update(ideaToRow(updated)).eq('id', id)
      if (error) setStatus(`Update failed: ${error.message}`)
    } else {
      setIdeas((prev) => prev.map((idea) => (idea.id === id ? updated : idea)))
    }

    if (updated.owner !== current.owner) {
      notifyAssignment(updated, updated.owner)
    }
  }

  async function deleteIdea(id) {
    if (!window.confirm('Delete this task?')) return

    if (hasSupabase) {
      const { error } = await supabase.from('ideas').delete().eq('id', id)
      if (error) return setStatus(`Delete failed: ${error.message}`)
    } else {
      setIdeas((prev) => prev.filter((idea) => idea.id !== id))
    }

    if (editingIdeaId === id) cancelEditing()
  }

  function onDropColumn(column) {
    if (!draggedId) return
    updateIdea(draggedId, (idea) => ({ ...idea, column }))
    setDraggedId(null)
  }

  function promoteToTask(id) {
    updateIdea(id, (idea) => ({ ...idea, column: 'Do Now' }))
  }

  function startEditing(idea) {
    setEditingIdeaId(idea.id)
    setEditDraft({ title: idea.title, notes: idea.notes || '', column: idea.column })
  }

  function cancelEditing() {
    setEditingIdeaId(null)
    setEditDraft({ title: '', notes: '', column: 'Do Next' })
  }

  async function saveEditing(id) {
    if (!editDraft.title.trim()) return
    await updateIdea(id, (idea) => ({
      ...idea,
      title: editDraft.title.trim(),
      notes: editDraft.notes.trim(),
      column: editDraft.column,
    }))
    cancelEditing()
  }

  const leaderboard = [...ideas]
    .map((idea) => ({ ...idea, score: priorityScore(idea) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return (
    <div className="app">
      <header>
        <h1>Priority Whiteboard</h1>
        <p>Capture ideas, vote, and rank what the team should build now.</p>
        <p className="status">Mode: {status}</p>
      </header>

      <section className="filters">
        <label>
          Filter by assignee
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
            <option value="All">All</option>
            {TEAM_MEMBERS.map((member) => (
              <option key={member.name} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="composer">
        <form onSubmit={addIdea}>
          <input
            value={newIdea.title}
            onChange={(e) => setNewIdea((p) => ({ ...p, title: e.target.value }))}
            placeholder="Idea title"
          />
          <input
            value={newIdea.notes}
            onChange={(e) => setNewIdea((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Notes / context"
          />
          <select
            value={newIdea.column}
            onChange={(e) => setNewIdea((p) => ({ ...p, column: e.target.value }))}
          >
            {COLUMNS.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>

          {Object.keys(newIdea.metrics).map((metric) => (
            <label key={metric}>
              {metric}
              <input
                type="range"
                min="1"
                max="5"
                value={newIdea.metrics[metric]}
                onChange={(e) =>
                  setNewIdea((p) => ({
                    ...p,
                    metrics: { ...p.metrics, [metric]: Number(e.target.value) },
                  }))
                }
              />
              <span>{newIdea.metrics[metric]}</span>
            </label>
          ))}

          <button type="submit">Add idea</button>
        </form>
      </section>

      <main className="board">
        {COLUMNS.map((column) => (
          <div
            key={column}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropColumn(column)}
          >
            <h2>{column}</h2>
            {groupedIdeas[column].map((idea) => {
              const isEditing = editingIdeaId === idea.id

              return (
                <article
                  key={idea.id}
                  className="card"
                  draggable={!isEditing}
                  onDragStart={() => setDraggedId(idea.id)}
                >
                  {isEditing ? (
                    <>
                      <input
                        value={editDraft.title}
                        onChange={(e) => setEditDraft((draft) => ({ ...draft, title: e.target.value }))}
                        placeholder="Task title"
                      />
                      <textarea
                        value={editDraft.notes}
                        onChange={(e) => setEditDraft((draft) => ({ ...draft, notes: e.target.value }))}
                        placeholder="Task notes"
                        rows={3}
                      />
                      <select
                        value={editDraft.column}
                        onChange={(e) => setEditDraft((draft) => ({ ...draft, column: e.target.value }))}
                      >
                        {COLUMNS.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <h3>{idea.title}</h3>
                      {idea.notes && <p>{idea.notes}</p>}
                    </>
                  )}

                  <p className="score">Score: {priorityScore(idea).toFixed(2)}</p>
                  <p className="assignee">Assigned: {idea.owner || 'Unassigned'}</p>

                  <div className="meta">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEditing(idea.id)}>Save</button>
                        <button className="secondary" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => updateIdea(idea.id, (i) => ({ ...i, votes: i.votes + 1 }))}>
                          👍 Vote ({idea.votes})
                        </button>
                        <button onClick={() => promoteToTask(idea.id)}>Promote to Do Now</button>
                        <button onClick={() => updateIdea(idea.id, (i) => ({ ...i, column: 'Done' }))}>
                          Mark complete
                        </button>
                        <button className="secondary" onClick={() => startEditing(idea)}>
                          Edit
                        </button>
                        <button className="danger" onClick={() => deleteIdea(idea.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  <div className="task-fields">
                    <select
                      value={idea.owner || 'Unassigned'}
                      onChange={(e) =>
                        updateIdea(idea.id, (i) => ({
                          ...i,
                          owner: e.target.value === 'Unassigned' ? '' : e.target.value,
                        }))
                      }
                    >
                      {TEAM_MEMBERS.map((member) => (
                        <option key={member.name} value={member.name}>
                          {member.email ? `${member.name} (${member.email})` : member.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={idea.dueDate}
                      onChange={(e) => updateIdea(idea.id, (i) => ({ ...i, dueDate: e.target.value }))}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        ))}
      </main>

      <section className="my-tasks">
        <h2>My Tasks View</h2>
        <label>
          Team member
          <select value={myTasksFor} onChange={(e) => setMyTasksFor(e.target.value)}>
            {TEAM_MEMBERS.filter((m) => m.name !== 'Unassigned').map((member) => (
              <option key={member.name} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <ul>
          {myTasks.length === 0 && <li>No tasks assigned.</li>}
          {myTasks.map((task) => (
            <li key={task.id}>
              {task.title} — {task.column} — due {task.dueDate || 'TBD'}
            </li>
          ))}
        </ul>
      </section>

      <section className="leaderboard">
        <h2>Top 5 by priority score</h2>
        <ol>
          {leaderboard.map((idea) => (
            <li key={idea.id}>
              {idea.title} — {idea.score.toFixed(2)}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export default App
