"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import AdaptiveAssessmentTopicForm from '../../../_components/Assessment/AdaptiveAssessmentTopicForm'
import type { AdaptiveAssessmentTopicPayload } from '../../../_components/Assessment/AdaptiveAssessmentTopicForm'
import { toast } from '@/components/ui/use-toast'

type Props = {}

const AdaptiveAssessment = (props: Props) => {
  const params = useParams<{ courseId: string; moduleId: string }>()
  const [formOpen, setFormOpen] = useState(true)

  const bootcampId = Number(params?.courseId)
  const moduleId = Number(params?.moduleId)
  const isValidIds = Number.isFinite(bootcampId) && Number.isFinite(moduleId)

  const handleSave = (payload: AdaptiveAssessmentTopicPayload) => {
    toast.success({
      title: 'Adaptive assessment topic saved',
      description: `Topic: ${payload.topic}`,
    })
  }

  if (!isValidIds) {
    return (
      <div className="p-6 text-sm text-destructive">
        Invalid module or course identifier.
      </div>
    )
  }

  return (
    <div className="w-full p-6">
      <AdaptiveAssessmentTopicForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        moduleId={moduleId}
        bootcampId={bootcampId}
      />
    </div>
  )
}

export default AdaptiveAssessment