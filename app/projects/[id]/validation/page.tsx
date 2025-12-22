'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { JobProgressPolling } from '@/components/job-progress-polling'
import { ChevronRight, TrendingUp, Users, Target, DollarSign, ExternalLink } from 'lucide-react'

// Mock validation data
const mockValidation = {
  subNiche: 'Inventory management for independent restaurants',
  overallScore: 74,
  signals: {
    search: { score: 82, label: 'Search Trends' },
    social: { score: 71, label: 'Social Proof' },
    competition: { score: 68, label: 'Competition Gaps' },
    financial: { score: 75, label: 'Financial Indicators' },
  },
}

// Mock job for validation process
const mockJobData = {
  id: 'job_validation_xyz789',
  status: 'running' as const,
  progress: 65,
  logs: [
    '[2024-12-21T17:10:00.000Z] Job created and queued',
    '[2024-12-21T17:10:02.000Z] Analyzing search trends...',
    '[2024-12-21T17:10:08.000Z] Gathering social proof signals...',
    '[2024-12-21T17:10:15.000Z] Evaluating competition landscape...',
    '[2024-12-21T17:10:22.000Z] Processing financial indicators...',
  ],
}

export default function ValidationPage({ params }: { params: { id: string } }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-primary'
    return 'text-muted-foreground'
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link href="/" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/projects/${params.id}/market`} className="hover:text-foreground transition-colors">
            Market Explorer
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Validation</span>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">
          Multi-Signal Validation
        </h1>
        <p className="text-muted-foreground text-lg">
          {mockValidation.subNiche}
        </p>
        <div className="h-px bg-gradient-to-r from-border via-border/50 to-transparent mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score */}
          <Card className="border-primary/50 animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Overall Validation Score</CardTitle>
                  <CardDescription>
                    Composite score across all validation signals
                  </CardDescription>
                </div>
                <div className="flex flex-col items-center gap-1 px-6 py-3 rounded border bg-green-500/10 border-green-500/20">
                  <div className="text-4xl font-mono font-bold text-green-500">
                    {mockValidation.overallScore}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">/ 100</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Signal Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Trends */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{mockValidation.signals.search.label}</CardTitle>
                      <div className="text-xs text-muted-foreground font-mono">SEARCH</div>
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold ${getScoreColor(mockValidation.signals.search.score)}`}>
                    {mockValidation.signals.search.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="text-xs font-mono bg-muted/30 p-2 rounded border border-border">
                    [STUB] Search volume, trending data, and keyword analysis will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{mockValidation.signals.social.label}</CardTitle>
                      <div className="text-xs text-muted-foreground font-mono">SOCIAL</div>
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold ${getScoreColor(mockValidation.signals.social.score)}`}>
                    {mockValidation.signals.social.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="text-xs font-mono bg-muted/30 p-2 rounded border border-border">
                    [STUB] Reddit discussions, forum activity, and social mentions will be shown here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Competition */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{mockValidation.signals.competition.label}</CardTitle>
                      <div className="text-xs text-muted-foreground font-mono">COMPETITION</div>
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold ${getScoreColor(mockValidation.signals.competition.score)}`}>
                    {mockValidation.signals.competition.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="text-xs font-mono bg-muted/30 p-2 rounded border border-border">
                    [STUB] Competitor analysis, feature gaps, and market positioning will appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{mockValidation.signals.financial.label}</CardTitle>
                      <div className="text-xs text-muted-foreground font-mono">FINANCIAL</div>
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold ${getScoreColor(mockValidation.signals.financial.score)}`}>
                    {mockValidation.signals.financial.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="text-xs font-mono bg-muted/30 p-2 rounded border border-border">
                    [STUB] Market size estimates, pricing data, and willingness to pay metrics will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Progress */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <JobProgressPolling jobId={mockJobData.id} mockData={mockJobData} />
          </div>

          {/* Next Steps */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate product ideas based on validated market gaps and opportunities.
              </p>
              <Link href={`/projects/${params.id}/blueprint`}>
                <Button className="w-full gap-2" disabled>
                  Generate Ideas
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center font-mono">
                [Coming in next phase]
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
