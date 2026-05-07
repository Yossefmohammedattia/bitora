import { NextResponse } from 'next/server'
import { Users } from '@/lib/db'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

function auth(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await Users.findById(payload.id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const payload = auth(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  const allowed = ['name','country','timezone','companyId','role','publicProfile','experienceLevel','availableTime','onboardingDone']
  const patch: any = {}
  for (const k of allowed) {
    if (body[k] !== undefined) patch[k] = body[k] === null ? null : body[k]
  }

  const updated = await Users.update(payload.id, patch)
  return NextResponse.json(updated)
}
