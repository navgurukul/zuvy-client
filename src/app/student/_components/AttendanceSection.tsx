'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  calculateAttendanceStreak,
  getMotivationalMessage,
  calculateAttendedCount
} from '@/lib/utils/attendanceLogic'

/**
 * AttendanceSection component
 * 
 * Displays the attendance streak counter, motivational message,
 * status of the last 3 classes, and attendance summary
 */
const AttendanceSection = () => {
  // Mock data - would be fetched from API in real implementation
  const attendanceData = {
    lastClasses: [
      {
        id: 1,
        topic: "JavaScript Event Handling",
        date: "Feb 12, 2024",
        attended: true
      },
      {
        id: 2,
        topic: "DOM Manipulation Workshop",
        date: "Feb 10, 2024",
        attended: true
      },
      {
        id: 3,
        topic: "Async JavaScript Introduction",
        date: "Feb 7, 2024",
        attended: false
      }
    ]
  }
  
  // Calculate streak and attendance stats using utility functions
  const streakCount = calculateAttendanceStreak(attendanceData.lastClasses)
  const attendedCount = calculateAttendedCount(attendanceData.lastClasses)
  const motivationalMessage = getMotivationalMessage(streakCount)
  
  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-heading font-semibold">Attendance</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-6">
        {/* Streak Counter - Updated alignment, removed 'class streak' text */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center">
            <Flame className="h-8 w-8 text-orange-500 mr-2" />
            <span className="text-4xl font-bold text-orange-500">{streakCount}</span>
          </div>
          {/* Motivational message moved below streak icon and number */}
          <p className="text-sm text-muted-foreground mt-2">
            {motivationalMessage}
          </p>
        </div>
        
        {/* Last 3 Classes - Changed to full-width row style */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Recent Classes</h3>
          <div className="space-y-2">
            {attendanceData.lastClasses.map((cls) => (
              <div 
                key={cls.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-md w-full"
              >
                <div className="flex items-center gap-2">
                  {cls.attended ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" aria-label="Attended" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" aria-label="Missed" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate" title={cls.topic}>{cls.topic}</span>
                    <span className="text-xs text-muted-foreground">{cls.date}</span>
                  </div>
                </div>
                <Badge variant={cls.attended ? 'default' : 'destructive'} className={cn(
                  cls.attended ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground',
                  'text-xs'
                )}>
                  {cls.attended ? 'Attended' : 'Missed'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div className="border-t pt-4">
          <p className="text-center text-sm">
            <span className="font-medium">{attendedCount}/3</span> classes attended recently
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AttendanceSection 