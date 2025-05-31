'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Circle, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Mock data for course modules
const mockModules = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the core concepts of JavaScript programming language",
    progress: 60,
    status: "inProgress", // inProgress, notStarted, completed
    topics: [
      { 
        id: 101, 
        title: "Variables and Data Types", 
        type: "lesson",
        completed: true
      },
      { 
        id: 102, 
        title: "Functions and Scope", 
        type: "lesson",
        completed: true
      },
      { 
        id: 103, 
        title: "Arrays and Objects", 
        type: "lesson",
        completed: false
      },
      { 
        id: 104, 
        title: "Control Flow and Loops", 
        type: "lesson",
        completed: false
      },
      { 
        id: 105, 
        title: "Module Assessment", 
        type: "assessment",
        completed: false
      }
    ]
  },
  {
    id: 2,
    title: "DOM Manipulation",
    description: "Interact with HTML elements using JavaScript",
    progress: 0,
    status: "notStarted", // inProgress, notStarted, completed
    topics: [
      { 
        id: 201, 
        title: "Introduction to the DOM", 
        type: "lesson",
        completed: false
      },
      { 
        id: 202, 
        title: "Selecting Elements", 
        type: "lesson",
        completed: false
      },
      { 
        id: 203, 
        title: "Modifying Content and Attributes", 
        type: "lesson",
        completed: false
      },
      { 
        id: 204, 
        title: "Event Handling", 
        type: "lesson",
        completed: false
      },
      { 
        id: 205, 
        title: "DOM Module Project", 
        type: "project",
        completed: false
      }
    ]
  },
  {
    id: 3,
    title: "Asynchronous JavaScript",
    description: "Work with promises, async/await, and handle API requests",
    progress: 100,
    status: "completed", // inProgress, notStarted, completed
    topics: [
      { 
        id: 301, 
        title: "Callbacks and Promises", 
        type: "lesson",
        completed: true
      },
      { 
        id: 302, 
        title: "Async/Await Syntax", 
        type: "lesson",
        completed: true
      },
      { 
        id: 303, 
        title: "Fetch API", 
        type: "lesson",
        completed: true
      },
      { 
        id: 304, 
        title: "Error Handling", 
        type: "lesson",
        completed: true
      },
      { 
        id: 305, 
        title: "Async Module Assessment", 
        type: "assessment",
        completed: true
      }
    ]
  },
  {
    id: 4,
    title: "React Fundamentals",
    description: "Learn the basics of the React library for building user interfaces",
    progress: 0,
    status: "locked", // inProgress, notStarted, completed, locked
    topics: [
      { 
        id: 401, 
        title: "Introduction to React", 
        type: "lesson",
        completed: false
      },
      { 
        id: 402, 
        title: "Components and Props", 
        type: "lesson",
        completed: false
      },
      { 
        id: 403, 
        title: "State and Lifecycle", 
        type: "lesson",
        completed: false
      },
      { 
        id: 404, 
        title: "Handling Events", 
        type: "lesson",
        completed: false
      },
      { 
        id: 405, 
        title: "React Module Project", 
        type: "project",
        completed: false
      }
    ]
  }
];

/**
 * CourseModulesSection component
 * 
 * Displays the course modules in a linear progression, showing individual module progress,
 * providing access to topics within the current module, and allowing navigation
 * to a detailed page for each module.
 */
const CourseModulesSection = () => {
  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<number[]>([1]); // Default to first module expanded
  
  // Toggle expanded state for a module
  const toggleModule = (moduleId: number) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };
  
  // Get CTA button text based on module status
  const getCtaText = (status: string) => {
    switch(status) {
      case 'notStarted': return 'Start Learning';
      case 'inProgress': return 'Resume Learning';
      case 'completed': return 'Revise Concepts';
      default: return 'View Module';
    }
  };
  
  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-heading font-semibold">
          Course Modules
        </CardTitle>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Complete modules sequentially to unlock the next content
        </p>
      </CardHeader>
      
      <CardContent className="px-0 pb-0 space-y-4">
        {mockModules.map((module) => (
          <Card 
            key={module.id} 
            className={`border ${
              module.status === 'inProgress' 
                ? 'border-primary/50' 
                : module.status === 'locked' 
                  ? 'border-muted bg-muted/20' 
                  : 'border-border'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {module.status === 'locked' ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : module.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className={`h-4 w-4 ${module.status === 'inProgress' ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <h3 className="font-heading font-medium">
                    {module.title}
                  </h3>
                </div>
                
                {module.status !== 'locked' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => toggleModule(module.id)}
                  >
                    {expandedModules.includes(module.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              <div className="space-y-1 mb-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{module.progress}%</span>
                </div>
                {/* Module Progress Bar */}
                {module.status !== 'locked' && (
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={module.progress} className="h-1.5 w-1/3 [&>div]:bg-success" />
                  </div>
                )}
              </div>
              
              {/* Expanded module content */}
              {expandedModules.includes(module.id) && module.status !== 'locked' && (
                <div className="mt-4 space-y-4">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Topics
                  </div>
                  
                  <ul className="space-y-2">
                    {module.topics.map((topic) => (
                      <li key={topic.id} className="flex items-start gap-2">
                        {/* Topic Progress (Checkmark or Circle) */}
                        {topic.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className="text-sm">{topic.title}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button with right alignment and width that hugs content */}
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="default"
                      className="h-12 px-4 font-sans w-auto bg-primary text-primary-foreground"
                      disabled={module.status === 'locked'}
                      asChild
                    >
                      <Link href={`/course/course1/module/${module.id}`}>
                        {getCtaText(module.status)}
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

export default CourseModulesSection 