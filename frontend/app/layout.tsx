import './globals.css'
import { ReactNode } from 'react'
import AppQueryProvider from '@/components/AppQueryProvider'

export const metadata = {
  title: 'CourierOS Enterprise',
  description: 'CourierOS',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  )
}