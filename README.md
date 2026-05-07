# ⬡ Bitora — Virtual Engineering Career Simulation

Real engineering job simulation inside virtual companies. Powered by Claude 3.5 Sonnet via OpenRouter.

## Quick Start

```bash
npm install --legacy-peer-deps
npm run build
npm start          # Production (recommended)
# OR
npm run dev        # Development
```

Open: http://localhost:3000

## Demo Account
```
Email:    demo@bitora.dev
Password: password123
```

## How It Works

1. **Browse Marketplace** — 6 virtual companies (Fintech, HealthTech, AI/ML, Logistics, Infra, eCommerce)
2. **Join a Company** — pick a role (Backend, Frontend, DevOps, Security, Data, Mobile)
3. **Work Through Tasks** — 6-phase AI-driven simulation per task:
   - PRD (read requirements)
   - Design (AI reviews your architecture)
   - Implementation (write code)
   - Code Review (AI gives specific, categorized feedback)
   - Production Incident (AI generates context-aware incident)
   - Evaluation (final score + career progression)
4. **Career Grows** — Junior → Mid → Senior → Staff → Principal
5. **Company Health Changes** — bad code increases techDebt, security issues raise securityRisk, etc.

## Architecture

- **Framework**: Next.js 14 App Router (API Routes + React client)
- **AI**: OpenRouter → Claude 3.5 Sonnet (task gen, design review, code review, incident gen, evaluation)
- **Auth**: JWT (30d) + bcryptjs
- **Database**: JSON files in `/data/` — no external DB needed
- **Fallback**: Local rule-based evaluator if AI unavailable

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register |
| `/api/auth/login` | POST | Login → JWT |
| `/api/user/me` | GET/PATCH | Profile |
| `/api/user/apply` | POST | Join company |
| `/api/companies` | GET | All companies + live health |
| `/api/tasks` | GET/POST | Tasks / Generate new (AI) |
| `/api/tasks/advance` | POST | PRD → Design |
| `/api/tasks/design` | POST | Submit design + AI review |
| `/api/tasks/implementation` | POST | Submit code |
| `/api/tasks/codereview` | POST | AI code review |
| `/api/tasks/incident` | GET/POST | Generate/submit incident |
| `/api/tasks/evaluate` | POST | Final score + career update |

## Data Files (auto-created)
- `data/users.json` — accounts + career state
- `data/tasks.json` — all tasks with full phase history  
- `data/company_health.json` — live company metrics
