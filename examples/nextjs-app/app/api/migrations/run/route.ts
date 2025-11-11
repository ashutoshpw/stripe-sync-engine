import { NextResponse } from 'next/server'
import { runMigrations } from 'stripe-sync-engine'
import { databaseUrl, schema } from '@/lib/stripeSync'

export async function POST() {
  try {
    await runMigrations({ databaseUrl, schema })
    return NextResponse.json({ status: 'migrated' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

