import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'bitora-super-secret-jwt-key-2024'

export async function hashPassword(pass: string) {
  return bcrypt.hash(pass, 10)
}
export async function verifyPassword(pass: string, hash: string) {
  return bcrypt.compare(pass, hash)
}

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}
export function verifyToken(token: string): { id: string; email: string } | null {
  try { return jwt.verify(token, SECRET) as any } catch { return null }
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  const cookie = req.headers.get('cookie')
  if (cookie) {
    const match = cookie.match(/bitora_token=([^;]+)/)
    if (match) return match[1]
  }
  return null
}
