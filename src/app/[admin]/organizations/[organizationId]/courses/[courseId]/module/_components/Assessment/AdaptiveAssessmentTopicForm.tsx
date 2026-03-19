import { useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useCreateTopic } from '@/hooks/useCreateTopic'
import { useTopics } from '@/hooks/useTopics'

export type AdaptiveAssessmentTopicPayload = {
	topic: string
	description: string
}

type AdaptiveAssessmentTopicFormProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (payload: AdaptiveAssessmentTopicPayload) => void
	moduleId: number
	bootcampId: number
}

function AdaptiveAssessmentTopicForm({
	open,
	onOpenChange,
	onSave,
	moduleId,
	bootcampId,
}: AdaptiveAssessmentTopicFormProps) {
	const { topics, loading: loadingTopics, refetch } = useTopics(
		moduleId,
		bootcampId,
		open
	)
	const { createTopic, creating } = useCreateTopic()
	const [topicOptions, setTopicOptions] = useState<
		Array<{ id: number; name: string }>
	>([])
	const [selectedTopicId, setSelectedTopicId] = useState<string>('')
	const [description, setDescription] = useState('')
	const [newTopicName, setNewTopicName] = useState('')
	const [selectOpen, setSelectOpen] = useState<boolean>(false)
	const selectionBeforeOpen = useRef<string>('')

	// Get selected topic name from ID
	const selectedTopicName = topicOptions.find(
		(t) => String(t.id) === selectedTopicId
	)?.name

	const hasSelectedTopic = !!selectedTopicName
	const hasNewTopicName = newTopicName.trim().length > 0

	// Handle toggle deselect on dropdown open/close
	useEffect(() => {
		if (selectOpen) {
			// Opening: store current selection
			selectionBeforeOpen.current = selectedTopicId
		} else {
			// Closing: if selection unchanged, user clicked same item - deselect
			if (selectionBeforeOpen.current !== '' && selectedTopicId === selectionBeforeOpen.current) {
				setSelectedTopicId('')
			}
			selectionBeforeOpen.current = ''
		}
	}, [selectOpen, selectedTopicId])

	useEffect(() => {
		const apiTopics = topics
			.filter((topic) => topic?.id && topic?.name)
			.map((topic) => ({
				id: topic.id!,
				name: topic.name,
			}))

		setTopicOptions(apiTopics)
	}, [topics])

	useEffect(() => {
		if (!open) {
			setSelectedTopicId('')
			setDescription('')
			setNewTopicName('')
			setSelectOpen(false)
			selectionBeforeOpen.current = ''
		}
	}, [open])

	const handleSave = async () => {
		const trimmedName = newTopicName.trim()
		const trimmedDescription = description.trim()

		if (trimmedName && hasSelectedTopic) {
			toast.error({
				title: 'Choose one topic source',
				description:
					'Use either Select Topic or Create New Topic, not both.',
			})
			return
		}

		if (!trimmedDescription) {
			toast.error({
				title: 'Description required',
				description: 'Please enter a topic description.',
			})
			return
		}

		const finalTopic = trimmedName || selectedTopicName

		if (!finalTopic) {
			toast.error({
				title: 'Topic required',
				description:
					'Select a topic from dropdown or enter a new topic name.',
			})
			return
		}

		try {
			await createTopic(bootcampId, {
				moduleId,
				name: finalTopic,
				description: trimmedDescription,
			})

			setSelectedTopicId('')
			setNewTopicName('')
			refetch()
		} catch (error: any) {
			toast.error({
				title: 'Failed to create topic',
				description:
					error?.response?.data?.message ||
					'Unable to create topic right now.',
			})
			return
		}

		onSave({
			topic: finalTopic,
			description: trimmedDescription,
		})
	}

	if (!open) {
		return null
	}

	return (
		<section className="w-full lg:w-1/2 border border-border/60 rounded-xl overflow-hidden bg-background">
			<div className="px-6 pt-6 pb-4 border-b bg-muted/20">
				<h2 className="text-foreground text-left text-[18px] font-semibold">
					Create Adaptive Assessment
				</h2>
				<p className="text-sm text-left text-muted-foreground">
					Select a topic and add a short description for this adaptive
					assessment.
				</p>
			</div>

			<div className="space-y-5 px-6 py-5">
				<div className="space-y-2.5">
					<Label
						htmlFor="adaptive-topic"
						className="text-sm flex font-medium text-foreground"
					>
						Select Topic
					</Label>
					<Select
						value={selectedTopicId}
						open={selectOpen}
						onOpenChange={setSelectOpen}
						onValueChange={(value) => {
							setSelectedTopicId(value)
							if (newTopicName) {
								setNewTopicName('')
							}
						}}
						disabled={hasNewTopicName || creating}
					>
						<SelectTrigger
							id="adaptive-topic"
							className="h-11 border-border/70 disabled:opacity-60"
						>
							<SelectValue
								placeholder={
									loadingTopics
										? 'Loading topics...'
										: 'Select topic'
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{topicOptions.map((topic) => (
								<SelectItem
									key={topic.id}
									value={String(topic.id)}
								>
									{topic.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2.5 rounded-lg border border-border/70 bg-background p-4">
					<Label
						htmlFor="new-topic-name"
						className="text-sm flex font-medium text-foreground"
					>
						Create New Topic
					</Label>
					<Input
						id="new-topic-name"
						value={newTopicName}
						onChange={(event) => {
							setNewTopicName(event.target.value)
							if (selectedTopicId) {
								setSelectedTopicId('')
							}
						}}
						placeholder="Topic name"
						className="h-11 border-border/70"
						disabled={hasSelectedTopic || creating}
					/>
					<p className="text-xs text-left text-muted-foreground leading-relaxed">
						If a topic name is entered here, Save And Generate will create
						it automatically.
					</p>
					{hasSelectedTopic && (
						<p className="text-xs text-amber-600">
							Clear selected topic to create a new one.
						</p>
					)}
					{hasNewTopicName && (
						<p className="text-xs text-amber-600">
							Clear new topic name to choose from dropdown.
						</p>
					)}
				</div>

				<div className="space-y-2.5">
					<Label
						htmlFor="adaptive-topic-description"
						className="text-sm flex font-medium text-foreground"
					>
						Topic Description
					</Label>
					<Textarea
						id="adaptive-topic-description"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder="Write topic description"
						className="min-h-[120px] border-border/70"
					/>
				</div>

				<div className="flex justify-end gap-2 pt-1">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="h-10 px-4"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={creating}
						className="h-10 px-4"
					>
						{creating
							? 'Saving...'
							: 'Save And Generate Assessment'}
					</Button>
				</div>
			</div>
		</section>
	)
}

export default AdaptiveAssessmentTopicForm
