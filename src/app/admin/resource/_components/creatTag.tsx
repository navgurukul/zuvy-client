import React from 'react'

import { Button } from '@/components/ui/button'
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import styles from './cources.module.css'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface newTopicDialogProps {
    newTopic: string
    handleNewTopicChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleCreateTopic: () => void
}

const CreatTag: React.FC<newTopicDialogProps> = ({
    newTopic,
    handleNewTopicChange,
    handleCreateTopic,
}) => {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Topic</DialogTitle>
                <div className="py-4">
                    <Label htmlFor="name">Topic Name:</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter course name"
                        value={newTopic}
                        onChange={handleNewTopicChange}
                    />
                </div>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button
                        onClick={() => handleCreateTopic()}
                        // className={styles.createCourseBtnDialog}
                    >
                        Create Topic
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default CreatTag
