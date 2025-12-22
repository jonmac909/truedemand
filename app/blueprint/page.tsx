'use client'

import { AppLayout } from '@/components/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export default function BlueprintPage() {
  return (
    <AppLayout title="Blueprint">
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Blueprint Module</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Product blueprint generation will be implemented in a future phase
            </p>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
