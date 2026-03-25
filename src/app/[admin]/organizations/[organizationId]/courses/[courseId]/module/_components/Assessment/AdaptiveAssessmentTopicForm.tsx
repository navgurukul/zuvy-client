import { useCallback, useEffect, useMemo, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useCreateTopic } from '@/hooks/useCreateTopic'
import { useDeleteTopic } from '@/hooks/useDeleteTopic'
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
	const { deleteTopic, deleting } = useDeleteTopic()
	const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
	const [description, setDescription] = useState('')
	const [newTopicName, setNewTopicName] = useState('')
	const [showAddTopicInput, setShowAddTopicInput] = useState(false)
	const [showAllTopics, setShowAllTopics] = useState(false)
	const [duplicateSuggestions, setDuplicateSuggestions] = useState<string[]>([])
	const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<{
		id: number
		name: string
	} | null>(null)

	const INITIAL_DISPLAY_LIMIT = 15

	const topicOptions = useMemo(
		() =>
			topics
				.filter((topic) => topic?.id && topic?.name)
				.map((topic) => ({
					id: topic.id!,
					name: topic.name,
				})),
		[topics]
	)

	// Get selected topic name from ID
	const selectedTopicName = topicOptions.find(
		(t) => t.id === selectedTopicId
	)?.name

	const hasSelectedTopic = !!selectedTopicName
	const hasNewTopicName = newTopicName.trim().length > 0
	const displayedTopics = showAllTopics
		? topicOptions
		: topicOptions.slice(0, INITIAL_DISPLAY_LIMIT)
	const hasMoreTopics = topicOptions.length > INITIAL_DISPLAY_LIMIT

	const checkDuplicates = useCallback(
		(topicName: string) => {
			const trimmedName = topicName.trim().toLowerCase()

			if (!trimmedName) {
				setDuplicateSuggestions([])
				return
			}

			const firstWord = trimmedName.split(' ')[0]
			const duplicates = topicOptions.filter((topic) => {
				const topicFirstWord = topic.name.toLowerCase().split(' ')[0]
				return topicFirstWord === firstWord
			})

			if (duplicates.length > 0) {
				setDuplicateSuggestions(duplicates.map((topic) => topic.name))
				return
			}

			setDuplicateSuggestions([])
		},
		[topicOptions]
	)

	const handleInputChange = (value: string) => {
		setNewTopicName(value)
		if (selectedTopicId) {
			setSelectedTopicId(null)
		}

		if (value.trim()) {
			checkDuplicates(value)
			return
		}

		setDuplicateSuggestions([])
	}

	const handleSelectTopic = (topicId: number) => {
		setSelectedTopicId((current) => (current === topicId ? null : topicId))
		if (newTopicName) {
			setNewTopicName('')
			setDuplicateSuggestions([])
		}
	}

	useEffect(() => {
		if (!open) {
			setSelectedTopicId(null)
			setDescription('')
			setNewTopicName('')
			setShowAddTopicInput(false)
			setShowAllTopics(false)
			setDuplicateSuggestions([])
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

		if (trimmedName && duplicateSuggestions.length > 0) {
			toast.error({
				title: 'Duplicate topic',
				description:
					'This topic is already in the list. Please choose another name.',
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

			setSelectedTopicId(null)
			setNewTopicName('')
			setDuplicateSuggestions([])
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

	const handleDeleteTopic = (topicId: number, topicName: string) => {
		setDeleteConfirmTopic({ id: topicId, name: topicName })
	}

	const confirmDelete = async () => {
		if (!deleteConfirmTopic) {
			return
		}

		try {
			await deleteTopic(deleteConfirmTopic.id, bootcampId)

			if (selectedTopicId === deleteConfirmTopic.id) {
				setSelectedTopicId(null)
			}

			toast.success({
				title: 'Success',
				description: `${deleteConfirmTopic.name} topic deleted successfully`,
			})
			setDeleteConfirmTopic(null)
			await refetch()
		} catch (error: any) {
			toast.error({
				title: 'Error',
				description:
					error?.response?.data?.message || 'Failed to delete topic',
			})
		}
	}

	if (!open) {
		return null
	}

	return (
		<>
			<section className="w-full lg:w-1/2 max-h-[85vh] overflow-y-auto border border-border/60 rounded-xl bg-background">
				<div className="px-6 pt-6 pb-4 border-b bg-muted/20">
				<h2 className="text-xl font-semibold text-left">
					Manage Topics
				</h2>
				<div className="bg-primary-light border border-primary rounded-lg p-3 mt-4">
					<p className="text-primary text-sm text-left">
						Choose an existing topic or create a new one, then add a
						description to save the topics.
					</p>
				</div>
			</div>

				<div className="space-y-6 px-6 py-5">
				<div className="space-y-2.5">
					<Label className="text-sm flex font-medium text-foreground">
						Select Topic
					</Label>
					<div className="border-2 border-dashed border-gray-200 rounded-lg p-4 h-[200px] overflow-y-auto">
						{loadingTopics ? (
							<div className="flex items-center justify-center h-full">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
						) : topicOptions.length === 0 ? (
							<div className="flex items-center justify-center h-full text-gray-500">
								<p>No topics available</p>
							</div>
						) : (
							<div className="space-y-3">
								<div className="flex flex-wrap gap-2">
									{displayedTopics.map((topic) => {
										const isSelected = selectedTopicId === topic.id
										return (
											<button
												type="button"
												key={topic.id}
												onClick={() => handleSelectTopic(topic.id)}
												disabled={hasNewTopicName || creating || deleting}
												className={`group relative inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-60 ${
													isSelected
														? 'bg-yellow-400 text-white hover:bg-yellow-200 hover:text-pink-800'
														: 'bg-orange-400 text-white hover:bg-pink-200 hover:text-pink-800'
												}`}
											>
												<span>{topic.name}</span>
												{/* {isSelected && <X className="ml-2 h-3 w-3" />} */}
												<button
													type="button"
													onClick={(event) => {
														event.stopPropagation()
														handleDeleteTopic(topic.id, topic.name)
													}}
													disabled={creating || deleting}
													className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 hover:text-white rounded-full p-1 disabled:opacity-60"
													aria-label={`Delete topic ${topic.name}`}
												>
													<X className="h-3 w-3" />
												</button>
											</button>
										)
									})}
								</div>

								{hasMoreTopics && (
									<div className="flex justify-center pt-2 pb-2">
										<button
											type="button"
											onClick={() => setShowAllTopics(!showAllTopics)}
											className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-medium transition-colors"
											disabled={deleting}
										>
											{showAllTopics ? (
												<>
													<ChevronUp className="h-4 w-4" />
													Show Less
												</>
											) : (
												<>
													<ChevronDown className="h-4 w-4" />
													Show More ({topicOptions.length - INITIAL_DISPLAY_LIMIT} more)
												</>
											)}
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="space-y-4">
					{!showAddTopicInput ? (
						<button
							type="button"
							onClick={() => setShowAddTopicInput(true)}
							className="flex items-center gap-2 text-muted-dark hover:text-foreground transition-colors"
							disabled={deleting}
						>
							<Plus className="h-4 w-4" />
							<span className="text-sm font-medium">Add New Topic</span>
						</button>
					) : (
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-foreground">
								<Plus className="h-4 w-4" />
								<span className="text-sm font-medium">Add New Topic</span>
							</div>

							<div className="space-y-2">
								<Input
									id="new-topic-name"
									placeholder="Enter topic name..."
									value={newTopicName}
									onChange={(event) =>
										handleInputChange(event.target.value)
									}
									className="text-foreground"
									autoFocus
									disabled={hasSelectedTopic || creating || deleting}
								/>

								{duplicateSuggestions.length > 0 && (
									<div className="text-sm text-red-600">
										{duplicateSuggestions[0]} (The topic is already in the
										system, you can try to add other topic)
									</div>
								)}
							</div>

							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setNewTopicName('')
										setDuplicateSuggestions([])
										setShowAddTopicInput(false)
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
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
						disabled={deleting}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={
							creating ||
							deleting ||
							(!hasSelectedTopic && !hasNewTopicName)
						}
						className="h-10 px-4"
					>
						{creating
							? 'Saving...'
							: 'Save'}
					</Button>
				</div>
			</div>
			</section>

			<Dialog
				open={!!deleteConfirmTopic}
				onOpenChange={() => {
					if (!deleting) {
						setDeleteConfirmTopic(null)
					}
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<Trash2 className="w-4 h-4" />
							Confirm Deletion
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 text-start">
						<p className="text-sm text-muted-foreground">
							Deleting topics will permanently remove them from the system.
							If a topic is linked to any question, it cannot be deleted.
							Are you sure you want to continue?
						</p>
						{deleteConfirmTopic && (
							<div className="bg-gray-100 rounded-lg p-2">
								<p className="text-sm">Topic: {deleteConfirmTopic.name}</p>
							</div>
						)}
					</div>

					<DialogFooter className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setDeleteConfirmTopic(null)}
							disabled={deleting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={confirmDelete}
							disabled={deleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default AdaptiveAssessmentTopicForm
