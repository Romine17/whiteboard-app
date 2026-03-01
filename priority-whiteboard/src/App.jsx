import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { hasSupabase, supabase } from './supabase'

const COLUMNS = ['Do Now', 'Do Next', 'Later', 'Done']
const OPS_COLUMNS = ['Do Now', 'Do Next', 'Later']

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
    title: 'Establish terms and conditions',
    notes: 'Draft, review, and finalize terms and conditions for client engagements.',
    column: 'Do Now',
    votes: 0,
    owner: 'Cory',
    dueDate: '',
    metrics: { impact: 4, revenue: 4, urgency: 4, confidence: 4, effort: 2 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Create company LLC',
    notes: 'File formation documents and complete LLC setup requirements.',
    column: 'Do Now',
    votes: 0,
    owner: 'Cory',
    dueDate: '',
    metrics: { impact: 4, revenue: 3, urgency: 4, confidence: 4, effort: 2 },
  },
  {
    id: crypto.randomUUID(),
    title: 'New client onboarding',
    notes: 'Build and execute the new client onboarding workflow from intake to kickoff.',
    column: 'Do Now',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 4, urgency: 5, confidence: 4, effort: 3 },
  },
  {
    id: crypto.randomUUID(),
    title: 'Build inventory system for Card Shop',
    notes: 'Design and implement inventory tracking for card intake, pricing, stock levels, and sales sync.',
    column: 'Do Next',
    votes: 0,
    owner: '',
    dueDate: '',
    metrics: { impact: 5, revenue: 5, urgency: 4, confidence: 4, effort: 4 },
  },
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
    detailedInstructions: '',
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
  const [selectedTaskId, setSelectedTaskId] = useState(null)
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
  const [searchText, setSearchText] = useState('')
  const [showDone, setShowDone] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [sortMode, setSortMode] = useState('manual')
  const [boardMode, setBoardMode] = useState('ops')
  const [quickFilter, setQuickFilter] = useState('all')
  const [expandedColumns, setExpandedColumns] = useState({})
  const [showSecondaryPanels, setShowSecondaryPanels] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [focusColumn, setFocusColumn] = useState('All')
  const [viewDensity, setViewDensity] = useState(() => localStorage.getItem('priority-whiteboard-density') || 'cozy')
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('priority-whiteboard-welcome-dismissed') !== 'true')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [history, setHistory] = useState([])
  const [future, setFuture] = useState([])
  const titleInputRef = useRef(null)

  useEffect(() => {
    if (!hasSupabase) {
      localStorage.setItem('priority-whiteboard-ideas', JSON.stringify(ideas))
      setLastSavedAt(new Date().toISOString())
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

      const fetchedIdeas = (data || []).map(rowToIdea)
      const mergedIdeas = mergeSeedIdeas(fetchedIdeas)
      const fetchedTitles = new Set(fetchedIdeas.map((idea) => idea.title.trim().toLowerCase()))
      const missingSeeds = localSeedIdeas.filter(
        (idea) => !fetchedTitles.has(idea.title.trim().toLowerCase()),
      )

      if (missingSeeds.length > 0) {
        const { error: seedError } = await supabase
          .from('ideas')
          .insert(missingSeeds.map((idea) => ideaToRow(idea)))

        if (seedError) {
          setStatus(`Seed sync warning: ${seedError.message}`)
        }
      }

      if (!ignore) {
        setIdeas(mergedIdeas)
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
    if (!hasSupabase) setLastSavedAt(new Date().toISOString())
  }, [taskMeta])

  useEffect(() => {
    localStorage.setItem('priority-whiteboard-locked-donow', JSON.stringify(lockedDoNowIds))
    if (!hasSupabase) setLastSavedAt(new Date().toISOString())
  }, [lockedDoNowIds])

  useEffect(() => {
    localStorage.setItem('priority-whiteboard-density', viewDensity)
  }, [viewDensity])

  useEffect(() => {
    localStorage.setItem('priority-whiteboard-welcome-dismissed', showWelcome ? 'false' : 'true')
  }, [showWelcome])

  const today = new Date().toISOString().slice(0, 10)

  const groupedIdeas = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map((column) => [column, []]))
    ideas
      .filter((idea) => assigneeFilter === 'All' || (idea.owner || 'Unassigned') === assigneeFilter)
      .filter((idea) => showDone || idea.column !== 'Done')
      .filter((idea) => focusColumn === 'All' || idea.column === focusColumn)
      .filter((idea) => {
        if (quickFilter === 'today') return idea.dueDate === today
        if (quickFilter === 'overdue') return Boolean(idea.dueDate) && idea.dueDate < today && idea.column !== 'Done'
        if (quickFilter === 'high') return idea.metrics.urgency >= 4 || idea.metrics.impact >= 4
        if (quickFilter === 'mine') return idea.owner === myTasksFor
        return true
      })
      .filter((idea) => {
        if (!searchText.trim()) return true
        const needle = searchText.toLowerCase()
        return (
          idea.title.toLowerCase().includes(needle) ||
          (idea.notes || '').toLowerCase().includes(needle) ||
          (idea.owner || '').toLowerCase().includes(needle)
        )
      })
      .forEach((idea) => grouped[idea.column].push(idea))

    if (sortMode !== 'manual') {
      Object.values(grouped).forEach((items) => {
        items.sort((a, b) => {
          if (sortMode === 'due') {
            return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')
          }
          if (sortMode === 'owner') {
            return (a.owner || 'zzzz').localeCompare(b.owner || 'zzzz')
          }
          return a.title.localeCompare(b.title)
        })
      })
    }

    return grouped
  }, [ideas, assigneeFilter, showDone, searchText, focusColumn, sortMode, quickFilter, myTasksFor, today])

  const myTasks = useMemo(
    () =>
      ideas
        .filter((idea) => idea.owner === myTasksFor)
        .sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')),
    [ideas, myTasksFor],
  )

  const visibleColumns = useMemo(() => {
    const baseColumns = boardMode === 'ops' ? OPS_COLUMNS : COLUMNS
    if (focusColumn !== 'All') return [focusColumn]
    if (boardMode === 'ops' && !showDone) return baseColumns
    return boardMode === 'ops' ? [...baseColumns, 'Done'] : baseColumns
  }, [focusColumn, boardMode, showDone])

  const orderedVisibleIdeas = useMemo(() => COLUMNS.flatMap((column) => groupedIdeas[column] || []), [groupedIdeas])

  const visibleTaskNumbers = useMemo(
    () => new Map(orderedVisibleIdeas.map((idea, index) => [idea.id, index + 1])),
    [orderedVisibleIdeas],
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

  const dashboardStats = useMemo(() => {
    const active = ideas.filter((idea) => idea.column !== 'Done')
    const dueToday = active.filter((idea) => idea.dueDate === today).length
    const overdue = active.filter((idea) => idea.dueDate && idea.dueDate < today).length
    const highPriority = active.filter((idea) => idea.metrics.urgency >= 4 || idea.metrics.impact >= 4).length
    const completionRate = ideas.length ? Math.round((ideas.filter((idea) => idea.column === 'Done').length / ideas.length) * 100) : 0

    return {
      total: ideas.length,
      active: active.length,
      dueToday,
      overdue,
      highPriority,
      completionRate,
    }
  }, [ideas, today])

  useEffect(() => {
    const doNowIds = new Set(ideas.filter((idea) => idea.column === 'Do Now').map((idea) => idea.id))
    setLockedDoNowIds((prev) => prev.filter((id) => doNowIds.has(id)))
  }, [ideas])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        setShowShortcuts((prev) => !prev)
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          redoChange()
        } else {
          undoChange()
        }
      }

      if (event.key.toLowerCase() === 'n' && !event.metaKey && !event.ctrlKey) {
        const targetTag = document.activeElement?.tagName?.toLowerCase()
        if (targetTag !== 'input' && targetTag !== 'textarea' && targetTag !== 'select') {
          event.preventDefault()
          titleInputRef.current?.focus()
        }
      }

      if (event.key.toLowerCase() === 'c' && !event.metaKey && !event.ctrlKey) {
        const targetTag = document.activeElement?.tagName?.toLowerCase()
        if (targetTag !== 'input' && targetTag !== 'textarea' && targetTag !== 'select') {
          event.preventDefault()
          setViewDensity((prev) => (prev === 'cozy' ? 'compact' : 'cozy'))
        }
      }

      if (event.key === '/' && !event.metaKey && !event.ctrlKey) {
        const targetTag = document.activeElement?.tagName?.toLowerCase()
        if (targetTag !== 'input' && targetTag !== 'textarea' && targetTag !== 'select') {
          event.preventDefault()
          setShowCommandPalette(true)
          setCommandQuery('')
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [history, future, hasSupabase])

  function captureSnapshot() {
    setHistory((prev) => [
      ...prev.slice(-24),
      { ideas, taskMeta, lockedDoNowIds, selectedTaskId },
    ])
    setFuture([])
  }

  function undoChange() {
    if (!history.length || hasSupabase) return
    const previous = history[history.length - 1]
    setFuture((f) => [{ ideas, taskMeta, lockedDoNowIds, selectedTaskId }, ...f].slice(0, 25))
    setHistory((prev) => prev.slice(0, -1))
    setIdeas(previous.ideas)
    setTaskMeta(previous.taskMeta)
    setLockedDoNowIds(previous.lockedDoNowIds)
    setSelectedTaskId(previous.selectedTaskId)
    setStatus('Undid last change')
  }

  function redoChange() {
    if (!future.length || hasSupabase) return
    const next = future[0]
    setHistory((h) => [...h, { ideas, taskMeta, lockedDoNowIds, selectedTaskId }].slice(-25))
    setFuture((f) => f.slice(1))
    setIdeas(next.ideas)
    setTaskMeta(next.taskMeta)
    setLockedDoNowIds(next.lockedDoNowIds)
    setSelectedTaskId(next.selectedTaskId)
    setStatus('Restored change')
  }

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
      captureSnapshot()
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
      captureSnapshot()
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
      captureSnapshot()
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
      captureSnapshot()
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

  function duplicateTask(id) {
    const current = ideas.find((idea) => idea.id === id)
    if (!current) return
    const duplicate = {
      ...current,
      id: crypto.randomUUID(),
      title: `${current.title} (copy)`,
      column: current.column === 'Done' ? 'Do Next' : current.column,
    }
    if (!hasSupabase) {
      captureSnapshot()
      setIdeas((prev) => [duplicate, ...prev])
      const currentMeta = getTaskMeta(id)
      setTaskMeta((prev) => ({
        ...prev,
        [duplicate.id]: {
          ...currentMeta,
          activity: [
            { id: crypto.randomUUID(), text: `Duplicated from task #${visibleTaskNumbers.get(id) || ''}`, at: new Date().toISOString() },
            ...(currentMeta.activity || []),
          ],
        },
      }))
    }
  }

  async function clearCompletedTasks() {
    const doneItems = ideas.filter((idea) => idea.column === 'Done')
    if (!doneItems.length) return setStatus('No completed tasks to clear')
    if (!window.confirm(`Clear ${doneItems.length} completed task(s)?`)) return

    if (hasSupabase) {
      const doneIds = doneItems.map((item) => item.id)
      const { error } = await supabase.from('ideas').delete().in('id', doneIds)
      if (error) return setStatus(`Clear failed: ${error.message}`)
    } else {
      captureSnapshot()
      const doneIds = new Set(doneItems.map((item) => item.id))
      setIdeas((prev) => prev.filter((idea) => !doneIds.has(idea.id)))
      setTaskMeta((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([id]) => !doneIds.has(id))),
      )
      setSelectedTaskId((prev) => (prev && doneIds.has(prev) ? null : prev))
    }
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
    if (!hasSupabase && activityText) captureSnapshot()
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

  const commands = [
    { id: 'focus-add', label: 'Focus add task input', run: () => titleInputRef.current?.focus() },
    { id: 'toggle-done', label: showDone ? 'Hide Done column' : 'Show Done column', run: () => setShowDone((p) => !p) },
    { id: 'toggle-density', label: `Switch to ${viewDensity === 'cozy' ? 'compact' : 'cozy'} view`, run: () => setViewDensity((p) => (p === 'cozy' ? 'compact' : 'cozy')) },
    { id: 'focus-donow', label: 'Focus Do Now column', run: () => setFocusColumn('Do Now') },
    { id: 'clear-filters', label: 'Clear all filters', run: () => { setSearchText(''); setAssigneeFilter('All'); setFocusColumn('All'); setQuickFilter('all'); setShowDone(true) } },
    { id: 'summary', label: 'Generate weekly summary', run: () => generateWeeklySummary() },
  ]

  const filteredCommands = commands.filter((cmd) => cmd.label.toLowerCase().includes(commandQuery.toLowerCase()))

  function runCommand(command) {
    command.run()
    setShowCommandPalette(false)
    setStatus(`Command: ${command.label}`)
  }

  return (
    <div className="app">
      <header>
        <h1>Priority Whiteboard</h1>
        <p>Simple board, faster execution. Click a card to open full details.</p>
        <p className="status">Mode: {status}</p>
      </header>

      {showWelcome && (
        <section className="welcome-tip">
          <p>
            Tip: press <strong>N</strong> to add fast, <strong>Cmd/Ctrl+Z</strong> to undo, and <strong>?</strong> for shortcuts.
          </p>
          <button className="secondary" onClick={() => setShowWelcome(false)}>
            Dismiss
          </button>
        </section>
      )}

      <section className="snapshot-strip">
        <article><strong>{dashboardStats.active}</strong><span>Active</span></article>
        <article><strong>{dashboardStats.dueToday}</strong><span>Due today</span></article>
        <article><strong>{dashboardStats.overdue}</strong><span>Overdue</span></article>
        <article><strong>{dashboardStats.highPriority}</strong><span>High priority</span></article>
        <article><strong>{dashboardStats.completionRate}%</strong><span>Completed</span></article>
      </section>

      <section className="toolbar">
        <div className="toolbar-main">
          <input
            placeholder="Search tasks, notes, owners…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="quick-filters">
            <button type="button" className={quickFilter === 'all' ? 'chip chip-active' : 'chip'} onClick={() => setQuickFilter('all')}>All</button>
            <button type="button" className={quickFilter === 'today' ? 'chip chip-active' : 'chip'} onClick={() => setQuickFilter('today')}>Today</button>
            <button type="button" className={quickFilter === 'overdue' ? 'chip chip-active' : 'chip'} onClick={() => setQuickFilter('overdue')}>Overdue</button>
            <button type="button" className={quickFilter === 'high' ? 'chip chip-active' : 'chip'} onClick={() => setQuickFilter('high')}>High Priority</button>
            <button type="button" className={quickFilter === 'mine' ? 'chip chip-active' : 'chip'} onClick={() => setQuickFilter('mine')}>Mine ({myTasksFor})</button>
          </div>
          <label>
            Layout
            <select value={boardMode} onChange={(e) => setBoardMode(e.target.value)}>
              <option value="ops">Now / Next / Later</option>
              <option value="classic">Classic 4-column</option>
            </select>
          </label>
          <label className="checkbox-inline">
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            Show Done
          </label>
          <label>
            Assignee
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="All">All</option>
              {TEAM_MEMBERS.map((member) => (
                <option key={member.name} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Focus column
            <select value={focusColumn} onChange={(e) => setFocusColumn(e.target.value)}>
              <option value="All">All</option>
              {COLUMNS.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </label>
          <label>
            Density
            <select value={viewDensity} onChange={(e) => setViewDensity(e.target.value)}>
              <option value="cozy">Cozy</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label>
            Sort
            <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
              <option value="manual">Manual</option>
              <option value="due">Due date</option>
              <option value="owner">Owner</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>

        <div className="toolbar-actions">
          <button className="secondary" onClick={undoChange} disabled={!history.length || hasSupabase}>
            Undo
          </button>
          <button className="secondary" onClick={redoChange} disabled={!future.length || hasSupabase}>
            Redo
          </button>
          <button className="secondary" onClick={() => setShowShortcuts(true)}>
            Shortcuts
          </button>
          <button className="secondary" onClick={clearCompletedTasks}>
            Clear Done
          </button>
          <button className="secondary" onClick={() => setShowSecondaryPanels((p) => !p)}>
            {showSecondaryPanels ? 'Hide extra panels' : 'Show extra panels'}
          </button>
        </div>

        <div className="toolbar-stats">
          <span>Sprint lock: {lockedDoNowIds.length}/{MAX_LOCKED_DO_NOW}</span>
          <span>Total visible: {orderedVisibleIdeas.length}</span>
          <span>
            Last saved:{' '}
            {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
      </section>

      <main className={`board board-${viewDensity}`}>
        {visibleColumns.map((column) => (
          <div
            key={column}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropColumn(column)}
          >
            <h2>
              {column} <span className="column-count">({groupedIdeas[column].length})</span>
            </h2>
            {(expandedColumns[column] ? groupedIdeas[column] : groupedIdeas[column].slice(0, 6)).map((idea) => {
              const isEditing = editingIdeaId === idea.id
              const isSelectedTask = selectedTaskId === idea.id

              const meta = getTaskMeta(idea.id)
              const completedSubtasks = meta.subtasks.filter((task) => task.done).length
              const notesPreview = (idea.notes || '').trim()

              return (
                <article
                  key={idea.id}
                  className={`card ${isSelectedTask ? 'card-selected' : 'card-collapsed'}`}
                  draggable={!isEditing}
                  onDragStart={() => setDraggedId(idea.id)}
                  onClick={() => setSelectedTaskId((prev) => (prev === idea.id ? null : idea.id))}
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
                      <h3 className="task-title-row">
                        <span className="task-caret" aria-hidden="true">{isSelectedTask ? '▾' : '▸'}</span>
                        <span>{visibleTaskNumbers.get(idea.id)} — {idea.title}</span>
                      </h3>
                      {notesPreview && <p className="notes-preview">{notesPreview}</p>}
                    </>
                  )}

                  <p className="assignee">Assigned: {idea.owner || 'Unassigned'}</p>
                  {!isEditing && (
                    <div className="quick-inline" onClick={(e) => e.stopPropagation()}>
                      <select
                        aria-label="Quick assign owner"
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
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label="Quick due date"
                        type="date"
                        value={idea.dueDate}
                        onChange={(e) => updateIdea(idea.id, (i) => ({ ...i, dueDate: e.target.value }))}
                      />
                    </div>
                  )}
                  <p className={isReadyForDoNow(idea) ? 'ready ready-yes' : 'ready ready-no'}>
                    {isReadyForDoNow(idea) ? 'Ready for Do Now' : 'Not Ready for Do Now'}
                  </p>
                  <p className="mini-meta">
                    Due: {idea.dueDate || 'TBD'} • Checklist: {completedSubtasks}/{meta.subtasks.length}
                  </p>
                  {meta.blocked && <p className="blocked">Blocked</p>}
                  {isSelectedTask && meta.dependencies && <p className="deps">Software needed: {meta.dependencies}</p>}

                  <div className="meta" onClick={(e) => e.stopPropagation()}>
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
                        <button
                          className="secondary"
                          onClick={() => setSelectedTaskId((prev) => (prev === idea.id ? null : idea.id))}
                        >
                          {isSelectedTask ? 'Hide details' : 'Open details'}
                        </button>
                        <button className="secondary" onClick={() => startEditing(idea)}>
                          Edit
                        </button>
                        {!hasSupabase && (
                          <button className="secondary" onClick={() => duplicateTask(idea.id)}>
                            Duplicate
                          </button>
                        )}
                        <button className="danger" onClick={() => deleteIdea(idea.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {isSelectedTask && (
                    <>
                      <div className="task-fields" onClick={(e) => e.stopPropagation()}>
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

                      <div className="task-fields task-fields-3" onClick={(e) => e.stopPropagation()}>
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

                      <div className="task-fields" onClick={(e) => e.stopPropagation()}>
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

                      <div className="task-fields" onClick={(e) => e.stopPropagation()}>
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

                      <div className="checklist" onClick={(e) => e.stopPropagation()}>
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

                      <div className="task-detail" onClick={(e) => e.stopPropagation()}>
                        <p>Detailed instructions</p>
                        <textarea
                          value={meta.detailedInstructions}
                          onChange={(e) =>
                            updateTaskMeta(idea.id, (current) => ({ ...current, detailedInstructions: e.target.value }))
                          }
                          onBlur={(e) =>
                            updateTaskMeta(
                              idea.id,
                              (current) => ({ ...current, detailedInstructions: e.target.value }),
                              'Updated detailed instructions',
                            )
                          }
                          placeholder="Click task, then write detailed requirements here."
                          rows={6}
                        />
                      </div>

                      <div className="activity-log" onClick={(e) => e.stopPropagation()}>
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
                    </>
                  )}
                </article>
              )
            })}
            {groupedIdeas[column].length > 6 && (
              <button
                type="button"
                className="secondary column-expand"
                onClick={() => setExpandedColumns((prev) => ({ ...prev, [column]: !prev[column] }))}
              >
                {expandedColumns[column] ? 'Show less' : `Show all (${groupedIdeas[column].length})`}
              </button>
            )}
          </div>
        ))}
      </main>

      <section className="composer composer-bottom">
        <h2>Add Task</h2>
        <form onSubmit={addIdea}>
          <input
            ref={titleInputRef}
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

      {showSecondaryPanels && (
        <>
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
        </>
      )}

      {showCommandPalette && (
        <div className="shortcut-modal" onClick={() => setShowCommandPalette(false)}>
          <div className="shortcut-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Command palette</h3>
            <input
              autoFocus
              placeholder="Type a command..."
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
            />
            <ul>
              {filteredCommands.map((command) => (
                <li key={command.id}>
                  <button className="secondary command-btn" onClick={() => runCommand(command)}>
                    {command.label}
                  </button>
                </li>
              ))}
              {filteredCommands.length === 0 && <li>No matching commands.</li>}
            </ul>
            <button className="secondary" onClick={() => setShowCommandPalette(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="shortcut-modal" onClick={() => setShowShortcuts(false)}>
          <div className="shortcut-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Keyboard shortcuts</h3>
            <ul>
              <li><strong>N</strong>: focus new task title</li>
              <li><strong>?</strong>: open/close this panel</li>
              <li><strong>Cmd/Ctrl + Z</strong>: undo (local mode)</li>
              <li><strong>Cmd/Ctrl + Shift + Z</strong>: redo (local mode)</li>
              <li><strong>C</strong>: toggle cozy/compact card density</li>
              <li><strong>/</strong>: open command palette</li>
            </ul>
            <button className="secondary" onClick={() => setShowShortcuts(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
