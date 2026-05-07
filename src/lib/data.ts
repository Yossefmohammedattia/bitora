export const COMPANIES = [
  { id: 'c1', name: 'Nexara Finance', type: 'Fintech', scale: 'Series B · 180 engineers', stack: ['Node.js', 'PostgreSQL', 'React', 'Redis', 'Kafka'], desc: 'Real-time payment infrastructure processing $2B+ daily transactions across 40 markets. We operate at the intersection of financial regulation and engineering performance.', roles: ['Backend Engineer', 'Security Engineer', 'DevOps Engineer'], incidents: ['Payment gateway timeout cascade during Black Friday peak', 'Auth token exposure in mobile SDK v2.3.1', 'Database replication lag causing stale reads at 3x traffic'] },
  { id: 'c2', name: 'LoopAI', type: 'AI/ML Platform', scale: 'Seed · 25 engineers', stack: ['Python', 'FastAPI', 'PyTorch', 'Kubernetes', 'MongoDB'], desc: 'Developer platform for deploying and monitoring ML models in production at scale. Customers run 50M+ inferences daily on our managed infrastructure.', roles: ['Backend Engineer', 'Data Engineer', 'Frontend Engineer'], incidents: ['Model serving p99 latency spiked to 12s under A/B test load', 'Training pipeline OOM crash corrupted 3 experiment runs'] },
  { id: 'c3', name: 'Vanta Health', type: 'HealthTech', scale: 'Series A · 60 engineers', stack: ['Go', 'React Native', 'PostgreSQL', 'AWS', 'Terraform'], desc: 'Telehealth platform connecting 500K patients with licensed providers. HIPAA-compliant infrastructure with zero tolerance for data leaks.', roles: ['Mobile Engineer', 'Backend Engineer', 'DevOps Engineer'], incidents: ['Video call drops at 200+ concurrent sessions', 'HIPAA audit finding on CloudWatch log retention', 'Push notification failure for 40% of Android users'] },
  { id: 'c4', name: 'ShipForge', type: 'Logistics SaaS', scale: 'Series C · 320 engineers', stack: ['Java', 'Spring Boot', 'React', 'MySQL', 'Elasticsearch'], desc: 'Fleet management and route optimization SaaS used by 8,000+ logistics companies. 4M shipments/day with real-time tracking.', roles: ['Backend Engineer', 'Frontend Engineer', 'Data Engineer'], incidents: ['Route calculation off by 12% for refrigerated cargo', 'SQL injection in legacy reporting module', 'Elasticsearch index corruption after rolling upgrade'] },
  { id: 'c5', name: 'Gravix Cloud', type: 'Developer Infrastructure', scale: 'Series B · 95 engineers', stack: ['Rust', 'Go', 'Kubernetes', 'Terraform', 'Prometheus'], desc: 'Managed cloud infrastructure with built-in observability. 99.99% uptime SLA for 2,000+ engineering teams.', roles: ['DevOps Engineer', 'Backend Engineer', 'Security Engineer'], incidents: ['Region failover took 12min instead of 90s', 'TLS cert expiry caused 4hr partial outage'] },
  { id: 'c6', name: 'Orbis Commerce', type: 'eCommerce Platform', scale: 'Series A · 40 engineers', stack: ['Next.js', 'Python', 'Redis', 'PostgreSQL', 'Stripe'], desc: 'Headless commerce platform powering 30K+ storefronts. 80K req/sec peak traffic with global CDN and edge caching.', roles: ['Frontend Engineer', 'Backend Engineer', 'Security Engineer'], incidents: ['Checkout broken on iOS Safari after Stripe SDK update', 'Rate limiter bypass exposing unlimited discount stacking'] },
]

export const LEVELS = ['Junior', 'Mid', 'Senior', 'Staff', 'Principal']
export const PROMO_THRESHOLDS = [0, 100, 250, 500, 900]
export const PHASES = ['PRD', 'Design', 'Implementation', 'Code Review', 'Incident', 'Evaluation']

