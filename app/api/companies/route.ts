import { NextResponse } from 'next/server'
import { CompanyHealthDB } from '@/lib/db'
import { COMPANIES } from '@/lib/data'

export async function GET() {
  const companies = await Promise.all(COMPANIES.map(async c => {
    const health = await CompanyHealthDB.get(c.id) || { reputation: 70, reliability: 70, velocity: 70, securityRisk: 40, techDebt: 40 }
    return { ...c, reputation: health.reputation, reliability: health.reliability, velocity: health.velocity, securityRisk: health.securityRisk, techDebt: health.techDebt }
  }))
  return NextResponse.json(companies)
}
