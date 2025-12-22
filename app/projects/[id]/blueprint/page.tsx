'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronRight, FileText, Download, BookOpen, Target, Rocket, AlertTriangle } from 'lucide-react'

export default function BlueprintPage({ params }: { params: { id: string } }) {
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
          <span className="text-foreground font-medium">Blueprint</span>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">
          Product Blueprint
        </h1>
        <p className="text-muted-foreground text-lg">
          Detailed implementation plan with features, positioning, and go-to-market strategy
        </p>
        <div className="h-px bg-gradient-to-r from-border via-border/50 to-transparent mt-4" />
      </div>

      {/* Stub Content */}
      <Card className="border-dashed animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <div className="h-20 w-20 rounded-full bg-muted/30 border-2 border-dashed border-border flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-serif font-semibold mb-2">Blueprint Generation</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            This feature will be implemented in a future phase. It will generate detailed
            product blueprints with implementation plans, feature roadmaps, and citations.
          </p>
          <div className="flex items-center gap-3">
            <Link href={`/projects/${params.id}/validation`}>
              <Button variant="outline">
                Back to Validation
              </Button>
            </Link>
            <Button disabled className="gap-2">
              <Download className="h-4 w-4" />
              Export Blueprint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview of what will be included */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Executive Summary</CardTitle>
            <CardDescription>
              High-level overview of the opportunity, target market, and value proposition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/30 p-3 rounded border border-border text-muted-foreground">
              [Coming Soon]
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Target Market Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of your ideal customer profile and market segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/30 p-3 rounded border border-border text-muted-foreground">
              [Coming Soon]
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Feature Roadmap</CardTitle>
            <CardDescription>
              MVP scope, core features, and future enhancement priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/30 p-3 rounded border border-border text-muted-foreground">
              [Coming Soon]
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Positioning Strategy</CardTitle>
            <CardDescription>
              How to position your product against competitors and communicate value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/30 p-3 rounded border border-border text-muted-foreground">
              [Coming Soon]
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Go-to-Market Plan</CardTitle>
            <CardDescription>
              Channel strategy, pricing, and launch recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/30 p-3 rounded border border-border text-muted-foreground">
              [Coming Soon]
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Risk Assessment</CardTitle>
            <CardDescription>
              Potential challenges, mitigation strategies, and critical assumptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-muted/30 p-3 rounded border border-border text-muted-foreground">
              [Coming Soon]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
