import { NextResponse } from 'next/server'
import { Users } from '@/lib/db'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const user = await Users.findByEmail(email)
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // Get password hash separately (not exposed in toAppUser)
    const hash = await Users.getPasswordHash(user.id)
    if (!hash) return NextResponse.json({ error: 'Account uses Google sign-in — please continue with Google' }, { status: 401 })

    const ok = await verifyPassword(password, hash)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ id: user.id, email: user.email })
    return NextResponse.json({ token, user })
  } catch (e: any) {
    console.error('Login error:', e.message)
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 500 })
  }
}
