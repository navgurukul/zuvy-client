import { Domain, PreviousAssessment, GeneratedQuestionSet, MCQQuestion } from './types';

export const mockDomains: Domain[] = [
  {
    id: 'dom-1',
    name: 'JavaScript',
    topics: [
      { id: 'top-1', name: 'Variables & Data Types', availableQuestions: { easy: 15, medium: 20, hard: 10 } },
      { id: 'top-2', name: 'Functions & Closures', availableQuestions: { easy: 12, medium: 18, hard: 8 } },
      { id: 'top-3', name: 'Async/Await & Promises', availableQuestions: { easy: 8, medium: 15, hard: 12 } },
      { id: 'top-4', name: 'DOM Manipulation', availableQuestions: { easy: 10, medium: 12, hard: 6 } },
    ],
  },
  {
    id: 'dom-2',
    name: 'React',
    topics: [
      { id: 'top-5', name: 'Components & Props', availableQuestions: { easy: 18, medium: 22, hard: 10 } },
      { id: 'top-6', name: 'Hooks', availableQuestions: { easy: 15, medium: 20, hard: 15 } },
      { id: 'top-7', name: 'State Management', availableQuestions: { easy: 10, medium: 18, hard: 12 } },
      { id: 'top-8', name: 'React Router', availableQuestions: { easy: 8, medium: 10, hard: 5 } },
    ],
  },
  {
    id: 'dom-3',
    name: 'Python',
    topics: [
      { id: 'top-9', name: 'Data Structures', availableQuestions: { easy: 20, medium: 25, hard: 15 } },
      { id: 'top-10', name: 'OOP Concepts', availableQuestions: { easy: 12, medium: 18, hard: 10 } },
      { id: 'top-11', name: 'File Handling', availableQuestions: { easy: 10, medium: 12, hard: 8 } },
      { id: 'top-12', name: 'Error Handling', availableQuestions: { easy: 8, medium: 10, hard: 6 } },
    ],
  },
  {
    id: 'dom-4',
    name: 'Data Science',
    topics: [
      { id: 'top-13', name: 'Pandas & NumPy', availableQuestions: { easy: 15, medium: 20, hard: 12 } },
      { id: 'top-14', name: 'Data Visualization', availableQuestions: { easy: 12, medium: 15, hard: 8 } },
      { id: 'top-15', name: 'Machine Learning Basics', availableQuestions: { easy: 8, medium: 12, hard: 10 } },
      { id: 'top-16', name: 'Statistical Analysis', availableQuestions: { easy: 10, medium: 14, hard: 8 } },
    ],
  },
  {
    id: 'dom-5',
    name: 'Empty Domain',
    topics: [],
  },
];

export const mockPreviousAssessments: PreviousAssessment[] = [
  {
    id: 'prev-1',
    name: 'JavaScript Fundamentals Quiz',
    domains: ['JavaScript'],
    difficulty: 'Easy',
    totalQuestions: 20,
    dateTaken: '2024-01-15',
  },
  {
    id: 'prev-2',
    name: 'React Advanced Assessment',
    domains: ['React', 'JavaScript'],
    difficulty: 'Hard',
    totalQuestions: 30,
    dateTaken: '2024-01-10',
  },
  {
    id: 'prev-3',
    name: 'Full Stack Developer Test',
    domains: ['JavaScript', 'React', 'Python'],
    difficulty: 'Medium',
    totalQuestions: 50,
    dateTaken: '2024-01-05',
  },
  {
    id: 'prev-4',
    name: 'Python Basics Quiz',
    domains: ['Python'],
    difficulty: 'Easy',
    totalQuestions: 15,
    dateTaken: '2024-01-03',
  },
  {
    id: 'prev-5',
    name: 'Data Science Comprehensive',
    domains: ['Python', 'Data Science'],
    difficulty: 'Hard',
    totalQuestions: 40,
    dateTaken: '2023-12-28',
  },
];

