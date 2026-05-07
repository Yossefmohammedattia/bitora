import { NextResponse } from 'next/server'
import { Users } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  if (error || !code) return NextResponse.redirect(`${baseUrl}/auth?error=google_denied`)

  try {
    const clientId     = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri  = `${baseUrl}/api/auth/google/callback`

    // Exchange code → tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('No access token from Google')

    // Get Google user info
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const gUser = await infoRes.json()
    if (!gUser.email) throw new Error('No email from Google')

    // Find by google_id first, then by email
    let user = await Users.findByGoogleId(gUser.id)
    if (!user) user = await Users.findByEmail(gUser.email)

    if (!user) {
      // Create new user
      user = await Users.create({
        id: randomUUID(),
        name: gUser.name || gUser.email.split('@')[0],
        email: gUser.email,
        passwordHash: null,
        googleId: gUser.id,
        avatar: gUser.picture || null,
      })
    }

    const token = signToken({ id: user.id, email: user.email })
    const redirect = new URL(`${baseUrl}/auth/callback`)
    redirect.searchParams.set('token', token)
    redirect.searchParams.set('name', user.name)
    return NextResponse.redirect(redirect.toString())
  } catch (e: any) {
    console.error('Google OAuth error:', e.message)
    return NextResponse.redirect(`${baseUrl}/auth?error=google_failed`)
  }
}
