import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/providers/ToastProvider'

export const metadata: Metadata = {
  title: '成长记录',
  description: '记录宝宝成长的每一个美好时刻',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-pink-500 to-blue-500">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}