// Mock replacement questions pool
export const mockReplacementQuestions: MCQQuestion[] = [
  {
    id: 'rq-1',
    question: 'What is the difference between let and var in JavaScript?',
    options: ['No difference', 'Scope and hoisting', 'Performance only', 'Syntax only'],
    correctOption: 1,
    topic: 'Variables & Data Types',
    difficulty: 'medium',
  },
  {
    id: 'rq-2',
    question: 'Which method is used to convert a JSON string to an object?',
    options: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'JSON.convert()'],
    correctOption: 1,
    topic: 'Variables & Data Types',
    difficulty: 'easy',
  },
  {
    id: 'rq-3',
    question: 'What is the purpose of the useMemo hook in React?',
    options: ['State management', 'Memoization of values', 'Side effects', 'Context creation'],
    correctOption: 1,
    topic: 'Hooks',
    difficulty: 'medium',
  },
  {
    id: 'rq-4',
    question: 'Which hook should be used for subscribing to external data sources?',
    options: ['useState', 'useEffect', 'useSyncExternalStore', 'useCallback'],
    correctOption: 2,
    topic: 'Hooks',
    difficulty: 'hard',
  },
  {
    id: 'rq-5',
    question: 'What does the const keyword prevent in JavaScript?',
    options: ['Value mutation', 'Reassignment', 'Property changes', 'All modifications'],
    correctOption: 1,
    topic: 'Variables & Data Types',
    difficulty: 'medium',
  },
];

export const mockGeneratedSets: GeneratedQuestionSet[] = [
  {
    id: 'set-1',
    name: 'Assessment Set A',
    totalQuestions: 25,
    difficultyBreakdown: { easy: 8, medium: 12, hard: 5 },
    domainsCovered: ['JavaScript', 'React'],
    isPublished: false,
    version: 1,
    questions: [
      {
        id: 'q-1',
        question: 'What is the output of console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'number'],
        correctOption: 2,
        topic: 'Variables & Data Types',
        difficulty: 'medium',
      },
      {
        id: 'q-2',
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctOption: 1,
        topic: 'Hooks',
        difficulty: 'easy',
      },
      {
        id: 'q-3',
        question: 'What does the spread operator (...) do in JavaScript?',
        options: ['Adds numbers', 'Expands iterables', 'Creates loops', 'Defines functions'],
        correctOption: 1,
        topic: 'Variables & Data Types',
        difficulty: 'easy',
      },
    ],
  },
  {
    id: 'set-2',
    name: 'Assessment Set B',
    totalQuestions: 25,
    difficultyBreakdown: { easy: 10, medium: 10, hard: 5 },
    domainsCovered: ['JavaScript', 'React'],
    isPublished: false,
    version: 1,
    questions: [
      {
        id: 'q-4',
        question: 'What is a closure in JavaScript?',
        options: ['A way to close the browser', 'A function with access to parent scope', 'A type of loop', 'An error handler'],
        correctOption: 1,
        topic: 'Functions & Closures',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'set-3',
    name: 'Assessment Set C',
    totalQuestions: 25,
    difficultyBreakdown: { easy: 5, medium: 15, hard: 5 },
    domainsCovered: ['JavaScript', 'React'],
    isPublished: false,
    version: 1,
    questions: [],
  },
  {
    id: 'set-4',
    name: 'Assessment Set D',
    totalQuestions: 25,
    difficultyBreakdown: { easy: 7, medium: 11, hard: 7 },
    domainsCovered: ['JavaScript', 'React'],
    isPublished: false,
    version: 1,
    questions: [],
  },
  {
    id: 'set-5',
    name: 'Assessment Set E',
    totalQuestions: 25,
    difficultyBreakdown: { easy: 6, medium: 14, hard: 5 },
    domainsCovered: ['JavaScript', 'React'],
    isPublished: false,
    version: 1,
    questions: [],
  },
];