export const TASK_TEMPLATES: Record<string, any[]> = {
  'Backend Engineer': [
    { title: 'Build idempotent payment retry queue', desc: 'Payment processor times out on 2–4% of requests, causing duplicate charges on naive client retries. Implement idempotent retry queue using Kafka + Redis with exponential backoff, dead-letter queue, and reconciliation job.', background: 'Finance team reported 340 duplicate charge complaints last month.', acceptance_criteria: ['Zero duplicate charges under concurrent retry load', 'DLQ alerts on > 3 failed retries', 'Idempotency key TTL = 7 days'], constraints: ['No downtime during rollout', 'Must work with existing Kafka cluster'], tags: ['queues', 'reliability', 'payments'] },
    { title: 'Diagnose and fix N+1 query regression', desc: 'GET /orders generates 80–120 SQL queries per request after v3.2 ORM migration. Fix all N+1 patterns with eager loading or DataLoader batching. Add query-count regression test.', background: 'P99 latency on orders endpoint jumped from 40ms to 1.8s post-migration.', acceptance_criteria: ['Max 5 DB queries per request', 'Query count assertion in CI', 'No behavior changes'], constraints: ['ORM must stay (no raw SQL rewrites)', 'Cannot change API contract'], tags: ['performance', 'database', 'orm'] },
    { title: 'JWT refresh token rotation with device revocation', desc: 'Implement single-use refresh tokens in Redis (SHA-256 hashed). Rotate on every use. Full device session revocation on logout. Detect token reuse attacks.', background: 'Security audit found refresh tokens are never invalidated, even after password change.', acceptance_criteria: ['Old token rejected after rotation', 'All sessions revocable from profile', 'Reuse attack triggers revocation of all user sessions'], constraints: ['No breaking change to existing mobile clients', 'Redis-first, DB fallback'], tags: ['auth', 'security', 'redis'] },
    { title: 'Distributed rate limiter for public API', desc: 'Public API endpoints have no rate limiting. One client caused 40min degradation. Implement sliding-window rate limiting in Redis. Limits: 100 req/min per API key, 10 req/sec burst. Must work across all API instances.', background: 'Incident: single bot account saturated the API, taking down the service for all users.', acceptance_criteria: ['Rate limit enforced across all pods', 'Returns 429 with Retry-After header', 'Redis failure falls back gracefully (fail-open with logging)'], constraints: ['Max 1ms overhead per request', 'No third-party rate-limit service'], tags: ['security', 'performance', 'redis'] },
  ],
  'Frontend Engineer': [
    { title: 'Fix feed virtual list memory leak', desc: 'Activity feed accumulates 8,000+ DOM nodes after 30 minutes, consuming 2GB+ RAM and crashing low-end devices. Implement windowed virtual list rendering only visible items + 20px overscan.', background: 'User reports of browser tab crashes spike every evening during peak usage.', acceptance_criteria: ['DOM nodes stay under 200 regardless of feed length', 'Scroll position preserved on re-render', 'Correct handling of dynamic row heights'], constraints: ['No external virtual list library', 'Must work in Safari 15+'], tags: ['performance', 'memory', 'react'] },
    { title: 'Optimistic cart UI with conflict resolution', desc: 'Cart mutations feel slow — 500ms before visual feedback. Implement optimistic updates: update UI immediately, roll back with diff on server error, handle mid-checkout quantity rejection.', background: 'A/B test showed 12% cart abandonment increase correlated with perceived slowness.', acceptance_criteria: ['Immediate visual feedback on all cart actions', 'Correct rollback on 4xx/5xx', 'No double-update on rapid clicks'], constraints: ['Must handle concurrent updates from two browser tabs'], tags: ['UX', 'state-management', 'react'] },
    { title: 'WCAG 2.1 AA accessibility remediation', desc: 'Checkout flow has 23 axe-core violations (4 Critical: keyboard trap in address modal, missing form labels, contrast failures, incorrect ARIA roles). Fix all Critical and Serious violations.', background: 'Legal received accessibility complaint. 30-day fix deadline.', acceptance_criteria: ['Zero Critical axe-core violations', 'Zero Serious axe-core violations', 'All interactive elements keyboard-navigable'], constraints: ['No visual design changes without designer sign-off'], tags: ['a11y', 'quality', 'forms'] },
  ],
  'DevOps Engineer': [
    { title: 'Zero-downtime deployment with automated rollback', desc: 'Current deploys cause 30s 503 spikes. Design blue-green or canary on Kubernetes. Automated rollback if error rate > 1% or p99 > 500ms within 5 minutes of rollout.', background: 'SLA breach last sprint — 3 deploys caused measurable user-facing errors.', acceptance_criteria: ['Zero user-visible errors during deploy', 'Rollback completes in < 2 minutes', 'Canary traffic starts at 5%'], constraints: ['Must work with existing Argo CD setup'], tags: ['deployment', 'k8s', 'reliability'] },
    { title: 'Backup verification automation', desc: 'Backups run nightly but never tested. Build weekly automated restore test: fresh DB, restore latest backup, schema validation, row count assertion, Slack alert on failure.', background: 'Engineer discovered PostgreSQL dump was silently corrupted for 6 weeks.', acceptance_criteria: ['Weekly restore test runs in CI', 'Failure triggers PagerDuty alert', 'Test report archived in S3'], constraints: ['Must not affect production DB', 'Max 4-hour test window'], tags: ['reliability', 'postgres', 'disaster-recovery'] },
  ],
  'Security Engineer': [
    { title: 'Automated secrets rotation with zero downtime', desc: 'DB passwords and API keys rotate manually once a year. Integrate HashiCorp Vault dynamic credentials. Services pick up rotated credentials without restart.', background: 'Git leak exposed 3 long-lived credentials. Rotation took 2 days manually.', acceptance_criteria: ['Zero downtime during credential rotation', 'Old credentials invalidated within 1 hour', 'Rotation logs in audit trail'], constraints: ['Must not require service restarts', 'Vault already deployed in staging'], tags: ['secrets', 'vault', 'compliance'] },
    { title: 'CI dependency vulnerability gating', desc: 'Production has 57 High and 12 Critical CVEs. Integrate Grype into CI. Block merge on Critical CVEs. Triage and patch all 12 Criticals.', background: 'Security audit flagged supply-chain risk as top priority.', acceptance_criteria: ['CI fails on new Critical CVEs', 'All 12 existing Criticals patched or risk-accepted with justification', 'Scan results posted as PR comment'], constraints: ['Must not block hotfix deploys'], tags: ['supply-chain', 'security', 'ci-cd'] },
  ],
  'Data Engineer': [
    { title: 'Fix late data in analytics pipeline', desc: 'Reports show data 4–6 hours stale. Spark streaming job has no watermarking — late mobile events (delayed 2–3h) are silently dropped. Add 2h watermark tolerance + late-data metrics.', background: 'Finance reported revenue numbers off by 8% in daily report vs source systems.', acceptance_criteria: ['Late events within 2h window are included', 'Late event drop rate metric exposed', 'Reports lag < 15 minutes'], constraints: ['Must not reprocess historical data', 'Kafka retention is 24h'], tags: ['spark', 'streaming', 'data-quality'] },
    { title: 'Schema evolution without breaking consumers', desc: 'Three services broke when a non-nullable column was added. Design Avro schema evolution strategy with registry. Implement backward + forward compatibility. Migrate 3 affected consumers.', background: 'Uncoordinated schema change caused 2hr partial outage for 3 teams.', acceptance_criteria: ['Old consumers read new schema without error', 'New consumers read old schema', 'Registry enforces compatibility on publish'], constraints: ['Must support rollback of schema changes'], tags: ['schema', 'avro', 'data-quality'] },
  ],
  'Mobile Engineer': [
    { title: 'Offline-first sync with conflict resolution', desc: 'App crashes on airplane mode and loses user data. Implement offline-first: writes to local SQLite, sync when connected, last-write-wins conflict resolution, two-device conflict handling.', background: 'Users in areas with poor connectivity (40% of user base) reported data loss.', acceptance_criteria: ['App fully functional with no internet', 'Sync completes within 10s of reconnect', 'Conflicts resolved without data loss'], constraints: ['Must handle offline duration > 72 hours'], tags: ['offline', 'sqlite', 'sync'] },
    { title: 'App launch time: 4.2s → under 1.5s', desc: '4.2s launch on Pixel 4a. Profiling: 1.8s in 3 SDKs (lazy-loadable), 900ms blocking MainThread SharedPreferences reads, 600ms layout inflation. Fix top bottlenecks without behavioral changes.', background: 'App store rating dropped to 2.8 — top complaint is slow launch.', acceptance_criteria: ['Launch < 1.5s on Pixel 4a (P50)', 'MainThread blocking < 50ms at startup', 'No behavioral regression'], constraints: ['Cannot remove any SDK (legal requirement)'], tags: ['performance', 'android', 'profiling'] },
  ],
}

