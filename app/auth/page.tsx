'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(params.get('error') ? 'Google sign-in failed. Please try again.' : '')

  useEffect(() => {
    if (localStorage.getItem('bt')) router.replace('/dashboard')
  }, [router])

  async function submit() {
    setError(''); setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email, password } : { name, email, password, country: '', timezone: '' }
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Something went wrong')
      localStorage.setItem('bt', d.token)
      router.replace('/dashboard')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inp: any = { width: '100%', background: '#161b27', border: '1px solid #ffffff18', borderRadius: 8, padding: '.7rem 1rem', color: '#e8edf5', fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }
  const label: any = { fontSize: 12, color: '#8892aa', marginBottom: '.35rem', display: 'block' }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus{border-color:#4f7cff!important}
        .google-btn:hover{background:#1e2638!important;border-color:#ffffff28!important}
        .mode-tab{cursor:pointer;padding:.5rem 1rem;font-size:14px;border-radius:8px;transition:all .15s}
        .mode-tab.active{background:#4f7cff20;color:#7fa8ff}
        .mode-tab:not(.active){color:#4a5268}
        .mode-tab:not(.active):hover{color:#8892aa}
        .submit-btn:hover:not(:disabled){background:#3d6ae8!important;transform:translateY(-1px)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Background effects */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#ffffff08 1px,transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%,black,transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,#4f7cff15,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, animation: 'fadeIn .4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', cursor: 'pointer' }} onClick={() => router.push('/landing')}>
          <img src="/logo.png" alt="Bitora" style={{ width: 44, height: 44, borderRadius: 10, marginBottom: '.75rem' }} onError={e => (e.currentTarget.style.display = 'none')} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e8edf5', letterSpacing: '-.4px' }}>Bitora</div>
          <div style={{ fontSize: 12, color: '#4a5268', marginTop: 4 }}>Engineering Career Simulation</div>
        </div>

        {/* Card */}
        <div style={{ background: '#111520', border: '1px solid #ffffff15', borderRadius: 16, padding: '2rem', boxShadow: '0 24px 64px #00000060' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '.25rem', marginBottom: '1.75rem', background: '#0b0e14', borderRadius: 10, padding: '.25rem' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} className={`mode-tab ${mode === m ? 'active' : ''}`} style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: 'inherit' }} onClick={() => { setMode(m); setError('') }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google Button */}
          <a href="/api/auth/google" className="google-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '.75rem', background: '#161b27', border: '1px solid #ffffff18', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#e8edf5', textDecoration: 'none', transition: 'all .15s', cursor: 'pointer', marginBottom: '1.25rem' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: 1, background: '#ffffff10' }} />
            <span style={{ fontSize: 12, color: '#4a5268' }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: '#ffffff10' }} />
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={label}>Full name</label>
                <input style={inp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>
            )}
            <div>
              <label style={label}>Email address</label>
              <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
            <div>
              <label style={label}>Password</label>
              <input style={inp} type="password" placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: '#f87171', background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, padding: '.65rem .9rem' }}>
                {error}
              </div>
            )}

            <button className="submit-btn" disabled={loading} onClick={submit} style={{ width: '100%', background: '#4f7cff', color: '#fff', border: 'none', borderRadius: 10, padding: '.8rem', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, transition: 'all .15s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && <div style={{ width: 14, height: 14, border: '2px solid #ffffff60', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#4a5268' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: '#4f7cff', cursor: 'pointer' }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: '#4a5268' }}>
          By continuing you agree to Bitora's Terms of Service
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0e14' }} />}>
      <AuthForm />
    </Suspense>
  )
}
