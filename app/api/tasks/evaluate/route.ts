import { NextResponse } from 'next/server'
import { Tasks, Users, CompanyHealthDB } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { PROMO_THRESHOLDS, LEVELS } from '@/lib/data'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await req.json()
  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 5) return NextResponse.json({ error: 'Not in evaluation phase' }, { status: 400 })

  const user = await Users.findById(payload.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const designScore   = (task.phaseData.design as any)?.review?.score ?? 65
  const codeScore     = (task.phaseData.codeReview as any)?.score ?? 65
  const incidentScore = (task.phaseData.incidentEval as any)?.overallScore ?? 65
  const finalScore    = Math.round(designScore * 0.25 + codeScore * 0.40 + incidentScore * 0.35)

  // Company health impact
  const health = await CompanyHealthDB.get(task.companyId) || { reputation: 70, reliability: 70, velocity: 70, securityRisk: 40, techDebt: 40 }
  let delta = { reputation: 0, reliability: 0, velocity: 0 }
  if      (finalScore >= 80) delta = { reputation:  3, reliability:  2, velocity:  2 }
  else if (finalScore >= 65) delta = { reputation:  1, reliability:  0, velocity:  1 }
  else if (finalScore <  50) delta = { reputation: -3, reliability: -3, velocity: -2 }
  else                       delta = { reputation: -1, reliability: -1, velocity:  0 }

  await CompanyHealthDB.upsert(task.companyId, {
    reputation:  Math.max(0, Math.min(100, health.reputation  + delta.reputation)),
    reliability: Math.max(0, Math.min(100, health.reliability + delta.reliability)),
    velocity:    Math.max(0, Math.min(100, health.velocity    + delta.velocity)),
  })

  // Update user stats
  const newTasksCompleted = (user.tasksCompleted || 0) + 1
  const newScore = Math.round(((user.performanceScore || 0) * (user.tasksCompleted || 0) + finalScore) / newTasksCompleted)
  const newIncidents = (user.incidentsHandled || 0) + 1
  let newLevel = user.level || 0
  if (newLevel < 4 && newScore >= (PROMO_THRESHOLDS?.[newLevel + 1] || 999)) newLevel++
  const promoted = newLevel > (user.level || 0)

  await Users.update(payload.id, {
    performanceScore: newScore,
    tasksCompleted: newTasksCompleted,
    incidentsHandled: newIncidents,
    level: newLevel,
  })

  // Complete the task
  const codeReview = task.phaseData.codeReview as any
  await Tasks.update(taskId, {
    status: 'complete',
    phase: 5,
    finalScore,
    completedAt: new Date().toISOString(),
    phaseData: {
      ...task.phaseData,
      evaluation: {
        finalScore, designScore, codeScore, incidentScore,
        healthImpact: {
          ...delta,
          techDebt: codeReview?.health_impact?.techDebt || 0,
          securityRisk: codeReview?.health_impact?.securityRisk || 0,
        },
      },
    },
  })

  const incidentEval = task.phaseData.incidentEval as any
  return NextResponse.json({
    finalScore, designScore, codeScore, incidentScore,
    healthImpact: delta, promoted, newLevel,
    newLevelName: LEVELS?.[newLevel] || 'Junior',
    newPerformanceScore: newScore,
    rcaCorrect: incidentEval?.rcaCorrect || false,
    incidentFeedback: incidentEval?.feedback || {},
    strengths: incidentEval?.strengths || [],
    missed: incidentEval?.missed || [],
  })
}