export const INCIDENT_POOL = [
  { title: 'Database connection pool fully exhausted', severity: 'SEV-1', affectedUsers: '~18,000 active users', revenueImpact: '$240K/hr', businessImpact: 'Payment processing halted. Customer support queue at 400% normal volume. SLA breach after 15 minutes.', symptoms: ['All API endpoints timing out after 30s', 'DB CPU at 6% — connections used, not CPU', 'Active connections: 50/50, Pending queue: 847 requests', 'Error rate jumped from 0.1% to 98% in 4 minutes'], logs: ['[ERROR] HikariPool-1 - Connection not available, request timed out after 30000ms', '[ERROR] Unable to acquire JDBC Connection; Timeout waiting for connection from pool', '[WARN] Active: 50, Idle: 0, Wait: 847', '[ERROR] Transaction rolled back: could not execute query — connection closed'], expectedRCA: 'A new background job runs full-table scans every 5 minutes without a query timeout, holding connections for up to 4 minutes each and exhausting the pool.' },
  { title: 'Auth service returning 401 for all valid sessions', severity: 'SEV-1', affectedUsers: '~52,000 authenticated users', revenueImpact: '$890K/hr', businessImpact: 'All logged-in users logged out and cannot re-authenticate. Mobile apps showing infinite login loop.', symptoms: ['Login success rate: 99.8% → 1.2%', 'JWT validation failures spiking in auth service', 'Redis cache miss rate at 100% (normally 94% hit)', 'Auth service CPU normal — not overloaded'], logs: ['[ERROR] JWT signature verification failed: algorithm mismatch HS256 vs RS256', '[ERROR] Redis connection refused: 10.0.1.45:6379 — connection reset by peer', '[WARN] Cache miss for session:usr_* — falling back to database', '[ERROR] Database auth rate limit exceeded: 10000 req/s threshold hit'], expectedRCA: 'A misconfigured deploy changed JWT signing algorithm from HS256 to RS256 without rotating the verification keys, causing all existing tokens to fail validation. Simultaneously, Redis failover left the auth cache unavailable.' },
  { title: 'Memory leak causing cascading OOM pod restarts', severity: 'SEV-2', affectedUsers: '~5,800 users on affected endpoints', revenueImpact: '$32K/hr', businessImpact: 'Order history and reporting endpoints intermittently unavailable. 3 pods restarting every 45 minutes.', symptoms: ["Heap growing at 200MB/hour — never GC'd", 'GC pause time: 200ms → 2.4s over 3 hours', 'Pod restarts: 8 in last 6 hours (alert threshold: 2)', 'Only affects /v2/orders and /v2/reports'], logs: ['java.lang.OutOfMemoryError: Java heap space at java.util.Arrays.copyOf', 'GC overhead limit exceeded — 98% time in GC', 'Restarting container due to OOM kill signal (exit code 137)', '[WARN] Large object allocated: 847MB for query result set — no pagination'], expectedRCA: 'The /v2/orders endpoint fetches entire result sets into memory without pagination. A recent change increased the default page size from 100 to "unlimited" for internal clients, causing unbounded memory growth.' },
  { title: 'CDN serving 6-hour-old HTML after deployment', severity: 'SEV-2', affectedUsers: '~31,000 users', revenueImpact: '$58K/hr', businessImpact: 'Users on cached version cannot complete checkout. Stripe integration changed — old key rejected. Support volume up 600%.', symptoms: ['New deployment 6 hours ago — users still on old UI', 'Cache-Control headers show max-age=86400 on /checkout', 'CDN purge API returned 403 on post-deploy hook', 'Stripe publishable key format changed — old key rejected'], logs: ['WARN: Cache-Control: max-age=86400 set on dynamic HTML route /checkout', 'ERROR: CDN cache purge failed — API key does not have purge:all permission', 'INFO: Cache HIT rate: 99.94% (expected <5% for HTML)', 'ERROR: Stripe.js: Invalid publishable key format'], expectedRCA: 'The CDN purge API key used in the deploy pipeline was rotated last month but the pipeline secret was never updated. Cache-Control headers for HTML routes were also incorrectly set to 24h max-age during a performance optimization last sprint.' },
]

