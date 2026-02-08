import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });

const basePath = process.env.NODE_ENV === 'production' ? '/valentines-rizz' : '';

export const metadata: Metadata = {
  title: 'Will You Be My Valentine?',
  description: 'A romantic Valentine\'s Day card generator built with Next.js and Vercel.',
  openGraph: {
    title: 'Will You Be My Valentine?',
    description: 'A romantic Valentine\'s Day card generator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Will You Be My Valentine?',
    description: 'A romantic Valentine\'s Day card generator',
  },
  icons: {
    icon: [
      {
        url: `${basePath}/icon-light-32x32.png`,
        media: '(prefers-color-scheme: light)',
      },
      {
        url: `${basePath}/icon-dark-32x32.png`,
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: `${basePath}/icon.svg`,
        type: 'image/svg+xml',
      },
    ],
    apple: `${basePath}/apple-icon.png`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
