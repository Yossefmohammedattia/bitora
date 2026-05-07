import { NextResponse } from 'next/server'
import { Users } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const { name, email, password, country, timezone } = await req.json()

    if (!name?.trim())    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email?.trim())   return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!password)        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const existing = await Users.findByEmail(email)
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const user = await Users.create({
      id: randomUUID(),
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      country: country || '',
      timezone: timezone || '',
    })

    const token = signToken({ id: user.id, email: user.email })
    return NextResponse.json({ token, user })
  } catch (e: any) {
    console.error('Register error:', e.message)
    return NextResponse.json({ error: e.message || 'Registration failed' }, { status: 500 })
  }
}
