export const metadata = {
  title: 'Bitora — Engineering Career Simulation',
  description: 'Work inside real virtual software companies. Get reviewed by AI like a real senior engineer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          :root{
            --bg:#080b10;--bg2:#0d1117;--bg3:#121820;--bg4:#171e29;--bg5:#1c2435;
            --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.10);--border3:rgba(255,255,255,0.16);
            --text:#f0f4fc;--text2:#8b95b0;--text3:#48536a;--text4:#2e3a50;
            --accent:#5b6cf9;--accent-hover:#6d7dff;--accent-dim:rgba(91,108,249,0.12);
            --accent-glow:rgba(91,108,249,0.25);--accent-border:rgba(91,108,249,0.30);
            --green:#10d88a;--green-dim:rgba(16,216,138,0.12);
            --red:#f05252;--red-dim:rgba(240,82,82,0.12);
            --amber:#f5a623;--amber-dim:rgba(245,166,35,0.12);
            --purple:#a78bfa;--purple-dim:rgba(167,139,250,0.12);
            --cyan:#22d3ee;--cyan-dim:rgba(34,211,238,0.12);
            --font:'DM Sans',system-ui,sans-serif;
            --font-mono:'DM Mono','SF Mono',Consolas,monospace;
            --font-display:'Syne',sans-serif;
            --r-sm:6px;--r-md:10px;--r-lg:14px;--r-xl:20px;
            --ease:cubic-bezier(0.16,1,0.3,1);
          }
          html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
          ::-webkit-scrollbar{width:4px;height:4px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:var(--bg5);border-radius:2px}
          ::-webkit-scrollbar-thumb:hover{background:var(--border3)}
          ::selection{background:var(--accent-dim);color:var(--text)}
          input,textarea,select{font-family:var(--font);font-size:14px;color:var(--text)}
          input::placeholder,textarea::placeholder{color:var(--text3)}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
          @keyframes slideDown{from{transform:translateY(-10px);opacity:0}to{transform:translateY(0);opacity:1}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
          @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
          @keyframes glowPulse{0%,100%{box-shadow:0 0 12px rgba(91,108,249,0.2)}50%{box-shadow:0 0 28px rgba(91,108,249,0.45)}}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
          @keyframes twinkle{0%,100%{opacity:var(--o1)}50%{opacity:var(--o2)}}
          @keyframes scrollLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
          .gradient-text{background:linear-gradient(135deg,#8b9fff 0%,#c4b5fd 50%,#8b9fff 100%);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite}
          .glass{background:rgba(13,17,23,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
          .tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;letter-spacing:.02em}
          .tag-accent{background:var(--accent-dim);color:#8b9fff;border:1px solid var(--accent-border)}
          .tag-green{background:var(--green-dim);color:var(--green);border:1px solid rgba(16,216,138,0.25)}
          .tag-red{background:var(--red-dim);color:var(--red);border:1px solid rgba(240,82,82,0.25)}
          .tag-amber{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(245,166,35,0.25)}
          .tag-purple{background:var(--purple-dim);color:var(--purple);border:1px solid rgba(167,139,250,0.25)}
          .tag-gray{background:var(--bg4);color:var(--text2);border:1px solid var(--border2)}
          .tag-cyan{background:var(--cyan-dim);color:var(--cyan);border:1px solid rgba(34,211,238,0.25)}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
