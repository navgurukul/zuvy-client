'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

import { ExplanationDialog } from '@/components/ExplanationDialog'
import { Flag, Bookmark, ArrowLeft, ArrowRight, Loader2, CheckCircle, XCircle, Sparkles, Volume2, VolumeX, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { useGetStudentAiAssessmentQuestions } from '@/hooks/useGetAiAssessmentQuestionEval'
import { useGetStudentAiAssessmentResult } from '@/hooks/useAiAssessmentResultsEval'
import { useExplanationStore } from '@/store/useExplanationStore'
import { useGetQuestionExplanation } from '@/hooks/useExplanationEval'

const AssessmentQuestionsPage = () => {
  const router = useRouter()
  const params = useParams()
  const searchParams = new URLSearchParams(window.location.search)
  const domainId = searchParams.get('domainId')
  const chapterId = searchParams.get('chapterId')


  const assessmentIdParam = params?.assessmentId
  const assessmentId = Number(assessmentIdParam)


  const {
    questions,
    assessmentMeta,
    isFetchingQuestions,
    error,
    fetchQuestions,
  } = useGetStudentAiAssessmentQuestions()

  const {
    result,
    isFetchingResult,
    fetchResult,
  } = useGetStudentAiAssessmentResult()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [resultCurrentQuestionIndex, setResultCurrentQuestionIndex] = useState(0)
  const [isExplanationDialogOpen, setIsExplanationDialogOpen] = useState(false)
  const [selectedQuestionForExplanation, setSelectedQuestionForExplanation] = useState<number | null>(null)
  const [activeSpeechTarget, setActiveSpeechTarget] = useState<'question' | 'options' | 'explanation' | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  const { fetchExplanation, isLoading: isExplanationLoading, error: explanationError } = useGetQuestionExplanation()
  const { getExplanation } = useExplanationStore()

  const handleDownloadPDF = () => {
    if (!result) return

    const doc = new jsPDF()

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(96, 144, 130)
    doc.setFontSize(16)
    doc.text(`AI Assessment Report`, 105, 15, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Score: ${result.score} / ${result.totalQuestions}`, 15, 30)
    doc.text(`Percentage: ${result.percentage}%`, 15, 35)
    doc.text(`Grade: ${result.level.grade} (${result.level.meaning})`, 15, 40)
    // doc.text(`Difficulty: ${result.level.hardship}`, 15, 45)

    const tableData = result.questions.map((q, index) => [
      `Q${index + 1}`,
      q.isCorrect ? 'Correct' : 'Incorrect'
    ])

    autoTable(doc, {
      head: [['Question', 'Status']],
      body: tableData,
      startY: 55,
      theme: 'grid',
      headStyles: {
        fillColor: [96, 144, 130],
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
    })

    doc.save(`Assessment_Report.pdf`)
  }

  useEffect(() => {
    if (!Number.isNaN(assessmentId) && assessmentId > 0) {
      fetchQuestions(assessmentId)
    }
  }, [assessmentId, fetchQuestions])

  // Auto-fetch results if assessment is already submitted
  useEffect(() => {
    if (assessmentMeta?.studentStatus === 1 && !showResults && !isFetchingResult) {
      fetchResult(assessmentId)
      setShowResults(true)
      setResultCurrentQuestionIndex(0)
    }
  }, [assessmentMeta?.studentStatus, assessmentId, fetchResult, showResults, isFetchingResult])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const updateVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices())
    }

    updateVoices()
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setActiveSpeechTarget(null)
  }, [currentQuestionIndex, showResults])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const totalQuestions = questions.length
  const attemptedQuestionsCount = Object.keys(selectedAnswers).length

  const currentQuestion = useMemo(() => {
    if (totalQuestions === 0) return null
    return questions[currentQuestionIndex] ?? null
  }, [questions, currentQuestionIndex, totalQuestions])

  const currentQuestionSpeechText = useMemo(() => {
    if (!currentQuestion) return ''
    return `Question ${currentQuestionIndex + 1}. ${currentQuestion.question}`
  }, [currentQuestion, currentQuestionIndex])

  const currentOptionsSpeechText = useMemo(() => {
    if (!currentQuestion) return ''
    const optionsText = Object.entries(currentQuestion.options)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([optionKey, optionLabel]) => `Option ${optionKey}. ${optionLabel}`)

    if (optionsText.length === 0) {
      return 'There are no options for this question.'
    }

    return `Options are: ${optionsText.join('. ')}`
  }, [currentQuestion])

  const selectPreferredVoice = (voices: SpeechSynthesisVoice[]) => {
    if (voices.length === 0) return null
    const normalize = (value: string) => value.toLowerCase()
    const isFemaleVoice = (voice: SpeechSynthesisVoice) => {
      const name = normalize(voice.name)
      return (
        name.includes('female') ||
        name.includes('woman') ||
        name.includes('zira') ||
        name.includes('sara') ||
        name.includes('ananya') ||
        name.includes('pooja') ||
        name.includes('neha') ||
        name.includes('rashmi') ||
        name.includes('lekha') ||
        name.includes('heera') ||
        name.includes('kavya')
      )
    }

    const enInVoices = voices.filter((voice) => normalize(voice.lang || '').startsWith('en-in'))
    const googleEnInVoices = enInVoices.filter((voice) => normalize(voice.name).includes('google'))

    return (
      googleEnInVoices.find(isFemaleVoice) ||
      googleEnInVoices[0] ||
      enInVoices.find(isFemaleVoice) ||
      enInVoices[0] ||
      voices.find((voice) => normalize(voice.name).includes('india')) ||
      voices.find((voice) => normalize(voice.name).includes('google')) ||
      voices[0] ||
      null
    )
  }

  const preferredVoice = useMemo(() => selectPreferredVoice(availableVoices), [availableVoices])

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

  const handleCloseTab = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.close()
      return
    }

    router.back()
  }

  const stopSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setActiveSpeechTarget(null)
  }

  const handleSpeak = (text: string, target: 'question' | 'options' | 'explanation') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({
        title: 'Not supported',
        description: 'Voice playback is not supported in this browser.',
        variant: 'destructive',
      })
      return
    }

    if (!text) return

    if (activeSpeechTarget === target) {
      stopSpeech()
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voiceToUse = preferredVoice || selectPreferredVoice(window.speechSynthesis.getVoices())
    if (voiceToUse) {
      utterance.voice = voiceToUse
      utterance.lang = voiceToUse.lang
    }
    utterance.rate = 1.75
    utterance.onend = () => {
      setActiveSpeechTarget((prev) => (prev === target ? null : prev))
    }
    utterance.onerror = () => {
      setActiveSpeechTarget((prev) => (prev === target ? null : prev))
    }

    setActiveSpeechTarget(target)
    window.speechSynthesis.speak(utterance)
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

  const handleSubmitAssessment = async () => {
    try {
      setIsSubmitting(true)

      const payload = {
        assessmentId: assessmentId,
        courseId: +params?.courseId || null,
        domainId: domainId ? +domainId : null,
        chapterId: chapterId ? +chapterId : null,
        questions: questions.map((question) => ({
          ...question,
          correctOptionSelectedByStudents: +selectedAnswers[question.questionId] || null,
        })),
      }

      const response = await api.post(`${process.env.NEXT_PUBLIC_EVAL_URL}/ai-assessment/submit-score`, payload)

      toast({
        title: 'Success',
        description: 'Assessment submitted successfully!',
      })

      // Fetch the result after successful submission
      await fetchResult(assessmentId)
      setShowResults(true)
      setResultCurrentQuestionIndex(0)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to submit assessment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
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

  const getResultQuestionButtonClass = (index: number) => {
    if (!result) return ''
    const isCurrentQuestion = index === resultCurrentQuestionIndex
    const resultQuestion = result.questions[index]
    const isCorrect = resultQuestion?.isCorrect

    if (isCurrentQuestion) {
      return 'aspect-square bg-primary shadow-soft rounded-md flex items-center justify-center font-semibold text-xs font-bold text-white border border-primary hover:bg-primary-dark'
    }

    if (isCorrect) {
      return 'aspect-square bg-success-light text-success rounded-md flex items-center justify-center font-semibold text-xs font-bold border border-success/30'
    }

    return 'aspect-square bg-destructive/10 text-destructive rounded-md flex items-center justify-center font-semibold text-xs font-bold border border-destructive/30'
  }

  const getOptionLabelFromQuestion = (questionId: number, optionKey: number | string): string | null => {
    const question = questions.find((q) => q.questionId === questionId)
    if (!question) return null
    return question.options[optionKey] || null
  }

  const handleExplainWithAi = async (questionId: number) => {
    setSelectedQuestionForExplanation(questionId)
    setIsExplanationDialogOpen(true)

    // Fetch explanation async
    await fetchExplanation(assessmentId, questionId)
  }

  const handleSpeakExplanation = async (questionId: number) => {
    const existingExplanation = getExplanation(assessmentId, questionId)?.explanation
    if (!existingExplanation) {
      await fetchExplanation(assessmentId, questionId)
    }

    const explanationText = getExplanation(assessmentId, questionId)?.explanation
    if (!explanationText) {
      toast({
        title: 'No explanation',
        description: 'Explanation is not available for this question yet.',
        variant: 'destructive',
      })
      return
    }

    handleSpeak(explanationText, 'explanation')
  }

  const handleDownloadReport = () => {
    if (!result || !assessmentMeta) return

    const doc = new jsPDF()

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(96, 144, 130)
    doc.setFontSize(16)
    doc.text(`AI Assessment Report`, 105, 10, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)

    doc.text(`Assessment ID: ${assessmentMeta.aiAssessmentId || 'N/A'}`, 15, 25)
    doc.text(`Set #: ${assessmentMeta.questionSetId || 'N/A'}`, 15, 30)
    doc.text(`Total Marks: ${result.totalQuestions}`, 15, 40)
    doc.text(`Score: ${result.score}`, 15, 45)
    doc.text(`Percentage: ${result.percentage}%`, 15, 50)
    doc.text(`Grade: ${result.level?.grade || 'N/A'}`, 15, 55)

    autoTable(doc, {
      head: [['Question', 'Status', 'Your Answer', 'Correct Answer']],
      body: result.questions.map((q, index) => {
        const originalQuestion = questions.find(oq => oq.questionId === q.questionId)
        const selectedOptionLabel = q.selectedOption ? originalQuestion?.options[q.selectedOption] || `Option ${q.selectedOption}` : 'Not answered'
        const correctOptionLabel = originalQuestion?.options[q.correctOption] || `Option ${q.correctOption}`

        return [
          `Q${index + 1}. ${originalQuestion?.question || ''}`,
          q.isCorrect ? 'Correct' : 'Incorrect',
          selectedOptionLabel,
          correctOptionLabel
        ]
      }),
      startY: 65,
      theme: 'grid',
      headStyles: {
        fillColor: [96, 144, 130],
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 20 },
        2: { cellWidth: 45 },
        3: { cellWidth: 45 },
      },
    })

    doc.save(`Assessment_${assessmentMeta.aiAssessmentId}_Report.pdf`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-soft h-16 flex justify-between items-center px-8 border-b border-border/60">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center shadow-soft">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-heading font-bold text-lg text-foreground tracking-tight">AI Assessment</h1>
          </div>
          <div className="h-6 w-px bg-border/60 hidden md:block"></div>
          <div className="hidden md:flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold font-body">Progress</span>
            <div className="flex items-center gap-2.5">
              <div className="w-28 h-2 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${totalQuestions > 0 ? (attemptedQuestionsCount / totalQuestions) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-primary font-body tabular-nums">
                {totalQuestions > 0 ? Math.round((attemptedQuestionsCount / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-16 flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="h-[calc(100vh-4rem)] w-72 fixed left-0 top-16 bg-card overflow-y-auto border-r border-border/60 flex flex-col p-5 space-y-5">
          {showResults && result ? (
            // Results Sidebar
            <>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground tracking-tight">Results Summary</h3>
                <p className="text-xs text-text-secondary mt-1.5 font-body">Score: <span className="font-semibold text-primary">{result.score}</span>/{result.totalQuestions}</p>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.12em] font-body">Question Review</span>
                    <span className="text-[11px] bg-primary-light text-primary px-2.5 py-1 rounded-full font-bold font-body tabular-nums">
                      {resultCurrentQuestionIndex + 1} / {result.questions.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {result.questions.map((question, index) => (
                      <button
                        key={`result-nav-${question.questionId}`}
                        onClick={() => setResultCurrentQuestionIndex(index)}
                        className={getResultQuestionButtonClass(index)}
                        title={`Question ${index + 1}${question.isCorrect ? ' (Correct)' : ' (Incorrect)'}`}
                      >
                        <span className="text-xs font-bold">{index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            // Questions Sidebar
            <>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground tracking-tight">Assessment {assessmentMeta?.aiAssessmentId}</h3>
                <p className="text-xs text-text-secondary mt-1.5 font-body">Set <span className="font-semibold">#{assessmentMeta?.questionSetId}</span></p>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.12em] font-body">Navigator</span>
                    <span className="text-[11px] bg-primary-light text-primary px-2.5 py-1 rounded-full font-bold font-body tabular-nums">
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
                <button
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Main Content */}
        <main className="ml-72 flex-1 p-8 pb-28">
          {showResults && result ? (
            // Results View
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {/* Results Header */}
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light border border-primary/10 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-bold text-primary uppercase tracking-[0.12em] font-body">Completed</span>
                    </div>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-tight leading-tight">Assessment Complete</h1>
                    <p className="text-sm text-text-secondary font-body font-medium leading-relaxed">Here&apos;s your detailed performance analysis</p>
                  </div>

                  {/* Score Card */}
                  <Card className="border-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background shadow-soft overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center justify-center space-y-2.5 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-border/30 hover:shadow-soft transition-shadow">
                          <div className="font-heading text-2xl font-bold text-primary tracking-tight">
                            {result.score}
                            <span className="text-xs text-text-secondary font-body font-normal">/{result.totalQuestions}</span>
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold font-body">Correct Answers</p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-2.5 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-border/30 hover:shadow-soft transition-shadow">
                          <div className="font-heading text-2xl font-bold text-foreground tracking-tight">{result.percentage}<span className="text-lg">%</span></div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold font-body">Score Percentage</p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-2.5 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-soft transition-shadow">
                          <div className="font-heading text-2xl font-bold text-primary tracking-tight">{result.level.grade}</div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold font-body">Grade</p>
                        </div>

                        <button
                          onClick={handleDownloadPDF}
                          className="flex flex-col items-center justify-center space-y-2.5 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-border/30 hover:bg-white/90 hover:shadow-soft transition-all cursor-pointer group"
                        >
                          <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                            <Download className="w-5 h-5 text-primary" />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-semibold font-body group-hover:text-primary transition-colors">Download Report</p>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Question Review */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-foreground tracking-tight">Question Review</h2>
                    <div className="text-[11px] font-bold text-text-secondary px-3.5 py-1.5 bg-background rounded-full border border-border/30 font-body tabular-nums">
                      {resultCurrentQuestionIndex + 1} of {result.questions.length}
                    </div>
                  </div>

                  {!isFetchingResult && result.questions.length > 0 && (
                    <Card className="border-border/40 bg-gradient-to-br from-background via-white/30 to-background shadow-soft rounded-xl overflow-hidden">
                      <CardContent className="p-8">
                        {(() => {
                          const resultQuestion = result.questions[resultCurrentQuestionIndex]
                          const originalQuestion = questions.find((q) => q.questionId === resultQuestion.questionId)

                          if (!resultQuestion || !originalQuestion) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-sm text-text-secondary">Could not load question details</p>
                              </div>
                            )
                          }

                          return (
                            <div className="space-y-6">
                              {/* Question Header */}
                              <div className="space-y-4 pb-5 border-b border-border/20">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white ${resultQuestion.isCorrect
                                      ? 'bg-gradient-to-br from-success to-success/80'
                                      : 'bg-gradient-to-br from-destructive to-destructive/80'
                                      }`}>
                                      {resultQuestion.isCorrect ? '✓' : '✕'}
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-[0.12em] font-body">Question {resultCurrentQuestionIndex + 1}</p>
                                      <p className={`text-xs font-semibold font-body ${resultQuestion.isCorrect ? 'text-success' : 'text-destructive'
                                        }`}>
                                        {resultQuestion.isCorrect ? 'Correct' : 'Incorrect'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* AI Actions — repositioned here for better UX */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border-primary/20 text-primary hover:bg-primary-light hover:border-primary/30 transition-all font-body font-semibold"
                                      onClick={() => handleExplainWithAi(resultQuestion.questionId)}
                                      disabled={isExplanationLoading}
                                    >
                                      {isExplanationLoading ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3.5 h-3.5" />
                                          Explain
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border-border/50 hover:bg-muted/50 transition-all font-body font-semibold"
                                      onClick={() => handleSpeakExplanation(resultQuestion.questionId)}
                                      disabled={isExplanationLoading}
                                    >
                                      {activeSpeechTarget === 'explanation' ? (
                                        <>
                                          <VolumeX className="w-3.5 h-3.5" />
                                          Stop
                                        </>
                                      ) : (
                                        <>
                                          <Volume2 className="w-3.5 h-3.5" />
                                          Voice
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <h3 className="text-[15px] font-semibold text-foreground leading-relaxed font-body">
                                  {originalQuestion.question}
                                </h3>
                              </div>

                              {/* Options with Comparison */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary mb-3 font-body">Answer Options</p>
                                {Object.entries(originalQuestion.options)
                                  .sort(([left], [right]) => Number(left) - Number(right))
                                  .map(([optionKey, optionLabel]) => {
                                    const optionNum = Number(optionKey)
                                    const isCorrectOption = resultQuestion.correctOption === optionNum
                                    const isSelectedOption = resultQuestion.selectedOption === optionNum
                                    const showAsCorrect = isCorrectOption && resultQuestion.isCorrect
                                    const showAsIncorrect = isSelectedOption && !resultQuestion.isCorrect
                                    const showAsCorrectAnswer = isCorrectOption && !resultQuestion.isCorrect

                                    return (
                                      <div
                                        key={`result-${resultQuestion.questionId}-${optionKey}`}
                                        className={`relative p-4 rounded-lg border transition-all ${showAsCorrect
                                          ? 'bg-success/5 border-success/30 shadow-sm'
                                          : showAsIncorrect
                                            ? 'bg-destructive/5 border-destructive/30 shadow-sm'
                                            : showAsCorrectAnswer
                                              ? 'bg-success/5 border-success/30'
                                              : 'bg-background border-border/30'
                                          }`}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-3 flex-1">
                                            <div
                                              className={`min-w-fit w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${showAsCorrect
                                                ? 'bg-success/20 text-success'
                                                : showAsIncorrect
                                                  ? 'bg-destructive/20 text-destructive'
                                                  : showAsCorrectAnswer
                                                    ? 'bg-success/20 text-success'
                                                    : 'bg-muted text-text-secondary'
                                                }`}
                                            >
                                              {optionKey}
                                            </div>
                                            <span className="text-sm text-foreground pt-0.5 font-body leading-relaxed">
                                              {optionLabel}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                            {showAsCorrect && (
                                              <div className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded text-xs font-semibold border border-success/20">
                                                <CheckCircle className="w-3 h-3" />
                                                Your Answer
                                              </div>
                                            )}
                                            {showAsIncorrect && (
                                              <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded text-xs font-semibold border border-destructive/20">
                                                <XCircle className="w-3 h-3" />
                                                Your Answer
                                              </div>
                                            )}
                                            {showAsCorrectAnswer && (
                                              <div className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded text-xs font-semibold border border-success/20">
                                                <CheckCircle className="w-3 h-3" />
                                                Correct
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </div>

                              {/* Answer Summary */}
                              <div className="bg-card border border-border/60 rounded-xl p-5 space-y-3">
                                <p className="text-xs font-bold text-foreground font-heading tracking-tight">Answer Summary</p>
                                <div className="text-xs space-y-2 text-text-secondary font-body">
                                  <p className="leading-relaxed">
                                    Your Answer:{' '}
                                    <span className="font-semibold text-foreground">
                                      {resultQuestion.selectedOption
                                        ? `Option ${resultQuestion.selectedOption} — ${getOptionLabelFromQuestion(
                                          resultQuestion.questionId,
                                          resultQuestion.selectedOption
                                        )}`
                                        : 'Not answered'}
                                    </span>
                                  </p>
                                  <p className="leading-relaxed">
                                    Correct Answer:{' '}
                                    <span className="font-semibold text-success">
                                      Option {resultQuestion.correctOption} — {getOptionLabelFromQuestion(
                                        resultQuestion.questionId,
                                        resultQuestion.correctOption
                                      )}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Questions View
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="px-3.5 py-1.5 bg-primary-light rounded-full border border-primary/10">
                        <span className="text-[11px] font-bold text-primary tracking-[0.1em] uppercase font-body tabular-nums">
                          Question {currentQuestionIndex + 1} / {totalQuestions}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSpeak(currentQuestionSpeechText, 'question')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold font-body ${activeSpeechTarget === 'question'
                            ? 'bg-primary-light text-primary shadow-soft'
                            : 'text-text-secondary hover:text-primary hover:bg-primary-light'
                            }`}
                          title={activeSpeechTarget === 'question' ? 'Stop voice' : 'Voice question'}
                        >
                          {activeSpeechTarget === 'question' ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                          {activeSpeechTarget === 'question' ? 'Stop' : 'Voice'}
                        </button>
                        <button
                          onClick={() => toggleFlag(currentQuestion.questionId)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold font-body ${flaggedQuestions.has(currentQuestion.questionId)
                            ? 'bg-destructive/10 text-destructive shadow-soft'
                            : 'text-text-secondary hover:text-destructive hover:bg-destructive/5'
                            }`}
                        >
                          <Flag className="w-4 h-4" fill={flaggedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
                          Flag
                        </button>
                        <button
                          onClick={() => toggleBookmark(currentQuestion.questionId)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-semibold font-body ${bookmarkedQuestions.has(currentQuestion.questionId)
                            ? 'bg-primary-light text-primary shadow-soft'
                            : 'text-text-secondary hover:text-primary hover:bg-primary-light'
                            }`}
                        >
                          <Bookmark className="w-4 h-4" fill={bookmarkedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
                          Save
                        </button>
                      </div>
                    </div>

                    <h2 className="text-lg font-body font-semibold text-foreground leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary font-body">Answer Options</p>
                      <button
                        onClick={() => handleSpeak(currentOptionsSpeechText, 'options')}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-semibold ${activeSpeechTarget === 'options'
                          ? 'bg-primary-light text-primary'
                          : 'text-text-secondary hover:text-primary hover:bg-primary-light'
                          }`}
                        title={activeSpeechTarget === 'options' ? 'Stop voice' : 'Voice options'}
                      >
                        {activeSpeechTarget === 'options' ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                        {activeSpeechTarget === 'options' ? 'Stop' : 'Voice Options'}
                      </button>
                    </div>

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
                              className={`group relative flex items-center p-4 rounded-xl text-left border transition-all duration-200 ${isSelected
                                ? 'bg-success-light border-success shadow-soft'
                                : 'bg-card border-border hover:border-primary/30 hover:shadow-soft'
                                }`}
                            >
                              <div
                                className={`min-w-fit w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm mr-4 transition-colors flex-shrink-0 ${isSelected
                                  ? 'bg-success text-white'
                                  : 'bg-muted text-primary group-hover:bg-primary group-hover:text-white'
                                  }`}
                              >
                                {optionKey}
                              </div>
                              <span className={`text-sm font-body leading-relaxed ${isSelected ? 'text-foreground font-semibold' : 'text-foreground font-medium'}`}>
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
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-72 right-0 h-20 bg-card/80 backdrop-blur-xl border-t border-border/60 px-8 flex items-center justify-between z-40">
        {showResults && result ? (
          // Results Navigation
          <>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 text-xs h-9 font-body font-semibold rounded-lg"
              onClick={() => {
                if (resultCurrentQuestionIndex > 0) {
                  setResultCurrentQuestionIndex((prev) => prev - 1)
                }
              }}
              disabled={resultCurrentQuestionIndex === 0}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </Button>

            <div className="text-[11px] font-bold text-text-secondary font-body tabular-nums">
              Question {resultCurrentQuestionIndex + 1} / {result.questions.length}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-xs h-9 font-body font-semibold rounded-lg"
                onClick={handleCloseTab}
              >
                Back to Chapter
              </Button>
              <Button
                type="button"
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground text-xs h-9 font-semibold shadow-soft font-body rounded-lg"
                onClick={() => {
                  if (resultCurrentQuestionIndex < result.questions.length - 1) {
                    setResultCurrentQuestionIndex((prev) => prev + 1)
                  }
                }}
                disabled={resultCurrentQuestionIndex === result.questions.length - 1}
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        ) : (
          // Questions Navigation
          <>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 text-xs h-9 font-body font-semibold rounded-lg"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => currentQuestion && toggleFlag(currentQuestion.questionId)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentQuestion && flaggedQuestions.has(currentQuestion.questionId)
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-text-secondary hover:bg-destructive/10 hover:text-destructive'
                  }`}
                title="Flag for Review"
              >
                <Flag className="w-4 h-4" fill={currentQuestion && flaggedQuestions.has(currentQuestion.questionId) ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => currentQuestion && toggleBookmark(currentQuestion.questionId)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentQuestion && bookmarkedQuestions.has(currentQuestion.questionId)
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
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground text-xs h-9 font-semibold shadow-soft font-body rounded-lg"
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </footer>

      {/* Explanation Dialog */}
      {selectedQuestionForExplanation && result && (
        <ExplanationDialog
          isOpen={isExplanationDialogOpen}
          onClose={() => {
            setIsExplanationDialogOpen(false)
            setSelectedQuestionForExplanation(null)
          }}
          questionId={selectedQuestionForExplanation}
          questionText={
            questions.find((q) => q.questionId === selectedQuestionForExplanation)?.question || ''
          }
          explanation={getExplanation(assessmentId, selectedQuestionForExplanation)?.explanation || null}
          isLoading={isExplanationLoading && selectedQuestionForExplanation === selectedQuestionForExplanation}
          error={isExplanationLoading ? null : (explanationError || null)}
        />
      )}
    </div>
  )
}

export default AssessmentQuestionsPage
