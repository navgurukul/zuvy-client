'use client'

import React from 'react'
import { ChevronLeft, Check, X, Circle, Award, Target, Clock, AlertCircle, Sun, Moon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, difficultyColor } from '@/lib/utils'
import useWindowSize from '@/hooks/useHeightWidth'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'
import { useQuizResults } from '@/hooks/useQuizResults'
import { useThemeStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import {MCQResult} from "@/app/student/course/[courseId]/modules/[moduleId]/assessmentResult/[submissionId]/quizResult/modulesAssessmentQuixResultType"
import{QuizResultPageSkeleton} from "@/app/student/_components/Skeletons"
const QuizResults = ({
    params,
}: {
    params: { submissionId: string }
}) => {
    const router = useRouter()
    const { isDark, toggleTheme } = useThemeStore();

    const { width } = useWindowSize()
    const isMobile = width < 768

    // Use the custom hook for API call
    const { data: quizResults, loading, error } = useQuizResults({
        submissionId: params.submissionId,
        enabled: true
    })

    // Calculate statistics
    const totalQuestions = quizResults?.mcqs?.length || 0
    const correctAnswers = quizResults?.mcqs?.filter(
        (result:any) => result.submissionsData?.status === 'passed'
    )?.length || 0
    const totalMarks = quizResults?.mcqs?.reduce(
        (sum: number, result: any) => sum + (result.submissionsData?.status === 'passed' ? Number(result.mark) : 0), 
        0
    ) || 0
    const maxMarks = quizResults?.mcqs?.reduce(
        (sum: number, result: any) => sum + (Number(result.mark)), 
        0
    ) || 0
    const percentage = maxMarks > 0 ? Math.ceil((totalMarks / maxMarks) * 100) : 0

    // Show loading state
    if (loading) {
     return<QuizResultPageSkeleton/>
    }
    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-destructive-light/5 to-warning-light/10 flex items-center justify-center p-6">
                <div className="max-w-lg w-full">
                    <div className="bg-card border border-destructive/20 rounded-2xl p-8 shadow-16dp">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-destructive" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-destructive mb-3">Unable to Load Results</h3>
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-4dp hover:shadow-8dp"
                                    >
                                        Try Again
                                    </button>
                                    <button 
                                        onClick={() => router.back()} 
                                        className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted-dark transition-all duration-200 shadow-2dp hover:shadow-4dp"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show no questions state
    if (!quizResults?.mcqs?.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted-light/20 to-primary-light/10 p-6">
                <div className="max-w-4xl mx-auto">
                    <div
                        onClick={() => router.back()}
                        className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark mb-8 transition-colors duration-200 cursor-pointer group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Back to Results</span>
                    </div>
                    
                    <div className="text-center bg-card border border-border rounded-2xl p-12 shadow-8dp">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Target className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-3">No Quiz Questions</h2>
                        <p className="text-muted-foreground">This assessment doesn&apos;t contain any quiz questions.</p>
                    </div>
                </div>
            </div>
        )
    }    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
            <div className='flex items-center justify-between mr-4'>
                    <div
                        onClick={() => router.back()}
                        className="inline-flex text-left w-full m-3 items-center space-x-2 text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Back to Results</span>
                    </div>
                    <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 p-0 mt-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>   

            </div>
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    
                    <div className="flex items-center space-x-3">
                        <Award className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold text-foreground">Quiz Results</h1>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-8dp hover:shadow-16dp transition-all duration-300">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Score</p>
                                <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl p-6 shadow-8dp hover:shadow-16dp transition-all duration-300">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                                <Check className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Correct</p>
                                <p className="text-2xl font-bold text-foreground">{correctAnswers}/{totalQuestions}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl p-6 shadow-8dp hover:shadow-16dp transition-all duration-300">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Points</p>
                                <p className="text-2xl font-bold text-foreground">{totalMarks.toFixed(2)}/{Math.ceil(maxMarks)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl p-6 shadow-8dp hover:shadow-16dp transition-all duration-300">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Questions</p>
                                <p className="text-2xl font-bold text-foreground">{totalQuestions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {quizResults?.mcqs.map((result: MCQResult, index: number) => (
                        <div
                            key={result.quizId}
                            className="bg-card border border-border rounded-2xl shadow-8dp hover:shadow-16dp transition-all duration-300 overflow-hidden"
                        >
                            {/* Question Header */}
                            <div className="bg-card-elevated border-b border-border p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">Question {index + 1}</h3>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-medium border',
                                            difficultyColor(result.difficulty)
                                        )}>
                                            {result.difficulty}
                                        </span>
                                        <div className={cn(
                                            'px-3 py-1 rounded-full text-xs font-medium',
                                            result.submissionsData?.status === 'passed'
                                                ? 'bg-success/10 text-success border border-success/20'
                                                : 'bg-muted text-muted-foreground border border-border'
                                        )}>
                                            {result.submissionsData?.status === 'passed' ? Number(result.mark) : 0}/{(Number(result.mark))} Marks
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="p-6">
                                <div className="mb-6 text-left">
                                    <RemirrorForm
                                        description={result.question}
                                        preview={true}
                                        bigScreen={true}
                                    />
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    {Object.entries(result.options).map(([key, value]) => {
                                        const isCorrect = key === result.correctOption.toString()
                                        const isChosen = key === result?.submissionsData?.chosenOption?.toString()
                                        
                                        let bgColor = 'bg-muted/30'
                                        let borderColor = 'border-border'
                                        let textColor = 'text-foreground'
                                        let iconColor = 'text-muted-foreground'
                                        
                                        if (isChosen) {
                                            if (isCorrect) {
                                                bgColor = 'bg-success/10'
                                                borderColor = 'border-success/30'
                                                textColor = 'text-success-dark'
                                                iconColor = 'text-success'
                                            } else {
                                                bgColor = 'bg-destructive/10'
                                                borderColor = 'border-destructive/30'
                                                textColor = 'text-destructive-dark'
                                                iconColor = 'text-destructive'
                                            }
                                        } else if (isCorrect) {
                                            bgColor = 'bg-success/5'
                                            borderColor = 'border-success/20'
                                            textColor = 'text-success-dark'
                                            iconColor = 'text-success'
                                        }

                                        const icon = isChosen ? (
                                            isCorrect ? (
                                                <Check className={`w-5 h-5 ${iconColor}`} />
                                            ) : (
                                                <X className={`w-5 h-5 ${iconColor}`} />
                                            )
                                        ) : isCorrect ? (
                                            <Check className={`w-5 h-5 ${iconColor}`} />
                                        ) : (
                                            <Circle className={`w-5 h-5 ${iconColor}`} />
                                        )

                                        return (
                                            <div
                                                key={key}
                                                className={cn(
                                                    'p-4 rounded-xl border transition-all duration-200',
                                                    bgColor,
                                                    borderColor,
                                                    textColor,
                                                    'shadow-2dp hover:shadow-4dp'
                                                )}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {icon}
                                                    <span className="font-medium text-left flex-1">{value as any}</span>
                                                    {isCorrect && !isChosen && (
                                                        <span className="text-xs px-2 py-1 bg-success/20 text-success-dark rounded-full font-medium">
                                                            Correct
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Not Answered State */}
                                {!result?.submissionsData && (
                                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="w-4 h-4 text-warning" />
                                            <span className="text-sm font-medium text-warning-dark">Not Answered</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default QuizResults
