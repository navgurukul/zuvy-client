/**
 * Utility functions for fetching and managing course data
 */

export interface CourseItem {
  id: string;
  title: string;
  type: 'liveClass' | 'video' | 'article' | 'assignment' | 'assessment';
  status: 'upcoming' | 'completed' | 'inProgress' | 'notStarted' | 'locked';
  description: string;
  [key: string]: any;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'inProgress' | 'notStarted' | 'completed' | 'locked';
  topics: Array<{
    id: number;
    title: string;
    type: string;
    completed: boolean;
  }>;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  instructor: {
    name: string;
    avatar: string;
  };
  modules: Module[];
}

/**
 * Fetch course data by course ID
 * This is a mock implementation that returns hardcoded data
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data
  const course: Course = {
    id: courseId,
    name: "Web Development Bootcamp",
    description: "A comprehensive journey from HTML basics to full-stack application development",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    progress: 38,
    instructor: {
      name: "Sarah Johnson",
      avatar: "/avatars/instructor.png"
    },
    modules: [
      {
        id: "module1",
        title: "JavaScript Fundamentals",
        description: "Learn the core concepts of JavaScript programming language",
        progress: 60,
        status: "inProgress",
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
        id: "module2",
        title: "DOM Manipulation",
        description: "Interact with HTML elements using JavaScript",
        progress: 0,
        status: "notStarted",
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
        id: "module3",
        title: "Asynchronous JavaScript",
        description: "Work with promises, async/await, and handle API requests",
        progress: 100,
        status: "completed",
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
        id: "module4",
        title: "React Fundamentals",
        description: "Learn the basics of the React library for building user interfaces",
        progress: 0,
        status: "locked",
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
    ]
  };
  
  return course;
}

/**
 * Fetch module data by module ID
 */
export async function getModuleById(courseId: string, moduleId: string): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // First get the course
  const course = await getCourseById(courseId);
  if (!course) return null;
  
  // Find the module in the course
  const module = course.modules.find(m => m.id === moduleId);
  if (!module) return null;
  
  // Mock module items
  const items: CourseItem[] = [
    {
      id: "item1",
      title: "Introduction to JavaScript",
      type: "liveClass",
      status: "upcoming",
      date: "2024-03-15T10:00:00Z",
      duration: 60,
      instructor: "Sarah Johnson",
      description: "Overview of JavaScript and its role in web development"
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
  ];
  
  return {
    id: moduleId,
    title: module.title,
    description: module.description,
    courseName: course.name,
    courseId: course.id,
    items
  };
}

/**
 * Get upcoming course items across all modules
 */
export async function getUpcomingItems(courseId: string, limit = 5): Promise<any[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Mock upcoming items
  const upcomingItems = [
    {
      id: "upcoming1",
      title: "Introduction to JavaScript",
      type: "liveClass",
      status: "upcoming",
      date: "2024-03-15T10:00:00Z",
      moduleId: "module1",
      moduleName: "JavaScript Fundamentals",
      description: "Overview of JavaScript and its role in web development"
    },
    {
      id: "upcoming2",
      title: "Weekly Assignment: JavaScript Basics",
      type: "assignment",
      status: "notStarted",
      dueDate: "2024-03-17T23:59:59Z",
      moduleId: "module1",
      moduleName: "JavaScript Fundamentals",
      description: "Apply your JavaScript knowledge to solve practical problems"
    },
    {
      id: "upcoming3",
      title: "JavaScript Quiz #1",
      type: "assessment",
      status: "notStarted",
      dueDate: "2024-03-20T23:59:59Z",
      moduleId: "module1",
      moduleName: "JavaScript Fundamentals",
      description: "Test your understanding of basic JavaScript concepts"
    },
    {
      id: "upcoming4",
      title: "Arrays and Objects Workshop",
      type: "liveClass",
      status: "upcoming",
      date: "2024-03-22T14:00:00Z",
      moduleId: "module1",
      moduleName: "JavaScript Fundamentals",
      description: "Interactive session on working with JavaScript data structures"
    },
    {
      id: "upcoming5",
      title: "DOM Manipulation Introduction",
      type: "liveClass",
      status: "upcoming",
      date: "2024-03-29T10:00:00Z",
      moduleId: "module2",
      moduleName: "DOM Manipulation",
      description: "Introduction to manipulating HTML using JavaScript"
    }
  ];
  
  return upcomingItems.slice(0, limit);
}

/**
 * Update course item progress
 */
export async function updateItemProgress(
  courseId: string,
  moduleId: string,
  itemId: string,
  progress: number
): Promise<boolean> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would make an API call to update the database
  console.log(`Updated progress for item ${itemId} to ${progress}%`);
  
  // Return success
  return true;
}

/**
 * Mark a course item as completed
 */
export async function markItemAsCompleted(
  courseId: string,
  moduleId: string,
  itemId: string
): Promise<boolean> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would make an API call to update the database
  console.log(`Marked item ${itemId} as completed`);
  
  // Return success
  return true;
} 