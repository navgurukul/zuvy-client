'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ModuleNavigationSidebar from './_components/ModuleNavigationSidebar'
import ItemContentView from './_components/ItemContentView'

interface CourseModulePageProps {
  params: {
    courseId: string
    moduleId: string
  }
}

export default function CourseModulePage({ params }: CourseModulePageProps) {
  const { courseId, moduleId } = params
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Mock data for the course and module - would be fetched from API
  const [moduleData, setModuleData] = useState<any>(null)
  
  // Simulate loading the module data
  useEffect(() => {
    const fetchModuleData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Mock data
      const data = {
        id: moduleId,
        title: "JavaScript Fundamentals",
        description: "Master the core concepts of JavaScript, including variables, functions, arrays, and control flow.",
        courseName: "Web Development Bootcamp",
        items: [
          {
            id: "item1",
            title: "Introduction to JavaScript",
            type: "liveClass",
            status: "completed", // First live class - completed
            date: "2024-03-01T10:00:00Z",
            duration: 60,
            instructor: "Sarah Johnson",
            description: "Overview of JavaScript and its role in web development",
            recordingUrl: "https://example.com/recording123"
          },
          {
            id: "item1a",
            title: "JavaScript DOM Manipulation",
            type: "liveClass",
            status: "inProgress", // Second live class - in progress (happening now)
            date: new Date().toISOString(), // Current date and time
            duration: 90,
            instructor: "Michael Chen",
            description: "Learn how to interact with the Document Object Model using JavaScript"
          },
          {
            id: "item1b",
            title: "Advanced JavaScript Concepts",
            type: "liveClass",
            status: "upcoming", // Third live class - upcoming
            date: "2024-07-30T14:00:00Z", // Future date
            duration: 120,
            instructor: "Emily Rodriguez",
            description: "Explore closures, prototypes, and other advanced JavaScript patterns"
          },
          {
            id: "item2",
            title: "Variables and Data Types",
            type: "video",
            status: "completed",
            duration: 15,
            description: "Learn about variables, primitive types, and type coercion"
          },
          {
            id: "item3",
            title: "Functions and Scope",
            type: "article",
            status: "completed",
            readTime: 10,
            description: "Understand functions, parameters, return values, and variable scope"
          },
          {
            id: "item4",
            title: "Arrays and Objects",
            type: "video",
            status: "inProgress",
            duration: 20,
            description: "Work with complex data structures in JavaScript"
          },
          {
            id: "item5",
            title: "Control Flow",
            type: "video",
            status: "notStarted",
            duration: 18,
            description: "Learn about conditions, loops, and flow control in JavaScript"
          },
          {
            id: "item6",
            title: "Weekly Assignment: JavaScript Basics",
            type: "assignment",
            status: "notStarted",
            dueDate: "2024-03-17T23:59:59Z",
            description: "Apply your JavaScript knowledge to solve practical problems"
          },
          {
            id: "item7",
            title: "Module Assessment",
            type: "assessment",
            status: "locked",
            timeLimit: 45,
            questionCount: 20,
            description: "Test your understanding of JavaScript fundamentals"
          }
        ]
      }
      
      setModuleData(data)
      // Set the first non-locked item as selected by default
      const firstAvailableItem = data.items.find((item: any) => item.status !== 'locked')
      if (firstAvailableItem) {
        setSelectedItemId(firstAvailableItem.id)
      }
      setLoading(false)
    }
    
    fetchModuleData()
  }, [moduleId])
  
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId)
  }
  
  // Find the selected item
  const selectedItem = moduleData?.items.find((item: any) => item.id === selectedItemId) || null
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-6 mb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/student" className="hover:text-foreground transition-colors">
          Course Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium">
          {loading ? <Skeleton className="h-4 w-40 inline-block" /> : moduleData?.title}
        </span>
      </div>
      
      {/* Module Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
          {loading ? <Skeleton className="h-9 w-3/4" /> : moduleData?.title}
        </h1>
        <p className="text-muted-foreground">
          {loading ? (
            <>
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-5 w-2/3" />
            </>
          ) : (
            moduleData?.description
          )}
        </p>
      </div>
      
      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left pane: Module Navigation Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ModuleNavigationSidebar 
              items={moduleData?.items || []} 
              selectedItemId={selectedItemId} 
              onItemSelect={handleItemSelect}
            />
          )}
        </div>
        
        {/* Right pane: Item Content View */}
        <div className="lg:col-span-8 xl:col-span-9">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : selectedItem ? (
            <ItemContentView 
              item={selectedItem} 
              moduleItems={moduleData?.items || []}
              onNavigate={handleItemSelect}
            />
          ) : (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-muted-foreground">
                Select an item from the sidebar to view its content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 