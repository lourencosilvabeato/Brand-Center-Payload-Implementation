import type { ReactNode } from 'react'
import { ibmPlexSans, montserrat } from '@/lib/fonts'
import '@/styles/tokens.css'

// Header, Footer, Sidebar, Breadcrumb — implemented in feature/layout (prompts 8–14)

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className={`${ibmPlexSans.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
