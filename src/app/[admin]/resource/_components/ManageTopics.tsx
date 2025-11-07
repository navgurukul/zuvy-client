'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'

interface Topic {
    id: number
    tagName: string
    version?: null
    usage?: number // Frontend calculated usage
}

interface ManageTopicsProps {
    isOpen: boolean
    onClose: () => void
    onTopicCreated: () => void
}

const ManageTopics: React.FC<ManageTopicsProps> = ({
    isOpen,
    onClose,
    onTopicCreated,
}) => {
    const [topics, setTopics] = useState<Topic[]>([])
    const [newTopicName, setNewTopicName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [duplicateSuggestions, setDuplicateSuggestions] = useState<string[]>([])
    const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<Topic | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showAddTopicInput, setShowAddTopicInput] = useState(false)
    const [showAllTopics, setShowAllTopics] = useState(false)
    const [newlyAddedTopics, setNewlyAddedTopics] = useState<string[]>([])
    const [tempTopicCounter, setTempTopicCounter] = useState(0)

    const INITIAL_DISPLAY_LIMIT = 15

    // Fetch all topics with usage information
    const fetchTopics = useCallback(async () => {
        try {
            setLoading(true)
            
            // Fetch topics
            const response = await api.get('/Content/allTags')
            const topicsData = response.data.allTags || []
            
            // Sort topics by ID (newest first)
            const sortedTopics = topicsData.sort((a: Topic, b: Topic) => b.id - a.id)
            
            setTopics(sortedTopics)
        } catch (error) {
            console.error('Error fetching topics:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch topics',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    // Check for duplicate topics
    const checkDuplicates = useCallback((topicName: string) => {
        const trimmedName = topicName.trim().toLowerCase()
        
        if (!trimmedName) {
            setDuplicateSuggestions([])
            return
        }

        // Get first word of input
        const firstWord = trimmedName.split(' ')[0]
        
        // Find topics where the first word matches
        const duplicates = topics.filter(topic => {
            const topicFirstWord = topic.tagName.toLowerCase().split(' ')[0]
            return topicFirstWord === firstWord
        })
        
        if (duplicates.length > 0) {
            setDuplicateSuggestions(duplicates.map(topic => topic.tagName))
        } else {
            setDuplicateSuggestions([])
        }
    }, [topics])

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNewTopicName(value)
        
        if (value.trim()) {
            checkDuplicates(value)
        } else {
            setDuplicateSuggestions([])
        }
    }

    // Add new topic to list (not API yet)
    const handleCreateTopic = async () => {
        if (!newTopicName.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a topic name',
                variant: 'destructive',
            })
            return
        }

        if (duplicateSuggestions.length > 0) {
            toast({
                title: 'Error',
                description: 'Topic already exists',
                variant: 'destructive',
            })
            return
        }

        // Add topic to newlyAddedTopics array with temporary ID
        const tempTopic: Topic = {
            id: -(tempTopicCounter + 1), // Negative ID for temp topics
            tagName: newTopicName.trim(),
            usage: 0
        }
        
        setNewlyAddedTopics(prev => [tempTopic.tagName, ...prev])
        setTopics(prev => [tempTopic, ...prev])
        setTempTopicCounter(prev => prev + 1)
        setNewTopicName('')
        setDuplicateSuggestions([])
        // setShowAddTopicInput(false)
    }

    // Handle delete topic
    const handleDeleteTopic = async (topic: Topic) => {
        // If it's a newly added topic (negative ID), just remove it from the list
        if (topic.id < 0) {
            setTopics(prev => prev.filter(t => t.id !== topic.id))
            setNewlyAddedTopics(prev => prev.filter(name => name !== topic.tagName))
            return
        }
        
        setDeleteConfirmTopic(topic)
    }

    // Perform actual deletion
    const performDelete = async (topic: Topic) => {
        try {
            setIsDeleting(true)
            
            await api.delete(`/content/deletequestiontag/${topic.id}`)
            
            toast({
                title: 'Success',
                description: `${topic.tagName} topic deleted successfully`,
            })

            await fetchTopics()
            setDeleteConfirmTopic(null)
            onTopicCreated()
        } catch (error: any) {
            console.error('Error deleting topic:', error)
            const errorMessage = error.response?.data?.message || 'Failed to delete topic'
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setIsDeleting(false)
        }
    }

    // Confirm delete
    const confirmDelete = async () => {
        if (deleteConfirmTopic) {
            await performDelete(deleteConfirmTopic)
        }
    }

    // Handle Done button click
    const handleDone = async () => {
        if (newlyAddedTopics.length > 0) {
            try {
                setIsCreating(true)
                
                // Create all newly added topics
               await api.post('/Content/createTag', {
                tagNames: newlyAddedTopics  // Send array with correct field name
            })               
             toast({
                    title: 'Success',
                    description: `${newlyAddedTopics.length} topic${newlyAddedTopics.length > 1 ? 's' : ''} created successfully`,
                })

                setNewlyAddedTopics([])
                setTempTopicCounter(0)
                await fetchTopics()
                onTopicCreated()
                onClose()
            } catch (error: any) {
                console.error('Error creating topics:', error)
                const errorMessage = error.response?.data?.message || 'Failed to create topics'
                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                })
            } finally {
                setIsCreating(false)
            }
        } else {
            onClose()
        }
    }

    // Load topics when dialog opens
    useEffect(() => {
        if (isOpen) {
            fetchTopics()
            setShowAllTopics(false)
        } else {
            // Reset input state when dialog closes
            setNewTopicName('')
            setDuplicateSuggestions([])
            setShowAddTopicInput(false)
            setNewlyAddedTopics([])
            setTempTopicCounter(0)
            setShowAllTopics(false)
        }
    }, [isOpen, fetchTopics])

    const isAddButtonDisabled = !newTopicName.trim() || duplicateSuggestions.length > 0
    
    // Get topics to display based on show more/less
    const displayedTopics = showAllTopics ? topics : topics.slice(0, INITIAL_DISPLAY_LIMIT)
    const hasMoreTopics = topics.length > INITIAL_DISPLAY_LIMIT

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                Manage Topics
                            </DialogTitle>
                        </div>
                        
                        <div className="bg-primary-light border border-primary rounded-lg p-3 mt-4">
                            <p className="text-primary text-sm">
                                Questions can be made for these topics in the content bank.
                            </p>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Topics Display Area */}
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 h-[200px] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : topics.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>No topics available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* <div className={`flex flex-wrap gap-2 ${showAllTopics ? 'max-h-[300px]' : ''}`}> */}
                                    <div className="flex flex-wrap gap-2">
                                        {displayedTopics.map((topic) => (
                                            <div
                                                key={topic.id}
                                                className={`group relative inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                    newlyAddedTopics.includes(topic.tagName)
                                                        ? 'bg-yellow-400 text-white hover:bg-yellow-200 hover:text-pink-800'
                                                        : 'bg-orange-400 text-white hover:bg-pink-200 hover:text-pink-800'
                                                }`}
                                            >
                                                <span>{topic.tagName}</span>
                                                <button
                                                    onClick={() => handleDeleteTopic(topic)}
                                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 hover:text-white rounded-full p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Show More/Less Button */}
                                    {hasMoreTopics && (
                                        <div className="flex justify-center pt-2 pb-2">
                                            <button
                                                onClick={() => setShowAllTopics(!showAllTopics)}
                                                className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                                            >
                                                {showAllTopics ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4" />
                                                        Show Less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4" />
                                                        Show More ({topics.length - INITIAL_DISPLAY_LIMIT} more)
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Add New Topic Section */}
                        <div className="space-y-4">
                            {!showAddTopicInput ? (
                                <button
                                    onClick={() => setShowAddTopicInput(true)}
                                    className="flex items-center gap-2 text-muted-dark hover:text-foreground transition-colors"
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
                                            placeholder="Enter topic name..."
                                            value={newTopicName}
                                            onChange={handleInputChange}
                                            className="text-foreground"
                                            autoFocus
                                        />
                                        
                                        {duplicateSuggestions.length > 0 && (
                                            <div className="text-sm text-red-600">
                                                {duplicateSuggestions[0]} (The topic is already in the system, you can try to add other topic)
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setNewTopicName('')
                                                setDuplicateSuggestions([])
                                                setShowAddTopicInput(false)
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateTopic}
                                            disabled={isAddButtonDisabled}
                                            className="px-4 py-2"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end">
                        <Button
                            onClick={handleDone}
                            disabled={isCreating}
                            className="px-6 py-2"
                        >
                            {isCreating ? 'Creating...' : 'Done'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmTopic} onOpenChange={() => setDeleteConfirmTopic(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-4 h-4" />
                            Confirm Deletion
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <p className="text-gray-700 font-medium">
                            Deleting topics will permanently remove them from the system.
                            If a topic is linked to any question, it can not be deleted.
                            Are you sure you want to continue?
                        </p>
                        {deleteConfirmTopic && (
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="font-medium">Topic: {deleteConfirmTopic.tagName}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmTopic(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ManageTopics