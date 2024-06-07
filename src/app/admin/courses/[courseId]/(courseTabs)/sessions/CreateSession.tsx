'use client'
import React, { useState } from 'react'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import NewClassDialog from '../../_components/newClassDialog'

interface CreateSessionProps {
    courseId: number
    bootcampData: { value: string; label: string }[]
    getClasses: any
}

const CreateSessionDialog: React.FC<CreateSessionProps> = ({
    courseId,
    bootcampData,
    getClasses,
}) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startDateTime, setStartDateTime] = useState(new Date())
    const [endDateTime, setEndDateTime] = useState(new Date())
    const [batchId, setBatchId] = useState('')

    const handleDialogOpenChange = () => {
        setTitle('')
        setDescription('')
        const startDate = new Date()
        startDate.setHours(startDate.getHours() + 5)
        startDate.setMinutes(startDate.getMinutes() + 30)
        setStartDateTime(startDate)
        const endDate = new Date()
        endDate.setHours(endDate.getHours() + 5)
        endDate.setMinutes(endDate.getMinutes() + 30)
        setEndDateTime(endDate)
        setBatchId('')
    }

    return (
        <Dialog onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                <Button className="text-white bg-secondary">
                    Create Session
                </Button>
            </DialogTrigger>
            <DialogOverlay />
            <NewClassDialog
                courseId={courseId}
                bootcampData={bootcampData}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                startDateTime={startDateTime}
                setStartDateTime={setStartDateTime}
                endDateTime={endDateTime}
                setEndDateTime={setEndDateTime}
                batchId={batchId}
                setBatchId={setBatchId}
                getClasses={getClasses}
            />
        </Dialog>
    )
}

export default CreateSessionDialog
