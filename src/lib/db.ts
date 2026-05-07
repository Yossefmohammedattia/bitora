import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export interface User {
  id: string
  name: string
  email: string
  password?: string        // kept for compat but not stored plain
  country: string
  timezone: string
  companyId: string | null
  role: string | null
  level: number
  performanceScore: number
  tasksCompleted: number
  incidentsHandled: number
  publicProfile?: boolean
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  availableTime?: '30min' | '1hr' | '2hrs'
  onboardingDone?: boolean
  googleId?: string | null
  avatar?: string | null
  createdAt: string
}

export interface TaskPhaseData {
  prd?: boolean
  design?: { arch: string; data: string; flow: string; tradeoffs: string; review?: any }
  implementation?: { code: string; tests: string }
  codeReview?: any
  revision?: { code: string }
  incident?: any
  incidentResponse?: { rca: string; fix: string; rollback: string; post: string }
  incidentEval?: any
  evaluation?: any
}

export interface Task {
  id: string
  userId: string
  companyId: string
  role: string
  title: string
  desc: string
  background: string
  acceptance_criteria: string[]
  constraints: string[]
  tags: string[]
  estimatedMinutes?: number
  difficulty?: string
  phase: number
  status: 'active' | 'complete' | 'abandoned'
  phaseData: TaskPhaseData
  startedAt: string
  completedAt?: string
  finalScore?: number
}

export interface CompanyHealth {
  companyId: string
  reputation: number
  reliability: number
  velocity: number
  securityRisk: number
  techDebt: number
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// HELPERS — map DB row → app shape
// ═══════════════════════════════════════════════════════════════
function rowToUser(r: any): User {
  return {
    id: r.id,
    name: r.full_name,
    email: r.email,
    country: r.country || '',
    timezone: r.timezone || '',
    companyId: r.company_id,
    role: r.role,
    level: r.level,
    performanceScore: r.performance_score,
    tasksCompleted: r.tasks_completed,
    incidentsHandled: r.incidents_handled,
    publicProfile: r.public_profile,
    experienceLevel: r.experience_level,
    availableTime: r.available_time,
    onboardingDone: r.onboarding_done,
    googleId: r.google_id,
    avatar: r.avatar_url,
    createdAt: r.created_at,
  }
}

function rowToTask(r: any): Task {
  return {
    id: r.id,
    userId: r.user_id,
    companyId: r.company_id,
    role: r.role,
    title: r.title,
    desc: r.description,
    background: r.background || '',
    acceptance_criteria: r.acceptance_criteria || [],
    constraints: r.constraints || [],
    tags: r.tags || [],
    estimatedMinutes: r.estimated_minutes,
    difficulty: r.difficulty,
    phase: r.phase,
    status: r.status,
    phaseData: r.phase_data || {},
    startedAt: r.started_at,
    completedAt: r.completed_at,
    finalScore: r.final_score,
  }
}

function rowToHealth(r: any): CompanyHealth {
  return {
    companyId: r.company_id,
    reputation: r.reputation,
    reliability: r.reliability,
    velocity: r.velocity,
    securityRisk: r.security_risk,
    techDebt: r.tech_debt,
    updatedAt: r.updated_at,
  }
}

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════
export const Users = {
  all: async (): Promise<User[]> => {
    const { data } = await supabase.from('users').select('*')
    return (data || []).map(rowToUser)
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const { data } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle()
    return data ? rowToUser(data) : null
  },

  findById: async (id: string): Promise<User | null> => {
    const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
    return data ? rowToUser(data) : null
  },

  findByGoogleId: async (googleId: string): Promise<User | null> => {
    const { data } = await supabase.from('users').select('*').eq('google_id', googleId).maybeSingle()
    return data ? rowToUser(data) : null
  },

  getPasswordHash: async (id: string): Promise<string | null> => {
    const { data } = await supabase.from('users').select('password_hash').eq('id', id).maybeSingle()
    return data?.password_hash || null
  },

  create: async (u: {
    id: string; name: string; email: string
    passwordHash?: string | null; googleId?: string | null; avatar?: string | null
    country?: string; timezone?: string
  }): Promise<User> => {
    const { data, error } = await supabase.from('users').insert({
      id: u.id,
      full_name: u.name,
      email: u.email.toLowerCase(),
      password_hash: u.passwordHash || null,
      google_id: u.googleId || null,
      avatar_url: u.avatar || null,
      country: u.country || '',
      timezone: u.timezone || '',
      company_id: null, role: null, level: 0,
      performance_score: 0, tasks_completed: 0, incidents_handled: 0,
      public_profile: false, onboarding_done: false,
    }).select('*').single()
    if (error) throw new Error(error.message)
    return rowToUser(data)
  },

  update: async (id: string, patch: Partial<User>): Promise<User> => {
    const map: Record<string, string> = {
      name: 'full_name', companyId: 'company_id', performanceScore: 'performance_score',
      tasksCompleted: 'tasks_completed', incidentsHandled: 'incidents_handled',
      publicProfile: 'public_profile', experienceLevel: 'experience_level',
      availableTime: 'available_time', onboardingDone: 'onboarding_done',
    }
    const dbPatch: any = {}
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) dbPatch[map[k] || k] = v
    }
    const { data, error } = await supabase.from('users').update(dbPatch).eq('id', id).select('*').single()
    if (error) throw new Error(error.message)
    return rowToUser(data)
  },
}

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════
export const Tasks = {
  all: async (): Promise<Task[]> => {
    const { data } = await supabase.from('tasks').select('*')
    return (data || []).map(rowToTask)
  },

  findById: async (id: string): Promise<Task | null> => {
    const { data } = await supabase.from('tasks').select('*').eq('id', id).maybeSingle()
    return data ? rowToTask(data) : null
  },

  activeByUser: async (userId: string): Promise<Task | null> => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle()
    return data ? rowToTask(data) : null
  },

  completedByUser: async (userId: string): Promise<Task[]> => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).eq('status', 'complete').order('completed_at', { ascending: false })
    return (data || []).map(rowToTask)
  },

  create: async (t: Task): Promise<void> => {
    const { error } = await supabase.from('tasks').insert({
      id: t.id,
      user_id: t.userId,
      company_id: t.companyId,
      role: t.role,
      title: t.title,
      description: t.desc,
      background: t.background,
      acceptance_criteria: t.acceptance_criteria,
      constraints: t.constraints,
      tags: t.tags,
      estimated_minutes: t.estimatedMinutes,
      difficulty: t.difficulty,
      phase: t.phase,
      status: t.status,
      phase_data: t.phaseData,
      started_at: t.startedAt,
      completed_at: t.completedAt || null,
      final_score: t.finalScore || null,
    })
    if (error) throw new Error(error.message)
  },

  update: async (id: string, patch: Partial<Task>): Promise<Task | null> => {
    const dbPatch: any = {}
    if (patch.phase       !== undefined) dbPatch.phase        = patch.phase
    if (patch.status      !== undefined) dbPatch.status       = patch.status
    if (patch.phaseData   !== undefined) dbPatch.phase_data   = patch.phaseData
    if (patch.finalScore  !== undefined) dbPatch.final_score  = patch.finalScore
    if (patch.completedAt !== undefined) dbPatch.completed_at = patch.completedAt
    const { data, error } = await supabase.from('tasks').update(dbPatch).eq('id', id).select('*').single()
    if (error) throw new Error(error.message)
    return data ? rowToTask(data) : null
  },
}

