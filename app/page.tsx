'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/app-layout'
import { Plus, ArrowRight, Search } from 'lucide-react'

// Mock project data - replace with real data later
const mockProjects = [
  {
    id: '1',
    name: 'SaaS for Small Businesses',
    description: 'Inventory management for independent restaurants',
    status: 'active' as const,
    created_at: '2024-12-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'Health & Wellness Apps',
    description: 'Fitness tracking for remote workers',
    status: 'active' as const,
    created_at: '2024-12-19T14:20:00Z',
  },
  {
    id: '3',
    name: 'Educational Technology',
    description: 'Online learning platforms for K-12',
    status: 'archived' as const,
    created_at: '2024-12-15T09:15:00Z',
  },
]

export default function ProjectLibrary() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout
      title="Project Library"
      action={
        <Link href="/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      }
    >
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-24">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-medium mb-2 text-[#0F172A]">No projects found</h3>
                <p className="text-sm text-[#64748B] mb-6">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first project to start validating market opportunities'}
                </p>
                {!searchQuery && (
                  <Link href="/new">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Grid */}
        {filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-md transition-shadow group cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-[#64748B]">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-xs text-[#94A3B8]">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    <Link href={`/projects/${project.id}/market`}>
                      <Button variant="ghost" className="w-full justify-between group-hover:bg-slate-50">
                        Open Project
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
