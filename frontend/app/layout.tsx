import './globals.css'
import { ReactNode } from 'react'
import AppQueryProvider from '@/components/AppQueryProvider'
import I18nProvider from '@/components/I18nProvider'

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
    <html lang="en" dir="ltr">
      <body>
        <I18nProvider>
          <AppQueryProvider>{children}</AppQueryProvider>
        </I18nProvider>
      </body>
    </html>
  )
}