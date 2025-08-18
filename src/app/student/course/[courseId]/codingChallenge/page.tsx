'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Editor from './editor'
import { Spinner } from '@/components/ui/spinner'

const ChallengePageContent = () => {
    const searchParams = useSearchParams()
    const questionId = searchParams.get('questionId')

    if (!questionId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                <h2 className="text-xl font-semibold mb-4">No Challenge Selected</h2>
                <p className="text-muted-foreground">Please go back and select a coding challenge to start.</p>
            </div>
        )
    }

    return <Editor questionId={questionId} />
}

const CodingChallengePage = () => {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-background">
            <Spinner size="large" />
        </div>
    }>
        <ChallengePageContent />
    </Suspense>
  )
}

export default CodingChallengePage