'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { JobProgressPolling } from '@/components/job-progress-polling'
import { ChevronRight, TrendingUp, Users, DollarSign, Target } from 'lucide-react'

// Mock data - replace with real data later
const mockMarketTree = {
  market: {
    id: '1',
    name: 'SaaS for Small Businesses',
    type: 'market',
  },
  subNiches: [
    {
      id: '2',
      name: 'Inventory management for independent restaurants',
      description: 'Specialized inventory and ordering tools for single-location and small chain restaurants (1-3 locations)',
      score: 78,
      explanation: 'High search volume (12K monthly), growing 23% YoY. Low competition with fragmented solutions.',
      signals: {
        search: 'High',
        social: 'Strong',
        competition: 'Low',
        financial: 'Good',
      },
    },
    {
      id: '3',
      name: 'Employee scheduling for small healthcare clinics',
      description: 'Shift scheduling and coverage management for medical practices with 5-50 staff',
      score: 65,
      explanation: 'Moderate search volume (8.5K monthly), stable trend. Existing solutions are enterprise-focused.',
      signals: {
        search: 'Moderate',
        social: 'Moderate',
        competition: 'Medium',
        financial: 'Fair',
      },
    },
    {
      id: '4',
      name: 'Client portals for home service businesses',
      description: 'Customer communication and job tracking for plumbers, electricians, HVAC contractors',
      score: 52,
      explanation: 'Lower search volume (4.2K monthly) but very specific intent. Willingness to pay is uncertain.',
      signals: {
        search: 'Low',
        social: 'Weak',
        competition: 'Low',
        financial: 'Uncertain',
      },
    },
  ],
}

// Mock job data for the polling component
const mockJobData = {
  id: 'job_abc123def456',
  status: 'completed' as const,
  progress: 100,
  logs: [
    '[2024-12-21T16:39:00.000Z] Job created and queued',
    '[2024-12-21T16:39:02.000Z] Analyzing market category...',
    '[2024-12-21T16:39:05.000Z] Researching demand signals...',
    '[2024-12-21T16:39:09.000Z] Identifying sub-niches...',
    '[2024-12-21T16:39:12.000Z] Scoring opportunities...',
    '[2024-12-21T16:39:15.000Z] Job completed successfully',
  ],
}

export default function MarketTreeExplorer({ params }: { params: { id: string } }) {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null)
  const [showJobProgress, setShowJobProgress] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-primary'
    return 'text-muted-foreground'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/10 border-green-500/20'
    if (score >= 50) return 'bg-primary/10 border-primary/20'
    return 'bg-muted/20 border-muted-foreground/20'
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
          <span className="text-foreground font-medium">{mockMarketTree.market.name}</span>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">
          Market Explorer
        </h1>
        <p className="text-muted-foreground text-lg">
          Discovered sub-niches with demand validation scores
        </p>
        <div className="h-px bg-gradient-to-r from-border via-border/50 to-transparent mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {mockMarketTree.subNiches.map((niche, index) => (
            <Card
              key={niche.id}
              className={`transition-all hover:border-primary/50 animate-fade-in cursor-pointer ${
                selectedNiche === niche.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedNiche(niche.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{niche.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {niche.description}
                    </CardDescription>
                  </div>
                  <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded border ${getScoreBgColor(niche.score)}`}>
                    <div className={`text-2xl font-mono font-bold ${getScoreColor(niche.score)}`}>
                      {niche.score}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      SCORE
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Explanation */}
                  <div className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                    {niche.explanation}
                  </div>

                  {/* Signal Indicators */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="text-[10px] font-mono text-muted-foreground">SEARCH</div>
                      <div className="text-xs font-medium">{niche.signals.search}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="text-[10px] font-mono text-muted-foreground">SOCIAL</div>
                      <div className="text-xs font-medium">{niche.signals.social}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="text-[10px] font-mono text-muted-foreground">COMP</div>
                      <div className="text-xs font-medium">{niche.signals.competition}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="text-[10px] font-mono text-muted-foreground">FINANCE</div>
                      <div className="text-xs font-medium">{niche.signals.financial}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedNiche ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run multi-signal validation to analyze search trends, social proof, competition, and financial indicators.
                  </p>
                  <Link href={`/projects/${params.id}/validation`}>
                    <Button className="w-full" size="lg">
                      Validate Sub-Niche
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a sub-niche to continue with validation
                </p>
              )}
            </CardContent>
          </Card>

          {/* Job Progress */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono font-semibold text-muted-foreground">
                ANALYSIS JOB
              </h3>
              <button
                onClick={() => setShowJobProgress(!showJobProgress)}
                className="text-xs font-mono text-primary hover:underline"
              >
                {showJobProgress ? 'Hide' : 'Show'}
              </button>
            </div>
            {showJobProgress && <JobProgressPolling jobId={mockJobData.id} mockData={mockJobData} />}
          </div>
        </div>
      </div>
    </div>
  )
}
