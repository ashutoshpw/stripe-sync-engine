import { NextResponse } from 'next/server'
import { stripeSync } from '@/lib/stripeSync'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await stripeSync.syncSingleEntity(id)
    return NextResponse.json({ status: 'synced', id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

