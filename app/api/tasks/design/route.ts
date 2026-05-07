import { NextResponse } from 'next/server'
import { Tasks } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { aiCall, parseJSON } from '@/lib/data'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

// ── Deep local design analysis ─────────────────────────────────
function analyzeDesign(arch: string, data: string, flow: string, tradeoffs: string, taskTitle: string) {
  const all = arch + ' ' + data + ' ' + flow + ' ' + tradeoffs
  const totalLen = arch.length + data.length + flow.length + tradeoffs.length

  // Detect quality signals
  const hasComponents       = /(service|component|gateway|worker|queue|cache|cron|consumer|producer|api layer|microservice)/i.test(arch)
  const hasCommunication    = /(kafka|redis|grpc|rest|http|async|sync|event|message|poll|webhook|rpc)/i.test(arch)
  const hasFailureInArch    = /(fallback|failover|circuit|retry|timeout|down|unavailable|replac)/i.test(arch)
  const hasSchemaFields     = /(varchar|uuid|int|boolean|text|timestamptz|jsonb|enum|NOT NULL|DEFAULT|REFERENCES|smallint|bigint)/i.test(data)
  const hasIndexes          = /(index|INDEX|UNIQUE|B-tree|partial|compound|composite)/i.test(data)
  const hasConstraints      = /(NOT NULL|UNIQUE|CHECK|REFERENCES|FK|foreign key|ON DELETE|ON UPDATE)/i.test(data)
  const hasFailureInFlow    = /(fail|error|401|400|429|503|ROLLBACK|rollback|retry|timeout|catch|down|reject)/i.test(flow)
  const hasStepNumbers      = /^\s*\d+[\.\)]/m.test(flow) || /step \d/i.test(flow)
  const hasConcreteNumbers  = /\d+(ms|s\b| sec| min| req| req\/|K\/|\/s\b|%|KB|MB|GB|k req)/i.test(all)
  const hasAlternatives     = /(rejected|alternative|instead of|vs\.|versus|over |chose .* because|rejected .* because)/i.test(tradeoffs)
  const hasDownsides        = /(downside|risk|tradeoff|trade-off|cost|but |however|mitigated|accepted)/i.test(tradeoffs)
  const hasSpecificReason   = /\d+(ms|s\b|req|K|%)|latency|throughput|scale|cost|operational|complexity/i.test(tradeoffs)

  // Score
  let score = 15
  if (hasComponents)      score += 8
  if (hasCommunication)   score += 6
  if (hasFailureInArch)   score += 8
  if (hasSchemaFields)    score += 10
  if (hasIndexes)         score += 7
  if (hasConstraints)     score += 5
  if (hasFailureInFlow)   score += 10
  if (hasStepNumbers)     score += 6
  if (hasConcreteNumbers) score += 8
  if (hasAlternatives)    score += 7
  if (hasDownsides)       score += 5
  if (hasSpecificReason)  score += 5
  if (totalLen > 800)     score += 5
  if (totalLen > 1500)    score += 3
  score = Math.min(85, score)

  const accepted = score >= 68

  // Build specific feedback
  const issues: any[] = []
  const missing: string[] = []

  if (!hasComponents || !hasCommunication) {
    issues.push({ severity: 'critical', area: 'Architecture', issue: 'Components and their communication patterns are not clearly named. A reviewer cannot tell what services exist, which are synchronous vs asynchronous, or how they connect.', fix: 'Name each component explicitly (e.g., "API Gateway," "Consumer Worker," "Reconciliation CronJob") and state how they communicate (HTTP/REST, Kafka messages, Redis pub/sub, gRPC).' })
  }
  if (!hasFailureInArch && !hasFailureInFlow) {
    issues.push({ severity: 'critical', area: 'Flow', issue: 'No failure paths described anywhere in the design. Every step that touches an external system (DB, cache, queue, external API) can fail — and the design must say what happens when it does.', fix: 'For each external call in your flow, add: what error is returned to the caller, whether the operation is retried, and how partial state is cleaned up on failure.' })
    missing.push('Failure mode analysis for every external dependency')
  }
  if (!hasSchemaFields) {
    issues.push({ severity: 'major', area: 'Data', issue: 'Schema has no field types. Without types, constraints, and index rationale, another engineer cannot implement the database layer from this doc alone.', fix: 'Add explicit types for every field (uuid, varchar(N), timestamptz, jsonb, enum), NOT NULL/UNIQUE/FK constraints, and for each index explain the exact query it supports.' })
  } else if (!hasIndexes) {
    issues.push({ severity: 'major', area: 'Data', issue: 'Schema has field types but no indexes. Without index definitions, every query will be a full table scan — at 1M+ rows this will cause timeouts.', fix: 'Add an index definition for every column used in WHERE, JOIN, or ORDER BY clauses. Explain why each index exists and which query it serves.' })
  }
  if (!hasAlternatives || !hasDownsides) {
    issues.push({ severity: 'major', area: 'Trade-offs', issue: !hasAlternatives ? 'Trade-offs section does not name alternatives that were considered and rejected. Saying "Kafka is reliable" is not a trade-off — it is an assertion.' : 'Trade-offs name alternatives but do not acknowledge the downsides of the chosen approach. Every design decision has costs.', fix: 'For each key decision write: (1) what alternatives you considered, (2) why you rejected them specifically for this task, (3) what the downside or risk of your chosen approach is and how you mitigate it.' })
  }
  if (!hasConcreteNumbers) {
    missing.push('Concrete numbers — latency targets, throughput estimates, limits (e.g., "100 req/min", "2ms p99", "10K req/sec")')
  }
  missing.push('Observability strategy — what metrics, logs, and alerts will tell you this system is healthy in production?')

  const strengths = [
    hasComponents && hasCommunication ? 'Components and communication patterns are identified' : null,
    hasSchemaFields && hasIndexes && hasConstraints ? 'Schema is well-specified with types, constraints, and index rationale' : null,
    hasFailureInFlow ? 'Failure paths are addressed in the system flow' : null,
    hasAlternatives && hasDownsides && hasSpecificReason ? 'Trade-offs include specific reasoning and acknowledge downsides' : null,
    hasConcreteNumbers ? 'Concrete performance numbers are included' : null,
  ].filter(Boolean) as string[]

  const summary = accepted
    ? `Score ${score}/100 — design accepted. The core approach is technically sound and failure modes are addressed. ${missing.length > 0 ? 'Address the notes below before starting implementation to avoid surprises.' : ''}`
    : `Score ${score}/100 — design rejected. ${issues[0] ? issues[0].issue.split('.')[0] + '.' : ''} Fix the ${issues.length} issue(s) below and resubmit.`

  return { accepted, score, summary, strengths, issues, missing }
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, arch, data, flow, tradeoffs } = await req.json()
  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 1) return NextResponse.json({ error: 'Not in design phase' }, { status: 400 })

  // Hard minimum — catch obvious non-attempts before calling AI
  const issues: string[] = []
  if ((arch       || '').length < 120) issues.push('Architecture overview is too shallow — name every component, how they communicate (sync/async, which protocol), and why you chose this structure. One paragraph is not enough.')
  if ((data       || '').length < 100) issues.push('Data structure is incomplete — provide full schema with explicit field types, constraints (NOT NULL, UNIQUE, FK), indexes with justification, and storage choice rationale.')
  if ((flow       || '').length < 120) issues.push('System flow is too vague — walk through each step exactly, including failure behavior at each external call. Saying "then it processes" is not a system flow.')
  if ((tradeoffs  || '').length < 80)  issues.push('Trade-offs section lacks depth — name specific alternatives you considered and explicitly rejected, explain why, and acknowledge the downsides of your chosen approach.')
  if (issues.length > 0) return NextResponse.json({ accepted: false, score: 0, precheck: true, issues })

  // Try AI
  const prompt = `You are a staff engineer doing a design review at a real company. Your job is to prevent bad designs from reaching production.

Task: ${task.title}
Description: ${task.desc}

=== ARCHITECTURE ===\n${arch}
=== DATA STRUCTURE ===\n${data}
=== SYSTEM FLOW ===\n${flow}
=== TRADE-OFFS ===\n${tradeoffs}

RULES:
1. Default score is 35. Earn points for specific, verifiable depth.
2. REJECT if: no failure paths in flow, schema has no field types, flow has unexplained gaps, trade-offs are assertions without reasoning.
3. Issues must name the exact problem and its production consequence.
4. Score: 0-40 inadequate; 41-60 major gaps; 61-74 acceptable; 75-85 solid; 86+ exceptional (rare).

Return ONLY valid JSON:
{
  "accepted": false,
  "score": <0-100>,
  "summary": "<3-4 sentences, lead with biggest problem>",
  "strengths": ["<specific genuine strength>"],
  "issues": [{"severity":"critical|major|minor","area":"<section>","issue":"<exact problem + consequence>","fix":"<specific fix>"}],
  "missing": ["<entire topic not covered>"]
}`

  let review: any
  try {
    const text = await aiCall(prompt)
    review = parseJSON(text)
    // Guard: if AI is lenient on shallow content, override
    const totalLen = (arch + data + flow + tradeoffs).length
    if (totalLen < 700 && review.accepted) {
      review.accepted = false
      review.score = Math.min(review.score, 55)
      review.summary = 'Design rejected — insufficient depth despite passing character length. ' + (review.summary || '')
    }
  } catch {
    // Full local analysis — no AI needed
    review = analyzeDesign(arch, data, flow, tradeoffs, task.title)
  }

  const updatedPhaseData = { ...task.phaseData, design: { arch, data, flow, tradeoffs, review } }
  await Tasks.update(taskId, { phaseData: updatedPhaseData, phase: review.accepted ? 2 : 1 })
  return NextResponse.json(review)
}