// ═══════════════════════════════════════════════════════════════
// COMPANY HEALTH
// ═══════════════════════════════════════════════════════════════
const BASE_HEALTH: Record<string, Omit<CompanyHealth, 'companyId' | 'updatedAt'>> = {
  c1: { reputation: 72, reliability: 68, velocity: 81, securityRisk: 55, techDebt: 42 },
  c2: { reputation: 88, reliability: 74, velocity: 92, securityRisk: 30, techDebt: 28 },
  c3: { reputation: 91, reliability: 88, velocity: 70, securityRisk: 38, techDebt: 61 },
  c4: { reputation: 65, reliability: 60, velocity: 55, securityRisk: 70, techDebt: 78 },
  c5: { reputation: 82, reliability: 90, velocity: 78, securityRisk: 22, techDebt: 35 },
  c6: { reputation: 78, reliability: 79, velocity: 85, securityRisk: 45, techDebt: 50 },
}

export const CompanyHealthDB = {
  all: async (): Promise<CompanyHealth[]> => {
    const { data } = await supabase.from('company_health').select('*')
    return (data || []).map(rowToHealth)
  },

  get: async (companyId: string): Promise<CompanyHealth | null> => {
    const { data } = await supabase.from('company_health').select('*').eq('company_id', companyId).maybeSingle()
    if (data) return rowToHealth(data)
    // Return base values if not in DB yet
    const base = BASE_HEALTH[companyId]
    if (!base) return null
    return { companyId, ...base, updatedAt: new Date().toISOString() }
  },

  upsert: async (companyId: string, patch: Partial<CompanyHealth>): Promise<CompanyHealth> => {
    const base = BASE_HEALTH[companyId] || { reputation: 70, reliability: 70, velocity: 70, securityRisk: 40, techDebt: 40 }
    const now = new Date().toISOString()
    const { data, error } = await supabase.from('company_health').upsert({
      company_id: companyId,
      reputation:    patch.reputation    ?? base.reputation,
      reliability:   patch.reliability   ?? base.reliability,
      velocity:      patch.velocity      ?? base.velocity,
      security_risk: patch.securityRisk  ?? base.securityRisk,
      tech_debt:     patch.techDebt      ?? base.techDebt,
      updated_at:    now,
    }, { onConflict: 'company_id' }).select('*').single()
    if (error) throw new Error(error.message)
    return rowToHealth(data)
  },
}
