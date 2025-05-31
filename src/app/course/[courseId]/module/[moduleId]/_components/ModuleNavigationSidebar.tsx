'use client'

import React from 'react'
import { 
  BookOpen, 
  Video, 
  FileText, 
  CalendarClock, 
  ClipboardCheck, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ModuleItem {
  id: string
  title: string
  type: string
  status: string
  [key: string]: any
}

interface ModuleNavigationSidebarProps {
  items: ModuleItem[]
  selectedItemId: string | null
  onItemSelect: (itemId: string) => void
}

/**
 * ModuleNavigationSidebar component
 * 
 * Displays a hierarchical navigation of module items
 * Allows selection of items to view their content
 * Shows completion status with visual indicators
 */
const ModuleNavigationSidebar = ({ 
  items, 
  selectedItemId, 
  onItemSelect 
}: ModuleNavigationSidebarProps) => {
  // Format the due date or scheduled date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // Get the appropriate icon for each item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'liveClass':
        return <CalendarClock className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'assignment':
        return <ClipboardCheck className="h-4 w-4" />
      case 'assessment':
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }
  
  // Get a human-readable label for each item type
  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'liveClass':
        return 'Live Class'
      case 'video':
        return 'Video'
      case 'article':
        return 'Reading'
      case 'assignment':
        return 'Assignment'
      case 'assessment':
        return 'Assessment'
      default:
        return type
    }
  }
  
  // Get the status indicator component
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'inProgress':
        return <Circle className="h-4 w-4 text-primary fill-primary/25" />
      case 'upcoming':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'locked':
        return <Lock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }
  
  // Get badge for item status
  const getStatusBadge = (item: ModuleItem) => {
    if (item.status === 'upcoming' && item.type === 'liveClass') {
      const date = new Date(item.date)
      const isToday = new Date().toDateString() === date.toDateString()
      
      if (isToday) {
        return (
          <Badge variant="default" className="ml-auto">
            Today
          </Badge>
        )
      }
      
      // Calculate days until the class
      const diffTime = date.getTime() - new Date().getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 3) {
        return (
          <Badge variant="outline" className="ml-auto">
            In {diffDays} day{diffDays > 1 ? 's' : ''}
          </Badge>
        )
      }
    }
    
    if (item.status === 'inProgress') {
      return (
        <Badge variant="outline" className="ml-auto text-primary border-primary">
          In Progress
        </Badge>
      )
    }
    
    // For assignments with due dates
    if (item.type === 'assignment' && item.dueDate && item.status !== 'completed') {
      const dueDate = new Date(item.dueDate)
      const today = new Date()
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 2) {
        return (
          <Badge variant="destructive" className="ml-auto">
            Due {diffDays <= 0 ? 'Today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`}
          </Badge>
        )
      }
    }
    
    return null
  }
  
  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-260px)]">
        <div className="p-4">
          <h2 className="text-sm font-medium mb-4">Module Content</h2>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => item.status !== 'locked' && onItemSelect(item.id)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-md p-2 text-sm transition-colors',
                  selectedItemId === item.id 
                    ? 'bg-primary text-white' 
                    : item.status === 'locked'
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      : 'hover:bg-muted',
                  'text-left'
                )}
                disabled={item.status === 'locked'}
              >
                {/* Status indicator */}
                <span className="flex-shrink-0">
                  {getStatusIndicator(item.status)}
                </span>
                
                {/* Item details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs",
                      selectedItemId === item.id ? "text-white" : "text-muted-foreground"
                    )}>
                      {getItemIcon(item.type)}
                      <span className="font-medium">
                        {getItemTypeLabel(item.type)}
                      </span>
                    </span>
                    
                    {/* Status badge */}
                    {selectedItemId !== item.id && getStatusBadge(item)}
                  </div>
                  
                  <span className={cn(
                    "block font-medium truncate mt-0.5",
                    item.status === 'locked' && "text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                  
                  {/* Show date for live classes */}
                  {item.type === 'liveClass' && item.date && (
                    <span className={cn(
                      "block text-xs mt-0.5", 
                      selectedItemId === item.id ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default ModuleNavigationSidebar 