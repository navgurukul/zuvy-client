'use client'

import React from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  CalendarClock, 
  Video, 
  FileText, 
  ClipboardCheck, 
  Clock,
  User,
  CheckCircle2,
  PlayCircle,
  Timer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ModuleItem {
  id: string
  title: string
  type: string
  status: string
  description: string
  [key: string]: any
}

interface ItemContentViewProps {
  item: ModuleItem
  moduleItems: ModuleItem[]
  onNavigate: (itemId: string) => void
}

/**
 * ItemContentView component
 * 
 * Displays the content of a selected module item
 * Shows different content blocks based on the item type
 * Provides navigation to previous/next items
 */
const ItemContentView = ({ 
  item, 
  moduleItems,
  onNavigate
}: ItemContentViewProps) => {
  // Get the indices for navigation
  const currentIndex = moduleItems.findIndex(i => i.id === item.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < moduleItems.length - 1

  // Get the previous and next items (if they exist)
  const previousItem = hasPrevious ? moduleItems[currentIndex - 1] : null
  const nextItem = hasNext ? moduleItems[currentIndex + 1] : null
  
  // Navigate to previous or next item
  const navigateToPrevious = () => {
    if (previousItem && previousItem.status !== 'locked') {
      onNavigate(previousItem.id)
    }
  }
  
  const navigateToNext = () => {
    if (nextItem && nextItem.status !== 'locked') {
      onNavigate(nextItem.id)
    }
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  
  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    }
    
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`
  }
  
  // Render content based on item type
  const renderContent = () => {
    switch (item.type) {
      case 'liveClass':
        return renderLiveClass()
      case 'video':
        return renderVideo()
      case 'article':
        return renderArticle()
      case 'assignment':
        return renderAssignment()
      case 'assessment':
        return renderAssessment()
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Content type not supported</p>
            </CardContent>
          </Card>
        )
    }
  }
  
  // Render live class content
  const renderLiveClass = () => {
    const isUpcoming = item.status === 'upcoming'
    const isCompleted = item.status === 'completed'
    const isInProgress = item.status === 'inProgress'
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Live Class</CardTitle>
            </div>
            {isInProgress && (
              <Badge variant="default" className="bg-success text-white animate-pulse">
                Live Now
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(item.date)}</span>
            </div>
            <Badge variant="outline" className="w-fit">
              {formatDuration(item.duration)}
            </Badge>
          </div>
          
          {item.instructor && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Instructor: {item.instructor}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="font-medium">About this class</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
          
          {isCompleted && item.recordingUrl && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Class Recording</h3>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                {/* This would be an actual video player in a real implementation */}
                <PlayCircle className="h-16 w-16 text-primary opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          {isInProgress ? (
            <Button className="h-12 px-6 w-full sm:w-auto bg-success hover:bg-success/90 text-white font-medium">
              Join Live Now
            </Button>
          ) : isUpcoming ? (
            <Button className="h-12 px-4 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {new Date(item.date).toDateString() === new Date().toDateString()
                ? 'Reminder: Join Today'
                : 'Add to Calendar'}
            </Button>
          ) : isCompleted ? (
            <Button variant="outline" className="h-12 px-4 w-full sm:w-auto">
              Download Materials
            </Button>
          ) : (
            <Button disabled className="h-12 px-4 w-full sm:w-auto">
              Class Not Available
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }
  
  // Render video content
  const renderVideo = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Video Lesson</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-4">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>{formatDuration(item.duration)}</span>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="font-medium">About this video</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
          
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            {/* This would be an actual video player in a real implementation */}
            <PlayCircle className="h-16 w-16 text-primary opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="h-12 px-4 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            {item.status === 'completed' ? 'Rewatch Video' : 
             item.status === 'inProgress' ? 'Resume Video' : 'Start Video'}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // Render article content
  const renderArticle = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Reading Material</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-4">
          {item.readTime && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span>{item.readTime} min read</span>
            </div>
          )}
          
          <Separator />
          
          <div className="prose prose-blue max-w-none dark:prose-invert">
            <h2>Article Content</h2>
            <p>
              {item.description}
            </p>
            <p>
              This is a placeholder for the actual article content. In a real implementation, 
              this would contain the full article text with proper formatting, images, code examples, etc.
            </p>
            <h3>Key Concepts</h3>
            <ul>
              <li>First important concept</li>
              <li>Second important concept</li>
              <li>Third important concept</li>
            </ul>
            <p>
              Additional explanatory text would appear here, elaborating on the concepts
              presented in the article.
            </p>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex items-center gap-2 w-full justify-between">
            <Button variant="outline" className="h-12 px-4">
              Download PDF
            </Button>
            <Button 
              variant={item.status === 'completed' ? 'outline' : 'default'}
              className={`h-12 px-4 ${item.status !== 'completed' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
            >
              {item.status === 'completed' ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </span>
              ) : 'Mark as Complete'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }
  
  // Render assignment content
  const renderAssignment = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Assignment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Due: {formatDate(item.dueDate)}</span>
            {new Date(item.dueDate) < new Date() && item.status !== 'completed' && (
              <Badge variant="destructive">Overdue</Badge>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="font-medium">Assignment Details</h3>
            <p className="text-muted-foreground">{item.description}</p>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-md">
              <h4 className="font-medium mb-2">Submission Requirements</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Complete all tasks described in the assignment document</li>
                <li>Submit your work as a single ZIP file</li>
                <li>Include a README file with instructions</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" className="h-12 px-4 sm:flex-1">
              Download Instructions
            </Button>
            <Button className="h-12 px-4 sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              {item.status === 'completed' ? 'View Feedback' : 'Submit Assignment'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }
  
  // Render assessment content
  const renderAssessment = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span>Time Limit: {item.timeLimit} minutes</span>
            </div>
            <Badge variant="outline" className="w-fit">
              {item.questionCount} Questions
            </Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Assessment Overview</h3>
              <p className="text-muted-foreground mt-1">{item.description}</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-md">
              <h4 className="font-medium mb-2">Important Information</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>This assessment covers all material from the module</li>
                <li>You must score at least 70% to pass</li>
                <li>Once started, the timer cannot be paused</li>
                <li>Ensure you have a stable internet connection before beginning</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            disabled={item.status === 'locked'} 
            className="h-12 px-4 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {item.status === 'completed' ? 'View Results' : 'Start Assessment'}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Item header */}
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-1">{item.title}</h2>
        <p className="text-muted-foreground">{item.description}</p>
      </div>
      
      {/* Item content */}
      {renderContent()}
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={navigateToPrevious}
          disabled={!hasPrevious || (previousItem?.status === 'locked')}
          className={cn(
            "h-12 px-4",
            (!hasPrevious || previousItem?.status === 'locked') && "opacity-50"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          variant="outline"
          onClick={navigateToNext}
          disabled={!hasNext || (nextItem?.status === 'locked')}
          className={cn(
            "h-12 px-4",
            (!hasNext || nextItem?.status === 'locked') && "opacity-50"
          )}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ItemContentView 