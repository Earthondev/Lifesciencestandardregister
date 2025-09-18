import type { Metadata } from 'next'
import { Inter, Sarabun } from 'next/font/google'
import './globals.css'
import Layout from '@/components/layout/Layout'
import { ThemeProvider } from '@/lib/theme'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const sarabun = Sarabun({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
})

export const metadata: Metadata = {
  title: 'Life Science Standards Register',
  description: 'ระบบลงทะเบียนสารมาตรฐาน',
  keywords: ['life science', 'standards', 'laboratory', 'management', 'thailand'],
  authors: [{ name: 'Life Science Standards Register Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f97316',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${inter.variable} ${sarabun.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="/favicon-pill.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Life Science Standards" />
      </head>
      <body className="font-thai antialiased min-h-screen" suppressHydrationWarning={true}>
        <ThemeProvider defaultTheme="light">
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  )
}
