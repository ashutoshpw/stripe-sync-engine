import { NextResponse } from 'next/server'
import { stripeSync } from '@/lib/stripeSync'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature') ?? undefined
    const arrayBuffer = await request.arrayBuffer()
    const payload = Buffer.from(arrayBuffer)

    await stripeSync.processWebhook(payload, signature)

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook processing failed', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

