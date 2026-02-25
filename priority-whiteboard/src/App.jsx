import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { hasSupabase, supabase } from './supabase'

const COLUMNS = ['Do Now', 'Do Next', 'Later', 'Done']

const TEAM_MEMBERS = [
  { name: 'Unassigned', email: '' },
  { name: 'Chea', email: 'cromine@rhwcpas.com' },
  { name: 'Cory', email: 'Cc2enterprises@gmail.com' },
  { name: 'Anthony', email: 'anthony.depassio@gmail.com' },
  { name: 'Chadd', email: 'Chaddjpierce@gmail.com' },
  { name: 'Zack', email: 'Zbyers07@gmail.com' },
]

const ASSIGNMENT_WEBHOOK = import.meta.env.VITE_ASSIGNMENT_WEBHOOK_URL || ''
const MAX_LOCKED_DO_NOW = 3

const TASK_TEMPLATES = [
  {
    name: 'Client onboarding',
    title: 'Client onboarding workflow setup',
    notes: 'Set up onboarding pipeline, intake docs, and kickoff communication.',
    column: 'Do Next',
    metrics: { impact: 4, revenue: 4, urgency: 4, confidence: 4, effort: 3 },
    subtasks: ['Kickoff call completed', 'Intake documents requested', 'CRM record created'],
  },
  {
    name: 'Tax strategy engagement',
    title: 'Tax strategy engagement launch',
    notes: 'Create strategy review plan and assign implementation actions.',
    column: 'Do Next',
    metrics: { impact: 5, revenue: 5, urgency: 4, confidence: 4, effort: 3 },
    subtasks: ['Financials collected', 'Strategy options drafted', 'Client review meeting booked'],
  },
  {
    name: 'App MVP build',
    title: 'App MVP sprint kickoff',
    notes: 'Define MVP scope, assign build owner, and launch first sprint tasks.',
    column: 'Do Next',
    metrics: { impact: 5, revenue: 4, urgency: 4, confidence: 4, effort: 4 },
    subtasks: ['MVP scope approved', 'Technical owner assigned', 'Sprint backlog prepared'],
  },
]

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

