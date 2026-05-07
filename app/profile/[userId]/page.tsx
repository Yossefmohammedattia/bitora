export default function PublicProfilePage({ params }: { params: { userId: string } }) {
  return (
    <div id="profile-root" data-userid={params.userId} style={{ minHeight: '100vh', background: '#0b0e14', color: '#e8edf5', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div id="profile-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#4a5268', fontSize: 14 }}>Loading profile...</div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        (async function() {
          const userId = document.getElementById('profile-root').dataset.userid
          const el = document.getElementById('profile-content')
          try {
            const r = await fetch('/api/user/profile', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId }) })
            if (!r.ok) { el.innerHTML = '<div style="color:#4a5268;font-size:14px;text-align:center"><div style="font-size:24px;margin-bottom:1rem">🔒</div><div>This profile is private or does not exist.</div></div>'; return }
            const d = await r.json()
            renderProfile(d, el)
          } catch(e) {
            el.innerHTML = '<div style="color:#ef4444">Failed to load profile</div>'
          }
        })()

        function renderProfile(d, el) {
          const score = d.readinessScore
          const scoreColor = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444'
          const levelColors = { 'Beginner':'#4a5268','Junior':'#4f7cff','Strong Junior':'#7c3aed','Job-Ready Junior':'#059669','Mid-Level Simulation':'#d97706' }
          const lvlColor = levelColors[d.levelName] || '#4f7cff'

          el.innerHTML = \`
            <div style="max-width:900px;margin:0 auto;padding:2rem;width:100%">
              <!-- Header -->
              <div style="background:#111520;border:1px solid #ffffff10;border-radius:16px;padding:2.5rem;margin-bottom:1.5rem;position:relative;overflow:hidden">
                <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(ellipse,#4f7cff10,transparent 70%);border-radius:50%"></div>
                <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1.5rem">
                  <div style="display:flex;align-items:center;gap:1.25rem">
                    <div style="width:64px;height:64px;border-radius:50%;background:#0b0e14;border:2px solid #ffffff15;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#e8edf5">\${d.user.name[0].toUpperCase()}</div>
                    <div>
                      <div style="font-size:22px;font-weight:700;letter-spacing:-.04em">\${d.user.name}</div>
                      <div style="font-size:13px;color:#8892aa;margin-top:3px">\${d.user.role || 'Engineer'}\${d.user.company ? ' at ' + d.user.company : ''}</div>
                      <div style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;background:\${lvlColor}20;border:1px solid \${lvlColor}40;border-radius:20px;padding:3px 12px;font-size:11px;color:\${lvlColor};font-weight:500">\${d.levelName}</div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:42px;font-weight:700;color:\${scoreColor};letter-spacing:-.04em;line-height:1">\${score}</div>
                    <div style="font-size:11px;color:#4a5268;margin-top:2px">Production Readiness</div>
                    <div style="font-size:11px;color:#4a5268;margin-top:8px;max-width:200px;line-height:1.4">\${d.readinessLabel}</div>
                  </div>
                </div>
                <div style="margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid #ffffff08;display:flex;gap:2rem;flex-wrap:wrap">
                  <div><div style="font-size:11px;color:#4a5268;text-transform:uppercase;letter-spacing:.5px">Country</div><div style="font-size:13px;margin-top:3px">\${d.user.country || '—'}</div></div>
                  <div><div style="font-size:11px;color:#4a5268;text-transform:uppercase;letter-spacing:.5px">Tasks Completed</div><div style="font-size:13px;margin-top:3px">\${d.metrics.tasksCompleted}</div></div>
                  <div><div style="font-size:11px;color:#4a5268;text-transform:uppercase;letter-spacing:.5px">Avg Score</div><div style="font-size:13px;margin-top:3px">\${d.metrics.avgFinalScore || '—'}/100</div></div>
                  <div><div style="font-size:11px;color:#4a5268;text-transform:uppercase;letter-spacing:.5px">Profile Completion</div><div style="font-size:13px;margin-top:3px">\${d.profileCompletion}%</div></div>
                </div>
                <div style="margin-top:.75rem;background:#ffffff08;border-radius:4px;height:4px;overflow:hidden"><div style="width:\${d.profileCompletion}%;height:100%;background:#4f7cff;border-radius:4px"></div></div>
                <div style="margin-top:1rem;font-size:11px;color:#4a5268;display:flex;align-items:center;gap:6px">
                  <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block"></span>
                  Verified by Bitora Engineering Simulation Environment
                </div>
              </div>

              <!-- Metrics Row -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem">
                \${[
                  ['Design Score', d.metrics.avgDesignScore ? d.metrics.avgDesignScore+'/100' : '—'],
                  ['Code Score', d.metrics.avgCodeScore ? d.metrics.avgCodeScore+'/100' : '—'],
                  ['Incident Score', d.metrics.avgIncidentScore ? d.metrics.avgIncidentScore+'/100' : '—'],
                  ['RCA Accuracy', d.metrics.rcaAccuracy !== null ? d.metrics.rcaAccuracy+'%' : '—'],
                  ['Revisions Needed', d.metrics.revisionsNeeded],
                  ['Security Issues', d.metrics.securityIssues || '0'],
                ].map(([label,val]) => \`
                  <div style="background:#111520;border:1px solid #ffffff0f;border-radius:12px;padding:1rem">
                    <div style="font-size:10px;color:#4a5268;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.4rem">\${label}</div>
                    <div style="font-size:22px;font-weight:700;letter-spacing:-.03em">\${val}</div>
                  </div>
                \`).join('')}
              </div>

              <!-- Skills -->
              <div style="background:#111520;border:1px solid #ffffff0f;border-radius:16px;padding:2rem;margin-bottom:1.5rem">
                <div style="font-size:13px;font-weight:600;margin-bottom:1.5rem;letter-spacing:-.2px">Skill Analysis — based on verified work</div>
                \${d.skills.map(s => {
                  const c = s.score >= 75 ? '#22c55e' : s.score >= 55 ? '#4f7cff' : s.score > 0 ? '#f59e0b' : '#4a5268'
                  return \`<div style="margin-bottom:1.25rem">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">
                      <div>
                        <span style="font-size:13px;font-weight:500">\${s.name}</span>
                        <span style="margin-left:8px;font-size:10px;color:#4a5268;background:#ffffff08;border-radius:10px;padding:2px 8px">\${s.confidence} confidence</span>
                      </div>
                      <span style="font-size:13px;font-weight:700;color:\${c}">\${s.score > 0 ? s.score+'/100' : '—'}</span>
                    </div>
                    <div style="background:#ffffff08;border-radius:4px;height:5px;overflow:hidden"><div style="width:\${s.score}%;height:100%;background:\${c};border-radius:4px;transition:width .6s ease"></div></div>
                    \${s.evidence ? \`<div style="font-size:11px;color:#4a5268;margin-top:.35rem">\${s.evidence} — \${s.note}</div>\` : \`<div style="font-size:11px;color:#4a5268;margin-top:.35rem">Not enough evidence yet</div>\`}
                  </div>\`
                }).join('')}
              </div>

              <!-- HR Summary -->
              <div style="background:#111520;border:1px solid #ffffff0f;border-radius:16px;padding:2rem;margin-bottom:1.5rem">
                <div style="font-size:13px;font-weight:600;margin-bottom:1.25rem">HR Summary — for recruiters</div>
                <div style="font-size:13px;color:#8892aa;line-height:1.7;margin-bottom:1.25rem">
                  \${d.user.name} has completed \${d.metrics.tasksCompleted} engineering simulation(s) on the Bitora platform with a production readiness score of \${d.readinessScore}/100.
                  \${d.metrics.avgFinalScore > 0 ? ' Average task score: ' + d.metrics.avgFinalScore + '/100.' : ''}
                  This profile reflects performance on real engineering tasks — system design, code implementation, code review, and production incident response.
                  All scores are generated by AI reviewers following the same standards applied in real software engineering teams.
                  <strong style="color:#e8edf5"> This is simulated work experience, not employment at a real company.</strong>
                </div>
                \${d.strengths.length > 0 ? \`
                  <div style="margin-bottom:1rem">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#22c55e;margin-bottom:.5rem">Strengths</div>
                    \${d.strengths.map(s => \`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:.4rem;font-size:13px;color:#8892aa"><span style="color:#22c55e;flex-shrink:0;margin-top:2px">✓</span>\${s}</div>\`).join('')}
                  </div>
                \` : ''}
                \${d.weaknesses.length > 0 ? \`
                  <div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#f59e0b;margin-bottom:.5rem">Areas for Improvement</div>
                    \${d.weaknesses.map(w => \`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:.4rem;font-size:13px;color:#8892aa"><span style="color:#f59e0b;flex-shrink:0;margin-top:2px">△</span>\${w}</div>\`).join('')}
                  </div>
                \` : ''}
                <div style="margin-top:1.25rem;padding:.85rem;background:#4f7cff10;border:1px solid #4f7cff25;border-radius:10px;font-size:12px;color:#7fa8ff;line-height:1.6">
                  <strong>Recruiter note:</strong> \${d.readinessLabel}. Every score on this profile is derived from actual task performance, not self-assessment. Evidence is listed below.
                </div>
              </div>

              <!-- Evidence -->
              \${d.evidence.length > 0 ? \`
                <div style="background:#111520;border:1px solid #ffffff0f;border-radius:16px;padding:2rem;margin-bottom:1.5rem">
                  <div style="font-size:13px;font-weight:600;margin-bottom:1.25rem">Verified Work Evidence</div>
                  \${d.evidence.map(e => \`
                    <div style="padding:1rem;background:#161b27;border-radius:10px;margin-bottom:.75rem;border:1px solid #ffffff08">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
                        <div>
                          <div style="font-size:13px;font-weight:600">\${e.title}</div>
                          <div style="font-size:11px;color:#4a5268;margin-top:3px">\${e.role} at \${e.company} · \${e.completedAt ? new Date(e.completedAt).toLocaleDateString() : 'In progress'}</div>
                        </div>
                        <div style="text-align:right">
                          <div style="font-size:18px;font-weight:700;color:\${e.finalScore >= 75 ? '#22c55e' : e.finalScore >= 55 ? '#f59e0b' : '#ef4444'}">\${e.finalScore || '—'}</div>
                          <div style="font-size:10px;color:#4a5268">Final Score</div>
                        </div>
                      </div>
                      <div style="display:flex;gap:.5rem;margin-top:.75rem;flex-wrap:wrap">
                        \${e.designScore !== null ? \`<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:#4f7cff15;color:#7fa8ff;border:1px solid #4f7cff25">Design: \${e.designScore}</span>\` : ''}
                        \${e.codeScore !== null ? \`<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:\${e.codeAccepted ? '#22c55e15' : '#ef444415'};color:\${e.codeAccepted ? '#4ade80' : '#f87171'};border:1px solid \${e.codeAccepted ? '#22c55e25' : '#ef444425'}">Code: \${e.codeScore} \${e.codeAccepted ? '✓' : '✗'}</span>\` : ''}
                        \${e.incidentScore !== null ? \`<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:#a78bfa15;color:#c4b5fd;border:1px solid #a78bfa25">Incident: \${e.incidentScore} \${e.rcaCorrect ? '(RCA ✓)' : '(RCA ✗)'}</span>\` : ''}
                        \${e.tags.map(tag => \`<span style="font-size:11px;padding:2px 10px;border-radius:20px;background:#ffffff08;color:#4a5268">\${tag}</span>\`).join('')}
                      </div>
                    </div>
                  \`).join('')}
                </div>
              \` : ''}

              <!-- Footer -->
              <div style="text-align:center;padding:1.5rem;font-size:11px;color:#4a5268;line-height:1.6">
                This profile was generated by <strong style="color:#8892aa">Bitora</strong> — Engineering Career Simulation Platform<br>
                All scores are based on verified simulation performance. This is not a record of real employment.
              </div>
            </div>
          \`
        }
      ` }} />
    </div>
  )
}
