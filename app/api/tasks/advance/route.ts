import { NextResponse } from 'next/server'
import { Tasks } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { taskId } = await req.json()
  const task = await Tasks.findById(taskId)
  if (!task || task.userId !== payload.id) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (task.phase !== 0) return NextResponse.json({ error: 'Can only advance from PRD phase' }, { status: 400 })
  await Tasks.update(taskId, { phase: 1, phaseData: { ...task.phaseData, prd: true } })
  return NextResponse.json({ phase: 1 })
}