function defaultTaskMeta() {
  return {
    blocked: false,
    dependencies: '',
    subtasks: [],
    effortHours: 0,
    revenueImpact: 0,
    timeSavings: 0,
    riskReduction: 0,
    clientName: '',
    valuePropAmount: '',
    chargeAmount: '',
    activity: [],
  }
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
  })

  const [draggedId, setDraggedId] = useState(null)
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [myTasksFor, setMyTasksFor] = useState('Chea')
  const [editingIdeaId, setEditingIdeaId] = useState(null)
  const [editDraft, setEditDraft] = useState({ title: '', notes: '', column: 'Do Next' })
  const [taskMeta, setTaskMeta] = useState(() => {
    const raw = localStorage.getItem('priority-whiteboard-taskmeta')
    if (!raw) return {}

    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  })
  const [summaryText, setSummaryText] = useState('')
  const [lockedDoNowIds, setLockedDoNowIds] = useState(() => {
    const raw = localStorage.getItem('priority-whiteboard-locked-donow')
    if (!raw) return []

    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  })
  const [selectedTemplate, setSelectedTemplate] = useState(TASK_TEMPLATES[0].name)

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

  useEffect(() => {
    localStorage.setItem('priority-whiteboard-taskmeta', JSON.stringify(taskMeta))
  }, [taskMeta])

  useEffect(() => {
    localStorage.setItem('priority-whiteboard-locked-donow', JSON.stringify(lockedDoNowIds))
  }, [lockedDoNowIds])

  const groupedIdeas = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map((column) => [column, []]))
    ideas
      .filter((idea) => assigneeFilter === 'All' || (idea.owner || 'Unassigned') === assigneeFilter)
      .forEach((idea) => grouped[idea.column].push(idea))
    return grouped
  }, [ideas, assigneeFilter])

  const myTasks = useMemo(
    () =>
      ideas
        .filter((idea) => idea.owner === myTasksFor)
        .sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')),
    [ideas, myTasksFor],
  )

  const capacityByOwner = useMemo(() => {
    const totals = {}
    ideas
      .filter((idea) => idea.column !== 'Done' && idea.owner)
      .forEach((idea) => {
        const hrs = Number(getTaskMeta(idea.id).effortHours || 0)
        totals[idea.owner] = (totals[idea.owner] || 0) + hrs
      })
    return totals
  }, [ideas, taskMeta])

  useEffect(() => {
    const doNowIds = new Set(ideas.filter((idea) => idea.column === 'Do Now').map((idea) => idea.id))
    setLockedDoNowIds((prev) => prev.filter((id) => doNowIds.has(id)))
  }, [ideas])

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
      metrics: { impact: 3, revenue: 3, urgency: 3, confidence: 3, effort: 3 },
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
    })
  }

  async function addTemplateIdea() {
    const template = TASK_TEMPLATES.find((item) => item.name === selectedTemplate)
    if (!template) return

    const idea = {
      id: crypto.randomUUID(),
      title: template.title,
      notes: template.notes,
      column: template.column,
      votes: 0,
      owner: '',
      dueDate: '',
      metrics: template.metrics,
    }

    if (hasSupabase) {
      const { error } = await supabase.from('ideas').insert(ideaToRow(idea))
      if (error) return setStatus(`Template insert failed: ${error.message}`)
    } else {
      setIdeas((prev) => [idea, ...prev])
    }

    setTaskMeta((prev) => ({
      ...prev,
      [idea.id]: {
        ...defaultTaskMeta(),
        subtasks: template.subtasks.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
        activity: [
          {
            id: crypto.randomUUID(),
            text: `Task created from template: ${template.name}`,
            at: new Date().toISOString(),
          },
        ],
      },
    }))
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
    setTaskMeta((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function isReadyForDoNow(idea) {
    const meta = getTaskMeta(idea.id)
    return Boolean((idea.owner || '').trim()) && Boolean((idea.dueDate || '').trim()) && meta.subtasks.length > 0
  }

  function validateMoveToDoNow(idea) {
    if (!isReadyForDoNow(idea)) {
      setStatus('Ready gate: assign owner, due date, and at least 1 checklist item before Do Now')
      return false
    }
    return true
  }

  function onDropColumn(column) {
    if (!draggedId) return
    const current = ideas.find((idea) => idea.id === draggedId)
    if (!current) return

    if (column === 'Do Now' && !validateMoveToDoNow(current)) {
      setDraggedId(null)
      return
    }

    if (lockedDoNowIds.includes(draggedId) && column !== 'Do Now') {
      setStatus('Locked sprint task: unlock it first to move it out of Do Now')
      setDraggedId(null)
      return
    }

    updateIdea(draggedId, (idea) => ({ ...idea, column }))
    setDraggedId(null)
  }

  function promoteToTask(id) {
    const current = ideas.find((idea) => idea.id === id)
    if (!current || !validateMoveToDoNow(current)) return
    updateIdea(id, (idea) => ({ ...idea, column: 'Do Now' }))
  }

  function toggleLockDoNow(id) {
    const idea = ideas.find((item) => item.id === id)
    if (!idea || idea.column !== 'Do Now') return

    const isLocked = lockedDoNowIds.includes(id)
    if (isLocked) {
      setLockedDoNowIds((prev) => prev.filter((lockedId) => lockedId !== id))
      return
    }

    if (lockedDoNowIds.length >= MAX_LOCKED_DO_NOW) {
      setStatus(`Weekly sprint lock limit reached (${MAX_LOCKED_DO_NOW})`)
      return
    }

    setLockedDoNowIds((prev) => [...prev, id])
  }

  function markComplete(id) {
    if (lockedDoNowIds.includes(id)) {
      setStatus('Locked sprint task: unlock it first before marking complete')
      return
    }
    updateIdea(id, (idea) => ({ ...idea, column: 'Done' }))
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
    const current = ideas.find((idea) => idea.id === id)
    if (!current) return

    if (editDraft.column === 'Do Now' && current.column !== 'Do Now' && !validateMoveToDoNow(current)) {
      return
    }

    if (lockedDoNowIds.includes(id) && editDraft.column !== 'Do Now') {
      setStatus('Locked sprint task: unlock it first to move it out of Do Now')
      return
    }

    await updateIdea(id, (idea) => ({
      ...idea,
      title: editDraft.title.trim(),
      notes: editDraft.notes.trim(),
      column: editDraft.column,
    }))
    cancelEditing()
  }

  function getTaskMeta(id) {
    return taskMeta[id] || defaultTaskMeta()
  }

  function logTaskActivity(meta, text) {
    return {
      ...meta,
      activity: [{ id: crypto.randomUUID(), text, at: new Date().toISOString() }, ...(meta.activity || [])].slice(
        0,
        25,
      ),
    }
  }

  function updateTaskMeta(id, updateFn, activityText = '') {
    setTaskMeta((prev) => {
      const current = prev[id] || defaultTaskMeta()
      let updated = updateFn(current)
      if (activityText) {
        updated = logTaskActivity(updated, activityText)
      }
      return {
        ...prev,
        [id]: updated,
      }
    })
  }

  function addSubtask(id, text) {
    const trimmed = text.trim()
    if (!trimmed) return

    updateTaskMeta(
      id,
      (meta) => ({
        ...meta,
        subtasks: [...meta.subtasks, { id: crypto.randomUUID(), text: trimmed, done: false }],
      }),
      `Added checklist item: ${trimmed}`,
    )
  }

  function generateWeeklySummary() {
    const inProgress = ideas.filter((idea) => idea.column !== 'Done')
    const completed = ideas.filter((idea) => idea.column === 'Done')
    const blocked = ideas.filter((idea) => getTaskMeta(idea.id).blocked)
    const overdue = ideas.filter((idea) => idea.dueDate && idea.dueDate < new Date().toISOString().slice(0, 10))

    const lines = [
      `Weekly Whiteboard Summary (${new Date().toLocaleDateString()})`,
      '',
      `Completed: ${completed.length}`,
      ...completed.slice(0, 8).map((idea) => `- ${idea.title} (${idea.owner || 'Unassigned'})`),
      '',
      `In Progress: ${inProgress.length}`,
      ...inProgress.slice(0, 10).map((idea) => `- ${idea.title} [${idea.column}] (${idea.owner || 'Unassigned'})`),
      '',
      `Blocked: ${blocked.length}`,
      ...blocked.slice(0, 8).map((idea) => {
        const meta = getTaskMeta(idea.id)
        return `- ${idea.title}${meta.dependencies ? ` — software needed: ${meta.dependencies}` : ''}`
      }),
      '',
      `Overdue: ${overdue.length}`,
      ...overdue.slice(0, 8).map((idea) => `- ${idea.title} (due ${idea.dueDate})`),
    ]

    setSummaryText(lines.join('\n'))
  }

  async function copySummary() {
    if (!summaryText) return
    await navigator.clipboard.writeText(summaryText)
  }

  return (
    <div className="app">
      <header>
        <h1>Priority Whiteboard</h1>
        <p>Capture ideas, prioritize execution, and move work to done.</p>
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
        <p className="status">Sprint lock: {lockedDoNowIds.length}/{MAX_LOCKED_DO_NOW} Do Now tasks locked</p>
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

              const meta = getTaskMeta(idea.id)
              const completedSubtasks = meta.subtasks.filter((task) => task.done).length

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

                  <p className="assignee">Assigned: {idea.owner || 'Unassigned'}</p>
                  <p className={isReadyForDoNow(idea) ? 'ready ready-yes' : 'ready ready-no'}>
                    {isReadyForDoNow(idea) ? 'Ready for Do Now' : 'Not Ready for Do Now'}
                  </p>
                  {meta.blocked && <p className="blocked">Blocked</p>}
                  {meta.dependencies && <p className="deps">Software needed: {meta.dependencies}</p>}

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
                        <button onClick={() => promoteToTask(idea.id)}>Promote to Do Now</button>
                        {idea.column === 'Do Now' && (
                          <button className="secondary" onClick={() => toggleLockDoNow(idea.id)}>
                            {lockedDoNowIds.includes(idea.id) ? 'Unlock sprint' : 'Lock sprint'}
                          </button>
                        )}
                        <button onClick={() => markComplete(idea.id)}>Mark complete</button>
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

                  <div className="task-fields task-fields-3">
                    <input
                      value={meta.clientName}
                      onChange={(e) =>
                        updateTaskMeta(idea.id, (current) => ({ ...current, clientName: e.target.value }))
                      }
                      placeholder="Client name"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={meta.valuePropAmount}
                      onChange={(e) =>
                        updateTaskMeta(idea.id, (current) => ({ ...current, valuePropAmount: e.target.value }))
                      }
                      placeholder="Value prop ($)"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={meta.chargeAmount}
                      onChange={(e) =>
                        updateTaskMeta(idea.id, (current) => ({ ...current, chargeAmount: e.target.value }))
                      }
                      placeholder="Charge amount ($)"
                    />
                  </div>

                  <div className="task-fields">
                    <label>
                      <input
                        type="checkbox"
                        checked={meta.blocked}
                        onChange={(e) =>
                          updateTaskMeta(
                            idea.id,
                            (current) => ({ ...current, blocked: e.target.checked }),
                            e.target.checked ? 'Marked blocked' : 'Marked unblocked',
                          )
                        }
                      />
                      Blocked
                    </label>
                    <input
                      value={meta.dependencies}
                      onChange={(e) =>
                        updateTaskMeta(idea.id, (current) => ({ ...current, dependencies: e.target.value }))
                      }
                      onBlur={(e) =>
                        updateTaskMeta(
                          idea.id,
                          (current) => ({ ...current, dependencies: e.target.value }),
                          `Updated software needed: ${e.target.value || 'None'}`,
                        )
                      }
                      placeholder="Software needed"
                    />
                  </div>

                  <div className="task-fields">
                    <label>
                      Est. hours
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={meta.effortHours}
                        onChange={(e) =>
                          updateTaskMeta(idea.id, (current) => ({
                            ...current,
                            effortHours: Number(e.target.value || 0),
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="checklist">
                    <p>
                      Checklist ({completedSubtasks}/{meta.subtasks.length})
                    </p>
                    {meta.subtasks.map((task) => (
                      <div key={task.id} className="checklist-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() =>
                              updateTaskMeta(
                                idea.id,
                                (current) => ({
                                  ...current,
                                  subtasks: current.subtasks.map((subtask) =>
                                    subtask.id === task.id ? { ...subtask, done: !subtask.done } : subtask,
                                  ),
                                }),
                                `${task.done ? 'Unchecked' : 'Checked'}: ${task.text}`,
                              )
                            }
                          />
                          <span className={task.done ? 'done' : ''}>{task.text}</span>
                        </label>
                        <button
                          className="secondary"
                          onClick={() =>
                            updateTaskMeta(
                              idea.id,
                              (current) => ({
                                ...current,
                                subtasks: current.subtasks.filter((subtask) => subtask.id !== task.id),
                              }),
                              `Removed checklist item: ${task.text}`,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="checklist-add">
                      <input
                        placeholder="Add checklist item"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSubtask(idea.id, e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <small>Press Enter to add</small>
                    </div>
                  </div>

                  <div className="activity-log">
                    <p>Recent activity</p>
                    <ul>
                      {(meta.activity || []).slice(0, 5).map((entry) => (
                        <li key={entry.id}>
                          {entry.text} — {new Date(entry.at).toLocaleString()}
                        </li>
                      ))}
                      {(meta.activity || []).length === 0 && <li>No activity yet.</li>}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
        ))}
      </main>

      <section className="composer composer-bottom">
        <h2>Add Task</h2>
        <form onSubmit={addIdea}>
          <input
            value={newIdea.title}
            onChange={(e) => setNewIdea((p) => ({ ...p, title: e.target.value }))}
            placeholder="Task title"
          />
          <input
            value={newIdea.notes}
            onChange={(e) => setNewIdea((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Notes"
          />
          <select value={newIdea.column} onChange={(e) => setNewIdea((p) => ({ ...p, column: e.target.value }))}>
            {COLUMNS.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
          <button type="submit">Add task</button>
        </form>

        <div className="template-row">
          <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
            {TASK_TEMPLATES.map((template) => (
              <option key={template.name} value={template.name}>
                Template: {template.name}
              </option>
            ))}
          </select>
          <button onClick={addTemplateIdea}>Add from template</button>
        </div>
      </section>

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

      <section className="capacity-view">
        <h2>Capacity View (estimated active hours)</h2>
        <ul>
          {Object.keys(capacityByOwner).length === 0 && <li>No estimated hours entered yet.</li>}
          {Object.entries(capacityByOwner)
            .sort((a, b) => b[1] - a[1])
            .map(([owner, hours]) => (
              <li key={owner}>
                {owner}: {hours} hrs
              </li>
            ))}
        </ul>
      </section>

      <section className="weekly-summary">
        <h2>Weekly Summary Export</h2>
        <div className="meta">
          <button onClick={generateWeeklySummary}>Generate summary</button>
          <button className="secondary" onClick={copySummary}>
            Copy summary
          </button>
        </div>
        <textarea
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          placeholder="Generate summary to copy into email, WhatsApp, or team updates."
          rows={12}
        />
      </section>
    </div>
  )
}

export default App
