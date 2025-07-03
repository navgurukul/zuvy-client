export interface SubmissionData {
  chosenOption: number
  status: 'passed' | 'failed'
}


export interface QuizResult {
  quizId: number
  question: string
  options: Record<string, string> 
  correctOption: number
  submissionsData?: SubmissionData
  difficulty: 'Easy' | 'Medium' | 'Hard'
  mark: string | number 
}


export interface QuizResultsResponse {
  mcqs: QuizResult[]
}
