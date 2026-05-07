'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingClient() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('bt')
    if (token) router.replace('/dashboard')
  }, [router])

  return (
    <div style={{ background: '#0b0e14', minHeight: '100vh', color: '#e8edf5', fontFamily: "'Inter',system-ui,sans-serif", overflowX: 'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--navy:#0b0e14;--navy2:#111520;--navy3:#161b27;--accent:#4f7cff;--accent2:#7fa8ff;--text:#e8edf5;--text2:#8892aa;--text3:#4a5268;--green:#22c55e;--red:#ef4444;--amber:#f59e0b;--border:#ffffff0f;--border2:#ffffff18}
        @keyframes twinkle{0%,100%{opacity:var(--o1)}50%{opacity:var(--o2)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        @keyframes scroll-left{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes orb-drift{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(30px)}}
        @keyframes shine{0%,100%{transform:translateX(-200%)}50%{transform:translateX(200%)}}
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .feat-card{background:var(--navy2);padding:2rem;transition:background .2s;cursor:default;position:relative;overflow:hidden;border-bottom:1px solid var(--border);border-right:1px solid var(--border)}
        .feat-card:hover{background:var(--navy3)}
        .feat-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;background:radial-gradient(circle at 30% 30%,#4f7cff12,transparent 60%)}
        .feat-card:hover::before{opacity:1}
        .phase-entry{display:grid;grid-template-columns:48px 1fr;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid var(--border);transition:all .2s;opacity:0;transform:translateX(-12px)}
        .phase-entry.visible{opacity:1;transform:translateX(0)}
        .phase-entry:last-child{border-bottom:none}
        .phase-entry:hover .ph-icon{border-color:var(--accent);background:var(--accent);color:#fff}
        .ph-icon{width:40px;height:40px;border-radius:10px;border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--text3);background:var(--navy2);transition:all .2s;flex-shrink:0;margin-top:2px}
        .btn-primary{background:var(--accent);color:#fff;border:none;padding:.85rem 2rem;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;transition:all .2s;letter-spacing:-.2px;display:inline-flex;align-items:center;gap:8px}
        .btn-primary:hover{background:#3d6ae8;transform:translateY(-2px);box-shadow:0 8px 32px #4f7cff40}
        .btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2);padding:.85rem 1.75rem;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;transition:all .2s}
        .btn-ghost:hover{color:var(--text);border-color:#ffffff30;background:var(--border)}
        .nav-cta{background:var(--accent);color:#fff;border:none;padding:.5rem 1.1rem;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
        .nav-cta:hover{background:#3d6ae8;transform:translateY(-1px)}
        .cta-input{flex:1;background:var(--navy);border:1px solid var(--border2);border-radius:8px;padding:.7rem 1rem;font-size:13px;color:var(--text);outline:none;transition:border .2s;font-family:inherit}
        .cta-input:focus{border-color:var(--accent)}
        .cta-input::placeholder{color:var(--text3)}
        .footer-link{font-size:12px;color:var(--text3);cursor:pointer;transition:color .2s}
        .footer-link:hover{color:var(--text2)}
        nav.scrolled{background:#0b0e14ee!important;border-bottom-color:var(--border2)!important;backdrop-filter:blur(12px)}
      `}</style>

      {/* Stars */}
      <div id="stars-container" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} />

      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(#ffffff0f 1px,transparent 1px),linear-gradient(90deg,#ffffff0f 1px,transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%,black 0%,transparent 100%)' }} />

      {/* Orbs */}
      <div style={{ position: 'fixed', width: 600, height: 400, top: -100, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse,#4f7cff18 0%,transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, animation: 'orb-drift 12s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', width: 400, height: 300, bottom: '10%', right: '-10%', background: 'radial-gradient(ellipse,#a78bfa12 0%,transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, animation: 'orb-drift 12s ease-in-out infinite', animationDelay: '-6s' }} />

      {/* Nav */}
      <nav id="main-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 2.5rem', background: 'linear-gradient(to bottom,#0b0e14cc,transparent)', borderBottom: '1px solid transparent', transition: 'all .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.png" alt="Bitora" style={{ width: 32, height: 32, borderRadius: 7 }} onError={e => (e.currentTarget.style.display = 'none')} />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.4px' }}>Bitora</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }} onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}>Features</span>
          <span style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }} onClick={() => document.getElementById('phases-section')?.scrollIntoView({ behavior: 'smooth' })}>How it works</span>
          <button className="nav-cta" onClick={() => router.push('/auth')}>Get started →</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* HERO */}
        <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '160px 2rem 100px', maxWidth: 900, width: '100%', animation: 'fadeUp .9s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--border2)', border: '1px solid var(--border2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: 'var(--text2)', marginBottom: '2rem', backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s ease infinite' }} />
            AI-powered · Real evaluations · 6 virtual companies
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.2rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-.04em', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text)' }}>Your engineering career,<br /></span>
            <span style={{ background: 'linear-gradient(135deg,#7fa8ff 0%,#a78bfa 50%,#7fa8ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%', animation: 'shimmer 4s linear infinite' }}>
              simulated for real.
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: 'var(--text2)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 2.5rem' }}>
            Work inside realistic software companies. Ship features, handle production incidents, get reviewed by AI — and build a career that actually means something.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => router.push('/auth')}>
              Start working
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('phases-section')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            {[['6', 'Virtual Companies'], ['6', 'Engineering Roles'], ['AI', 'Code Reviewer'], ['5', 'Career Levels']].map(([num, label], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: 'var(--border2)' }} />}
                <div style={{ textAlign: 'center', animation: `fadeUp .9s ${i * .1}s ease both` }}>
                  <div className="stat-num" data-target={isNaN(+num) ? 0 : +num} data-text={num} style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-.04em' }}>{num}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: '.2rem', letterSpacing: '.3px' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <div className="reveal" style={{ width: '100%', maxWidth: 1000, padding: '0 2rem 6rem' }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border2)', boxShadow: '0 40px 120px #00000080' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,transparent 40%,#ffffff03 50%,transparent 60%)', pointerEvents: 'none', animation: 'shine 4s ease infinite', zIndex: 2 }} />
            <div style={{ background: 'var(--navy3)', padding: '.65rem 1rem', display: 'flex', alignItems: 'center', gap: '.5rem', borderBottom: '1px solid var(--border)' }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: '.5rem' }}>bitora.dev/dashboard</span>
            </div>
            <div style={{ background: 'var(--navy2)', display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 300 }}>
              {/* Sidebar */}
              <div style={{ background: 'var(--navy3)', borderRight: '1px solid var(--border)', padding: '1.25rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.5rem 1rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '.75rem' }}>
                  <img src="/logo.png" alt="B" style={{ width: 22, height: 22, borderRadius: 5 }} onError={e => (e.currentTarget.style.display = 'none')} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Bitora</span>
                </div>
                {[['▪', 'Dashboard', true],['≡','Active Task',false],['⊙','History',false],['⊞','Marketplace',false],['⌂','My Company',false]].map(([icon, label, active]) => (
                  <div key={label as string} style={{ padding: '.45rem 1rem', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 8, color: active ? 'var(--accent)' : 'var(--text3)', background: active ? '#4f7cff15' : 'transparent' }}>
                    <span>{icon as string}</span>{label as string}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px', marginBottom: '.25rem' }}>Engineering Dashboard</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>Senior Backend Engineer at Nexara Finance</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.6rem' }}>
                  {[['Performance','84','var(--green)','Overall score'],['Level','Senior','','Career rank'],['Tasks Done','12','','Completed'],['Incidents','8','','Handled']].map(([label, val, color, sub]) => (
                    <div key={label as string} style={{ background: 'var(--navy3)', border: '1px solid var(--border)', borderRadius: 8, padding: '.65rem' }}>
                      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '.3rem' }}>{label as string}</div>
                      <div style={{ fontSize: (label === 'Level' ? 14 : 18), fontWeight: 700, color: (color as string) || 'var(--text)', paddingTop: label === 'Level' ? 4 : 0 }}>{val as string}</div>
                      <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: '.15rem' }}>{sub as string}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: '.5rem' }}>Active task — Phase progress</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {['PRD','Design','Impl','Review','Incident','Eval'].map((p, i) => (
                      <div key={p} style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, background: i < 3 ? 'var(--green)' : i === 3 ? 'var(--accent)' : 'var(--border2)', color: i <= 3 ? '#fff' : 'var(--text3)', boxShadow: i === 3 ? '0 0 10px #4f7cff60' : 'none' }}>
                            {i < 3 ? '✓' : i + 1}
                          </div>
                          <div style={{ fontSize: 9, color: i === 3 ? 'var(--accent)' : 'var(--text3)', marginTop: 3, whiteSpace: 'nowrap' }}>{p}</div>
                        </div>
                        {i < 5 && <div style={{ height: 2, width: 24, background: i < 3 ? 'var(--green)' : 'var(--border)', marginTop: 12 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPANIES STRIP */}
        <div className="reveal" style={{ width: '100%', padding: '0 0 5rem', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.75rem' }}>6 virtual companies to work at</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right,var(--navy),transparent)', zIndex: 2 }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left,var(--navy),transparent)', zIndex: 2 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '1rem', animation: 'scroll-left 22s linear infinite', width: 'max-content' }}>
                {[...Array(2)].flatMap(() => [
                  ['Nexara Finance','Fintech','#4f7cff'],
                  ['LoopAI','AI/ML Platform','#a78bfa'],
                  ['Vanta Health','HealthTech','#22c55e'],
                  ['ShipForge','Logistics SaaS','#f59e0b'],
                  ['Gravix Cloud','Infrastructure','#06b6d4'],
                  ['Orbis Commerce','eCommerce','#ef4444'],
                ]).map(([name, type, color], i) => (
                  <div key={i} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 10, padding: '.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.65rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features-section" className="reveal" style={{ width: '100%', maxWidth: 1000, padding: '2rem 2rem 6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500, marginBottom: '.75rem' }}>Why Bitora</div>
            <div style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, letterSpacing: '-.04em', lineHeight: 1.15 }}>Not a course. Not a challenge.<br />A real engineering job.</div>
            <div style={{ fontSize: 15, color: 'var(--text2)', marginTop: '.75rem', lineHeight: 1.6 }}>Everything a real job has — except the salary.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              ['🏗','Real company context','Every task comes with business context, tech debt levels, and health metrics that actually affect what you face next.','6 companies · 6 roles'],
              ['🔍','Honest AI code review','Not "improve security." Exact vulnerabilities, attack vectors, and required fixes — the way a senior engineer actually reviews.','Claude 3.5 Sonnet'],
              ['🚨','Production incidents','Generated from your past decisions. Ignored auth issues? Expect an auth breach. The system remembers.','AI-generated · Context-aware'],
              ['📈','Career that progresses','Start Junior. Reach Principal. Every score permanently affects your level and company health metrics.','5 career levels'],
              ['⚡','Consequences that stick','Bad code increases tech debt. Bugs drop reliability. Good fixes build reputation. Your company lives with your decisions.','Persistent state'],
              ['🎯','Role-specific tasks','Backend, Frontend, DevOps, Security, Data, Mobile — tasks that match each role\'s real-world responsibilities.','6 engineering roles'],
            ].map(([icon, title, desc, tag]) => (
              <div key={title as string} className="feat-card">
                <div style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: '1.25rem', background: 'var(--border)' }}>{icon as string}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: '.5rem', letterSpacing: '-.2px' }}>{title as string}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{desc as string}</div>
                <div style={{ display: 'inline-block', marginTop: '.85rem', fontSize: 11, color: 'var(--accent2)', background: '#4f7cff18', border: '1px solid #4f7cff25', borderRadius: 20, padding: '2px 10px' }}>{tag as string}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PHASES */}
        <section id="phases-section" style={{ width: '100%', maxWidth: 800, padding: '0 2rem 6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 500, marginBottom: '.75rem' }}>The simulation</div>
            <div style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, letterSpacing: '-.04em', lineHeight: 1.15 }}>6 phases. Every task.</div>
            <div style={{ fontSize: 15, color: 'var(--text2)', marginTop: '.75rem' }}>The full engineering lifecycle — from PRD to postmortem.</div>
          </div>
          <div id="phases-list">
            {[
              ['1','PRD — Product Requirements','Real business context. Why this task exists, what the constraints are, and what success looks like. You read. You understand. Then you design.','Read-only — context setting','#4f7cff15','var(--accent2)','#4f7cff25'],
              ['2','Design — System design review','Architecture, data structures, system flow, trade-offs. AI rejects vague submissions. You need to think like a principal engineer.','AI reviewed · Reject with specific feedback','#a78bfa15','#c4b5fd','#a78bfa25'],
              ['3','Implementation — Write real code','Actual code or detailed technical plans. The AI reviewer will see exactly what you wrote — no hand-waving allowed.','Code or structured technical answer','#22c55e15','#4ade80','#22c55e25'],
              ['4','Code Review — Specific, honest feedback','Security vulnerabilities by attack vector. Performance bottlenecks with impact numbers. Architecture issues with required fixes. Not vague. Not generic.','Categorized · Score · Required fixes','#f59e0b15','#fbbf24','#f59e0b25'],
              ['5','Production Incident — You\'re on-call','A real incident, generated from your past decisions and company health. Symptoms, logs, business impact. RCA, fix plan, rollback, postmortem.','AI-generated · SEV-1 / SEV-2','#ef444415','#f87171','#ef444430'],
              ['6','Evaluation — Scored on everything','Design quality, code quality, incident handling. Company health updated. Career progression calculated. History saved permanently.','Weighted score · Career impact · Permanent','#22c55e15','#4ade80','#22c55e25'],
            ].map(([num, title, desc, tag, bg, color, border]) => (
              <div key={num as string} className="phase-entry" data-phase>
                <div><div className="ph-icon">{num as string}</div></div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px', marginBottom: '.35rem' }}>{title as string}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{desc as string}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: '.65rem', fontSize: 11, padding: '2px 10px', borderRadius: 20, background: bg as string, color: color as string, border: `1px solid ${border as string}` }}>{tag as string}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="reveal" style={{ width: '100%', maxWidth: 680, padding: '0 2rem 8rem', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg,var(--navy3) 0%,var(--navy2) 100%)', border: '1px solid var(--border2)', borderRadius: 20, padding: '3.5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'radial-gradient(ellipse,#4f7cff18,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, letterSpacing: '-.04em', marginBottom: '.75rem' }}>Ready to start working?</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: '2rem' }}>Join a virtual company. Ship real features. Handle real incidents. Build a career that actually reflects how you think.</div>
            <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => router.push('/auth')}>
              Create your account →
            </button>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: '.85rem' }}>No credit card. No skill selection. No interviews. Just work.</div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ width: '100%', borderTop: '1px solid var(--border)', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: .6 }}>
            <img src="/logo.png" alt="B" style={{ width: 20, height: 20, borderRadius: 4 }} onError={e => (e.currentTarget.style.display = 'none')} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Bitora</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Engineering Career Simulation</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy','Terms','Contact'].map(l => <span key={l} className="footer-link">{l}</span>)}
          </div>
        </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        // Stars
        const c = document.getElementById('stars-container')
        if(c) for(let i=0;i<120;i++){
          const s=document.createElement('div')
          const sz=Math.random()*2+1
          s.style.cssText='position:absolute;border-radius:50%;background:#fff;width:'+sz+'px;height:'+sz+'px;left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;--o1:'+(Math.random()*.5+.1).toFixed(2)+';--o2:'+(Math.random()*.15).toFixed(2)+';animation:twinkle '+(Math.random()*4+2).toFixed(1)+'s ease-in-out '+(Math.random()*6).toFixed(1)+'s infinite'
          c.appendChild(s)
        }
        // Nav scroll
        const nav=document.getElementById('main-nav')
        window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled',window.scrollY>40),{passive:true})
        // Reveal
        const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -40px 0px'})
        document.querySelectorAll('.reveal').forEach(r=>ro.observe(r))
        // Phases stagger
        document.querySelectorAll('[data-phase]').forEach((el,i)=>{
          const po=new IntersectionObserver(es=>{if(es[0].isIntersecting){setTimeout(()=>el.classList.add('visible'),i*80);po.unobserve(el)}},{threshold:.2})
          po.observe(el)
        })
        // Features stagger
        document.querySelectorAll('.feat-card').forEach((el,i)=>{
          el.style.opacity='0';el.style.transform='translateY(12px)';el.style.transition='opacity .5s '+(i*.06)+'s ease,transform .5s '+(i*.06)+'s ease,background .2s'
          const fo=new IntersectionObserver(es=>{if(es[0].isIntersecting){el.style.opacity='1';el.style.transform='none';fo.unobserve(el)}},{threshold:.15})
          fo.observe(el)
        })
      `}} />
    </div>
  )
}
