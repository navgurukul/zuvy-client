// ─── Domain types for Zuvy Eval ───────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'mcq' | 'coding' | 'open'
export type LevelId = 'E' | 'D' | 'C' | 'B' | 'A' | 'A+'
export type AssessmentMode = 'formative' | 'summative'
export type AssessmentStatus = 'editing' | 'draft' | 'published' | 'scheduled'

// Chapter types in a Zuvy module
// topicId mirrors the backend enum — 4 = MCQ quiz, 9 = Adaptive Assessment
export type TopicId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface Course {
  id: number
  name: string
  description: string
  language: string
  duration: string
  startDate: string
  coverColor: string  // used for the course card accent stripe
}

export interface Module {
  id: number
  courseId: number
  name: string
  description: string
  order: number
}

export interface Chapter {
  id: number
  moduleId: number
  title: string
  topicId: TopicId
  topicName: string
  order: number
  questionCount?: number  // only relevant for topicId === 4 (MCQ)
}

export interface Question {
  id: number
  qtype: QuestionType
  topic: string
  difficulty: Difficulty
  text: string
  options?: string[]       // mcq only
  correctIndex?: number    // mcq only
  explanation: string
  source: 'bank' | 'ai'
  validated: boolean
  quarantined: boolean
}

export interface BaselineChapter {
  chapterId: number
  title: string
  questionCount: number
}

// The adaptive level model — six levels, each with an Easy/Medium/Hard question mix (%)
export interface Level {
  id: LevelId
  label: string
  mix: [number, number, number]  // [easy%, medium%, hard%]
}

// Saved configuration for a published adaptive assessment chapter
export interface AssessmentConfig {
  chapterId: number
  name: string
  objective: string
  outcomes: string
  questionsPerForm: number
  baselineChapterIds: number[]  // MCQ chapter IDs in this module used as baseline signal
  poolTopics: string[]           // topics used to build the question pool
  pool: Question[]
  mode: AssessmentMode
  gateLevel: LevelId
  timeLimit: string
  proctorCopyPaste: boolean
  proctorTabChange: boolean
  status: AssessmentStatus
  scheduledDate?: string
  scheduledTime?: string
}

export interface Student {
  id: number
  name: string
  email: string
  batchName: string
  currentLevel: LevelId
  attemptsCompleted: number
}

export interface BatchStats {
  batchName: string
  enrolled: number
  completed: number
  distribution: Record<LevelId, number>
}
