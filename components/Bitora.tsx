'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── Tokens ───────────────────────────────────────────────────
const LEVELS  = ['Junior','Mid-Level','Senior','Staff','Principal']
const PHASES  = ['PRD','Design','Implementation','Code Review','Incident','Evaluation']
const PHASE_ICONS = ['📋','🏗','💻','🔍','🚨','⭐']

function getToken() { return typeof window!=='undefined' ? localStorage.getItem('bt') : null }
async function api(path:string,opts:any={}) {
  const token = getToken()
  const r = await fetch(path, {
    ...opts,
    headers: {'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...opts.headers},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error||'Request failed')
  return d
}

// ─── Design tokens ────────────────────────────────────────────
const S: Record<string,any> = {
  // Sidebar
  sidebar: { width:220, bg:'var(--bg2)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, height:'100vh', position:'sticky' as const, top:0 },
  // Input
  input: { width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--r-md)', padding:'.65rem 1rem', color:'var(--text)', fontSize:13, outline:'none', transition:'border .15s, box-shadow .15s', fontFamily:'var(--font)' },
  // Textarea
  textarea: { width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--r-md)', padding:'.75rem 1rem', color:'var(--text)', fontSize:13, outline:'none', resize:'vertical' as const, fontFamily:'var(--font)', lineHeight:1.65, transition:'border .15s' },
  // Section header
  pageHeader: { marginBottom:'2rem', paddingBottom:'1.5rem', borderBottom:'1px solid var(--border)' },
}

// ─── Primitives ───────────────────────────────────────────────
function Btn({ children, onClick, disabled, full, ghost, sm, xs, danger, primary, style={} }:any) {
  const base: any = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
    borderRadius: xs ? 'var(--r-sm)' : 'var(--r-md)',
    fontSize: xs ? 11 : sm ? 12 : 13,
    fontWeight: 500, fontFamily:'var(--font)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? .45 : 1,
    width: full ? '100%' : 'auto',
    transition: 'all .15s var(--ease)',
    letterSpacing: '-.01em',
    padding: xs ? '.3rem .7rem' : sm ? '.45rem 1rem' : '.6rem 1.25rem',
    border: 'none',
  }
  if (danger)   Object.assign(base, { background:'var(--red-dim)',   color:'var(--red)',   border:'1px solid rgba(240,82,82,0.25)' })
  else if (ghost) Object.assign(base, { background:'transparent',     color:'var(--text2)', border:'1px solid var(--border2)' })
  else if (primary) Object.assign(base, { background:'var(--accent)', color:'#fff', boxShadow:'0 0 20px var(--accent-glow)' })
  else          Object.assign(base, { background:'var(--accent)',     color:'#fff' })

  return (
    <button onClick={onClick} disabled={disabled} style={{...base,...style}}
      onMouseEnter={e=>{ if(!disabled){ const el=e.currentTarget as HTMLElement; el.style.opacity='.85'; el.style.transform='translateY(-1px)' }}}
      onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.opacity=disabled?'.45':'1'; el.style.transform='translateY(0)' }}
    >{children}</button>
  )
}

function Badge({ color='gray', children, dot }:any) {
  const colors: Record<string,string> = { gray:'tag-gray', green:'tag-green', red:'tag-red', amber:'tag-amber', blue:'tag-accent', purple:'tag-purple', cyan:'tag-cyan' }
  return (
    <span className={`tag ${colors[color]||'tag-gray'}`}>
      {dot && <span style={{width:5,height:5,borderRadius:'50%',background:'currentColor',display:'inline-block'}}/>}
      {children}
    </span>
  )
}

function Card({ title, badge, children, style={}, action }:any) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', ...style }}>
      {(title||badge||action) && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom: children ? '1px solid var(--border)' : 'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {title && <div style={{ fontSize:13, fontWeight:600, letterSpacing:'-.02em', color:'var(--text)' }}>{title}</div>}
            {badge}
          </div>
          {action}
        </div>
      )}
      {children && <div style={{ padding:'1.5rem' }}>{children}</div>}
    </div>
  )
}

function StatCard({ label, value, color, sub, icon, trend }:any) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:500 }}>{label}</div>
        {icon && <span style={{ fontSize:14, opacity:.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize:26, fontWeight:700, color: color||'var(--text)', letterSpacing:'-.04em', fontFamily:'var(--font-display)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{sub}</div>}
      {trend && <div style={{ fontSize:11, color: trend>0?'var(--green)':'var(--red)', marginTop:2 }}>{trend>0?'↑':'↓'} {Math.abs(trend)}%</div>}
    </div>
  )
}

function Input({ value, onChange, type='text', placeholder='', disabled=false, onKeyDown }:any) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={S.input} onKeyDown={onKeyDown}
      onFocus={e=>{ e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)' }}
      onBlur={e=>{  e.target.style.borderColor='var(--border2)'; e.target.style.boxShadow='none' }}
    />
  )
}

function Textarea({ value, onChange, placeholder='', rows=5, disabled=false }:any) {
  return (
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled} style={S.textarea}
      onFocus={e=>{ e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-dim)' }}
      onBlur={e=>{  e.target.style.borderColor='var(--border2)'; e.target.style.boxShadow='none' }}
    />
  )
}

function Spinner({ size=16 }:any) {
  return <div style={{ width:size, height:size, border:`2px solid var(--border2)`, borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
}

function Divider({ label }:any) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'1rem 0' }}>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
      {label && <span style={{ fontSize:11, color:'var(--text3)' }}>{label}</span>}
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
    </div>
  )
}

