import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stripe Sync Engine - Next.js Example',
  description: 'Example Next.js App Router application using stripe-sync-engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

