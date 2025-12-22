'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GitBranch } from 'lucide-react'

export default function NewProject() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    market: '',
    goal: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock redirect to market explorer
    router.push('/explorer')
  }

  const isValid = formData.name.trim() && formData.market.trim()

  return (
    <AppLayout title="Create New Project">
      <div className="flex items-center justify-center p-6 min-h-full">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Project</CardTitle>
            <CardDescription>
              Define your project scope to generate a comprehensive market analysis tree
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Project Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., SaaS for Small Businesses"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name for your market validation project
                </p>
              </div>

              {/* Target Market */}
              <div className="space-y-2">
                <label htmlFor="market" className="text-sm font-medium">
                  Target Market / Niche
                </label>
                <Input
                  id="market"
                  type="text"
                  placeholder="e.g., Independent restaurants, 1-3 locations"
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The specific market segment you want to analyze
                </p>
              </div>

              {/* Primary Goal (Optional) */}
              <div className="space-y-2">
                <label htmlFor="goal" className="text-sm font-medium">
                  Primary Goal <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  id="goal"
                  type="text"
                  placeholder="e.g., Identify underserved segments"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  What are you trying to achieve with this analysis?
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating Market Tree...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4" />
                    Generate Market Tree
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
