import { ReactNode } from 'react'
import { AppSidebar } from './app-sidebar'

interface AppLayoutProps {
  children: ReactNode
  title: string
  action?: ReactNode
}

export function AppLayout({ children, title, action }: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {action && <div>{action}</div>}
        </div>
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
