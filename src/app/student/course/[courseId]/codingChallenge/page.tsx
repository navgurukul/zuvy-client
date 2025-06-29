'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Editor from './editor'
import { Spinner } from '@/components/ui/spinner'

function CodingChallengeWrapper() {
  const searchParams = useSearchParams()
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Invalid Question</h1>
          <p className="text-muted-foreground">No question ID provided</p>
        </div>
      </div>
    )
  }

  return (
    <Editor
      params={{ editor: questionId }}
      onBack={() => window.history.back()}
    />
  )
}

export default function CodingChallengePage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <CodingChallengeWrapper />
    </Suspense>
  )
}