function ScoreRing({ score, size=52 }:any) {
  const c = score>=75?'var(--green)':score>=55?'var(--accent)':score>0?'var(--amber)':'var(--text4)'
  const r = (size-6)/2, circ = 2*Math.PI*r, dash = circ*(score/100)
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border2)" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={3} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray .6s var(--ease)' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:c, fontFamily:'var(--font-display)' }}>{score||'—'}</div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ user, company, page, nav, logout }:any) {
  const items = [
    { id:'dashboard',   label:'Dashboard',    icon:'▣' },
    { id:'task',        label:'Active Task',  icon:'◎' },
    { id:'history',     label:'History',      icon:'◷' },
    { id:'profile',     label:'My Profile',   icon:'◈' },
    { id:'marketplace', label:'Companies',    icon:'⬡' },
    { id:'company',     label:'My Company',   icon:'◉' },
    { id:'settings',    label:'Settings',     icon:'◌' },
  ]
  return (
    <div style={S.sidebar}>
      {/* Logo */}
      <div style={{ padding:'1.25rem 1.25rem 1rem', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <img src="/logo.png" alt="Bitora" style={{ width:28, height:28, borderRadius:'var(--r-md)', flexShrink:0 }} onError={e=>(e.currentTarget.style.display='none')} />
          <div>
            <div style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.02em' }}>Bitora</div>
            <div style={{ fontSize:9, color:'var(--text4)', letterSpacing:'.1em', textTransform:'uppercase', marginTop:1 }}>Engineering OS</div>
          </div>
        </div>
      </div>

      {/* Company pill */}
      {company && (
        <div style={{ margin:'1rem 1rem .5rem', padding:'.6rem .85rem', background:'var(--bg3)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
          <div style={{ fontSize:10, color:'var(--text3)', marginBottom:2 }}>Working at</div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{company.name}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{user?.role}</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:'.5rem 0', overflowY:'auto' }}>
        {items.map(item => {
          const active = page===item.id
          return (
            <div key={item.id} onClick={()=>nav(item.id)}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'.55rem 1.25rem', color:active?'var(--text)':'var(--text3)', background:active?'var(--bg3)':'transparent', borderRight:active?'2px solid var(--accent)':'2px solid transparent', cursor:'pointer', fontSize:13, transition:'all .12s', fontWeight:active?500:400, margin:'1px 0' }}
              onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background='var(--bg3)'; (e.currentTarget as HTMLElement).style.color='var(--text2)' }}
              onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color=active?'var(--text)':'var(--text3)' }}
            >
              <span style={{ fontSize:11, width:16, textAlign:'center', fontFamily:'var(--font-mono)', opacity:active?1:.5 }}>{item.icon}</span>
              {item.label}
            </div>
          )
        })}
      </nav>

      {/* User chip */}
      <div style={{ padding:'.75rem 1rem', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'.5rem .75rem', borderRadius:'var(--r-md)', cursor:'pointer', transition:'background .15s' }}
          onClick={()=>nav('settings')}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg3)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}
        >
          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase()||'?'}
          </div>
          <div style={{ overflow:'hidden', flex:1 }}>
            <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>{LEVELS[user?.level||0]}</div>
          </div>
        </div>
        <div style={{ marginTop:4 }}>
          <Btn ghost xs full onClick={logout}>Sign out</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding Modal ─────────────────────────────────────────
