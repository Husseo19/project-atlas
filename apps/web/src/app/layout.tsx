import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atlas | Microsoft Certification Prep',
  description: 'Master Microsoft certifications with Atlas.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Atlas',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import { createClient } from '../utils/supabase/server'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  let theme = cookieStore.get('theme')?.value

  if (!theme) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('dark_mode_enabled')
          .eq('id', user.id)
          .single()
        if (profile?.dark_mode_enabled) {
          theme = 'dark'
        }
      }
    } catch {
      // Fallback to light on error
    }
  }

  const finalTheme = theme || 'light'

  return (
    <html lang="en" data-theme={finalTheme}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
