import './globals.css'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ja"
      className={cn('font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
