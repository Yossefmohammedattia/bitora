import { NextResponse } from 'next/server'

import { Tasks, Users } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { COMPANIES } from '@/lib/data'

function auth(req: Request) {
  const t = getTokenFromRequest(req); if (!t) return null; return verifyToken(t)
}

export async function POST(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { companyId, role } = await req.json()
  const company = COMPANIES.find(c => c.id === companyId)
  if (!company)                    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  if (!company.roles.includes(role)) return NextResponse.json({ error: 'Role not available' }, { status: 400 })

  const user = await Users.findById(payload.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const activeTask = await Tasks.activeByUser(payload.id)
  if (activeTask && user.companyId !== companyId) {
    return NextResponse.json({ error: 'Complete your current task before switching companies' }, { status: 409 })
  }

  const updated = await Users.update(payload.id, { companyId, role, level: 0, performanceScore: 0, tasksCompleted: 0, incidentsHandled: 0 })
  return NextResponse.json({ success: true, user: updated })
}