function OnboardingModal({ user, onDone }: any) {
  const [step, setStep] = useState(0)
  const [expLevel, setExpLevel] = useState<string>('')
  const [timeAvail, setTimeAvail] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const steps = [
    {
      title: 'What\'s your experience level?',
      sub: 'We\'ll adjust task complexity to match you',
      options: [
        { value: 'beginner',     label: 'Beginner',     desc: 'Learning the basics, < 1 year', icon: '🌱' },
        { value: 'intermediate', label: 'Intermediate',  desc: '1–3 years, building real features', icon: '⚡' },
        { value: 'advanced',     label: 'Advanced',      desc: '3+ years, production experience', icon: '🔥' },
      ],
      selected: expLevel,
      onSelect: (v: string) => { setExpLevel(v); setTimeout(() => setStep(1), 300) },
    },
    {
      title: 'How much time do you have?',
      sub: 'Tasks will be scoped to fit your available time',
      options: [
        { value: '30min', label: '30 minutes', desc: 'Quick fix or small improvement', icon: '⚡' },
        { value: '1hr',   label: '1 hour',     desc: 'A proper feature or task', icon: '◎' },
        { value: '2hrs',  label: '2 hours',    desc: 'A full engineering challenge', icon: '🏗' },
      ],
      selected: timeAvail,
      onSelect: (v: string) => setTimeAvail(v),
    },
  ]

  const current = steps[step]

  async function finish() {
    if (!expLevel || !timeAvail) return
    setSaving(true)
    try {
      await api('/api/user/me', { method: 'PATCH', body: { experienceLevel: expLevel, availableTime: timeAvail, onboardingDone: true } })
      onDone({ experienceLevel: expLevel, availableTime: timeAvail, onboardingDone: true })
    } catch { }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(8px)', padding: '2rem' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--r-xl)', padding: '2.5rem', maxWidth: 520, width: '100%', animation: 'fadeUp .35s var(--ease)' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '2rem' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--border)', transition: 'background .3s' }} />
          ))}
        </div>

        <div style={{ marginBottom: '.5rem', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>
          Step {step + 1} of {steps.length}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-.03em', marginBottom: '.5rem' }}>{current.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: '1.75rem' }}>{current.sub}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
          {current.options.map(opt => {
            const selected = current.selected === opt.value
            return (
              <div key={opt.value} onClick={() => current.onSelect(opt.value)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: 'var(--r-lg)', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`, background: selected ? 'var(--accent-dim)' : 'var(--bg3)', cursor: 'pointer', transition: 'all .15s var(--ease)', boxShadow: selected ? '0 0 0 1px var(--accent-dim) inset' : 'none' }}
                onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border3)' }}
                onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)' }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--text)' : 'var(--text2)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{opt.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`, background: selected ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                  {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '.75rem' }}>
          {step > 0 && <Btn ghost onClick={() => setStep(s => s - 1)}>← Back</Btn>}
          {step < steps.length - 1
            ? <Btn primary full onClick={() => current.selected && setStep(s => s + 1)} disabled={!current.selected}>Next →</Btn>
            : <Btn primary full onClick={finish} disabled={!timeAvail || saving}>{saving ? <><Spinner size={14} /> Saving...</> : 'Start working →'}</Btn>
          }
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────
function DashboardPage({ user, company, activeTask, taskHistory, onGenerate, nav, loading, onChangePrefs }: any) {
  const completedCount = taskHistory?.length||0
  const avgScore = completedCount ? Math.round(taskHistory.reduce((a:number,t:any)=>a+(t.finalScore||0),0)/completedCount) : 0
  const level = LEVELS[user?.level||0]

  return (
    <div style={{ padding:'2rem', maxWidth:900, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      {/* Header */}
      <div style={{ ...S.pageHeader, display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>
            Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </div>
          <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>
            {company ? `${level} ${user?.role} at ${company.name}` : 'Join a company to start your simulation'}
          </div>
        </div>
        {company && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            {/* Preferences chip */}
            {user?.experienceLevel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '.35rem .85rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}
                onClick={onChangePrefs}
                title="Click to change preferences"
              >
                <span>{user.experienceLevel === 'beginner' ? '🌱' : user.experienceLevel === 'intermediate' ? '⚡' : '🔥'}</span>
                <span style={{ textTransform: 'capitalize' }}>{user.experienceLevel}</span>
                <span style={{ color: 'var(--text4)' }}>·</span>
                <span>{user.availableTime || '1hr'}</span>
                <span style={{ fontSize: 10, color: 'var(--text4)', marginLeft: 2 }}>✎</span>
              </div>
            )}
            <Btn primary onClick={onGenerate} disabled={loading || !!activeTask}>
              {loading ? <><Spinner size={14} /> Generating...</> : activeTask ? '⟳ Task in progress' : '+ New task'}
            </Btn>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard label="Performance" value={user?.performanceScore||0} sub="Overall score" icon="⚡" color={user?.performanceScore>=75?'var(--green)':user?.performanceScore>=50?'var(--accent)':'var(--text)'} />
        <StatCard label="Career Level" value={level} sub={`Level ${(user?.level||0)+1} of 5`} icon="◈" />
        <StatCard label="Tasks Done" value={completedCount} sub={`${user?.incidentsHandled||0} incidents handled`} icon="✓" />
        <StatCard label="Avg Score" value={avgScore||'—'} sub="Across all tasks" icon="◎" color={avgScore>=75?'var(--green)':avgScore>=55?'var(--accent)':avgScore>0?'var(--amber)':'var(--text3)'} />
      </div>

      {/* Active task */}
      {activeTask ? (
        <Card title="Active Task" badge={<Badge color="blue" dot>In progress</Badge>} action={<Btn sm onClick={()=>nav('task')}>Continue →</Btn>}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:15, fontWeight:600, letterSpacing:'-.02em', marginBottom:6 }}>{activeTask.title}</div>
              <div style={{ display:'flex', gap:6, marginBottom:'.6rem', flexWrap:'wrap' }}>
                {activeTask.difficulty && <Badge color={activeTask.difficulty==='beginner'?'green':activeTask.difficulty==='advanced'?'red':'amber'}>{activeTask.difficulty}</Badge>}
                {activeTask.estimatedMinutes && <Badge color="gray">⏱ {activeTask.estimatedMinutes<60?`${activeTask.estimatedMinutes}min`:`${activeTask.estimatedMinutes/60}hr`}</Badge>}
                <Badge color="gray">{activeTask.role}</Badge>
              </div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:'1rem' }}>{activeTask.desc?.slice(0,100)}...</div>
              {/* Phase progress */}
              <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                {PHASES.map((ph,i) => {
                  const done = i < activeTask.phase
                  const active = i === activeTask.phase
                  return (
                    <div key={ph} style={{ display:'flex', alignItems:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, background:done?'var(--green)':active?'var(--accent)':'var(--bg4)', color:done||active?'#fff':'var(--text4)', boxShadow:active?'0 0 12px var(--accent-glow)':'none', border:active?'none':done?'none':'1px solid var(--border)', transition:'all .3s' }}>
                          {done ? '✓' : i+1}
                        </div>
                        <div style={{ fontSize:9, color:active?'var(--accent)':done?'var(--green)':'var(--text4)', whiteSpace:'nowrap', fontWeight:active?500:400 }}>{ph}</div>
                      </div>
                      {i<PHASES.length-1 && <div style={{ width:20, height:2, background:done?'var(--green)':'var(--border)', marginBottom:14, transition:'background .3s' }} />}
                    </div>
                  )
                })}
              </div>
            </div>
            <ScoreRing score={activeTask.finalScore||0} size={60} />
          </div>
        </Card>
      ) : company ? (
        <div style={{ background:'var(--bg2)', border:'1px dashed var(--border2)', borderRadius:'var(--r-lg)', padding:'3rem 2rem', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:'1rem', opacity:.5 }}>◎</div>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>No active task</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginBottom:'1.5rem' }}>Generate a task to start your simulation</div>
          <Btn primary onClick={onGenerate} disabled={loading}>
            {loading ? <><Spinner size={14}/> Generating task...</> : '+ Generate task'}
          </Btn>
        </div>
      ) : (
        <div style={{ background:'var(--bg2)', border:'1px dashed var(--border2)', borderRadius:'var(--r-lg)', padding:'3rem 2rem', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:'1rem', opacity:.5 }}>⬡</div>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>Join a company first</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginBottom:'1.5rem' }}>Browse companies and pick your role</div>
          <Btn onClick={()=>nav('marketplace')}>Browse companies</Btn>
        </div>
      )}

      {/* Recent history */}
      {taskHistory?.length > 0 && (
        <div style={{ marginTop:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ fontSize:13, fontWeight:600 }}>Recent tasks</div>
            <Btn ghost sm onClick={()=>nav('history')}>View all</Btn>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {taskHistory.slice(0,3).map((t:any) => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.85rem 1.25rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', gap:'1rem' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{t.role}</div>
                </div>
                <ScoreRing score={t.finalScore||0} size={40} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Marketplace ──────────────────────────────────────────────
function MarketplacePage({ companies, user, filterRole, setFilterRole, onApply, loading, nav }:any) {
  const [viewing, setViewing] = useState<any>(null)
  const allRoles = ['All', ...Array.from(new Set(companies.flatMap((c:any)=>c.roles||[])))]

  const filtered = filterRole==='All' ? companies : companies.filter((c:any)=>c.roles?.includes(filterRole))

  const sev = (v:number) => v>=75?'green':v>=50?'amber':'red'

  if (viewing) return (
    <div style={{ padding:'2rem', maxWidth:800, margin:'0 auto', animation:'fadeUp .3s var(--ease)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'2rem' }}>
        <Btn ghost sm onClick={()=>setViewing(null)}>← Back</Btn>
        <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--font-display)' }}>{viewing.name}</div>
        <Badge color="gray">{viewing.type}</Badge>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        {[['Reputation',viewing.reputation],['Reliability',viewing.reliability],['Velocity',viewing.velocity],['Security Risk',viewing.securityRisk]].map(([label,val]:any)=>(
          <div key={label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1rem 1.25rem' }}>
            <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{label}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${val}%`, height:'100%', background:`var(--${sev(label==='Security Risk'?100-val:val)})`, borderRadius:3 }} />
              </div>
              <span style={{ fontSize:12, fontWeight:600, fontFamily:'var(--font-mono)', color:'var(--text2)' }}>{val}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:'1.5rem', padding:'1rem 1.25rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)' }}>
        {viewing.description}
      </div>

      <Card title="Open Roles">
        <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
          {(viewing.roles||[]).map((role:string)=>(
            <div key={role} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.75rem 1rem', background:'var(--bg3)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, fontWeight:500 }}>{role}</span>
              {user?.companyId===viewing.id && user?.role===role
                ? <Badge color="green" dot>Current role</Badge>
                : <Btn sm onClick={()=>onApply(viewing.id,role)} disabled={loading}>{loading?<Spinner size={12}/>:'Apply'}</Btn>
              }
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  return (
    <div style={{ padding:'2rem', maxWidth:1000, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      <div style={{ ...S.pageHeader, display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>Companies</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>6 virtual companies · pick your role</div>
        </div>
        <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
          {allRoles.map((r:string)=>(
            <button key={r} onClick={()=>setFilterRole(r)} style={{ padding:'.35rem .85rem', borderRadius:'var(--r-md)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', transition:'all .15s', background:filterRole===r?'var(--accent)':'var(--bg3)', color:filterRole===r?'#fff':'var(--text3)', border:filterRole===r?'none':'1px solid var(--border)' }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
        {filtered.map((c:any)=>{
          const isMine = user?.companyId===c.id
          return (
            <div key={c.id} onClick={()=>setViewing(c)}
              style={{ background:'var(--bg2)', border:`1px solid ${isMine?'var(--accent-border)':'var(--border)'}`, borderRadius:'var(--r-lg)', padding:'1.5rem', cursor:'pointer', transition:'all .18s var(--ease)', position:'relative', overflow:'hidden' }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border3)'; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 8px 32px rgba(0,0,0,.5)' }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=isMine?'var(--accent-border)':'var(--border)'; el.style.transform='translateY(0)'; el.style.boxShadow='none' }}
            >
              {isMine && <div style={{ position:'absolute', top:12, right:12 }}><Badge color="blue" dot>Current</Badge></div>}
              <div style={{ fontSize:16, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:4, letterSpacing:'-.02em' }}>{c.name}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:'1.25rem' }}>{c.type}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem', marginBottom:'1rem' }}>
                {[['Rep',c.reputation],['Rel',c.reliability],['Vel',c.velocity],['Risk',c.securityRisk]].map(([k,v]:any)=>(
                  <div key={k} style={{ background:'var(--bg3)', borderRadius:'var(--r-sm)', padding:'.4rem .6rem' }}>
                    <div style={{ fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:`var(--${sev(k==='Risk'?100-v:v)})` }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {(c.roles||[]).slice(0,3).map((r:string)=><Badge key={r} color="gray">{r}</Badge>)}
                {c.roles?.length>3 && <Badge color="gray">+{c.roles.length-3}</Badge>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── My Company ───────────────────────────────────────────────
function MyCompanyPage({ company, user }:any) {
  if (!company) return (
    <div style={{ padding:'2rem', textAlign:'center', color:'var(--text3)', paddingTop:'4rem' }}>
      <div style={{ fontSize:32, marginBottom:'1rem' }}>⬡</div>
      <div style={{ fontSize:15, fontWeight:500 }}>You're not part of any company</div>
    </div>
  )
  const metrics = [
    { label:'Reputation',    value:company.reputation,  color: company.reputation>=70?'var(--green)':company.reputation>=50?'var(--amber)':'var(--red)' },
    { label:'Reliability',   value:company.reliability,  color: company.reliability>=70?'var(--green)':company.reliability>=50?'var(--amber)':'var(--red)' },
    { label:'Velocity',      value:company.velocity,     color: company.velocity>=70?'var(--green)':company.velocity>=50?'var(--amber)':'var(--red)' },
    { label:'Tech Debt',     value:company.techDebt,     color: company.techDebt<=30?'var(--green)':company.techDebt<=60?'var(--amber)':'var(--red)' },
    { label:'Security Risk', value:company.securityRisk, color: company.securityRisk<=30?'var(--green)':company.securityRisk<=60?'var(--amber)':'var(--red)' },
  ]
  return (
    <div style={{ padding:'2rem', maxWidth:800, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      <div style={S.pageHeader}>
        <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>{company.name}</div>
        <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>{company.type} · {user?.role}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {metrics.map(m=>(
          <div key={m.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.25rem 1.5rem' }}>
            <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{m.label}</div>
            <div style={{ fontSize:28, fontWeight:700, color:m.color, fontFamily:'var(--font-display)', marginBottom:6 }}>{m.value}</div>
            <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${m.value}%`, height:'100%', background:m.color, borderRadius:2, transition:'width .6s var(--ease)' }} />
            </div>
          </div>
        ))}
      </div>
      <Card title="About">
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.75 }}>{company.description}</div>
      </Card>
    </div>
  )
}

// ─── History ──────────────────────────────────────────────────
function HistoryPage({ tasks }:any) {
  return (
    <div style={{ padding:'2rem', maxWidth:800, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      <div style={S.pageHeader}>
        <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>Task History</div>
        <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>{tasks?.length||0} completed tasks</div>
      </div>
      {!tasks?.length ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>
          <div style={{ fontSize:28, marginBottom:'1rem', opacity:.4 }}>◷</div>
          <div>No completed tasks yet</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
          {tasks.map((t:any)=>(
            <div key={t.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1.25rem', transition:'border-color .15s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border2)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}
            >
              <ScoreRing score={t.finalScore||0} size={48} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, letterSpacing:'-.01em', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{t.role}</div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
                {t.phaseData?.design?.review?.score!=null && <Badge color="gray">Design {t.phaseData.design.review.score}</Badge>}
                {t.phaseData?.codeReview?.score!=null && <Badge color={t.phaseData.codeReview.accepted?'green':'red'}>Code {t.phaseData.codeReview.score}</Badge>}
                {t.phaseData?.incidentEval?.overallScore!=null && <Badge color="purple">Inc {t.phaseData.incidentEval.overallScore}</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────
function ProfilePage({ user, showToast }:any) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const scoreColor = (s:number) => s>=75?'var(--green)':s>=55?'var(--accent)':s>0?'var(--amber)':'var(--text3)'
  const confColor  = (c:string) => c==='High'?'green':c==='Medium'?'amber':'gray'

  useEffect(() => {
    api('/api/user/profile').then(setProfile).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const toggle = async () => {
    if (!profile) return
    const nv = !profile.isPublic
    await api('/api/user/profile',{method:'PATCH',body:{publicProfile:nv}})
    setProfile({...profile,isPublic:nv})
    showToast(nv?'Profile is now public':'Profile set to private')
  }

  const copy = () => { navigator.clipboard.writeText(`${window.location.origin}/profile/${user.id}`); showToast('Link copied!') }

  if (loading) return <div style={{ padding:'3rem', display:'flex', justifyContent:'center' }}><Spinner size={20}/></div>
  if (!profile) return <div style={{ padding:'3rem', color:'var(--text3)', textAlign:'center' }}>Failed to load profile</div>

  const lvlColors: Record<string,string> = { 'Beginner':'var(--text3)','Junior':'var(--accent)','Strong Junior':'var(--purple)','Job-Ready Junior':'var(--green)','Mid-Level Simulation':'var(--amber)' }
  const lvlC = lvlColors[profile.levelName]||'var(--accent)'

  return (
    <div style={{ padding:'2rem', maxWidth:860, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      {/* Header */}
      <div style={{ ...S.pageHeader, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>Developer Profile</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Based on verified simulation performance</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {profile.isPublic && <Btn ghost sm onClick={copy}>Copy link</Btn>}
          <Btn ghost sm onClick={toggle}>{profile.isPublic?'🔒 Make private':'🌐 Make public'}</Btn>
        </div>
      </div>

      {/* Hero card */}
      <div style={{ background:'var(--bg2)', border:`1px solid ${profile.readinessScore>=68?'var(--accent-border)':'var(--border)'}`, borderRadius:'var(--r-xl)', padding:'2rem', marginBottom:'1.25rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-40, width:200, height:200, background:'radial-gradient(ellipse,var(--accent-dim),transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#fff', flexShrink:0 }}>{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.02em' }}>{user.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:3 }}>{profile.user.role||'Engineer'}{profile.user.company?` at ${profile.user.company}`:''}</div>
              <div style={{ marginTop:8 }}><span className="tag tag-accent" style={{ background:lvlC+'20', color:lvlC, borderColor:lvlC+'40' }}>{profile.levelName}</span></div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:44, fontWeight:800, color:scoreColor(profile.readinessScore), letterSpacing:'-.05em', fontFamily:'var(--font-display)', lineHeight:1 }}>{profile.readinessScore||'—'}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Production Readiness</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:6, maxWidth:180, lineHeight:1.5 }}>{profile.readinessLabel}</div>
          </div>
        </div>
        {/* Progress */}
        <div style={{ marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>Profile completion</span>
            <span style={{ fontSize:11, fontWeight:600, color:'var(--text2)' }}>{profile.profileCompletion}%</span>
          </div>
          <div style={{ background:'var(--border)', borderRadius:3, height:4, overflow:'hidden' }}>
            <div style={{ width:`${profile.profileCompletion}%`, height:'100%', background:'var(--accent)', borderRadius:3, transition:'width .8s var(--ease)' }} />
          </div>
          <div style={{ marginTop:8, fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
            Verified by Bitora Engineering Simulation
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'.75rem', marginBottom:'1.25rem' }}>
        {[
          ['Tasks',profile.metrics.tasksCompleted,'◎'],
          ['Avg Score',profile.metrics.avgFinalScore?`${profile.metrics.avgFinalScore}/100`:'—','⭐'],
          ['Design',profile.metrics.avgDesignScore?`${profile.metrics.avgDesignScore}/100`:'—','🏗'],
          ['Code',profile.metrics.avgCodeScore?`${profile.metrics.avgCodeScore}/100`:'—','💻'],
          ['Incident',profile.metrics.avgIncidentScore?`${profile.metrics.avgIncidentScore}/100`:'—','🚨'],
          ['RCA',profile.metrics.rcaAccuracy!==null?`${profile.metrics.rcaAccuracy}%`:'—','◈'],
        ].map(([l,v,ic])=>(
          <div key={l as string} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'.9rem 1rem' }}>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4, display:'flex', gap:4, alignItems:'center' }}><span>{ic}</span>{l}</div>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <Card title="Skill Analysis" style={{ marginBottom:'1.25rem' }} badge={<Badge color="gray">From verified work only</Badge>}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
          {profile.skills.map((s:any)=>(
            <div key={s.name}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{s.name}</span>
                  <Badge color={confColor(s.confidence) as any}>{s.confidence}</Badge>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:scoreColor(s.score), fontFamily:'var(--font-display)' }}>{s.score>0?`${s.score}/100`:'—'}</span>
              </div>
              <div style={{ background:'var(--border)', borderRadius:3, height:5, overflow:'hidden', marginBottom:4 }}>
                <div style={{ width:`${s.score}%`, height:'100%', background:scoreColor(s.score), borderRadius:3, transition:'width .8s var(--ease)' }} />
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', lineHeight:1.5 }}>
                {s.evidence ? `${s.evidence} — ${s.note}` : <em>Not enough evidence yet — complete tasks to unlock</em>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* HR Summary */}
      <Card title="HR Summary" style={{ marginBottom:'1.25rem' }} badge={<Badge color="gray">For recruiters</Badge>}>
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.8, marginBottom:'1.25rem' }}>
          {user.name} has completed {profile.metrics.tasksCompleted} engineering simulation(s) on Bitora with a production readiness score of {profile.readinessScore}/100.
          {profile.metrics.avgFinalScore>0?` Average task score: ${profile.metrics.avgFinalScore}/100.`:''}
          {' '}All scores are generated by AI reviewers using real engineering standards.{' '}
          <strong style={{ color:'var(--text)' }}>This is verified simulation experience — not employment at a real company.</strong>
        </div>
        {profile.strengths.length>0 && (
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--green)', marginBottom:6, fontWeight:500 }}>Strengths</div>
            {profile.strengths.map((s:string)=>(
              <div key={s} style={{ display:'flex', gap:8, marginBottom:5, fontSize:13, color:'var(--text2)' }}>
                <span style={{ color:'var(--green)', flexShrink:0 }}>✓</span>{s}
              </div>
            ))}
          </div>
        )}
        {profile.weaknesses.length>0 && (
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--amber)', marginBottom:6, fontWeight:500 }}>Areas for Improvement</div>
            {profile.weaknesses.map((w:string)=>(
              <div key={w} style={{ display:'flex', gap:8, marginBottom:5, fontSize:13, color:'var(--text2)' }}>
                <span style={{ color:'var(--amber)', flexShrink:0 }}>△</span>{w}
              </div>
            ))}
          </div>
        )}
        <div style={{ padding:'.85rem 1rem', background:'var(--accent-dim)', border:'1px solid var(--accent-border)', borderRadius:'var(--r-md)', fontSize:12, color:'#8b9fff', lineHeight:1.6 }}>
          <strong>Recruiter note:</strong> {profile.readinessLabel}. Every score is derived from actual performance, not self-assessment.
        </div>
      </Card>

      {/* Evidence */}
      {profile.evidence.length>0 && (
        <Card title="Verified Work Evidence" style={{ marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
            {profile.evidence.map((e:any)=>(
              <div key={e.id} style={{ padding:'1rem', background:'var(--bg3)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{e.title}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{e.role} at {e.company}</div>
                  </div>
                  <ScoreRing score={e.finalScore||0} size={40} />
                </div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {e.designScore!=null && <Badge color="gray">Design: {e.designScore}</Badge>}
                  {e.codeScore!=null && <Badge color={e.codeAccepted?'green':'red'}>Code: {e.codeScore} {e.codeAccepted?'✓':'✗'}</Badge>}
                  {e.incidentScore!=null && <Badge color="purple">Incident: {e.incidentScore} {e.rcaCorrect?'(RCA ✓)':'(RCA ✗)'}</Badge>}
                  {e.tags?.map((t:string)=><Badge key={t} color="gray">{t}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {profile.isPublic && (
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500 }}>Public profile</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2, fontFamily:'var(--font-mono)' }}>{typeof window!=='undefined'?`${window.location.origin}/profile/${user.id}`:`/profile/${user.id}`}</div>
          </div>
          <Btn sm onClick={copy}>Copy link</Btn>
        </div>
      )}
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsPage({ user, onSave, onLeave, logout }:any) {
  const [name, setName] = useState(user?.name||'')
  const [country, setCountry] = useState(user?.country||'')
  const [saving, setSaving] = useState(false)

  return (
    <div style={{ padding:'2rem', maxWidth:640, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      <div style={S.pageHeader}>
        <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>Settings</div>
        <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Manage your account and preferences</div>
      </div>
      <Card title="Profile" style={{ marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6, fontWeight:500 }}>Full name</div>
            <Input value={name} onChange={setName} placeholder="Your name" />
          </div>
          <div>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6, fontWeight:500 }}>Email</div>
            <Input value={user?.email||''} onChange={()=>{}} disabled placeholder="Email" />
          </div>
          <div>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6, fontWeight:500 }}>Country</div>
            <Input value={country} onChange={setCountry} placeholder="Your country" />
          </div>
          <Btn primary onClick={async()=>{ setSaving(true); await onSave({name,country}); setSaving(false) }} disabled={saving}>
            {saving?<><Spinner size={13}/>Saving...</>:'Save changes'}
          </Btn>
        </div>
      </Card>

      {user?.companyId && (
        <Card title="Company" style={{ marginBottom:'1.25rem' }}>
          <div style={{ fontSize:13, color:'var(--text2)', marginBottom:'1rem' }}>You are currently at <strong style={{ color:'var(--text)' }}>{user.role}</strong>. Leaving will reset your active task.</div>
          <Btn danger onClick={onLeave}>Leave company</Btn>
        </Card>
      )}

      <Card title="Account">
        <Btn ghost full onClick={logout}>Sign out</Btn>
      </Card>
    </div>
  )
}

// ─── Task Phase components ─────────────────────────────────────
function PhaseHeader({ phase, task }:any) {
  return (
    <div style={{ marginBottom:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1rem' }}>
        <div style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'var(--accent-dim)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{PHASE_ICONS[phase]}</div>
        <div>
          <div style={{ fontSize:11, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:500 }}>Phase {phase+1} of {PHASES.length}</div>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.02em' }}>{PHASES[phase]}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:0 }}>
        {PHASES.map((_,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:i<phase?'var(--green)':i===phase?'var(--accent)':'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:i<=phase?'#fff':'var(--text4)', flexShrink:0, boxShadow:i===phase?'0 0 8px var(--accent-glow)':'none', transition:'all .3s' }}>
              {i<phase?'✓':i+1}
            </div>
            {i<PHASES.length-1 && <div style={{ width:24, height:2, background:i<phase?'var(--green)':'var(--border)', transition:'background .4s' }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewResult({ review, type }:any) {
  if (!review) return null
  const ok = review.accepted||review.rcaCorrect
  const score = review.score||review.overallScore||0
  return (
    <div style={{ background:ok?'var(--green-dim)':'var(--red-dim)', border:`1px solid ${ok?'rgba(16,216,138,0.25)':'rgba(240,82,82,0.25)'}`, borderRadius:'var(--r-lg)', padding:'1.25rem', marginTop:'1rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <span style={{ fontSize:16 }}>{ok?'✓':'✗'}</span>
        <div style={{ fontSize:13, fontWeight:600, color:ok?'var(--green)':'var(--red)' }}>
          {ok?'Accepted':'Rejected'} — Score: {score}/100
        </div>
      </div>
      {review.summary && <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7, marginBottom:8 }}>{review.summary}</div>}
      {review.issues?.length>0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {review.issues.slice(0,3).map((iss:any,i:number)=>{
            const text = typeof iss==='string'?iss:iss.issue||iss.message||JSON.stringify(iss)
            const sev = typeof iss==='object'?iss.severity:null
            return (
              <div key={i} style={{ fontSize:12, color:'var(--text2)', padding:'.6rem .85rem', background:'rgba(0,0,0,0.25)', borderRadius:'var(--r-sm)', borderLeft:`3px solid ${sev==='critical'?'var(--red)':sev==='major'?'var(--amber)':'var(--text3)'}` }}>
                {sev && <strong style={{ color:sev==='critical'?'var(--red)':sev==='major'?'var(--amber)':'var(--text3)', textTransform:'capitalize', marginRight:6 }}>{sev}:</strong>}
                {text}
              </div>
            )
          })}
        </div>
      )}
      {review.required_fixes?.length>0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:11, color:'var(--red)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:5 }}>Required fixes</div>
          {review.required_fixes.slice(0,3).map((f:string,i:number)=>(
            <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:3, display:'flex', gap:6 }}>
              <span style={{ color:'var(--red)', flexShrink:0 }}>→</span>{f}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Task Page ────────────────────────────────────────────────
function TaskPage({ task, user, company, onComplete, showToast, refreshTask, reloadTask }:any) {
  const [loading, setLoading] = useState(false)
  // Design
  const [arch, setArch] = useState(task?.phaseData?.design?.arch||'')
  const [ddata, setDdata] = useState(task?.phaseData?.design?.data||'')
  const [flow, setFlow] = useState(task?.phaseData?.design?.flow||'')
  const [tradeoffs, setTradeoffs] = useState(task?.phaseData?.design?.tradeoffs||'')
  // Impl
  const [code, setCode] = useState(task?.phaseData?.implementation?.code||'')
  const [tests, setTests] = useState(task?.phaseData?.implementation?.tests||'')
  // Incident
  const [rca, setRca] = useState(task?.phaseData?.incidentResponse?.rca||'')
  const [fix, setFix] = useState(task?.phaseData?.incidentResponse?.fix||'')
  const [rollback, setRollback] = useState(task?.phaseData?.incidentResponse?.rollback||'')
  const [post, setPost] = useState(task?.phaseData?.incidentResponse?.postmortem||'')
  // Revision
  const [revisionCode, setRevisionCode] = useState('')
  const [incidentData, setIncidentData] = useState<any>(task?.phaseData?.incident||null)

  if (!task) return (
    <div style={{ padding:'3rem', textAlign:'center', color:'var(--text3)' }}>
      <div style={{ fontSize:28, marginBottom:'1rem', opacity:.4 }}>◎</div>
      <div style={{ fontSize:15, fontWeight:500, marginBottom:6 }}>No active task</div>
      <div style={{ fontSize:13 }}>Go to Dashboard and generate a task</div>
    </div>
  )

  async function doAction(action: ()=>Promise<any>, onDone?:(d:any)=>void) {
    setLoading(true)
    try {
      const d = await action()
      if (onDone) onDone(d)
      await reloadTask()
    } catch(e:any) { showToast(e.message,'error') }
    finally { setLoading(false) }
  }

  const phase = task.phase

  return (
    <div style={{ padding:'2rem', maxWidth:860, margin:'0 auto', animation:'fadeUp .4s var(--ease)' }}>
      {/* Task header */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'-.02em', marginBottom:6 }}>{task.title}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
              {task.role && <Badge color="blue">{task.role}</Badge>}
              {task.tags?.map((t:string)=><Badge key={t} color="gray">{t}</Badge>)}
            </div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>{task.desc}</div>
          </div>
          {task.finalScore>0 && <ScoreRing score={task.finalScore} size={56} />}
        </div>
      </div>

      {/* Phase content */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'1.75rem' }}>
        <PhaseHeader phase={phase} task={task} />

        {/* PRD */}
        {phase===0 && (
          <div>
            <div style={{ background:'var(--bg3)', borderRadius:'var(--r-lg)', padding:'1.25rem', marginBottom:'1.25rem', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Background</div>
              <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.75 }}>{task.background}</div>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:'var(--r-lg)', padding:'1.25rem', marginBottom:'1.25rem', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Acceptance Criteria</div>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.75, fontFamily:'var(--font-mono)' }}>{task.acceptance_criteria}</div>
            </div>
            {task.constraints && (
              <div style={{ background:'var(--amber-dim)', borderRadius:'var(--r-lg)', padding:'1rem', marginBottom:'1.25rem', border:'1px solid rgba(245,166,35,0.25)' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--amber)', marginBottom:6 }}>⚠ Constraints</div>
                <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7 }}>{task.constraints}</div>
              </div>
            )}
            <Btn primary full onClick={()=>doAction(()=>api('/api/tasks/advance',{method:'POST',body:{taskId:task.id}}))}>
              {loading?<><Spinner size={14}/>Advancing...</>:'I understand the requirements → Start Design'}
            </Btn>
          </div>
        )}

        {/* Design */}
        {phase===1 && (
          <div>
            {task.phaseData?.design?.review && <ReviewResult review={task.phaseData.design.review} type="design" />}
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginTop:'1rem' }}>
              {[
                ['Architecture', arch, setArch, 'Name every component, how they communicate (sync/async, which protocol), and failure handling...', 5],
                ['Data Structure & Schema', ddata, setDdata, 'Full schema with field types, constraints (NOT NULL, UNIQUE, FK), indexes with justification...', 5],
                ['System Flow (step by step)', flow, setFlow, '1. POST /endpoint... 2. Validate JWT → 401... 3. SETNX → duplicate? return cached... include failure paths at each step...', 6],
                ['Trade-offs & Alternatives', tradeoffs, setTradeoffs, 'What alternatives did you consider? Why did you reject them? What are the downsides of your approach?', 4],
              ].map(([label, val, setter, ph, rows])=>(
                <div key={label as string}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>{label as string}</div>
                  <Textarea value={val} onChange={setter} placeholder={ph as string} rows={rows as number} />
                </div>
              ))}
              <Btn primary full onClick={()=>doAction(()=>api('/api/tasks/design',{method:'POST',body:{taskId:task.id,arch,data:ddata,flow,tradeoffs}}))}>
                {loading?<><Spinner size={14}/>Reviewing design...</>:'Submit design for AI review →'}
              </Btn>
            </div>
          </div>
        )}

        {/* Implementation */}
        {phase===2 && (
          <div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:'1.25rem' }}>
              Write your implementation. The AI reviewer will look at your actual code.
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Code / Implementation</div>
              <Textarea value={code} onChange={setCode} placeholder="// Write your implementation here..." rows={14} />
            </div>
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Test Strategy</div>
              <Textarea value={tests} onChange={setTests} placeholder="What tests would you write? List the key scenarios..." rows={4} />
            </div>
            <Btn primary full onClick={()=>doAction(()=>api('/api/tasks/implementation',{method:'POST',body:{taskId:task.id,code,tests}}))}>
              {loading?<><Spinner size={14}/>Submitting...</>:'Submit implementation →'}
            </Btn>
          </div>
        )}

        {/* Code Review */}
        {phase===3 && (
          <div>
            <ReviewResult review={task.phaseData?.codeReview} type="code" />
            {!task.phaseData?.codeReview?.accepted && (
              <div style={{ marginTop:'1.5rem' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Revised Code</div>
                <Textarea value={revisionCode} onChange={setRevisionCode} placeholder="// Fix the required issues and resubmit..." rows={12} />
                <div style={{ marginTop:'1rem' }}>
                  <Btn primary full onClick={()=>doAction(()=>api('/api/tasks/codereview',{method:'POST',body:{taskId:task.id,revisionCode}}))}>
                    {loading?<><Spinner size={14}/>Re-reviewing...</>:'Submit revision →'}
                  </Btn>
                </div>
              </div>
            )}
            {task.phaseData?.codeReview?.accepted && (
              <div style={{ marginTop:'1.25rem' }}>
                <Btn primary full onClick={()=>doAction(async()=>{ const d=await api(`/api/tasks/incident?taskId=${task.id}`); setIncidentData(d); return d })}>
                  {loading?<><Spinner size={14}/>Generating incident...</>:'Continue to Incident Response →'}
                </Btn>
              </div>
            )}
          </div>
        )}

        {/* Incident */}
        {phase===4 && (
          <div>
            {(incidentData||task.phaseData?.incident) && (
              <div style={{ background:'var(--red-dim)', border:'1px solid rgba(240,82,82,0.25)', borderRadius:'var(--r-lg)', padding:'1.25rem', marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:16 }}>🚨</span>
                  <Badge color="red">{(incidentData||task.phaseData.incident).severity}</Badge>
                  <div style={{ fontSize:14, fontWeight:700 }}>{(incidentData||task.phaseData.incident).title}</div>
                </div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.75, marginBottom:8 }}>{(incidentData||task.phaseData.incident).description}</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <Badge color="amber">Affected: {(incidentData||task.phaseData.incident).affectedUsers}</Badge>
                  <Badge color="red">Impact: {(incidentData||task.phaseData.incident).revenueImpact}</Badge>
                </div>
              </div>
            )}
            {task.phaseData?.incidentEval && (
              <ReviewResult review={task.phaseData.incidentEval} type="incident" />
            )}
            {!task.phaseData?.incidentEval && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {[
                  ['Root Cause Analysis', rca, setRca, 'Trace the full causal chain back to the root cause — not just symptoms. Why did it happen? What triggered it?', 5],
                  ['Immediate Fix Plan', fix, setFix, 'Step 1: kubectl rollout undo... Step 2: verify... Step 3: monitor... Include exact commands and verification.', 5],
                  ['Rollback Plan', rollback, setRollback, 'If the fix fails: what exactly do you undo? How do you verify the system is in a safe state?', 4],
                  ['Blameless Postmortem', post, setPost, 'What process failure allowed this? Action items: each must have an owner and deadline.', 5],
                ].map(([label, val, setter, ph, rows])=>(
                  <div key={label as string}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>{label as string}</div>
                    <Textarea value={val} onChange={setter} placeholder={ph as string} rows={rows as number} />
                  </div>
                ))}
                <Btn primary full onClick={()=>doAction(()=>api('/api/tasks/incident',{method:'POST',body:{taskId:task.id,rca,fix,rollback,post}}))}>
                  {loading?<><Spinner size={14}/>Evaluating...</>:'Submit incident response →'}
                </Btn>
              </div>
            )}
            {task.phaseData?.incidentEval && (
              <div style={{ marginTop:'1.25rem' }}>
                <Btn primary full onClick={()=>doAction(()=>api('/api/tasks/evaluate',{method:'POST',body:{taskId:task.id}}),onComplete)}>
                  {loading?<><Spinner size={14}/>Evaluating...</>:'Complete task & see final score →'}
                </Btn>
              </div>
            )}
          </div>
        )}

        {/* Evaluation */}
        {phase>=5 && (
          <div style={{ textAlign:'center', padding:'2rem' }}>
            <div style={{ fontSize:48, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--green)', marginBottom:8 }}>{task.finalScore}</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Task Complete!</div>
            <div style={{ fontSize:13, color:'var(--text3)', marginBottom:'2rem' }}>You've completed all 6 phases</div>
            <Btn onClick={onComplete}>Back to Dashboard</Btn>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────
export default function Bitora() {
  const router = useRouter()
  const [user, setUser]             = useState<any>(null)
  const [page, setPage]             = useState('dashboard')
  const [companies, setCompanies]   = useState<any[]>([])
  const [activeTask, setActiveTask] = useState<any>(null)
  const [taskHistory, setTaskHistory] = useState<any[]>([])
  const [toast, setToast]           = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [filterRole, setFilterRole] = useState('All')

  function showToast(msg:string, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3500) }

  const loadUser = useCallback(async () => {
    const u = await api('/api/user/me')
    setUser(u)
    return u
  }, [])
  const loadTasks    = useCallback(async()=>{ try { const {active,history}=await api('/api/tasks'); setActiveTask(active); setTaskHistory(history) } catch{} },[])
  const loadCompanies= useCallback(async()=>{ try { setCompanies(await api('/api/companies')) } catch{} },[])

  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/auth'); return }
    loadUser().then(u => {
      loadTasks(); loadCompanies(); setLoading(false)
      // Show onboarding if not done yet
      if (u && !u.onboardingDone) setShowOnboarding(true)
    }).catch(() => { localStorage.removeItem('bt'); router.replace('/auth') })
  }, [loadUser, loadTasks, loadCompanies, router])

  function nav(p:string) { setPage(p); if(p==='dashboard')loadTasks(); if(p==='marketplace')loadCompanies() }
  function logout() { localStorage.removeItem('bt'); router.replace('/auth') }

  async function generateTask() {
    setLoading(true)
    try { const t=await api('/api/tasks',{method:'POST',body:{}}); setActiveTask(t); nav('task') }
    catch(e:any) { showToast(e.message,'error') }
    finally { setLoading(false) }
  }

  async function applyRole(companyId:string, role:string) {
    setLoading(true)
    try { const d=await api('/api/user/apply',{method:'POST',body:{companyId,role}}); setUser(d.user); await loadCompanies(); showToast(`Joined as ${role}`) }
    catch(e:any) { showToast(e.message,'error') }
    finally { setLoading(false) }
  }

  const company = user?.companyId ? companies.find(c=>c.id===user.companyId) : null

  if (loading) return (
    <div style={{ height:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:'var(--text3)' }}>
        <Spinner size={28} />
        <div style={{ marginTop:'1rem', fontSize:13 }}>Loading your workspace...</div>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div style={{ height:'100vh', display:'flex', background:'var(--bg)', overflow:'hidden' }}>
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingModal user={user} onDone={(patch: any) => {
          setUser((u: any) => ({ ...u, ...patch }))
          setShowOnboarding(false)
        }} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'1.25rem', right:'1.25rem', zIndex:999, background:'var(--bg3)', border:`1px solid ${toast.type==='error'?'rgba(240,82,82,.4)':toast.type==='info'?'var(--accent-border)':'rgba(16,216,138,.3)'}`, borderRadius:'var(--r-lg)', padding:'.85rem 1.25rem', fontSize:13, minWidth:260, maxWidth:380, boxShadow:'0 8px 40px rgba(0,0,0,.6)', animation:'slideDown .25s var(--ease)', display:'flex', alignItems:'center', gap:10, backdropFilter:'blur(12px)' }}>
          <span style={{ fontSize:15, flexShrink:0 }}>{toast.type==='error'?'✗':toast.type==='info'?'ℹ':'✓'}</span>
          <span style={{ color:toast.type==='error'?'var(--red)':toast.type==='info'?'#8b9fff':'var(--green)', fontWeight:500 }}>{toast.msg}</span>
        </div>
      )}

      <Sidebar user={user} company={company} page={page} nav={nav} logout={logout} />

      <main style={{ flex:1, overflowY:'auto', height:'100vh' }}>
        {page==='dashboard'   && <DashboardPage user={user} company={company} activeTask={activeTask} taskHistory={taskHistory} onGenerate={generateTask} nav={nav} loading={loading} onChangePrefs={() => setShowOnboarding(true)} />}
        {page==='marketplace' && <MarketplacePage companies={companies} user={user} filterRole={filterRole} setFilterRole={setFilterRole} onApply={applyRole} loading={loading} nav={nav} />}
        {page==='company'     && <MyCompanyPage company={company} user={user} />}
        {page==='task'        && <TaskPage task={activeTask} user={user} company={company} onComplete={()=>{ setActiveTask(null); loadUser(); loadTasks(); nav('dashboard') }} showToast={showToast} refreshTask={(t:any)=>setActiveTask(t)} reloadTask={async()=>{ try { const {active}=await api('/api/tasks'); if(active)setActiveTask(active) } catch{} }} />}
        {page==='history'     && <HistoryPage tasks={taskHistory} />}
        {page==='profile'     && <ProfilePage user={user} showToast={showToast} />}
        {page==='settings'    && <SettingsPage user={user} onSave={async(p:any)=>{ const u=await api('/api/user/me',{method:'PATCH',body:p}); setUser(u); showToast('Saved') }} onLeave={async()=>{ await api('/api/user/me',{method:'PATCH',body:{companyId:null,role:null}}); const u=await api('/api/user/me'); setUser(u); setActiveTask(null); nav('marketplace'); showToast('Left company') }} logout={logout} />}
      </main>
    </div>
  )
}
