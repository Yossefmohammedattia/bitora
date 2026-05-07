import { NextResponse } from 'next/server'
import { Tasks } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { taskId, code, tests } = await req.json()
  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 2) return NextResponse.json({ error: 'Not in implementation phase' }, { status: 400 })
  if (!code || code.trim().length < 100) return NextResponse.json({ error: 'Implementation too brief — write at least 100 characters of real code' }, { status: 400 })
  const updatedPhaseData = { ...task.phaseData, implementation: { code: code.trim(), tests: (tests || '').trim() } }
  await Tasks.update(taskId, { phaseData: updatedPhaseData, phase: 3 })
  return NextResponse.json({ success: true, nextPhase: 3 })
}
