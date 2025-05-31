'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  FileText, 
  FileCheck, 
  CalendarClock, 
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react'
import Link from 'next/link'

/**
 * WhatsNextSection component
 * 
 * Displays a consolidated list of the next five upcoming items
 * (live classes, assignments, assessments/quizzes) ordered by due date/time
 */
const WhatsNextSection = () => {
  // Mock data - would be fetched from API in real implementation
  const upcomingItems = [
    {
      id: 1,
      type: 'liveClass',
      title: 'JavaScript Functions Deep Dive',
      status: 'Today',
      dateTime: 'Today, 4:00 PM',
      duration: '90 minutes',
      info: 'Learn advanced function concepts including closures and higher-order functions',
      actionLabel: 'Join Class',
      actionUrl: '#',
      urgent: true
    },
    {
      id: 2,
      type: 'assignment',
      title: 'React Component Challenge',
      status: 'Due Tomorrow',
      dateTime: 'Feb 15, 11:59 PM',
      info: 'Build five custom React components from the provided designs',
      actionLabel: 'View Assignment',
      actionUrl: '#',
      urgent: false
    },
    {
      id: 3,
      type: 'quiz',
      title: 'CSS Layouts Quiz',
      status: 'Due in 3 days',
      dateTime: 'Feb 17, 3:00 PM',
      duration: '45 minutes',
      info: '25 questions covering Flexbox, Grid, and responsive design techniques',
      actionLabel: 'Start Quiz',
      actionUrl: '#',
      urgent: false
    },
    {
      id: 4,
      type: 'liveClass',
      title: 'Database Design Principles',
      status: 'This Week',
      dateTime: 'Feb 18, 2:00 PM',
      duration: '120 minutes',
      info: 'Introduction to relational database concepts and normalization',
      actionLabel: 'Add to Calendar',
      actionUrl: '#',
      urgent: false
    },
    {
      id: 5,
      type: 'assessment',
      title: 'Mid-Module Assessment',
      status: 'Due in 7 days',
      dateTime: 'Feb 22, 2:00 PM',
      duration: '90 minutes',
      info: 'Comprehensive assessment covering all topics from this module',
      actionLabel: 'Prepare for Assessment',
      actionUrl: '#',
      urgent: false
    }
  ]

  // Function to render the appropriate icon based on item type
  const getItemIcon = (type: string) => {
    switch(type) {
      case 'liveClass':
        return <Video className="h-5 w-5 text-primary" />
      case 'assignment':
        return <FileText className="h-5 w-5 text-primary" />
      case 'quiz':
        return <FileCheck className="h-5 w-5 text-primary" />
      case 'assessment':
        return <FileSpreadsheet className="h-5 w-5 text-primary" />
      default:
        return <CalendarClock className="h-5 w-5 text-primary" />
    }
  }

  // Function to determine button variant based on item type
  const getButtonVariant = (item: any) => {
    if (item.type === 'liveClass') return "default" // primary
    if (item.type === 'assignment' || item.type === 'quiz') return "secondary"
    if (item.type === 'assessment') return "default" 
    return "default"
  }

  return (
    <Card className="h-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-heading">What&apos;s Next?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {upcomingItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="flex items-center justify-between gap-4 py-2">
                {/* Left: Icon + Content */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getItemIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge variant={item.urgent ? "destructive" : "outline"} className="ml-1">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>{item.dateTime}</span>
                      {item.duration && <span className="ml-2">· {item.duration}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.info}
                    </p>
                  </div>
                </div>
                
                {/* Right: Action Button */}
                <div className="ml-auto pl-2 flex-shrink-0 self-center">
                  <Link href={item.actionUrl || '#'} passHref>
                    <Button 
                      variant={getButtonVariant(item)} 
                      size="sm" 
                      className="h-8"
                    >
                      {item.actionLabel}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Separator - add for all but last item */}
              {index < upcomingItems.length - 1 && (
                <div className="border-b border-border"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default WhatsNextSection 