'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'

interface ExplanationDialogProps {
  isOpen: boolean
  onClose: () => void
  questionId: number
  questionText: string
  explanation: string | null
  isLoading: boolean
  error: string | null
}

export const ExplanationDialog: React.FC<ExplanationDialogProps> = ({
  isOpen,
  onClose,
  questionId,
  questionText,
  explanation,
  isLoading,
  error,
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    if (explanation && !isLoading) {
      setIsTyping(true)
      let currentIndex = 0
      const fullText = explanation

      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(typeInterval)
        }
      }, 15) // Adjust typing speed (15ms per character)

      return () => clearInterval(typeInterval)
    }
  }, [explanation, isLoading, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex items-start justify-between">
          <div className="flex-1">
            <DialogTitle className="text-lg  font-bold text-foreground">Question Explanation</DialogTitle>
            <p className="text-xs text-text-secondary mt-2 font-medium">Question #{questionId}</p>
          </div>
          {/* <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-background transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button> */}
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Display */}
          <div className="p-4 rounded-lg border border-border/30 bg-background">
            <p className="text-xs font-semibold uppercase text-left tracking-widest text-text-secondary mb-2">Question</p>
            <p className="text-sm text-left text-foreground leading-relaxed">{questionText}</p>
          </div>

          {/* Explanation Display */}
          <div className="space-y-2">
            <div className="flex text-left gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">AI Explanation</p>
              {(isLoading || isTyping) && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating
                </div>
              )}
            </div>

            {error ? (
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-border/30 bg-gradient-to-br from-background to-primary/5 min-h-32">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <p className="text-xs text-text-secondary">Fetching explanation...</p>
                    </div>
                  </div>
                ) : explanation ? (
                  <div>
                    <p className="text-sm text-left leading-relaxed text-foreground whitespace-pre-wrap">
                      {displayedText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary italic">No explanation available</p>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
