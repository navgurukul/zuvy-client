import { useState, useEffect } from 'react'

const ToggleSwitch = ({
    className,
    onToggle,
}: {
    className?: string
    onToggle: (isChecked: boolean) => void
}) => {
    const [isChecked, setIsChecked] = useState(false)

    const handleToggle = () => {
        setIsChecked(!isChecked)
        onToggle(!isChecked)
    }

    return (
        <div
            className={`relative w-[38px] h-6 rounded-full bg-gray-300 p-1 cursor-pointer ${
                isChecked ? 'bg-secondary' : ''
            }`}
            onClick={handleToggle}
        >
            <div
                className={`absolute ml-[2px] left-0 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                    isChecked ? 'translate-x-full' : ''
                }`}
            />
        </div>
    )
}

export default ToggleSwitch
