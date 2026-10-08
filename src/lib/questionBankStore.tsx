'use client'

/**
 * Shared Question Bank context.
 *
 * Validation model:
 *   - Manually written questions → validated: true  (SME wrote it, implicitly approved)
 *   - AI-generated questions     → validated: false (enters a "Pending review" queue)
 *
 * Only validated questions are shown in the AssessmentBuilder pool picker.
 * SMEs approve pending questions directly in the Question Bank page.
 *
 * In production, replace useState with SWR / React Query + PATCH /questions/:id/validate.
 */

import { createContext, useContext, useState, ReactNode } from 'react'
import { QUESTION_BANK } from '@/lib/mockData'
import type { Question } from '../app/[admin]/organizations/[organizationId]/resource/_components/aiquestiontypes'

interface QBStore {
  questions:        Question[]
  addQuestion:      (q: Question) => void
  removeQuestion:   (id: number)  => void
  validateQuestion: (id: number)  => void
}

const QBCtx = createContext<QBStore | null>(null)

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANK)

  const addQuestion      = (q: Question) => setQuestions(prev => [q, ...prev])
  const removeQuestion   = (id: number)  => setQuestions(prev => prev.filter(q => q.id !== id))
  const validateQuestion = (id: number)  => setQuestions(prev =>
    prev.map(q => q.id === id ? { ...q, validated: true, source: 'bank' as const } : q)
  )

  return (
    <QBCtx.Provider value={{ questions, addQuestion, removeQuestion, validateQuestion }}>
      {children}
    </QBCtx.Provider>
  )
}

export function useQuestionBank(): QBStore {
  const ctx = useContext(QBCtx)
  if (!ctx) throw new Error('useQuestionBank must be used inside <QuestionBankProvider>')
  return ctx
}

// Stable ID generator for new questions added at runtime.
let _nextId = QUESTION_BANK.length + 1000
export const nextQuestionId = () => ++_nextId
