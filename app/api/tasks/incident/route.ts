import { NextResponse } from 'next/server'
import { Tasks, CompanyHealthDB } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { COMPANIES, INCIDENT_POOL, aiCall, parseJSON } from '@/lib/data'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

export async function GET(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const taskId = url.searchParams.get('taskId')
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 4) return NextResponse.json({ error: 'Not in incident phase' }, { status: 400 })

  // Return existing incident if already generated
  if (task.phaseData.incident) return NextResponse.json(task.phaseData.incident)

  // Generate incident with AI
  const company = COMPANIES.find(c => c.id === task.companyId)
  const health = await CompanyHealthDB.get(task.companyId) || { securityRisk: 40, techDebt: 40, reliability: 70 }
  const codeReview = task.phaseData.codeReview as any
  const requiredFixes = codeReview?.required_fixes || []

  const prompt = `You are a production incident simulator generating a realistic incident causally connected to an engineer's recent work.

Company: ${company?.name} (${company?.type})
Engineer role: ${task.role}
Task just completed: ${task.title} — ${task.desc}
Code review issues that were flagged: ${JSON.stringify(requiredFixes)}
Company health: reliability=${health.reliability}/100, securityRisk=${health.securityRisk}/100, techDebt=${health.techDebt}/100

Rules for incident generation:
${health.securityRisk > 65 ? '- MUST be a security incident (auth breach, data leak, permission bypass) — security risk is critical.' : ''}
${(health.reliability || 70) < 55 ? '- MUST be SEV-1 — reliability is very low, a full outage is plausible.' : ''}
${health.techDebt > 70 ? '- MUST be caused by technical debt accumulation, not a new bug.' : ''}
${requiredFixes.some((f: string) => /auth|security|token|permission/i.test(f)) ? '- MUST involve auth or permission failure — engineer ignored auth issues in code review.' : ''}
${requiredFixes.some((f: string) => /timeout|connection|pool/i.test(f)) ? '- MUST involve connection pool exhaustion or timeout cascade.' : ''}

Generate a realistic production incident with enough detail to debug.

Return ONLY valid JSON:
{
  "title": "<incident title>",
  "severity": "SEV-1|SEV-2|SEV-3",
  "affectedUsers": "<number and description>",
  "revenueImpact": "<$ estimate per hour>",
  "businessImpact": "<2 sentences on business consequences>",
  "rootCauseHint": "<subtle clue about root cause — don't reveal directly, make them investigate>",
  "symptoms": ["<observable symptom>", "<symptom>", "<symptom>", "<symptom>"],
  "logs": ["<realistic log line with level and detail>", "<log line>", "<log line>", "<log line>"],
  "expectedRCA": "<the actual root cause — only used for evaluation, not shown to engineer>"
}`

  let incident: any
  try {
    const text = await aiCall(prompt)
    incident = parseJSON(text)
  } catch (e) {
    // Fallback: pick from pool, bias by health
    let pool = [...INCIDENT_POOL]
    if (health.securityRisk > 65) pool = pool.filter(i => i.title.includes('Auth') || i.title.includes('session')) || pool
    if ((health.reliability || 70) < 55) pool = pool.filter(i => i.severity === 'SEV-1') || pool
    incident = { ...pool[Math.floor(Math.random() * pool.length)] }
  }

  const phaseData = { ...task.phaseData, incident }
  await Tasks.update(taskId, { phaseData })
  return NextResponse.json(incident)
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, rca, fix, rollback, post } = await req.json()
  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 4) return NextResponse.json({ error: 'Not in incident phase' }, { status: 400 })

  // Strict validation — real minimums
  const issues: string[] = []
  if ((rca || '').trim().length < 100) issues.push('Root cause analysis is too shallow — trace the full causal chain back to the underlying cause, not just the symptom. "The DB went down" is a symptom. Why did it go down? What triggered that?')
  if ((fix || '').trim().length < 80) issues.push('Fix plan is not detailed enough — provide numbered steps with exact commands, config changes, or code changes. Include how you verify each step worked.')
  if ((rollback || '').trim().length < 60) issues.push('Rollback plan is too brief — specify exactly what to undo in what order and how you verify the system returned to a safe state.')
  if ((post || '').trim().length < 100) issues.push('Postmortem lacks depth — identify what PROCESS failed (not just the technical component), and each action item must have a specific owner and a deadline.')
  if (issues.length > 0) return NextResponse.json({ error: 'validation', issues }, { status: 400 })

  const incident = task.phaseData.incident as any

  const prompt = `You are a principal SRE who has managed hundreds of production incidents. You are evaluating an incident response submitted by an engineer. You score on quality, not effort. You know the difference between someone who found the real root cause and someone who stopped at the first symptom.

Incident: ${incident?.title} (${incident?.severity})
Affected: ${incident?.affectedUsers} | Revenue impact: ${incident?.revenueImpact}
ACTUAL root cause (use to assess accuracy): ${incident?.expectedRCA || 'Assess quality of reasoning independently'}

Engineer submitted:

ROOT CAUSE ANALYSIS:
${rca}

FIX PLAN:
${fix}

ROLLBACK PLAN:
${rollback}

POSTMORTEM:
${post}

SCORING RUBRIC:
RCA: 80-100 = correct root cause with full causal chain | 50-79 = proximate cause only, missed underlying reason | 20-49 = described symptoms as cause | 0-19 = wrong or too vague
Fix: 80-100 = numbered steps + exact commands + verification step | 50-79 = has steps but missing verification | 20-49 = goals without actionable steps | 0-19 = "fix the bug"
Rollback: 80-100 = specific undo steps + verification + safe state defined | 50-79 = has idea but vague | 20-49 = too vague for pressure situation
Postmortem: 80-100 = process failure identified + action items with owner+deadline+deliverable + blameless | 50-79 = action items lack owners/deadlines | 20-49 = timeline without process analysis

Return ONLY valid JSON:
{
  "rcaScore": <0-100>,
  "fixScore": <0-100>,
  "rollbackScore": <0-100>,
  "postmortemScore": <0-100>,
  "overallScore": <rca*0.35 + fix*0.30 + rollback*0.15 + post*0.20>,
  "rcaCorrect": <true only if actual underlying cause was identified, not just symptom>,
  "feedback": {
    "rca": "<what they got right vs wrong, what the actual root cause was, what part of the causal chain they missed>",
    "fix": "<what step is missing, what is not executable under pressure, what verification is absent>",
    "rollback": "<what is vague, what a real rollback for this incident requires>",
    "postmortem": "<which process failure they missed, which action items are too vague, example of a proper action item for this incident>"
  },
  "missed": ["<specific insight, component, or process gap they completely missed>"],
  "strengths": ["<genuine specific strength — omit if none>"]
}`

  let incidentEval: any
  try {
    const text = await aiCall(prompt)
    incidentEval = parseJSON(text)
    // Guard against AI being too generous on thin responses
    const totalLen = rca.length + fix.length + rollback.length + post.length
    if (totalLen < 400 && incidentEval.overallScore > 65) {
      incidentEval.overallScore = Math.min(incidentEval.overallScore, 55)
      incidentEval.rcaScore = Math.min(incidentEval.rcaScore, 55)
    }
  } catch (e) {
    // Smart fallback scoring based on content quality
    const hasRootCause = /(because|caused by|triggered by|root cause|underlying|chain|sequence|led to)/i.test(rca)
    const hasSpecificSteps = /(step \d|1\.|2\.|3\.|kubectl|pg_cancel|SELECT pg_|redis-cli|config|flag|restart|scale)/i.test(fix)
    const hasVerification = /(verify|confirm|monitor|check|pg_stat|error rate|dashboard|alert|metric)/i.test(fix + rollback)
    const hasActionItems = /(by \[|owner:|deadline:|action item|within \d|this week|this sprint|@[a-z])/i.test(post)
    const hasProcessGap = /(process|policy|review|test|alert|monitor|runbook|checklist|deployment)/i.test(post)

    let rcaScore = 30; let fixScore = 30; let rollbackScore = 30; let postScore = 30
    if (hasRootCause) rcaScore += 25; if (rca.length > 200) rcaScore += 15; if (rca.length > 350) rcaScore += 10
    if (hasSpecificSteps) fixScore += 25; if (fix.length > 150) fixScore += 15; if (hasVerification) fixScore += 10
    if (hasVerification) rollbackScore += 25; if (rollback.length > 120) rollbackScore += 15
    if (hasActionItems) postScore += 20; if (hasProcessGap) postScore += 20; if (post.length > 200) postScore += 10

    rcaScore = Math.min(85, rcaScore); fixScore = Math.min(82, fixScore)
    rollbackScore = Math.min(80, rollbackScore); postScore = Math.min(82, postScore)
    const overallScore = Math.round(rcaScore * 0.35 + fixScore * 0.30 + rollbackScore * 0.15 + postScore * 0.20)

    incidentEval = {
      rcaScore, fixScore, rollbackScore, postmortemScore: postScore, overallScore,
      rcaCorrect: rcaScore >= 60,
      feedback: {
        rca: hasRootCause
          ? 'RCA shows causal reasoning. Ensure you traced back to the underlying technical root cause, not just the proximate failure.'
          : 'RCA describes symptoms rather than root cause. "The DB went down" is a symptom — why did it go down? What triggered that? Trace the full causal chain.',
        fix: hasSpecificSteps
          ? 'Fix plan has actionable steps. Add verification: how do you confirm each step worked before moving to the next?'
          : 'Fix plan is too high-level. Provide numbered steps with exact commands (kubectl, pg_cancel_backend, redis-cli) and how to verify each step succeeded.',
        rollback: hasVerification
          ? 'Rollback plan includes verification. Ensure you define what "safe state" looks like and how to confirm you reached it.'
          : 'Rollback plan needs a verification step — how do you confirm the rollback succeeded and the system is stable?',
        postmortem: hasActionItems && hasProcessGap
          ? 'Postmortem identifies process gaps with action items. Each item needs an owner name and a specific deadline.'
          : hasProcessGap
            ? 'Process failure is identified. Action items need a specific owner and deadline — "improve monitoring" with no owner is not an action item.'
            : 'Postmortem describes what happened but does not identify what process failed. What allowed this code/config to reach production?',
      },
      missed: [
        !hasRootCause ? 'Full causal chain leading to the root cause' : null,
        !hasActionItems ? 'Specific action items with owners and deadlines' : null,
        'Monitoring gap that allowed this to go undetected before users were affected',
      ].filter(Boolean) as string[],
      strengths: [
        hasRootCause ? 'Causal reasoning present in RCA' : null,
        hasSpecificSteps ? 'Fix plan has actionable steps' : null,
        hasProcessGap ? 'Process failure identified in postmortem' : null,
      ].filter(Boolean) as string[],
    }
  }

  const phaseData = {
    ...task.phaseData,
    incidentResponse: { rca, fix, rollback, post },
    incidentEval,
  }
  await Tasks.update(taskId, { phaseData, phase: 5 })
  return NextResponse.json(incidentEval)
}
