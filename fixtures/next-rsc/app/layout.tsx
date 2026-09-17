import type { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div data-xui-theme="trading-dark" data-xui-density="compact">
          {children}
        </div>
      </body>
    </html>
  )
}
