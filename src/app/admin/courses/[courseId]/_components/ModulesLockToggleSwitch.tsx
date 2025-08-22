import React, { useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {ToggleSwitchProps,BootcampResponse } from "@/app/admin/courses/[courseId]/_components/adminCourseCourseIdComponentType"

const ModulesLockToggleSwitch: React.FC<ToggleSwitchProps> = ({ bootcampId }) => {
    const [isModuleLocked, setIsModuleLocked] = useState<boolean>(false)
    const [bootcampType, setBootcampType] = useState<any>(null)

    useEffect(() => {
        fetchModuleLockStatus()
    }, [])

    const fetchModuleLockStatus = async () => {
        try {
            const response = await api.get<BootcampResponse>(
                `/bootcamp/bootcampSetting/${bootcampId}`
            )
            const settings = response.data.bootcampSetting[0]
            setIsModuleLocked(settings.isModuleLocked)
            setBootcampType(settings.type)
        } catch (error) {
            console.error('Error fetching module lock status:', error)
        }
    }

    const handleToggle = async () => {
        const newState = !isModuleLocked
        setIsModuleLocked(newState)

        try {
            await api.put(`/bootcamp/bootcampSetting/${bootcampId}`, {
                type: bootcampType,
                isModuleLocked: newState,
            })
            toast.success({
                title: 'Success',
                description: `Modules ${newState ? 'locked' : 'unlocked'} successfully`,
            })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error updating module lock settings. Please try again.',
            })
        }
    }

    return (
        <div className='flex flex-col justify-left items-start'>
            <div
                className={`relative w-[38px] h-6 rounded-full bg-gray-300 p-1 cursor-pointer ${
                    isModuleLocked ? 'bg-primary' : ''
                }`}
                onClick={handleToggle}
            >
                <div
                    className={`absolute ml-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        isModuleLocked ? 'translate-x-full' : ''
                    }`}
                />
            </div>
            <p>{isModuleLocked ? 'Unlock all modules' : 'Lock all modules'}</p>
        </div>
    )
}

export default ModulesLockToggleSwitch