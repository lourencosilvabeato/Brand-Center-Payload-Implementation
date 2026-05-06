import type { ReactNode } from 'react'
import { ibmPlexSans, montserrat } from '@/lib/fonts'
import '@/styles/tokens.css'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className={`${ibmPlexSans.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
