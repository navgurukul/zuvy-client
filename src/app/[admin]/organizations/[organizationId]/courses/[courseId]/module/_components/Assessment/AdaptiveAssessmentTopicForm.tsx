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
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useCreateTopic } from '@/hooks/useCreateTopic'
import { useDeleteTopic } from '@/hooks/useDeleteTopic'
import { useTopics } from '@/hooks/useTopics'
import { useUpdateTopic } from '@/hooks/useUpdateTopic'
import AdaptiveAssessment from '@/app/[admin]/courses/[courseId]/module/[moduleId]/chapter/[chapterId]/adaptiveAssessment/AdaptiveAssessmentConfigurationForm'

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
	const { updateTopic, updating } = useUpdateTopic()
	const [description, setDescription] = useState('')
	const [newTopicName, setNewTopicName] = useState('')
	const [showAddTopicInput, setShowAddTopicInput] = useState(false)
	const [showAllTopics, setShowAllTopics] = useState(false)
	const [duplicateSuggestions, setDuplicateSuggestions] = useState<string[]>([])
	const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<{
		id: number
		name: string
	} | null>(null)
	const [editTopic, setEditTopic] = useState<{ id: number; name: string } | null>(null)
	const [editTopicName, setEditTopicName] = useState('')
	const [editTopicDescription, setEditTopicDescription] = useState('')

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

		if (value.trim()) {
			checkDuplicates(value)
			return
		}

		setDuplicateSuggestions([])
	}

	useEffect(() => {
		if (!open) {
			setDescription('')
			setNewTopicName('')
			setShowAddTopicInput(false)
			setShowAllTopics(false)
			setDuplicateSuggestions([])
			setEditTopic(null)
			setEditTopicName('')
			setEditTopicDescription('')
		}
	}, [open])

	const handleSave = async () => {
		const trimmedName = newTopicName.trim()
		const trimmedDescription = description.trim()

		if (!trimmedName) {
			toast.error({
				title: 'Topic name required',
				description: 'Please enter a topic name.',
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


		try {
			await createTopic(bootcampId, {
				moduleId,
				name: trimmedName,
				description: trimmedDescription,
			})

			setNewTopicName('')
			setDescription('')
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
			topic: trimmedName,
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

	const openEditDialog = (topicId: number) => {
		const selectedTopic = topics.find((topic) => topic.id === topicId)
		if (!selectedTopic || !selectedTopic.id) {
			return
		}

		setEditTopic({ id: selectedTopic.id, name: selectedTopic.name })
		setEditTopicName(selectedTopic.name)
		setEditTopicDescription(selectedTopic.description || '')
	}

	const confirmEdit = async () => {
		if (!editTopic) {
			return
		}

		const trimmedName = editTopicName.trim()
		const trimmedDescription = editTopicDescription.trim()

		if (!trimmedName) {
			toast.error({
				title: 'Topic name required',
				description: 'Please enter a topic name.',
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

		const duplicateTopic = topicOptions.find(
			(topic) =>
				topic.id !== editTopic.id &&
				topic.name.trim().toLowerCase() === trimmedName.toLowerCase()
		)

		if (duplicateTopic) {
			toast.error({
				title: 'Duplicate topic',
				description: 'A topic with this name already exists.',
			})
			return
		}

		try {
			await updateTopic(editTopic.id, bootcampId, {
				name: trimmedName,
				description: trimmedDescription,
			})

			toast.success({
				title: 'Success',
				description: `${trimmedName} topic updated successfully`,
			})

			setEditTopic(null)
			setEditTopicName('')
			setEditTopicDescription('')
			await refetch()
		} catch (error: any) {
			toast.error({
				title: 'Failed to update topic',
				description:
					error?.response?.data?.message ||
					error?.message ||
					'Unable to update topic right now.',
			})
		}
	}

	if (!open) {
		return null
	}

	return (
		<>
			<div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<section className="w-full lg:col-span-5 max-h-[85vh] overflow-y-auto border border-border/60 rounded-xl bg-background">
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
						Topics
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
										return (
											<div
												key={topic.id}
												className="group relative inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-orange-400 text-white hover:bg-pink-200 hover:text-pink-800"
											>
												<span>{topic.name}</span>
												<button
													type="button"
													onClick={(event) => {
														event.stopPropagation()
														openEditDialog(topic.id)
													}}
													disabled={creating || deleting || updating}
													className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-500 hover:text-white rounded-full p-1 disabled:opacity-60"
													aria-label={`Update topic ${topic.name}`}
												>
													<Pencil className="h-3 w-3" />
												</button>
												<button
													type="button"
													onClick={(event) => {
														event.stopPropagation()
														handleDeleteTopic(topic.id, topic.name)
													}}
													disabled={creating || deleting || updating}
													className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 hover:text-white rounded-full p-1 disabled:opacity-60"
													aria-label={`Delete topic ${topic.name}`}
												>
													<X className="h-3 w-3" />
												</button>
											</div>
										)
									})}
								</div>

								{hasMoreTopics && (
									<div className="flex justify-center pt-2 pb-2">
										<button
											type="button"
											onClick={() => setShowAllTopics(!showAllTopics)}
											className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-medium transition-colors"
											disabled={deleting || updating}
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
							disabled={deleting || updating}
						>
							<Plus className="h-4 w-4" />
							<span className="text-sm font-medium">Add New Topic</span>
						</button>
					) : (
						<div className="space-y-4 border border-border/70 rounded-lg p-4 bg-muted/30">
							<div className="space-y-2">
								<Label
									htmlFor="new-topic-name"
									className="text-sm font-medium  flex text-foreground"
								>
									Topic Name
								</Label>
								<Input
									id="new-topic-name"
									placeholder="Enter topic name..."
									value={newTopicName}
									onChange={(event) =>
										handleInputChange(event.target.value)
									}
									className="text-foreground"
									autoFocus
									disabled={creating || deleting || updating}
								/>

								{duplicateSuggestions.length > 0 && (
									<div className="text-sm text-red-600">
										{duplicateSuggestions[0]} (The topic is already in the
										system, you can try to add other topic)
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="new-topic-description"
									className="text-sm flex font-medium text-foreground"
								>
									Topic Description
								</Label>
								<Textarea
									id="new-topic-description"
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									placeholder="Write topic description"
									className="min-h-[120px] border-border/70"
									disabled={creating || deleting || updating}
								/>
							</div>

							<div className="flex justify-end gap-2 pt-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setNewTopicName('')
										setDescription('')
										setDuplicateSuggestions([])
										setShowAddTopicInput(false)
									}}
									disabled={creating || deleting || updating}
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={handleSave}
									disabled={
										creating ||
										deleting ||
										updating ||
										!hasNewTopicName
									}
								>
									{creating
										? 'Saving...'
										: 'Save'}
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
			</section>

			<section className="w-full lg:col-span-7 max-h-[85vh] overflow-y-auto border border-border/60 rounded-xl bg-background">
				<AdaptiveAssessment />
			</section>
			</div>

			<Dialog
				open={!!editTopic}
				onOpenChange={(nextOpen) => {
					if (!nextOpen && !updating) {
						setEditTopic(null)
						setEditTopicName('')
						setEditTopicDescription('')
					}
				}}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Update Topic</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-topic-name" className="text-sm flex font-medium text-foreground">
								Topic Name
							</Label>
							<Input
								id="edit-topic-name"
								value={editTopicName}
								onChange={(event) => setEditTopicName(event.target.value)}
								placeholder="Enter topic name"
								disabled={updating}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-topic-description" className="text-sm flex font-medium text-foreground">
								Description
							</Label>
							<Textarea
								id="edit-topic-description"
								value={editTopicDescription}
								onChange={(event) => setEditTopicDescription(event.target.value)}
								placeholder="Enter topic description"
								className="min-h-[120px]"
								disabled={updating}
							/>
						</div>
					</div>

					<DialogFooter className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setEditTopic(null)
								setEditTopicName('')
								setEditTopicDescription('')
							}}
							disabled={updating}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={confirmEdit}
							disabled={updating}
						>
							{updating ? 'Updating...' : 'Update'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!deleteConfirmTopic}
				onOpenChange={() => {
					if (!deleting && !updating) {
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
