import type { ReactNode } from 'react'
import { ibmPlexSans, montserrat } from '@/lib/fonts'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/styles/tokens.css'

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className={`${ibmPlexSans.variable} ${montserrat.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
