// components/ShowMore.tsx
import React, { useState } from 'react'
import { ShowMoreProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const ShowMore: React.FC<ShowMoreProps> = ({ description = '' }) => {
    // Provide a default value
    const [isExpanded, setIsExpanded] = useState(false)

    // Calculate the halfway point of the description
    const halfwayIndex = Math.ceil(description.length / 2)

    // Split the description into two parts
    const firstHalf = description.substring(0, halfwayIndex)
    const secondHalf = description.substring(halfwayIndex)

    return (
        <div className="flex items-center gap-x-2">
            <p
                className={`transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-full' : 'max-h-full overflow-hidden'
                }`}
            >
                {firstHalf}
                {!isExpanded && '...'}
                {isExpanded && secondHalf}
            </p>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="  text-secondary hover:underline focus:outline-none"
            >
                {isExpanded ? 'Show Less' : 'Full Description'}
            </button>
        </div>
    )
}

export default ShowMore
