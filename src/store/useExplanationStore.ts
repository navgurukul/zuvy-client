import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type QuestionExplanation = {
  questionId: number
  explanation: string
  cached: boolean
}

interface ExplanationState {
  explanations: Record<string, QuestionExplanation>
  addExplanation: (assessmentId: number, explanation: QuestionExplanation) => void
  getExplanation: (assessmentId: number, questionId: number) => QuestionExplanation | undefined
}

export const useExplanationStore = create<ExplanationState>()(
  persist(
    (set, get) => ({
      explanations: {},
      addExplanation: (assessmentId: number, explanation: QuestionExplanation) => {
        set((state) => ({
          explanations: {
            ...state.explanations,
            [`${assessmentId}_${explanation.questionId}`]: explanation,
          },
        }))
      },
      getExplanation: (assessmentId: number, questionId: number) => {
        const key = `${assessmentId}_${questionId}`
        return get().explanations[key]
      },
    }),
    {
      name: 'explanation-store',
    }
  )
)
