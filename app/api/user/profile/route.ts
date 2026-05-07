import { NextResponse } from 'next/server'

import { Tasks, Users } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { COMPANIES } from '@/lib/data'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

const LEVELS = ['Beginner','Junior','Strong Junior','Mid-Level','Staff Engineer']

async function computeProfile(userId: string) {
  const user = await Users.findById(userId)
  if (!user) return null

  const completed: any[] = await Tasks.completedByUser(userId) || []
  const active = await Tasks.activeByUser(userId)
  const allTasks = active ? [...completed, active] : completed

  const company = COMPANIES.find(c => c.id === user.companyId)

  const scores         = completed.map(t => t.finalScore||0).filter(s=>s>0)
  const designScores   = completed.map(t => t.phaseData?.design?.review?.score||0).filter(s=>s>0)
  const codeScores     = completed.map(t => t.phaseData?.codeReview?.score||0).filter(s=>s>0)
  const incidentScores = completed.map(t => t.phaseData?.incidentEval?.overallScore||0).filter(s=>s>0)

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0
  const avgScore    = avg(scores)
  const avgDesign   = avg(designScores)
  const avgCode     = avg(codeScores)
  const avgIncident = avg(incidentScores)

  const revisionsNeeded = completed.filter(t=>t.phaseData?.codeReview&&!t.phaseData?.codeReview?.accepted&&t.phase>=4).length
  const hadSQLi = completed.filter(t=>t.phaseData?.codeReview?.categories?.some((c:any)=>c.name==='Security'&&c.type==='issue'&&c.issues?.some((i:any)=>typeof i==='string'&&i.includes('SQL')))).length
  const rcaCorrect  = completed.filter(t=>t.phaseData?.incidentEval?.rcaCorrect).length
  const totalInc    = completed.filter(t=>t.phaseData?.incidentEval).length

  const skills = [
    { name:'System Design',    score:avgDesign,   confidence:designScores.length>=3?'High':designScores.length>=1?'Medium':'Low', evidence:designScores.length>0?`${designScores.length} design review(s), avg ${avgDesign}/100`:null, note:avgDesign<60?'Failure paths and schema depth need improvement':avgDesign<75?'Good fundamentals — strengthen trade-off reasoning':'Strong system design' },
    { name:'Code Quality',     score:avgCode,     confidence:codeScores.length>=3?'High':codeScores.length>=1?'Medium':'Low', evidence:codeScores.length>0?`${codeScores.length} code review(s), avg ${avgCode}/100`:null, note:avgCode<60?'Critical gaps in auth and validation':avgCode<75?'Decent code hygiene — work on transactions':'Clean, production-ready code' },
    { name:'Security',         score:hadSQLi>0?Math.max(15,65-hadSQLi*20):avgCode>0?Math.min(88,avgCode+5):0, confidence:codeScores.length>=1?'Medium':'Low', evidence:hadSQLi>0?`${hadSQLi} submission(s) flagged for SQL injection`:codeScores.length>0?'No critical vulnerabilities detected':null, note:hadSQLi>0?'SQL injection vulnerabilities found':'No critical security issues detected' },
    { name:'Incident Response',score:avgIncident, confidence:incidentScores.length>=2?'High':incidentScores.length>=1?'Medium':'Low', evidence:totalInc>0?`${totalInc} incident(s), RCA correct: ${rcaCorrect}/${totalInc}`:null, note:avgIncident<60?'RCA needs to go deeper than symptoms':avgIncident<75?'Good awareness — improve postmortem detail':'Strong on-call performance' },
    { name:'Problem Solving',  score:avgScore,    confidence:completed.length>=3?'High':completed.length>=1?'Medium':'Low', evidence:completed.length>0?`${completed.length} task(s) completed`:null, note:avgScore<60?'Needs more structured thinking':avgScore<75?'Solid solver — improve edge case handling':'Consistently delivers good solutions' },
    { name:'Reliability',      score:completed.length>0?Math.max(25,85-revisionsNeeded*12):0, confidence:completed.length>=2?'Medium':'Low', evidence:completed.length>0?`${revisionsNeeded} revision(s) out of ${completed.length} task(s)`:null, note:revisionsNeeded>2?'Multiple revisions — review before submitting':revisionsNeeded>0?'Minor revisions — overall quality good':'Clean first-submission record' },
  ]

  let readiness = 0
  if (avgScore>0)    readiness += avgScore*0.3
  if (avgCode>0)     readiness += avgCode*0.3
  if (avgDesign>0)   readiness += avgDesign*0.2
  if (avgIncident>0) readiness += avgIncident*0.2
  const readinessScore = Math.round(readiness)

  let levelName = 'Beginner'
  if (readinessScore>=80&&completed.length>=4) levelName='Mid-Level Simulation'
  else if (readinessScore>=70&&completed.length>=3) levelName='Job-Ready Junior'
  else if (readinessScore>=60&&completed.length>=2) levelName='Strong Junior'
  else if (readinessScore>=45&&completed.length>=1) levelName='Junior'

  let readinessLabel = 'Needs more practice before job-ready'
  if (readinessScore>=75&&completed.length>=3) readinessLabel='Ready for junior engineering roles or internship'
  else if (readinessScore>=65&&completed.length>=2) readinessLabel='Strong candidate for internship with mentorship'
  else if (readinessScore>=50&&completed.length>=1) readinessLabel='Shows promise — 2-3 more tasks recommended'

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (avgDesign>=70) strengths.push('Strong system design — articulates architecture with failure modes')
  if (avgCode>=70)   strengths.push('Clean code with proper auth, validation, and error handling')
  if (avgIncident>=70) strengths.push('Effective incident responder — correctly identifies root causes')
  if (revisionsNeeded===0&&completed.length>=2) strengths.push('Consistent first-submission quality')
  if (hadSQLi===0&&codeScores.length>=2) strengths.push('Security-conscious — no critical vulnerabilities detected')
  if (avgDesign<60&&designScores.length>0) weaknesses.push('System design needs depth — failure paths and schema constraints often missing')
  if (avgCode<60&&codeScores.length>0)    weaknesses.push('Code quality gaps — auth and input validation need attention')
  if (hadSQLi>0)                          weaknesses.push('SQL injection detected — must use parameterized queries')
  if (avgIncident<60&&totalInc>0)         weaknesses.push('Incident RCA stops at symptoms — needs deeper analysis')
  if (revisionsNeeded>2)                  weaknesses.push('Multiple revisions — more careful self-review recommended')

  const evidence = completed.map(t => ({
    id:t.id, title:t.title, role:t.role,
    company: COMPANIES.find(c=>c.id===t.companyId)?.name||t.companyId,
    finalScore: t.finalScore||0,
    designScore: t.phaseData?.design?.review?.score??null,
    codeScore:   t.phaseData?.codeReview?.score??null,
    codeAccepted:t.phaseData?.codeReview?.accepted??null,
    incidentScore:t.phaseData?.incidentEval?.overallScore??null,
    rcaCorrect:  t.phaseData?.incidentEval?.rcaCorrect??null,
    completedAt: t.completedAt||t.startedAt,
    tags: t.tags||[],
  }))

  let profileCompletion = 20
  if (user.companyId)        profileCompletion+=15
  if (completed.length>=1)   profileCompletion+=20
  if (completed.length>=3)   profileCompletion+=20
  if (avgScore>=60)          profileCompletion+=15
  if (avgScore>=75)          profileCompletion+=10
  profileCompletion = Math.min(100, profileCompletion)

  return {
    user: { id:user.id, name:user.name, email:user.email, country:user.country, role:user.role, company:company?.name||null, companyType:company?.type||null, level:LEVELS[user.level]||'Junior', performanceScore:user.performanceScore||0, tasksCompleted:user.tasksCompleted||0, incidentsHandled:user.incidentsHandled||0, joinedAt:user.createdAt },
    profileCompletion, readinessScore, readinessLabel, levelName,
    skills, metrics:{ tasksCompleted:completed.length, avgFinalScore:avgScore, avgDesignScore:avgDesign, avgCodeScore:avgCode, avgIncidentScore:avgIncident, revisionsNeeded, securityIssues:hadSQLi, rcaAccuracy:totalInc>0?Math.round((rcaCorrect/totalInc)*100):null },
    strengths, weaknesses, evidence,
    isPublic: user.publicProfile??false,
  }
}

export async function GET(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await computeProfile(payload.id)
  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const profile = await computeProfile(userId)
  if (!profile||!profile.isPublic) return NextResponse.json({ error: 'Profile not found or private' }, { status: 404 })
  profile.user.email = profile.user.email.replace(/(.{2}).*@/, '$1***@')
  return NextResponse.json(profile)
}

export async function PATCH(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { publicProfile } = await req.json()
  await Users.update(payload.id, { publicProfile: !!publicProfile })
  return NextResponse.json({ success: true, publicProfile: !!publicProfile })
}