// ───── OpenRouter AI Client ─────
const OR_KEY = process.env.OPENROUTER_KEY || ''const OR_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OR_MODELS = [
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.1-8b-instruct:free',
]

export async function aiCall(prompt: string): Promise<string> {
  const errors: string[] = []
  for (const model of OR_MODELS) {
    try {
      const res = await fetch(OR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OR_KEY}`,
          'HTTP-Referer': 'https://bitora.dev',
          'X-Title': 'Bitora',
        },
        body: JSON.stringify({ model, max_tokens: 1800, temperature: 0.3, messages: [{ role: 'user', content: prompt }] }),
      })
      if (!res.ok) {
        const errText = await res.text()
        errors.push(`${model}: ${res.status} ${errText.slice(0, 80)}`)
        continue
      }
      const d = await res.json()
      const text = d?.choices?.[0]?.message?.content
      if (!text) { errors.push(`${model}: empty response`); continue }
      return text
    } catch (e: any) {
      errors.push(`${model}: ${e.message}`)
    }
  }
  throw new Error(`All AI models failed: ${errors.join(' | ')}`)
}

export function parseJSON(text: string): any {
  const clean = text.replace(/```json\n?|```\n?/g, '').trim()
  // find first { ... }
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found')
  return JSON.parse(clean.slice(start, end + 1))
}
