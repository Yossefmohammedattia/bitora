import { NextResponse } from 'next/server'
import { Tasks, CompanyHealthDB } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { COMPANIES, aiCall, parseJSON } from '@/lib/data'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

// ─── Deep local analysis — no AI needed ───────────────────────
function deepLocalReview(code: string, task: any, isRevision: boolean, prevFixes: string[]): any {
  if (!code || code.trim().length < 80) {
    return {
      score: 5, accepted: false,
      summary: 'Rejected: implementation is empty or too brief. Write actual code — not a comment, not a placeholder, not pseudocode without real logic.',
      categories: [{ name: 'Completeness', type: 'issue', issues: ['Submission is too short to review. Minimum requirement is a real implementation with function signatures, business logic, and error handling.'] }],
      required_fixes: ['Submit a real implementation with actual code, not a stub'],
      optional_improvements: [],
      health_impact: { techDebt: 8, reliability: -5, securityRisk: 3 }
    }
  }

  // ── Pattern detection ──────────────────────────────────────
  // SQLi: only flag string concat INSIDE DB query/execute calls
  const hasSQLInjection =
    /(?:db|pool|client|connection|knex|sequelize|prisma)\.(query|execute|raw)\s*\(\s*["'`][^"'`]*\+/.test(code) ||
    /(?:db|pool|client|connection|knex|sequelize|prisma)\.(query|execute|raw)\s*\(\s*["'`][\s\S]{0,300}["'`]\s*\+/.test(code) ||
    /\.(query|execute|raw)\s*\(\s*`[^`]*(req\.|params\.|body\.|query\.|\$\{(?:req|params|body|query))[^`]*`/.test(code)
  const hasRawSQL       = /(?:db|pool|client|connection)\.(query|execute)\s*\(["'`]/.test(code)
  const hasParamSQL     = /\$\d+|parameterized|prepared|schema\.parse|zod\.|joi\.|yup\./.test(code)
  const hasAuth         = /req\.user\??\.id|verifyToken|authenticate\(|authorize\(|jwtMiddleware|if\s*\(!?\s*req\.user|bearerToken|checkToken/.test(code)
  const hasInputVal     = /schema\.parse|zod\.|joi\.|yup\.|z\.object|Joi\.object|validate\s*\(|sanitize/.test(code)
  const hasErrorHandling= /try\s*\{[\s\S]{10,}catch\s*\(/.test(code)
  const hasTransaction  = /BEGIN|COMMIT|ROLLBACK|\.transaction\(|beginTransaction/.test(code)
  const hasTimeout      = /Promise\.race|AbortController|setTimeout[^;]{0,60}reject/.test(code)
  const hasRateLimit    = /rateLimit|rate_limit|rateLimiter|throttle/.test(code)
  const hasLogging      = /logger\.(info|warn|error)|log\.(info|warn|error)|winston|pino\./.test(code)
  const hasHardcodedSecret = /(?:secret|password|apiKey|api_key)\s*[=:]\s*['"`][a-zA-Z0-9_\-\.]{8,}['"`]/.test(code)
  const hasDangerous    = /\beval\s*\(|\bexec\s*\(|innerHTML\s*=/.test(code)
  const hasMultipleWrites = (code.match(/await\s+\S+\.(query|save|update|insert|create|set)\s*\(/g) || []).length > 1
  const hasLength = code.length

  // ── Score calculation — strict but fair ──────────────────────
  let score = 22

  // Penalize critical issues
  if (hasSQLInjection)    score -= 35
  if (hasHardcodedSecret) score -= 18
  if (hasDangerous)       score -= 22

  // Reward good practices
  if (hasAuth)            score += 12
  if (hasInputVal)        score += 10
  if (hasParamSQL && !hasSQLInjection) score += 12
  if (hasErrorHandling)   score += 12
  if (hasTransaction)     score += 10
  if (hasTimeout)         score += 8
  if (hasRateLimit)       score += 6
  if (hasLogging)         score += 5
  if (hasLength > 400)    score += 4
  if (hasLength > 900)    score += 4
  if (hasLength > 1500)   score += 3

  score = Math.max(0, Math.min(88, score))

  // If revision — check if required fixes were done
  if (isRevision && prevFixes.length > 0) {
    const unfixed = prevFixes.filter(fix => {
      const words = fix.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(' ').filter(w => w.length > 4)
      return words.some(w => !code.toLowerCase().includes(w))
    })
    if (unfixed.length > 0) {
      score = Math.min(score, 55)
    }
  }

  const accepted = score >= 68

  // ── Build detailed categories ─────────────────────────────
  const categories: any[] = []

  // Security
  const secIssues: string[] = []
  if (hasSQLInjection) {
    secIssues.push(`CRITICAL SQL INJECTION: You are concatenating user input directly into a SQL string (e.g. "WHERE id='" + userId + "'"). An attacker can input ' OR '1'='1 to bypass your WHERE clause, or '; DROP TABLE payments; -- to destroy data. Fix: use parameterized queries — db.query('SELECT * FROM payments WHERE id=$1', [userId]) — the DB driver escapes values automatically.`)
  } else if (hasRawSQL && !hasParamSQL) {
    secIssues.push(`Possible SQL injection risk: raw SQL detected without clear parameterization. If any user-supplied value is interpolated into the query string, this is injectable. Fix: use $1/$2 placeholders with a values array for every user-controlled field.`)
  }
  if (!hasAuth) {
    secIssues.push(`No authentication check found — any unauthenticated caller can invoke this endpoint. Fix: add JWT middleware before this handler that verifies the token, extracts userId, and sets req.user. Reject with 401 if the token is missing or invalid.`)
  }
  if (!hasInputVal) {
    secIssues.push(`No input validation — user-supplied fields are used without checking type, format, or range. An attacker can send unexpected types (null, arrays, huge strings) to cause unexpected behavior or bypass business logic. Fix: validate every incoming field with Zod or Joi before processing.`)
  }
  if (hasHardcodedSecret) {
    secIssues.push(`Hardcoded secret or credential found in code — this will be committed to git and exposed. Fix: move all secrets to environment variables and load with process.env.`)
  }
  if (!hasRateLimit) {
    secIssues.push(`No rate limiting — a single client can call this endpoint thousands of times per minute. For payment endpoints this enables brute force and DoS. Fix: add Redis ZADD sliding-window rate limiting keyed on userId.`)
  }
  if (hasDangerous) {
    secIssues.push(`Dangerous function detected (eval/exec/innerHTML/document.write) — these execute arbitrary code or inject raw HTML. Remove entirely.`)
  }
  categories.push({ name: 'Security', type: secIssues.length > 0 ? 'issue' : 'good', issues: secIssues.length > 0 ? secIssues : ['No critical security vulnerabilities detected in static analysis.'] })

  // Data Integrity
  const diIssues: string[] = []
  if (!hasTransaction && hasMultipleWrites) {
    diIssues.push(`Multiple database writes found without a transaction. If the second write fails after the first succeeds, your database is left in an inconsistent state — for example, a payment record exists but the Kafka event was never produced, or the user was charged but the DB was not updated. Fix: wrap all related writes in BEGIN/COMMIT with ROLLBACK on any error.`)
  } else if (!hasTransaction) {
    diIssues.push(`No explicit transaction found. If this function does more than one write, they must be wrapped in a transaction. Fix: use BEGIN/COMMIT with a try/catch ROLLBACK.`)
  }
  categories.push({ name: 'Data Integrity', type: (!hasTransaction && hasMultipleWrites) ? 'issue' : hasTransaction ? 'good' : 'warning', issues: diIssues.length ? diIssues : [hasTransaction ? 'Transaction handling present.' : 'Single write operation — verify this is intentional.'] })

  // Error Handling
  const ehIssues: string[] = []
  if (!hasErrorHandling) {
    ehIssues.push(`No try/catch blocks found. Any thrown exception — DB connection drop, timeout, JSON parse error — will crash the Node.js process or leave the HTTP request hanging with no response. Fix: wrap every async block in try/catch, log the error with structured context (userId, requestId, error.message), and return a clean JSON error response to the client.`)
  }
  categories.push({ name: 'Error Handling', type: hasErrorHandling ? 'good' : 'issue', issues: ehIssues.length ? ehIssues : ['Error handling present. Verify that caught errors never expose stack traces, DB schemas, or internal field names to the client.'] })

  // Performance
  const perfIssues: string[] = []
  if (!hasTimeout) {
    perfIssues.push(`No timeout on external calls (DB, Kafka, payment processor). If the downstream service hangs, your request thread holds a DB connection indefinitely. Under load this exhausts the connection pool and cascades to all endpoints — one slow dependency takes down the whole service. Fix: wrap every external call with Promise.race() and a reject timer, or use AbortController.`)
  }
  perfIssues.push(`No evidence of query result limiting — if this endpoint can return multiple rows, add LIMIT and pagination. Returning 100K rows in a single response will cause memory spikes and timeouts.`)
  categories.push({ name: 'Performance', type: hasTimeout ? 'warning' : 'issue', issues: perfIssues })

  // Code Quality
  const cqIssues: string[] = []
  if (!hasLogging) {
    cqIssues.push(`No structured logging found. Without logs that include userId, requestId, and the operation performed, debugging production incidents is nearly impossible. Fix: add logger.info/warn/error calls at key decision points using a structured logger (Winston, Pino).`)
  }
  if (hasLength < 200) {
    cqIssues.push(`Implementation is very brief (${hasLength} chars). Production code for this task should include: input validation, auth check, idempotency handling, the core business logic, and error handling. This looks like a stub.`)
  }
  categories.push({ name: 'Code Quality', type: (hasLogging && hasLength >= 200) ? 'good' : 'warning', issues: cqIssues.length ? cqIssues : ['Code structure is adequate.'] })

  // Test Coverage
  categories.push({ name: 'Test Coverage', type: 'issue', issues: [`No test cases visible. Required test scenarios for this endpoint: (1) valid input → success path, (2) duplicate idempotency key → returns cached response, not a new write, (3) missing/invalid auth → 401, (4) invalid input format → 400 with specific error, (5) DB connection failure → 503 with retry hint, (6) concurrent requests with same key → only one write occurs (race condition test), (7) timeout from payment processor → handled gracefully.`] })

  // ── Required fixes ─────────────────────────────────────────
  const requiredFixes: string[] = []
  if (hasSQLInjection) requiredFixes.push('CRITICAL: Replace all string-concatenated SQL with parameterized queries using $1/$2 placeholders and a values array — this is a SQL injection vulnerability that must be fixed before any other review')
  if (!hasAuth)        requiredFixes.push('Add authentication middleware: verify JWT token, extract userId, attach to req.user — reject with 401 if token is missing or invalid')
  if (!hasInputVal)    requiredFixes.push('Add input validation: use Zod or Joi schema to validate every incoming field before processing — reject with 400 and a specific error message for invalid input')
  if (!hasErrorHandling) requiredFixes.push('Add try/catch to every async operation: catch errors, log with context (userId, requestId), return structured JSON error response without exposing internals')
  if (!hasTransaction && hasMultipleWrites) requiredFixes.push('Wrap all DB writes in a transaction (BEGIN/COMMIT) with ROLLBACK on any failure — multiple writes without a transaction leave the DB in inconsistent state on error')
  if (!hasTimeout)     requiredFixes.push('Add timeout to all external calls: wrap with Promise.race() or AbortController — hanging calls exhaust connection pools under load')
  if (hasHardcodedSecret) requiredFixes.push('Remove hardcoded secrets — move to environment variables (process.env.SECRET_KEY)')

  const summary = hasSQLInjection
    ? `Score ${score}/100 — REJECTED. Critical SQL injection vulnerability: user input is concatenated directly into SQL strings. This is exploitable to read all data, bypass auth, or destroy the database. Multiple other security and reliability issues also prevent this from merging.`
    : !accepted
      ? `Score ${score}/100 — changes required. ${requiredFixes.length} issue(s) must be fixed before this can be merged: ${requiredFixes.slice(0,2).map(f=>f.split(':')[0]).join(', ')}.`
      : `Score ${score}/100 — accepted with notes. The implementation covers the core requirements. Address the optional improvements before the next feature built on top of this.`

  return {
    score, accepted, summary, categories,
    required_fixes: requiredFixes,
    optional_improvements: [
      ...(!hasRateLimit ? ['Add rate limiting to prevent abuse'] : []),
      ...(!hasLogging   ? ['Add structured logging with correlation IDs'] : []),
      'Add OpenTelemetry instrumentation (request count, latency histogram)',
      'Add idempotency key expiry notification to the caller',
    ],
    health_impact: {
      techDebt:    hasSQLInjection ? 10 : !hasTransaction ? 5 : score < 60 ? 4 : score < 75 ? 1 : -1,
      reliability: !hasErrorHandling ? -5 : !hasTransaction ? -2 : score >= 75 ? 1 : 0,
      securityRisk: hasSQLInjection ? 12 : !hasAuth ? 8 : !hasInputVal ? 5 : !hasRateLimit ? 3 : -1,
    }
  }
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, revisionCode } = await req.json()
  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 3) return NextResponse.json({ error: 'Not in code review phase' }, { status: 400 })

  const health  = await CompanyHealthDB.get(task.companyId) || { securityRisk: 40, techDebt: 40, reliability: 70 }
  const code    = revisionCode || task.phaseData.implementation?.code || ''
  const isRevision  = !!revisionCode
  const prevReview  = task.phaseData.codeReview as any
  const prevFixes   = prevReview?.required_fixes || []
  const company = COMPANIES.find(c => c.id === task.companyId)

  // ── Try AI first, fall back to deep local analysis ──────────
  let review: any
  try {
    const prompt = `You are a senior engineer doing a code review at ${company?.name || 'a tech company'}. This code is going to production. Real users and real money are at stake.

Company: ${company?.name} (${company?.type}) | techDebt=${health.techDebt}/100 | securityRisk=${health.securityRisk}/100
Task: ${task.title}
Description: ${task.desc}

${isRevision ? `REVISION — previous score: ${prevReview?.score || '?'}/100\nRequired fixes not yet addressed MUST still block acceptance:\n${JSON.stringify(prevFixes)}\n` : ''}
Code:
\`\`\`
${code}
\`\`\`

Testing strategy submitted:
${task.phaseData.implementation?.tests || '(none provided)'}

MANDATORY RULES:
- Default score is 35. Earn points for specific, concrete good practices only.
- REJECT (accepted:false) if ANY: SQL string concatenation with user input, no auth check, no input validation, multi-write without transaction, no error handling on async, hardcoded secrets.
- Every issue must name the EXACT code pattern, the SPECIFIC attack vector or failure, and the EXACT fix.
- Score 0-40: dangerous; 41-60: critical gaps; 61-74: fixable; 75-85: solid; 86+: production-ready (rare).
- If revision: check each required_fix explicitly. Still missing = still blocked.

Return ONLY valid JSON:
{
  "score": <0-100>,
  "accepted": <true only if score>=68 AND no critical issues>,
  "summary": "<3-5 sentences, lead with biggest problem, be direct>",
  "categories": [
    {"name":"Security","type":"issue|warning|good","issues":["<exact code pattern + attack vector + exact fix>"]},
    {"name":"Data Integrity","type":"issue|warning|good","issues":["<specific failure scenario>"]},
    {"name":"Error Handling","type":"issue|warning|good","issues":["<specific missing handler>"]},
    {"name":"Performance","type":"issue|warning|good","issues":["<bottleneck with load impact>"]},
    {"name":"Code Quality","type":"issue|warning|good","issues":["<specific observation>"]},
    {"name":"Test Coverage","type":"issue|warning|good","issues":["<missing test scenarios>"]}
  ],
  "required_fixes": ["<must-fix before merge — start with verb: Add/Replace/Wrap/Remove>"],
  "optional_improvements": ["<nice to have>"],
  "health_impact": {"techDebt":<-5 to 10>,"reliability":<-6 to 3>,"securityRisk":<-4 to 12>}
}`

    const text = await aiCall(prompt)
    review = parseJSON(text)

    // Anti-leniency guards
    if (code.trim().length < 80) { review.accepted = false; review.score = Math.min(review.score, 15) }
    if (isRevision && prevFixes.length > 0) {
      const stillMissing = prevFixes.filter((fix: string) =>
        fix.toLowerCase().split(' ').filter((w: string) => w.length > 4)
           .some((kw: string) => !code.toLowerCase().includes(kw))
      )
      if (stillMissing.length > 0 && review.accepted) {
        review.accepted = false
        review.score = Math.min(review.score, 58)
        review.summary = `Revision rejected: ${stillMissing.length} required fix(es) from previous review are still missing. ` + review.summary
      }
    }
  } catch {
    // AI unavailable — use deep local analysis
    review = deepLocalReview(code, task, isRevision, prevFixes)
  }

  // Apply health impact
  if (review.health_impact) {
    const hi = review.health_impact
    await CompanyHealthDB.upsert(task.companyId, {
      techDebt:    Math.max(0, Math.min(100, (health.techDebt    || 40) + (hi.techDebt    || 0))),
      reliability: Math.max(0, Math.min(100, ((health as any).reliability || 70) + (hi.reliability || 0))),
      securityRisk:Math.max(0, Math.min(100, (health.securityRisk|| 40) + (hi.securityRisk|| 0))),
    })
  }

  const phaseData = { ...task.phaseData, codeReview: review }
  if (isRevision) phaseData.revision = { code: revisionCode }
  await Tasks.update(taskId, { phaseData, phase: review.accepted ? 4 : 3 })

  return NextResponse.json(review)
}
