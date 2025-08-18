
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