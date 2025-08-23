import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Example App - David Holcer',
  description: 'An example subdomain app',
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
