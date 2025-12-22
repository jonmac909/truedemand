'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Plus,
  GitBranch,
  CheckSquare,
  FileText,
} from 'lucide-react'

const navigation = [
  {
    section: 'Overview',
    items: [
      { name: 'Project Library', href: '/', icon: LayoutGrid },
      { name: 'New Project', href: '/new', icon: Plus },
    ],
  },
  {
    section: 'Analysis',
    items: [
      { name: 'Market Tree Explorer', href: '/explorer', icon: GitBranch },
      { name: 'Validation', href: '/validation', icon: CheckSquare },
      { name: 'Blueprint', href: '/blueprint', icon: FileText },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-60 border-r border-border bg-slate-50 flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border bg-white">
        <h1 className="text-lg font-semibold text-[#0F172A]">TrueDemand</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-8">
        {navigation.map((section) => (
          <div key={section.section}>
            <div className="px-3 mb-3">
              <h2 className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                {section.section}
              </h2>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg',
                      isActive
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
