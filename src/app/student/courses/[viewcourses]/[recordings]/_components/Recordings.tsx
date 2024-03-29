'use client'

import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import RecordingCard from './RecordingCard'

function Recordings({ completedClasses }: { completedClasses: any }) {
    return (
        <div className="grid grid-cols-3 gap-5">
            {completedClasses?.length > 0 ? (
                completedClasses.map((classObj: any) => (
                    <RecordingCard
                        classData={classObj}
                        key={classObj.meetingid}
                        classType="complete"
                    />
                ))
            ) : (
                <p>No past classes found</p>
            )}
        </div>
    )
}

export default Recordings
