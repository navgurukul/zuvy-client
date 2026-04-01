'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetStudentAiAssessmentQuestions } from '@/hooks/useGetStudentAiAssessmentQuestions'
import { Flag, Bookmark, ArrowLeft, ArrowRight } from 'lucide-react'

const AssessmentQuestionsPage = () => {
  const router = useRouter()
  const params = useParams()

  const assessmentIdParam = params?.assessmentId
  const assessmentId = Number(assessmentIdParam)

  const {
    questions,
    assessmentMeta,
    isFetchingQuestions,
    error,
    fetchQuestions,
  } = useGetStudentAiAssessmentQuestions()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!Number.isNaN(assessmentId) && assessmentId > 0) {
      fetchQuestions(assessmentId)
    }
  }, [assessmentId, fetchQuestions])

  const totalQuestions = questions.length

  const currentQuestion = useMemo(() => {
    if (totalQuestions === 0) return null
    return questions[currentQuestionIndex] ?? null
  }, [questions, currentQuestionIndex, totalQuestions])

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= totalQuestions) return
    setCurrentQuestionIndex(index)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handleSelectAnswer = (questionId: number, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }))
  }

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const toggleBookmark = (questionId: number) => {
    setBookmarkedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const getQuestionButtonClass = (index: number) => {
    const isCurrentQuestion = index === currentQuestionIndex
    const isAnswered = Boolean(selectedAnswers[questions[index].questionId])
    const isFlagged = flaggedQuestions.has(questions[index].questionId)
    const isBookmarked = bookmarkedQuestions.has(questions[index].questionId)

    if (isCurrentQuestion) {
      return 'aspect-square bg-primary shadow-soft rounded-md flex items-center justify-center font-semibold text-xs font-bold text-white border border-primary hover:bg-primary-dark'
    }
    
    if (isFlagged) {
      return 'aspect-square bg-destructive/10 text-destructive rounded-md flex items-center justify-center font-semibold text-xs font-bold relative border border-destructive/30'
    }
    
    if (isBookmarked) {
      return 'aspect-square bg-primary-light text-primary rounded-md flex items-center justify-center font-semibold text-xs font-bold relative border border-primary/20'
    }
    
    if (isAnswered) {
      return 'aspect-square bg-success-light text-success rounded-md flex items-center justify-center font-semibold text-xs font-bold border border-success/30'
    }

    return 'aspect-square bg-muted text-text-secondary rounded-md flex items-center justify-center font-semibold text-xs font-bold border border-border hover:bg-border'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg shadow-soft h-16 flex justify-between items-center px-8 border-b border-border">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-base text-primary">AI Assessment</h1>
          <div className="h-5 w-px bg-border hidden md:block"></div>
          <div className="hidden md:flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Assessment</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-primary">
                {totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
            <span className="text-xs font-semibold text-foreground">⏱ 45:12</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-16 flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="h-[calc(100vh-4rem)] w-72 fixed left-0 top-16 bg-card overflow-y-auto border-r border-border flex flex-col p-5 space-y-5">
          <div>
            <h3 className="font-bold text-sm text-primary">Assessment {assessmentMeta?.aiAssessmentId}</h3>
            <p className="text-xs text-text-secondary mt-1">Set #{assessmentMeta?.questionSetId}</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Navigator</span>
                <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-semibold">
                  {currentQuestionIndex + 1} / {totalQuestions}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((question, index) => (
                  <button
                    key={`nav-${question.questionId}`}
                    onClick={() => goToQuestion(index)}
                    className={getQuestionButtonClass(index)}
                    title={`Question ${index + 1}${flaggedQuestions.has(question.questionId) ? ' (Flagged)' : ''}${bookmarkedQuestions.has(question.questionId) ? ' (Bookmarked)' : ''}`}
                  >
                    <span className="text-xs font-bold">{question.position || index + 1}</span>
                    {flaggedQuestions.has(question.questionId) && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-destructive rounded-full"></span>
                    )}
                    {bookmarkedQuestions.has(question.questionId) && !flaggedQuestions.has(question.questionId) && (
                      <Bookmark className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-primary" fill="currentColor" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          <div className="pt-4 space-y-2 border-t border-border">
            <button className="w-full flex items-center justify-center py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors shadow-soft">
              Submit
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-72 flex-1 p-8 pb-28">
          <div className="max-w-3xl mx-auto">
            {isFetchingQuestions && (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary">Loading questions...</p>
              </div>
            )}

            {!isFetchingQuestions && error && (
              <div className="text-center py-8">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!isFetchingQuestions && !error && totalQuestions === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary">No questions available for this assessment.</p>
              </div>
            )}

            {!isFetchingQuestions && !error && currentQuestion && (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1.5 bg-primary-light rounded-full">
                      <span className="text-xs font-bold text-primary tracking-wide uppercase">
                        Question {currentQuestionIndex + 1} / {totalQuestions}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleFlag(currentQuestion.questionId)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold ${
                          flaggedQuestions.has(currentQuestion.questionId)
                            ? 'bg-destructive/10 text-destructive'
                            : 'text-text-secondary hover:text-destructive hover:bg-destructive/5'
                        }`}
                      >
                        <Flag className="w-4 h-4" fill={flaggedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
                        Flag
                      </button>
                      <button
                        onClick={() => toggleBookmark(currentQuestion.questionId)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold ${
                          bookmarkedQuestions.has(currentQuestion.questionId)
                            ? 'bg-primary-light text-primary'
                            : 'text-text-secondary hover:text-primary hover:bg-primary-light'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" fill={bookmarkedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
                        Save
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-foreground leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                  {Object.entries(currentQuestion.options)
                    .sort(([left], [right]) => Number(left) - Number(right))
                    .map(([optionKey, optionLabel]) => {
                      const isSelected = selectedAnswers[currentQuestion.questionId] === optionKey

                      return (
                        <button
                          key={`${currentQuestion.questionId}-${optionKey}`}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQuestion.questionId, optionKey)}
                          className={`group relative flex items-start p-4 rounded-lg text-left border transition-all duration-200 ${
                            isSelected
                              ? 'bg-success-light border-success shadow-soft'
                              : 'bg-card border-border hover:border-primary/30 hover:shadow-soft'
                          }`}
                        >
                          <div
                            className={`min-w-fit w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm mr-4 transition-colors flex-shrink-0 ${
                              isSelected
                                ? 'bg-success text-white'
                                : 'bg-muted text-primary group-hover:bg-primary group-hover:text-white'
                            }`}
                          >
                            {optionKey}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                            {optionLabel}
                          </span>
                          {isSelected && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <span className="text-success text-lg">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-72 right-0 h-20 bg-card/80 backdrop-blur-lg border-t border-border px-8 flex items-center justify-between z-40">
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 text-xs h-9"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => currentQuestion && toggleFlag(currentQuestion.questionId)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
              currentQuestion && flaggedQuestions.has(currentQuestion.questionId)
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-text-secondary hover:bg-destructive/10 hover:text-destructive'
            }`}
            title="Flag for Review"
          >
            <Flag className="w-4 h-4" fill={currentQuestion && flaggedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => currentQuestion && toggleBookmark(currentQuestion.questionId)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
              currentQuestion && bookmarkedQuestions.has(currentQuestion.questionId)
                ? 'bg-primary-light text-primary'
                : 'bg-muted text-text-secondary hover:bg-primary-light hover:text-primary'
            }`}
            title="Bookmark Question"
          >
            <Bookmark className="w-4 h-4" fill={currentQuestion && bookmarkedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <Button
          type="button"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground text-xs h-9 font-semibold shadow-soft"
          onClick={handleNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
        >
          Next
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </footer>
    </div>
  )
}

export default AssessmentQuestionsPage
