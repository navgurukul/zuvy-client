"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import AdaptiveAssessmentTopicForm from '../../../_components/Assessment/AdaptiveAssessmentTopicForm'
import type { AdaptiveAssessmentTopicPayload } from '../../../_components/Assessment/AdaptiveAssessmentTopicForm'
import { toast } from '@/components/ui/use-toast'

type Props = {
  chapterData?: any;
  content?: any;
  fetchChapterContent?: any;
  moduleId?: any;
  courseId?: any;
  canEdit?: boolean;
  chapterId?: number;
  topicId?: number;
}

const AdaptiveAssessment = (props: Props) => {
  const params = useParams<{ courseId: string; moduleId: string }>()
  const [formOpen, setFormOpen] = useState(true)

  const bootcampId = Number(props.courseId || params?.courseId)
  const moduleId = Number(props.moduleId || params?.moduleId)
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
    <div className="w-full h-[calc(100vh-48px)]">
      <AdaptiveAssessmentTopicForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        bootcampId={bootcampId}
        {...props}
        moduleId={moduleId}
      />
    </div>
  )
}

export default AdaptiveAssessment