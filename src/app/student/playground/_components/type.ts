export interface QuestionDetail {
  title: string
  description: string
}

export interface Submission {
  createdAt: string             
  status: 'Accepted' | 'Rejected' | string
  questionDetail: QuestionDetail
  language?: { name: string }   
}

export interface SubmissionsApiRes {
  data: Submission[]
}

export interface SubmissionsListProps {
  questionId: string
  admin?: boolean
}
