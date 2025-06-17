import React, { useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

interface ToggleSwitchProps {
    onToggle: (isChecked: boolean) => void
    bootcampId: number
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    onToggle,
    bootcampId,
}) => {
    const [checked, setChecked] = useState<boolean>(false)

    useEffect(() => {
        fetchBootCampSettings()
    }, [])

    const fetchBootCampSettings = async () => {
        try {
            const response = await api.get(
                `/bootcamp/bootcampSetting/${bootcampId}`
            )
            const type = response.data.bootcampSetting[0].type
            setChecked(type === 'Public')
        } catch (error) {
            console.error('Error fetching boot camp settings:', error)
        }
    }

    const handleToggle = async () => {
        const newState = !checked
        setChecked(newState)
        onToggle(newState)
        const type = newState ? 'Public' : 'Private'
        try {
            await api.put(`/bootcamp/bootcampSetting/${bootcampId}`, {
                type,
            })
            toast.success({
                title: "Success!",
                description: `Bootcamp type updated to ${type}`
              })
        } catch (error) {
            toast.error({
                title: 'Error',
                description:
                    'Error updating bootcamp settings. Please try again.',
            })
        }
    }

    return (
        <div>
            <div
                className={`relative w-[38px] h-6 rounded-full bg-gray-300 p-1 cursor-pointer ${
                    checked ? 'bg-primary' : ''
                }`}
                onClick={handleToggle}
            >
                <div
                    className={`absolute ml-[2px] left-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        checked ? 'translate-x-full' : ''
                    }`}
                />
            </div>
            <p>{checked ? 'Public' : 'Private'}</p>
        </div>
    )
}

export default ToggleSwitch
