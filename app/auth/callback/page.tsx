'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const name  = params.get('name')
    const error = params.get('error')

    if (error) {
      router.replace('/auth?error=' + error)
      return
    }
    if (token) {
      localStorage.setItem('bt', token)
      if (name) localStorage.setItem('bt_name', name)
      router.replace('/dashboard')
    } else {
      router.replace('/auth')
    }
  }, [params, router])

  return (
    <div style={{ minHeight: '100vh', background: '#0b0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', color: '#8892aa' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #4f7cff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ fontSize: 14 }}>Signing you in...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#0b0e14' }} />}>
      <CallbackHandler />
    </Suspense>
  )
}
