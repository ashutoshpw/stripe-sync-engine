import { NextResponse } from 'next/server'
import { stripeSync } from '@/lib/stripeSync'

export async function POST() {
  try {
    const result = await stripeSync.syncBackfill({ object: 'all' })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

