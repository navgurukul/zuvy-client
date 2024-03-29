'use client'

import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'

function Recordings({ completedClasses }: { completedClasses: any }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {completedClasses?.length > 0 ? (
                completedClasses.map((classObj: any) => (
                    <ClassCard
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
