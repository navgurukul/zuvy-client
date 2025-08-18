export interface AssessmentParams {
  courseId: string
  moduleId: string
  submissionId: string
}

export interface ViewResultsData {
  assessmentOutsourseId: number
  isPassed: boolean
  percentage: number
  startedAt: string
  submitedAt: string
  submitedOutsourseAssessment?: {
    passPercentage: number
  }
}

export interface UseAssessmentResultResponse {
  data: ViewResultsData | null
  loading: boolean
  error: any
  refetch: () => void
}