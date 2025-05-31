'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CalendarIcon } from 'lucide-react'

/**
 * CourseInformationBanner component
 * 
 * Displays key information about the current course:
 * - Left side: Course name, dates, progress
 * - Right side: Instructor details
 */
const CourseInformationBanner = () => {
  // Mock data - would be fetched from API in real implementation
  const courseData = {
    name: "Full Stack Web Development",
    startDate: "Jan 15, 2024",
    endDate: "Jun 30, 2024",
    progress: 65,
    instructor: {
      name: "Dr. Jane Smith",
      avatarUrl: "/placeholder-avatar.png" // Replace with actual instructor avatar
    }
  }
  
  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Left-aligned content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-foreground">{courseData.name}</h2>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                {courseData.startDate} - {courseData.endDate}
              </span>
            </div>
            
            <div className="space-y-2 max-w-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-sans">Course Progress</span>
                <span className="text-sm font-sans font-medium">{courseData.progress}%</span>
              </div>
              <Progress value={courseData.progress} className="h-2 [&>div]:bg-success" />
            </div>
          </div>
          
          {/* Right-aligned content */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={courseData.instructor.avatarUrl} alt={courseData.instructor.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {courseData.instructor.name.split(' ').map(name => name[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col md:items-end">
              <span className="text-sm text-muted-foreground">Instructor</span>
              <span className="font-medium">{courseData.instructor.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseInformationBanner 