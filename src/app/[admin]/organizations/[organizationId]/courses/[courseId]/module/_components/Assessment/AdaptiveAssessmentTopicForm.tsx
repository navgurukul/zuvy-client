'use client'

import React from 'react'
import AssessmentBuilder from '../AdaptiveAssessmentEval/AssessmentBuilder'
import { Chapter } from '../AdaptiveAssessmentEval/types'

export type AdaptiveAssessmentTopicPayload = any;

interface AdaptiveAssessmentTopicFormProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSave?: (payload: AdaptiveAssessmentTopicPayload) => void;
	moduleId: number;
	bootcampId: number;
}

export default function AdaptiveAssessmentTopicForm({
	moduleId,
	bootcampId,
}: AdaptiveAssessmentTopicFormProps) {
	// Mock baseline options
	const dummyBaselineOptions: Chapter[] = [
		{ id: 1012, title: 'HTML & CSS Basics', questionCount: 15 },
		{ id: 1022, title: 'JavaScript Fundamentals', questionCount: 20 },
	];

	return (
		<div className="h-full">
			<AssessmentBuilder
				chapterId={0}
				moduleId={moduleId}
				baselineOptions={dummyBaselineOptions}
			/>
		</div>
	)
}