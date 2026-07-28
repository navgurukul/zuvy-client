
export interface Student {
    id: string;
    name: string;
    email: string;
    avatar: string;
  }
  
  export interface Course {
    id: string;
    name: string;
    description: string;
    instructor: {
      name: string;
      avatar: string;
    };
    image: string;
    progress: number;
    status: 'enrolled' | 'completed';
    batchName: string;
    duration: string;
    studentsEnrolled: number;
    upcomingItems: UpcomingItem[];
    modules: Module[];
    attendanceStats: {
      percentage: number;
      attended: number;
      total: number;
      recentClasses: RecentClass[];
    };
    currentModule: {
      id: string;
      name: string;
      currentChapter: string;
      currentItem: string;
      nextItem: {
        type: string;
        name: string;
        scheduledTime?: string;
        dueDate?: string;
      };
      isJustStarting: boolean;
    };
  }
  
  export interface UpcomingItem {
    id: string;
    type: 'class' | 'assessment' | 'assignment';
    title: string;
    description: string;
    dateTime: Date;
    tag: string;
    actionText: string;
    canStart: boolean;
    daysUntil?: number;
  }
  
  export interface RecentClass {
    id: string;
    name: string;
    status: 'attended' | 'absent';
    date: Date;
    instructor: string;
  }
  
  export interface Module {
    id: string;
    name: string;
    topics: Topic[];
  }
  
  export interface Topic {
    id: string;
    name: string;
    description: string;
    items: TopicItem[];
  }
  
  export interface TopicItem {
    id: string;
    type: 'live-class' | 'recording' | 'video' | 'article' | 'assignment' | 'assessment' | 'quiz' | 'feedback';
    title: string;
    status: 'not-started' | 'in-progress' | 'completed';
    description?: string;
    duration?: string;
    meetLink?: string;
    videoUrl?: string;
    content?: string;
    dueDate?: Date;
    scheduledDateTime?: Date;
    endDateTime?: Date;
    attendanceStatus?: 'present' | 'absent';
    watchStatus?: 'not-watched' | 'watched';
    readStatus?: 'not-started' | 'read';
  }
  
  // Mock Data
  export const mockStudent: Student = {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };
  
  export const mockCourses: Course[] = [
    {
      id: "502",
      name: "Full Stack JavaScript Development",
      description: "Master modern web development with React, Node.js, and MongoDB",
      instructor: {
        name: "Dr. Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150&h=150&fit=crop&crop=face"
      },
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
      progress: 68,
      status: 'enrolled',
      batchName: "FSB-2024-A",
      duration: "6 months",
      studentsEnrolled: 45,
      upcomingItems: [
        {
          id: "1",
          type: 'class',
          title: "Live Class: Advanced React Patterns",
          description: "Learn about render props, higher-order components, and hooks patterns",
          dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tag: "Upcoming Live Class",
          actionText: "Class starts in 2 days",
          canStart: false,
          daysUntil: 2
        },
        {
          id: "2",
          type: 'assessment',
          title: "Assessment: React Fundamentals Quiz",
          description: "Test your knowledge of React hooks, state management, and lifecycle methods",
          dateTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
          tag: "Upcoming Assessment",
          actionText: "Assessment starts in 12 hours",
          canStart: false
        },
        {
          id: "3",
          type: 'assignment',
          title: "Assignment: Build a Todo App",
          description: "Create a fully functional todo application using React and local storage",
          dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tag: "Upcoming Assignment",
          actionText: "Start Assignment",
          canStart: true
        }
      ],
      attendanceStats: {
        percentage: 85,
        attended: 17,
        total: 20,
        recentClasses: [
          {
            id: "1",
            name: "Introduction to React Hooks",
            status: 'attended',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            instructor: "Dr. Sarah Chen"
          },
          {
            id: "2",
            name: "State Management Basics",
            status: 'attended',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            instructor: "Dr. Sarah Chen"
          },
          {
            id: "3",
            name: "Component Composition",
            status: 'absent',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            instructor: "Dr. Sarah Chen"
          }
        ]
      },
      currentModule: {
        id: "1",
        name: "JavaScript Fundamentals",
        currentChapter: "Introduction to JavaScript & Setup",
        currentItem: "Introduction to JavaScript",
        nextItem: {
          type: "live-class",
          name: "What is JavaScript? History, Use Cases & Setting up Your Development Environment",
          scheduledTime: "Available now"
        },
        isJustStarting: false
      },
      modules: [
        {
          id: "1",
          name: "JavaScript Fundamentals",
          topics: [
            {
              id: "1",
              name: "Introduction to JavaScript & Setup",
              description: "Learn the absolute basics of JavaScript and set up your development environment",
              items: [
                {
                  id: "1-1-1",
                  type: 'live-class',
                  title: "What is JavaScript? History, Use Cases & Setting up Your Development Environment",
                  status: 'completed',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  meetLink: "https://meet.google.com/abc-defg-hij",
                  attendanceStatus: 'present',
                  description: "Introduction to JavaScript fundamentals and development environment setup"
                },
                {
                  id: "1-1-2",
                  type: 'video',
                  title: "Installing Node.js and npm",
                  status: 'completed',
                  duration: "15 min",
                  watchStatus: 'watched'
                },
                {
                  id: "1-1-3",
                  type: 'video',
                  title: "VS Code setup for JavaScript development",
                  status: 'completed',
                  duration: "12 min",
                  watchStatus: 'watched'
                },
                {
                  id: "1-1-4",
                  type: 'article',
                  title: "The History of JavaScript",
                  status: 'completed',
                  duration: "6 min read",
                  readStatus: 'read'
                },
                {
                  id: "1-1-5",
                  type: 'article',
                  title: "Why Learn JavaScript in 2025?",
                  status: 'completed',
                  duration: "8 min read",
                  readStatus: 'read'
                },
                {
                  id: "1-1-6",
                  type: 'assignment',
                  title: "Setup your Development Environment",
                  status: 'completed',
                  description: "Setup your development environment and write a 'Hello, World!' program in JavaScript"
                },
                {
                  id: "1-1-7",
                  type: 'assessment',
                  title: "JavaScript Basics and Environment Setup",
                  status: 'completed',
                  description: "Quiz on JavaScript basics and environment setup",
                  duration: "30 min",
                  scheduledDateTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                }
              ]
            },
            {
              id: "2",
              name: "Variables, Data Types & Operators",
              description: "Master JavaScript variables, primitive data types, and various operators",
              items: [
                {
                  id: "1-2-1",
                  type: 'live-class',
                  title: "Understanding var, let, const; Primitive Data Types; Operators",
                  status: 'completed',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                  attendanceStatus: 'present',
                  description: "Deep dive into JavaScript variables, data types, and operators"
                },
                {
                  id: "1-2-2",
                  type: 'video',
                  title: "Deep dive into JavaScript data types",
                  status: 'in-progress',
                  duration: "20 min",
                  watchStatus: 'not-watched'
                },
                {
                  id: "1-2-3",
                  type: 'video',
                  title: "Practical examples of operators",
                  status: 'not-started',
                  duration: "18 min",
                  watchStatus: 'not-watched'
                },
                {
                  id: "1-2-4",
                  type: 'article',
                  title: "JavaScript Naming Conventions",
                  status: 'not-started',
                  duration: "5 min read",
                  readStatus: 'not-started'
                },
                {
                  id: "1-2-5",
                  type: 'article',
                  title: "Type Coercion in JavaScript",
                  status: 'not-started',
                  duration: "7 min read",
                  readStatus: 'not-started'
                },
                {
                  id: "1-2-6",
                  type: 'assignment',
                  title: "Simple Calculator Script",
                  status: 'not-started',
                  description: "Create a simple calculator script that uses various data types and operators"
                },
                {
                  id: "1-2-7",
                  type: 'assessment',
                  title: "Variable Manipulation Challenge",
                  status: 'not-started',
                  description: "Coding challenge involving variable manipulation and operator usage",
                  duration: "45 min",
                  scheduledDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                }
              ]
            },
            {
              id: "3",
              name: "Control Flow - Conditional Statements & Loops",
              description: "Learn to control program flow with conditionals and loops",
              items: [
                {
                  id: "1-3-1",
                  type: 'live-class',
                  title: "if/else statements, switch statements; for, while, do...while loops",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                  description: "Master control flow with conditional statements and various loop types"
                },
                {
                  id: "1-3-2",
                  type: 'video',
                  title: "Mastering loops in JavaScript",
                  status: 'not-started',
                  duration: "25 min"
                },
                {
                  id: "1-3-3",
                  type: 'video',
                  title: "Conditional logic best practices",
                  status: 'not-started',
                  duration: "22 min"
                },
                {
                  id: "1-3-4",
                  type: 'article',
                  title: "Ternary Operator for concise conditionals",
                  status: 'not-started',
                  duration: "6 min read"
                },
                {
                  id: "1-3-5",
                  type: 'article',
                  title: "Common pitfalls with loops",
                  status: 'not-started',
                  duration: "8 min read"
                },
                {
                  id: "1-3-6",
                  type: 'assignment',
                  title: "FizzBuzz Challenge",
                  status: 'not-started',
                  description: "Write a script that prints numbers 1-100, but prints 'Fizz' for multiples of 3, 'Buzz' for multiples of 5"
                },
                {
                  id: "1-3-7",
                  type: 'assessment',
                  title: "Control Flow Quiz",
                  status: 'not-started',
                  description: "Quiz on control flow statements",
                  duration: "35 min",
                  scheduledDateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                }
              ]
            },
            {
              id: "4",
              name: "Functions & Scope",
              description: "Understand function declarations, scope, and advanced function concepts",
              items: [
                {
                  id: "1-4-1",
                  type: 'live-class',
                  title: "Declaring functions; Parameters and arguments; Return values; Scope",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                  description: "Learn function declarations, expressions, arrow functions, and scope concepts"
                },
                {
                  id: "1-4-2",
                  type: 'video',
                  title: "Understanding 'this' keyword in functions",
                  status: 'not-started',
                  duration: "28 min"
                },
                {
                  id: "1-4-3",
                  type: 'video',
                  title: "Closures explained simply",
                  status: 'not-started',
                  duration: "24 min"
                },
                {
                  id: "1-4-4",
                  type: 'article',
                  title: "Hoisting in JavaScript",
                  status: 'not-started',
                  duration: "10 min read"
                },
                {
                  id: "1-4-5",
                  type: 'article',
                  title: "IIFE (Immediately Invoked Function Expressions)",
                  status: 'not-started',
                  duration: "8 min read"
                },
                {
                  id: "1-4-6",
                  type: 'assignment',
                  title: "Utility Functions Collection",
                  status: 'not-started',
                  description: "Create a set of utility functions (e.g., capitalize string, find max number in array)"
                },
                {
                  id: "1-4-7",
                  type: 'assessment',
                  title: "Function Scope Debugging",
                  status: 'not-started',
                  description: "Debugging exercises involving function scope and return values",
                  duration: "40 min",
                  scheduledDateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
              ]
            }
          ]
        },
        {
          id: "2",
          name: "DOM Manipulation & Events",
          topics: [
            {
              id: "1",
              name: "Introduction to the DOM",
              description: "Learn about the Document Object Model and how to select elements",
              items: [
                {
                  id: "2-1-1",
                  type: 'live-class',
                  title: "What is the DOM? Document tree; Selecting elements",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  description: "Introduction to DOM concepts and element selection methods"
                },
                {
                  id: "2-1-2",
                  type: 'video',
                  title: "Visualizing the DOM tree",
                  status: 'not-started',
                  duration: "15 min"
                },
                {
                  id: "2-1-3",
                  type: 'video',
                  title: "Different ways to select elements",
                  status: 'not-started',
                  duration: "20 min"
                },
                {
                  id: "2-1-4",
                  type: 'article',
                  title: "Understanding Nodes in the DOM",
                  status: 'not-started',
                  duration: "8 min read"
                },
                {
                  id: "2-1-5",
                  type: 'article',
                  title: "Best practices for DOM element selection",
                  status: 'not-started',
                  duration: "6 min read"
                },
                {
                  id: "2-1-6",
                  type: 'assignment',
                  title: "DOM Element Selection Practice",
                  status: 'not-started',
                  description: "Create a simple HTML page and use JavaScript to select various elements"
                },
                {
                  id: "2-1-7",
                  type: 'assessment',
                  title: "DOM Concepts Quiz",
                  status: 'not-started',
                  description: "Quiz on DOM concepts and selectors",
                  duration: "30 min",
                  scheduledDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000)
                }
              ]
            }
          ]
        },
        {
          id: "3",
          name: "Asynchronous JavaScript & APIs",
          topics: [
            {
              id: "1",
              name: "Understanding Asynchronous JavaScript",
              description: "Learn the fundamentals of asynchronous programming in JavaScript",
              items: [
                {
                  id: "3-1-1",
                  type: 'live-class',
                  title: "Synchronous vs. Asynchronous programming; The Event Loop",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                  description: "Understanding asynchronous concepts and the event loop"
                }
              ]
            }
          ]
        },
        {
          id: "4",
          name: "Introduction to Node.js & Express.js",
          topics: [
            {
              id: "1",
              name: "Introduction to Node.js",
              description: "Step into server-side JavaScript with Node.js",
              items: [
                {
                  id: "4-1-1",
                  type: 'live-class',
                  title: "What is Node.js? Node.js architecture; npm",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                  description: "Introduction to Node.js and server-side JavaScript"
                }
              ]
            }
          ]
        },
        {
          id: "5",
          name: "Building a Full Stack Application & Review",
          topics: [
            {
              id: "1",
              name: "Connecting Front-end to Back-end",
              description: "Learn to connect your frontend and backend applications",
              items: [
                {
                  id: "5-1-1",
                  type: 'live-class',
                  title: "Making API calls from your front-end to your Express back-end",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                  description: "Connect frontend and backend with API calls and handle CORS"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Android App Development with Kotlin",
      description: "Build native Android applications using Kotlin and modern Android development tools",
      instructor: {
        name: "Prof. Michael Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
      progress: 35,
      status: 'enrolled',
      batchName: "AND-2024-B",
      duration: "5 months",
      studentsEnrolled: 38,
      upcomingItems: [
        {
          id: "1",
          type: 'class',
          title: "Live Class: Activity Lifecycle",
          description: "Understanding Android activity lifecycle and state management",
          dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          tag: "Upcoming Live Class",
          actionText: "Class starts in 1 day",
          canStart: false,
          daysUntil: 1
        }
      ],
      attendanceStats: {
        percentage: 90,
        attended: 9,
        total: 10,
        recentClasses: [
          {
            id: "1",
            name: "Kotlin Fundamentals",
            status: 'attended',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            instructor: "Prof. Michael Rodriguez"
          },
          {
            id: "2", 
            name: "Android Studio Setup",
            status: 'attended',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            instructor: "Prof. Michael Rodriguez"
          },
          {
            id: "3",
            name: "Variables and Data Types",
            status: 'absent',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            instructor: "Prof. Michael Rodriguez"
          }
        ]
      },
      currentModule: {
        id: "2",
        name: "Android UI Development",
        currentChapter: "Layouts and Views",
        currentItem: "Linear and Relative Layouts",
        nextItem: {
          type: "live-class",
          name: "Activity Lifecycle",
          scheduledTime: "Tomorrow at 3:00 PM"
        },
        isJustStarting: false
      },
      modules: [
        {
          id: "1",
          name: "Kotlin Programming",
          topics: [
            {
              id: "1",
              name: "Kotlin Basics",
              description: "Introduction to Kotlin programming language and its syntax",
              items: [
                {
                  id: "1-1-1",
                  type: 'live-class',
                  title: "Introduction to Kotlin",
                  status: 'completed',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                  attendanceStatus: 'present',
                  description: "Learn Kotlin syntax and basic programming concepts"
                },
                {
                  id: "1-1-2",
                  type: 'video',
                  title: "Kotlin vs Java",
                  status: 'completed',
                  duration: "15 min",
                  watchStatus: 'watched'
                },
                {
                  id: "1-1-3",
                  type: 'article',
                  title: "Kotlin Best Practices",
                  status: 'completed',
                  duration: "8 min read",
                  readStatus: 'read'
                },
                {
                  id: "1-1-4",
                  type: 'assignment',
                  title: "Basic Kotlin Programs",
                  status: 'completed',
                  description: "Write basic Kotlin programs to practice syntax"
                },
                {
                  id: "1-1-5",
                  type: 'assessment',
                  title: "Kotlin Fundamentals Quiz",
                  status: 'completed',
                  description: "Test your knowledge of Kotlin basics",
                  duration: "30 min",
                  scheduledDateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              ]
            },
            {
              id: "2",
              name: "Object-Oriented Programming in Kotlin",
              description: "Learn OOP concepts in Kotlin including classes, objects, and inheritance",
              items: [
                {
                  id: "1-2-1",
                  type: 'live-class',
                  title: "Classes and Objects in Kotlin",
                  status: 'completed',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  attendanceStatus: 'present',
                  description: "Deep dive into OOP concepts in Kotlin"
                },
                {
                  id: "1-2-2",
                  type: 'video',
                  title: "Inheritance and Polymorphism",
                  status: 'in-progress',
                  duration: "25 min",
                  watchStatus: 'not-watched'
                },
                {
                  id: "1-2-3",
                  type: 'article',
                  title: "Data Classes in Kotlin",
                  status: 'not-started',
                  duration: "10 min read",
                  readStatus: 'not-started'
                },
                {
                  id: "1-2-4",
                  type: 'assignment',
                  title: "OOP Practice Project",
                  status: 'not-started',
                  description: "Create a small project using OOP principles in Kotlin"
                },
                {
                  id: "1-2-5",
                  type: 'assessment',
                  title: "OOP Concepts Test",
                  status: 'not-started',
                  description: "Assessment on object-oriented programming in Kotlin",
                  duration: "45 min",
                  scheduledDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                }
              ]
            }
          ]
        },
        {
          id: "2",
          name: "Android UI Development",
          topics: [
            {
              id: "1",
              name: "Layouts and Views",
              description: "Learn about different layout types and view components in Android",
              items: [
                {
                  id: "2-1-1",
                  type: 'live-class',
                  title: "Activity Lifecycle",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                  description: "Understanding Android activity lifecycle and state management"
                },
                {
                  id: "2-1-2",
                  type: 'video',
                  title: "Linear and Relative Layouts",
                  status: 'not-started',
                  duration: "30 min",
                  watchStatus: 'not-watched'
                },
                {
                  id: "2-1-3",
                  type: 'video',
                  title: "ConstraintLayout Basics",
                  status: 'not-started',
                  duration: "25 min",
                  watchStatus: 'not-watched'
                },
                {
                  id: "2-1-4",
                  type: 'article',
                  title: "Android UI Design Principles",
                  status: 'not-started',
                  duration: "12 min read",
                  readStatus: 'not-started'
                },
                {
                  id: "2-1-5",
                  type: 'assignment',
                  title: "Layout Design Challenge",
                  status: 'not-started',
                  description: "Create different layouts using various layout managers"
                },
                {
                  id: "2-1-6",
                  type: 'assessment',
                  title: "UI Components Quiz",
                  status: 'not-started',
                  description: "Test your knowledge of Android UI components",
                  duration: "35 min",
                  scheduledDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                  endDateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
                }
              ]
            }
          ]
        },
        {
          id: "3",
          name: "Android Components",
          topics: [
            {
              id: "1",
              name: "Activities and Intents",
              description: "Master Android activities and intent system",
              items: [
                {
                  id: "3-1-1",
                  type: 'live-class',
                  title: "Understanding Activities and Intents",
                  status: 'not-started',
                  duration: "90 min",
                  scheduledDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  description: "Learn about Android activities and the intent system"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "3",
      name: "Python for Data Science",
      description: "Learn Python programming for data analysis and machine learning",
      instructor: {
        name: "Dr. Emily Watson",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
      },
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
      progress: 100,
      status: 'completed',
      batchName: "PDS-2024-B",
      duration: "4 months",
      studentsEnrolled: 32,
      upcomingItems: [],
      attendanceStats: {
        percentage: 95,
        attended: 19,
        total: 20,
        recentClasses: []
      },
      currentModule: {
        id: "1",
        name: "Course Completed",
        currentChapter: "All chapters completed",
        currentItem: "All content completed",
        nextItem: {
          type: "completed",
          name: "Course Certificate Available"
        },
        isJustStarting: false
      },
      modules: []
    }
  ];

  // ─── All mock data for the Zuvy Eval standalone prototype ─────────────────────
// This file is the single source of truth for all demo content.
// Replace each export with a real API call when wiring to a backend.

import type { Course, Module, Chapter, Question, Level, Student, BatchStats, LevelId } from '@/types'

// ─── ADAPTIVE LEVEL MODEL ─────────────────────────────────────────────────────
// Six levels from E (weakest) to A+ (strongest).
// mix = [easy%, medium%, hard%] — how each level's form is assembled from the pool.

export const LEVELS: Level[] = [
  { id: 'E',  label: 'Level E',  mix: [60, 30, 10] },
  { id: 'D',  label: 'Level D',  mix: [50, 35, 15] },
  { id: 'C',  label: 'Level C',  mix: [35, 40, 25] },
  { id: 'B',  label: 'Level B',  mix: [30, 40, 30] },
  { id: 'A',  label: 'Level A',  mix: [20, 40, 40] },
  { id: 'A+', label: 'Level A+', mix: [10, 35, 55] },
]

// ─── BASELINE LEVEL MAPPING ───────────────────────────────────────────────────
// Derived from a learner's aggregate MCQ performance across the module's chapters.
// Percentage = (correct answers) / (total answered) across all linked MCQ chapters.

export const BASELINE_RULES: Array<{ minPct: number; maxPct: number; level: LevelId }> = [
  { minPct: 90, maxPct: 100, level: 'A+' },
  { minPct: 76, maxPct: 89,  level: 'A'  },
  { minPct: 61, maxPct: 75,  level: 'B'  },
  { minPct: 46, maxPct: 60,  level: 'C'  },
  { minPct: 31, maxPct: 45,  level: 'D'  },
  { minPct: 0,  maxPct: 30,  level: 'E'  },
]

// Learners with zero MCQ attempts default to Level C (median starting point).
export const DEFAULT_START_LEVEL: LevelId = 'C'

export const POOL_MULTIPLIER = 2.5  // pool target = 2.5× the largest draw any level makes

// ─── COURSES ─────────────────────────────────────────────────────────────────

export const COURSES: Course[] = [
  { id: 1, name: 'Web Development Fundamentals', description: 'HTML, CSS, and JavaScript from the ground up.', language: 'English', duration: '12 weeks', startDate: '2026-07-01', coverColor: '#2C5F2D' },
  { id: 2, name: 'Python for Data Science',       description: 'Python, Pandas, and data visualisation.', language: 'English', duration: '10 weeks', startDate: '2026-07-15', coverColor: '#1976D2' },
  { id: 3, name: 'Finance & Wealth Building',     description: 'Personal finance, investing, and credit.', language: 'Hindi',   duration: '8 weeks',  startDate: '2026-08-01', coverColor: '#EB7E2E' },
]

// ─── MODULES ──────────────────────────────────────────────────────────────────

export const MODULES: Record<number, Module[]> = {
  1: [
    { id: 101, courseId: 1, name: 'HTML & CSS',          description: 'Markup, selectors, box model, and layouts.', order: 1 },
    { id: 102, courseId: 1, name: 'JavaScript Essentials', description: 'Variables, functions, closures, and async.', order: 2 },
    { id: 103, courseId: 1, name: 'React Basics',         description: 'Components, props, state, and hooks.', order: 3 },
  ],
  2: [
    { id: 201, courseId: 2, name: 'Python Fundamentals', description: 'Syntax, data types, and control flow.', order: 1 },
    { id: 202, courseId: 2, name: 'Data Wrangling',      description: 'Pandas, NumPy, and data cleaning.', order: 2 },
  ],
  3: [
    { id: 301, courseId: 3, name: 'Money Mindset',        description: 'Budgeting, savings, and financial goals.', order: 1 },
    { id: 302, courseId: 3, name: 'Investing Basics',     description: 'Mutual funds, SIPs, and risk.', order: 2 },
  ],
}

// ─── CHAPTERS ─────────────────────────────────────────────────────────────────
// topicId reference:
//   1 = Video  |  2 = Article  |  3 = Coding Challenge  |  4 = MCQ Quiz
//   5 = Assignment  |  6 = Assessment  |  8 = Live Class  |  9 = Adaptive Assessment

export const CHAPTERS: Record<number, Chapter[]> = {
  // ── Module 101: HTML & CSS ──
  // MCQ chapters (topicId: 4) accumulate baseline signal.
  // The Adaptive Assessment chapter (topicId: 9) reads their performance.
  101: [
    { id: 1011, moduleId: 101, title: 'Box Model & Selectors',   topicId: 2, topicName: 'Article',  order: 1 },
    { id: 1012, moduleId: 101, title: 'Box Model — Check',       topicId: 4, topicName: 'MCQ Quiz', order: 2, questionCount: 12 },
    { id: 1013, moduleId: 101, title: 'Flexbox & Grid',          topicId: 2, topicName: 'Article',  order: 3 },
    { id: 1014, moduleId: 101, title: 'Flexbox — Check',         topicId: 4, topicName: 'MCQ Quiz', order: 4, questionCount: 10 },
    { id: 1015, moduleId: 101, title: 'CSS Variables & Theming', topicId: 2, topicName: 'Article',  order: 5 },
    { id: 1016, moduleId: 101, title: 'CSS Variables — Check',   topicId: 4, topicName: 'MCQ Quiz', order: 6, questionCount: 8  },
    { id: 1017, moduleId: 101, title: 'Module Assessment',       topicId: 9, topicName: 'Adaptive Assessment', order: 7 },
  ],

  // ── Module 102: JavaScript Essentials ──
  102: [
    { id: 1021, moduleId: 102, title: 'Scope & Hoisting',    topicId: 2, topicName: 'Article',  order: 1 },
    { id: 1022, moduleId: 102, title: 'Scope — Check',       topicId: 4, topicName: 'MCQ Quiz', order: 2, questionCount: 10 },
    { id: 1023, moduleId: 102, title: 'Closures & this',     topicId: 2, topicName: 'Article',  order: 3 },
    { id: 1024, moduleId: 102, title: 'Closures — Check',    topicId: 4, topicName: 'MCQ Quiz', order: 4, questionCount: 10 },
    { id: 1025, moduleId: 102, title: 'Promises & Async',    topicId: 2, topicName: 'Article',  order: 5 },
    { id: 1026, moduleId: 102, title: 'Async — Check',       topicId: 4, topicName: 'MCQ Quiz', order: 6, questionCount: 12 },
    { id: 1027, moduleId: 102, title: 'Module Assessment',   topicId: 9, topicName: 'Adaptive Assessment', order: 7 },
  ],

  // ── Module 103: React Basics ──
  103: [
    { id: 1031, moduleId: 103, title: 'Components & Props',  topicId: 2, topicName: 'Article',  order: 1 },
    { id: 1032, moduleId: 103, title: 'Components — Check',  topicId: 4, topicName: 'MCQ Quiz', order: 2, questionCount: 10 },
    { id: 1033, moduleId: 103, title: 'State & useEffect',   topicId: 2, topicName: 'Article',  order: 3 },
    { id: 1034, moduleId: 103, title: 'Hooks — Check',       topicId: 4, topicName: 'MCQ Quiz', order: 4, questionCount: 12 },
    { id: 1035, moduleId: 103, title: 'Module Assessment',   topicId: 9, topicName: 'Adaptive Assessment', order: 5 },
  ],

  // ── Module 201: Python Fundamentals ──
  201: [
    { id: 2011, moduleId: 201, title: 'Data Types & Loops',  topicId: 2, topicName: 'Article',  order: 1 },
    { id: 2012, moduleId: 201, title: 'Basics — Check',      topicId: 4, topicName: 'MCQ Quiz', order: 2, questionCount: 12 },
    { id: 2013, moduleId: 201, title: 'Functions & Scope',   topicId: 2, topicName: 'Article',  order: 3 },
    { id: 2014, moduleId: 201, title: 'Functions — Check',   topicId: 4, topicName: 'MCQ Quiz', order: 4, questionCount: 10 },
    { id: 2015, moduleId: 201, title: 'Module Assessment',   topicId: 9, topicName: 'Adaptive Assessment', order: 5 },
  ],

  // ── Module 301: Money Mindset ──
  301: [
    { id: 3011, moduleId: 301, title: 'Budgeting 101',        topicId: 2, topicName: 'Article',  order: 1 },
    { id: 3012, moduleId: 301, title: 'Budgeting — Check',    topicId: 4, topicName: 'MCQ Quiz', order: 2, questionCount: 10 },
    { id: 3013, moduleId: 301, title: 'Savings Goals',        topicId: 2, topicName: 'Article',  order: 3 },
    { id: 3014, moduleId: 301, title: 'Savings — Check',      topicId: 4, topicName: 'MCQ Quiz', order: 4, questionCount: 8  },
    { id: 3015, moduleId: 301, title: 'Module Assessment',    topicId: 9, topicName: 'Adaptive Assessment', order: 5 },
  ],
}

// ─── QUESTION BANK ────────────────────────────────────────────────────────────
// A small seeded bank per topic × difficulty.
// In production this comes from /Content/allQuizQuestions.

let _qid = 0
const mcq = (topic: string, diff: Question['difficulty'], text: string, options: string[], ci: number, exp: string): Question =>
  ({ id: ++_qid, qtype: 'mcq', topic, difficulty: diff, text, options, correctIndex: ci, explanation: exp, source: 'bank', validated: true, quarantined: false })

export const QUESTION_BANK: Question[] = [
  // HTML & CSS — easy
  mcq('HTML & CSS', 'easy', 'Which property adds space inside a border?',            ['margin','gap','padding','border-gap'], 2, 'padding is between content and border.'),
  mcq('HTML & CSS', 'easy', 'What does display:none do?',                            ['Hides but keeps space','Removes from layout','Moves off-screen','Collapses height'], 1, 'display:none removes the element from the flow entirely.'),
  mcq('HTML & CSS', 'easy', 'Which tag creates a hyperlink?',                        ['<link>','<a>','<href>','<url>'], 1, '<a> with href creates links.'),
  mcq('HTML & CSS', 'easy', 'Which property changes text colour?',                   ['font-color','text-style','color','foreground'], 2, 'The color property sets text colour.'),
  // HTML & CSS — medium
  mcq('HTML & CSS', 'medium', 'What does box-sizing:border-box change?',             ['Only affects margin','Width includes padding and border','Sub-pixel rendering','Removes margin collapse'], 1, 'border-box makes width the total visual size.'),
  mcq('HTML & CSS', 'medium', 'Which value makes a flex container?',                 ['display:block','display:flexbox','display:flex','display:flow'], 2, 'display:flex turns the element into a flex container.'),
  mcq('HTML & CSS', 'medium', 'What does position:absolute reference?',              ['Viewport always','Nearest positioned ancestor','Body always','Previous sibling'], 1, 'Absolute positions relative to nearest non-static ancestor.'),
  mcq('HTML & CSS', 'medium', 'What does z-index control?',                          ['Transparency','Horizontal offset','Stacking order','Font rendering'], 2, 'z-index controls which element is on top.'),
  // HTML & CSS — hard
  mcq('HTML & CSS', 'hard', 'Why does a transition not fire on display:none→block?', ['display is not animatable','Browsers batch repaints','transition overrides display','display needs !important'], 0, 'display changes do not participate in CSS transitions.'),
  mcq('HTML & CSS', 'hard', "Why might a child's margin-top appear on its parent?",  ['Bug','Margin collapsing between parent and first child','Inherited margin','Wrong box-sizing'], 1, 'Adjoining vertical margins collapse when nothing separates them.'),

  // JavaScript — easy
  mcq('JavaScript', 'easy', 'What does typeof null return?',                         ['"null"','"undefined"','"object"','"boolean"'], 2, 'A long-standing JS quirk — null\'s type tag is 0, mapped to "object".'),
  mcq('JavaScript', 'easy', 'Which declares a block-scoped variable?',               ['var','let','global','dim'], 1, 'let and const are block-scoped.'),
  mcq('JavaScript', 'easy', 'What does === check that == does not?',                 ['Value only','Type and value','Reference only','Nothing extra'], 1, 'Strict equality skips type coercion.'),
  mcq('JavaScript', 'easy', 'Which method adds to the end of an array?',             ['unshift','push','append','add'], 1, 'Array.prototype.push appends and returns the new length.'),
  // JavaScript — medium
  mcq('JavaScript', 'medium', 'What does Array.prototype.map return?',               ['Same array mutated','New array of transformed values','Single reduced value','Iterator'], 1, 'map builds a new array via the callback.'),
  mcq('JavaScript', 'medium', 'What does Object.freeze do?',                         ['Deep-clones','Prevents adding/removing/changing own props','Seals prototype','Immutable deep copy'], 1, 'freeze makes own enumerable properties non-writable.'),
  mcq('JavaScript', 'medium', 'What does the spread operator do with an array?',     ['Creates a reference','Shallow-copies or spreads elements','Deep-clones','Mutates original'], 1, 'Spread creates a shallow copy; nested objects remain references.'),
  // JavaScript — hard
  mcq('JavaScript', 'hard', 'What is the temporal dead zone?',                       ['Closed-over scope','Period between hoist and init of let/const where access throws','GC region','WeakMap scope'], 1, 'let and const are hoisted but not initialized until declaration.'),
  mcq('JavaScript', 'hard', 'What does a closure retain access to?',                 ['Global vars only','Defining scope vars after that scope exits',"Caller's stack",'Own params only'], 1, 'Functions capture their lexical scope.'),
  mcq('JavaScript', 'hard', 'How does Promise.all differ from Promise.allSettled?',  ['Identical','Promise.all rejects on first rejection; allSettled waits for all','allSettled is faster','all gives more detail'], 1, 'allSettled never rejects early — it always resolves with status pairs.'),

  // Python — easy
  mcq('Python', 'easy', 'What does bool("") evaluate to?',                           ['True','False','None','Error'], 1, 'Empty string is falsy.'),
  mcq('Python', 'easy', 'Which keyword defines a function?',                         ['func','function','def','fn'], 2, 'Python uses def.'),
  mcq('Python', 'easy', 'What does range(1,4) produce?',                             ['1,2,3,4','1,2,3','0,1,2,3','1,4'], 1, 'range end is exclusive.'),
  // Python — medium
  mcq('Python', 'medium', 'What does enumerate() add?',                              ['Indices only','Values only','(index,value) pairs','Reversed list'], 2, 'enumerate() yields (index, item) pairs.'),
  mcq('Python', 'medium', 'What is [x**2 for x in range(4)]?',                      ['[1,4,9,16]','[0,1,4,9]','[0,2,4,6]','[0,1,2,3]'], 1, '0–3 squared = [0,1,4,9].'),
  // Python — hard
  mcq('Python', 'hard', 'What does __slots__ do?',                                   ['Enables MI','Restricts instance attrs to a named set','Speeds method calls','Enables operator overloading'], 1, '__slots__ prevents per-instance __dict__.'),

  // Finance — easy
  mcq('Personal Finance', 'easy', 'What is an emergency fund?',                      ['Investment account','3–6 months of expenses in liquid savings','Retirement fund','Insurance policy'], 1, 'An emergency fund covers unexpected expenses without debt.'),
  mcq('Personal Finance', 'easy', 'What does SIP stand for?',                        ['Systematic Investment Plan','Savings Interest Plan','Stock Index Portfolio','Standard Insurance Policy'], 0, 'SIP lets you invest fixed amounts regularly in mutual funds.'),
  // Finance — medium
  mcq('Personal Finance', 'medium', 'What is the 50/30/20 rule?',                    ['50 stocks 30 bonds 20 cash','50 needs 30 wants 20 savings','50 investment 30 expense 20 tax','50 savings 30 debt 20 fun'], 1, '50% needs, 30% wants, 20% savings/debt.'),
  mcq('Personal Finance', 'medium', 'What does compound interest mean?',             ['Interest only on principal','Interest on principal + accumulated interest','Fixed monthly charge','Government subsidy'], 1, 'Compound interest earns interest on interest — it accelerates growth.'),
]

// ─── STUDENTS ─────────────────────────────────────────────────────────────────

export const STUDENTS: Student[] = [
  { id: 1,  name: 'Priya Sharma',   email: 'priya.s@example.com',   batchName: 'Cohort 4', currentLevel: 'B',  attemptsCompleted: 3 },
  { id: 2,  name: 'Ravi Kumar',     email: 'ravi.k@example.com',    batchName: 'Cohort 4', currentLevel: 'C',  attemptsCompleted: 2 },
  { id: 3,  name: 'Ananya Singh',   email: 'ananya.s@example.com',  batchName: 'Cohort 4', currentLevel: 'A',  attemptsCompleted: 4 },
  { id: 4,  name: 'Mohit Verma',    email: 'mohit.v@example.com',   batchName: 'Cohort 4', currentLevel: 'D',  attemptsCompleted: 1 },
  { id: 5,  name: 'Kavya Nair',     email: 'kavya.n@example.com',   batchName: 'Cohort 5', currentLevel: 'A+', attemptsCompleted: 5 },
  { id: 6,  name: 'Arjun Patel',    email: 'arjun.p@example.com',   batchName: 'Cohort 5', currentLevel: 'B',  attemptsCompleted: 3 },
  { id: 7,  name: 'Sonal Mehta',    email: 'sonal.m@example.com',   batchName: 'Cohort 5', currentLevel: 'E',  attemptsCompleted: 1 },
  { id: 8,  name: 'Deepak Rao',     email: 'deepak.r@example.com',  batchName: 'Cohort 5', currentLevel: 'C',  attemptsCompleted: 2 },
]

export const BATCH_STATS: BatchStats[] = [
  { batchName: 'Cohort 4', enrolled: 18, completed: 14, distribution: { E: 1, D: 2, C: 4, B: 5, A: 2, 'A+': 0 } },
  { batchName: 'Cohort 5', enrolled: 14, completed: 8,  distribution: { E: 2, D: 1, C: 3, B: 1, A: 1, 'A+': 0 } },
]

// ─── DEMO QUESTIONS (AI generation stubs) ─────────────────────────────────────
// In production, generation calls the backend LLM endpoint.
// These are used by the AssessmentBuilder's "Generate" buttons during prototyping.

const demoBank: Record<string, Array<{ text: string; options: string[]; correctIndex: number; explanation: string }>> = {}
const d = (k: string, text: string, options: string[], ci: number, exp: string) => {
  if (!demoBank[k]) demoBank[k] = []
  demoBank[k].push({ text, options, ci, exp } as any)
}

d('HTML & CSS:easy',   'What does the <meta charset="UTF-8"> tag do?',              ['Sets page language','Declares character encoding','Adds page metadata','Links a stylesheet'], 1, 'charset declares how the browser should decode the file.')
d('HTML & CSS:easy',   'Which CSS unit is relative to the root font size?',         ['em','px','rem','vw'], 2, 'rem is relative to the root (<html>) font size, not the parent.')
d('HTML & CSS:medium', 'What is specificity in CSS?',                               ['Browser rendering order','Weight system for which rule wins','Cascade level','Inheritance chain'], 1, 'Specificity determines which CSS rule takes precedence.')
d('HTML & CSS:hard',   'What creates a new CSS stacking context?',                  ['Any block element','position+z-index, opacity<1, transform, and others','Only root','float:left'], 1, 'Several properties create isolated stacking contexts.')
d('JavaScript:easy',   'What does NaN === NaN evaluate to?',                        ['true','false','undefined','TypeError'], 1, 'NaN is the only value not equal to itself.')
d('JavaScript:medium', 'What does Object.assign(target, source) do?',               ['Deep clone','Shallow merge source into target','Freeze target','Create prototype chain'], 1, 'Object.assign copies own enumerable source properties to target.')
d('JavaScript:hard',   'What is a WeakMap and when would you use it?',              ['A lighter Map','Map with weak references to keys — GC-able when key is gone','Ordered Map','Immutable Map'], 1, 'WeakMap holds keys weakly, allowing GC when no other reference exists.')
d('Python:easy',       'What does len([1,2,3]) return?',                            ['2','3','4','Error'], 1, 'len() returns the number of items — 3 here.')
d('Python:medium',     'What does the walrus operator := do?',                      ['Compares equality','Assigns and returns the value in one expression','Creates a new scope','Declares a constant'], 1, 'Walrus combines assignment and expression — e.g. if n := len(a) > 5.')
d('Personal Finance:easy',   'What is a credit score used for?',                   ['Loan eligibility and interest rates','Job applications only','Tax calculation','Insurance premium only'], 0, 'Credit score affects loan approval and the rate you\'re offered.')
d('Personal Finance:medium', 'What is the difference between a term and whole life policy?', ['Term covers investments','Term covers a fixed period; whole covers entire life and builds cash value','Identical products','Whole is cheaper'], 1, 'Term is pure insurance; whole adds a savings component.')

let _demoId = 5000
export function pickDemoQuestion(topic: string, difficulty: string, excludeTexts: string[]): Question | null {
  const pool = (demoBank[`${topic}:${difficulty}`] || []).filter((q: any) => !excludeTexts.includes(q.text))
  if (!pool.length) return null
  const raw = pool[Math.floor(Math.random() * pool.length)] as any
  return {
    id: ++_demoId, qtype: 'mcq', topic, difficulty: difficulty as Question['difficulty'],
    text: raw.text, options: raw.options, correctIndex: raw.ci, explanation: raw.exp,
    source: 'ai', validated: false, quarantined: false,
  }
}
