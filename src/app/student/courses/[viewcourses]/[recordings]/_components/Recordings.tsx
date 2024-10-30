'use client'

import RecordingCard from './RecordingCard'

function Recordings({ completedClasses }: { completedClasses: any }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-7 gap-y-6">
            {completedClasses?.length > 0 ? (
                completedClasses.map((classObj: any) => (
                    <RecordingCard
                        classData={classObj}
                        key={classObj.meetingId}
                        // classType="complete"
                        isAdmin={false}
                    />
                ))
            ) : (
                <p>No past classes found</p>
            )}
        </div>
    )
}

export default Recordings
