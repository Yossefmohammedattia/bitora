import { NextResponse } from 'next/server'
import { Tasks, Users, CompanyHealthDB } from '@/lib/db'

import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { COMPANIES, TASK_TEMPLATES, aiCall, parseJSON, LEVELS } from '@/lib/data'
import { randomUUID } from 'crypto'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

// ── Adaptive difficulty config ────────────────────────────────
const DIFFICULTY_CONFIG = {
  beginner: {
    '30min': { scope: 'Fix a single bug or add one small validation', criteria: 2, constraints: 1, complexity: 'simple', label: 'Quick Fix' },
    '1hr':   { scope: 'Add one small feature or endpoint with basic validation', criteria: 3, constraints: 1, complexity: 'small feature', label: 'Mini Feature' },
    '2hrs':  { scope: 'Build a single API endpoint with auth and error handling', criteria: 3, constraints: 2, complexity: 'single endpoint', label: 'Small Task' },
  },
  intermediate: {
    '30min': { scope: 'Fix a bug with tests or improve error handling in one module', criteria: 3, constraints: 2, complexity: 'focused fix', label: 'Bug Fix' },
    '1hr':   { scope: 'Build one feature with validation, error handling, and basic tests', criteria: 4, constraints: 2, complexity: 'feature', label: 'Feature' },
    '2hrs':  { scope: 'Design and implement a small service with DB, validation, and error handling', criteria: 5, constraints: 3, complexity: 'small service', label: 'Task' },
  },
  advanced: {
    '30min': { scope: 'Performance optimization or security fix with measurable impact', criteria: 3, constraints: 2, complexity: 'optimization', label: 'Optimization' },
    '1hr':   { scope: 'Build a production-ready feature with edge cases, tests, and monitoring', criteria: 5, constraints: 3, complexity: 'production feature', label: 'Feature' },
    '2hrs':  { scope: 'Design and implement a system component with failure handling, tests, and observability', criteria: 6, constraints: 4, complexity: 'system component', label: 'Engineering Task' },
  },
}

export async function GET(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const active = await Tasks.activeByUser(payload.id)
  const completed = await Tasks.completedByUser(payload.id)
  return NextResponse.json({ active: active || null, history: completed })
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await Users.findById(payload.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!user.companyId) return NextResponse.json({ error: 'Join a company first' }, { status: 400 })
  if (await Tasks.activeByUser(payload.id)) return NextResponse.json({ error: 'You already have an active task' }, { status: 409 })

  const company = COMPANIES.find(c => c.id === user.companyId)
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  const health = await CompanyHealthDB.get(user.companyId) || { reputation: 70, reliability: 70, velocity: 70, securityRisk: 40, techDebt: 40 }

  const role = user.role || 'Backend Engineer'

  // ── Adaptive difficulty ────────────────────────────────────
  const expLevel = user.experienceLevel || 'intermediate'
  const timeAvail = user.availableTime || '1hr'
  const diff = DIFFICULTY_CONFIG[expLevel]?.[timeAvail] || DIFFICULTY_CONFIG.intermediate['1hr']

  // ── Scope adjustments based on health ─────────────────────
  const healthContext = [
    health.securityRisk > 65 ? 'Security risk is HIGH — task should involve a security vulnerability fix' : '',
    health.techDebt > 70     ? 'Tech debt is HIGH — task should reduce complexity or pay down debt' : '',
    health.reliability < 55  ? 'Reliability is LOW — task should improve error handling or stability' : '',
  ].filter(Boolean).join('. ')

  const prompt = `You are an engineering manager at ${company.name} (${company.type}).

Engineer profile:
- Role: ${role}
- Experience: ${expLevel} (${LEVELS[user.level] || 'Junior'})
- Available time: ${timeAvail}
- Tasks completed before: ${user.tasksCompleted}

Task constraints (STRICT):
- Scope: ${diff.scope}
- Max acceptance criteria: ${diff.criteria} (NO MORE)
- Max constraints: ${diff.constraints} (NO MORE)
- Complexity level: ${diff.complexity}
- Must be completable in ${timeAvail}

${healthContext ? `Company situation: ${healthContext}` : ''}

Company stack: ${company.stack?.join(', ') || 'Node.js, PostgreSQL, Redis'}

IMPORTANT RULES:
- DO NOT generate full system designs or large features
- Keep scope very focused — one function, one endpoint, one fix, one component
- For beginners: no distributed systems, no complex patterns
- For 30min tasks: literally one small thing
- Title should be specific like a real JIRA ticket

Generate ONE task matching this exact scope. Return ONLY valid JSON:
{
  "title": "<5-8 word specific ticket title>",
  "desc": "<2-3 sentences max. Specific technical context with real numbers>",
  "background": "<1 sentence: why this task exists now>",
  "acceptance_criteria": ["<specific testable criterion — MAX ${diff.criteria}>"],
  "constraints": ["<hard constraint — MAX ${diff.constraints}>"],
  "tags": ["<tag1>", "<tag2>"],
  "estimatedMinutes": ${timeAvail === '30min' ? 30 : timeAvail === '1hr' ? 60 : 120},
  "difficulty": "${expLevel}"
}`

  let taskData: any
  try {
    const aiText = await aiCall(prompt)
    taskData = parseJSON(aiText)
    // Enforce limits — trim if AI went over
    if (taskData.acceptance_criteria?.length > diff.criteria) {
      taskData.acceptance_criteria = taskData.acceptance_criteria.slice(0, diff.criteria)
    }
    if (taskData.constraints?.length > diff.constraints) {
      taskData.constraints = taskData.constraints.slice(0, diff.constraints)
    }
  } catch {
    // Adaptive fallback templates
    const pool = TASK_TEMPLATES[role] || TASK_TEMPLATES['Backend Engineer']
    const tmpl = pool[Math.floor(Math.random() * pool.length)]
    taskData = {
      ...tmpl,
      acceptance_criteria: (tmpl.acceptance_criteria || []).slice(0, diff.criteria),
      constraints: (tmpl.constraints || []).slice(0, diff.constraints),
      estimatedMinutes: timeAvail === '30min' ? 30 : timeAvail === '1hr' ? 60 : 120,
      difficulty: expLevel,
    }
  }

  const task = {
    id: randomUUID(),
    userId: payload.id,
    companyId: user.companyId,
    role,
    title: taskData.title,
    desc: taskData.desc,
    background: taskData.background || '',
    acceptance_criteria: taskData.acceptance_criteria || [],
    constraints: taskData.constraints || [],
    tags: taskData.tags || [],
    estimatedMinutes: taskData.estimatedMinutes || 60,
    difficulty: taskData.difficulty || expLevel,
    phase: 0,
    status: 'active' as const,
    phaseData: {},
    startedAt: new Date().toISOString(),
  }
  await Tasks.create(task)
  return NextResponse.json(task)
}
