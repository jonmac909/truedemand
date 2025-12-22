'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'

type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

interface JobProgressData {
  id: string
  status: JobStatus
  progress: number
  logs: string[]
  error_message?: string | null
}

interface JobProgressPollingProps {
  jobId: string
  mockData?: JobProgressData // For UI-only testing
  pollingInterval?: number
  onComplete?: (data: JobProgressData) => void
  onError?: (error: string) => void
}

export function JobProgressPolling({
  jobId,
  mockData,
  pollingInterval = 2000,
  onComplete,
  onError,
}: JobProgressPollingProps) {
  const [jobData, setJobData] = useState<JobProgressData | null>(mockData || null)

  // Simulate polling (UI only - no real fetching)
  useEffect(() => {
    if (mockData) {
      setJobData(mockData)
      return
    }

    // TODO: Replace with real polling when backend is ready
    // const interval = setInterval(async () => {
    //   const response = await fetch(`/api/jobs/${jobId}`)
    //   const data = await response.json()
    //   setJobData(data)
    //   if (data.status === 'completed') {
    //     clearInterval(interval)
    //     onComplete?.(data)
    //   } else if (data.status === 'failed') {
    //     clearInterval(interval)
    //     onError?.(data.error_message)
    //   }
    // }, pollingInterval)
    // return () => clearInterval(interval)
  }, [jobId, mockData, pollingInterval, onComplete, onError])

  if (!jobData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-sm">Initializing job...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'QUEUED',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
    },
    running: {
      icon: Loader2,
      label: 'PROCESSING',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    completed: {
      icon: CheckCircle2,
      label: 'COMPLETE',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    failed: {
      icon: AlertCircle,
      label: 'FAILED',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  }

  const config = statusConfig[jobData.status]
  const Icon = config.icon

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-card/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Job Execution</CardTitle>
          <div className={`flex items-center gap-2 px-3 py-1 rounded ${config.bgColor}`}>
            <Icon className={`h-3.5 w-3.5 ${config.color} ${jobData.status === 'running' ? 'animate-spin' : ''}`} />
            <span className={`text-xs font-mono font-semibold ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">Progress</span>
            <span className="text-sm font-mono font-semibold text-primary">
              {jobData.progress}%
            </span>
          </div>
          <Progress value={jobData.progress} className="h-1.5" />
        </div>

        {/* Job ID */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">JOB_ID</span>
            <span className="text-xs font-mono">{jobData.id}</span>
          </div>
        </div>

        {/* Logs */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground">EXECUTION LOG</span>
            <span className="text-xs font-mono text-muted-foreground">
              {jobData.logs.length} {jobData.logs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <div className="space-y-1 bg-background/50 border border-border p-3 rounded max-h-48 overflow-y-auto font-mono text-xs">
            {jobData.logs.length === 0 ? (
              <div className="text-muted-foreground italic">No log entries yet...</div>
            ) : (
              jobData.logs.map((log, index) => (
                <div
                  key={index}
                  className="text-foreground/80 leading-relaxed py-0.5"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Message */}
        {jobData.error_message && (
          <div className="px-6 pb-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-mono font-semibold text-destructive mb-1">
                    ERROR
                  </div>
                  <div className="text-sm text-destructive/90">
                    {jobData.error_message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
