'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ChevronDown, Search, Plus, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

// Tree data structure
interface TreeNode {
  id: string
  name: string
  description?: string
  children?: TreeNode[]
  score?: number
  metadata?: {
    marketSize?: string
    growth?: string
    competition?: string
  }
}

const mockTreeData: TreeNode = {
  id: '1',
  name: 'SaaS for Small Businesses',
  description: 'Software solutions targeting SMB market',
  metadata: {
    marketSize: '$180B',
    growth: '+12% YoY',
    competition: 'High',
  },
  children: [
    {
      id: '2',
      name: 'Inventory Management',
      description: 'Tools for tracking and managing inventory',
      score: 78,
      metadata: {
        marketSize: '$8.2B',
        growth: '+23% YoY',
        competition: 'Medium',
      },
      children: [
        {
          id: '3',
          name: 'Restaurant Inventory',
          description: 'Specialized for food service industry',
          score: 85,
        },
        {
          id: '4',
          name: 'Retail Inventory',
          description: 'Point of sale and stock management',
          score: 72,
        },
      ],
    },
    {
      id: '5',
      name: 'Employee Scheduling',
      description: 'Shift planning and workforce management',
      score: 65,
      metadata: {
        marketSize: '$4.5B',
        growth: '+15% YoY',
        competition: 'High',
      },
      children: [
        {
          id: '6',
          name: 'Healthcare Scheduling',
          description: 'For medical practices and clinics',
          score: 70,
        },
      ],
    },
    {
      id: '7',
      name: 'Client Portals',
      description: 'Customer-facing communication platforms',
      score: 52,
      metadata: {
        marketSize: '$2.1B',
        growth: '+8% YoY',
        competition: 'Low',
      },
    },
  ],
}

function TreeNodeComponent({
  node,
  level = 0,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: {
  node: TreeNode
  level?: number
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (node: TreeNode) => void
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-muted transition-colors',
          isSelected && 'bg-accent text-accent-foreground',
          level > 0 && 'ml-6'
        )}
        onClick={() => onSelect(node)}
      >
        {/* Expand/collapse icon */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) onToggle(node.id)
          }}
          className="flex-shrink-0"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        {/* Node name */}
        <div className="flex-1 text-sm font-medium">{node.name}</div>

        {/* Child count badge */}
        {hasChildren && (
          <Badge variant="secondary" className="text-xs">
            {node.children!.length}
          </Badge>
        )}

        {/* Score */}
        {node.score !== undefined && (
          <Badge variant={node.score >= 70 ? 'success' : 'secondary'}>
            {node.score}
          </Badge>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MarketTreeExplorer() {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2']))
  const [filterQuery, setFilterQuery] = useState('')

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  return (
    <AppLayout
      title="Market Tree Explorer"
      action={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Segment
        </Button>
      }
    >
      <div className="flex h-full">
        {/* LEFT: Tree View */}
        <div className="w-96 border-r border-border bg-background flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter nodes..."
                className="pl-10"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-2">
            <TreeNodeComponent
              node={mockTreeData}
              selectedId={selectedNode?.id || null}
              expandedIds={expandedIds}
              onSelect={setSelectedNode}
              onToggle={handleToggle}
            />
          </div>
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedNode ? (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-3xl font-semibold mb-2">{selectedNode.name}</h2>
                {selectedNode.description && (
                  <p className="text-muted-foreground">{selectedNode.description}</p>
                )}
              </div>

              {/* Score */}
              {selectedNode.score !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Demand Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-primary">
                        {selectedNode.score}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        out of 100
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Stats */}
              {selectedNode.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedNode.metadata.marketSize && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Market Size</span>
                        <span className="text-sm font-medium">{selectedNode.metadata.marketSize}</span>
                      </div>
                    )}
                    {selectedNode.metadata.growth && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Growth Rate</span>
                        <span className="text-sm font-medium">{selectedNode.metadata.growth}</span>
                      </div>
                    )}
                    {selectedNode.metadata.competition && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-muted-foreground">Competition</span>
                        <span className="text-sm font-medium">{selectedNode.metadata.competition}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="gap-2">
                  <Target className="h-4 w-4" />
                  Analyze Competitors
                </Button>
                <Button variant="secondary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Sub-Segment
                </Button>
              </div>

              {/* Children Summary */}
              {selectedNode.children && selectedNode.children.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sub-Segments ({selectedNode.children.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedNode.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 border border-border hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => setSelectedNode(child)}
                      >
                        <div>
                          <div className="font-medium text-sm">{child.name}</div>
                          {child.description && (
                            <div className="text-xs text-muted-foreground">{child.description}</div>
                          )}
                        </div>
                        {child.score !== undefined && (
                          <Badge variant={child.score >= 70 ? 'success' : 'secondary'}>
                            {child.score}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Select a node from the tree to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
