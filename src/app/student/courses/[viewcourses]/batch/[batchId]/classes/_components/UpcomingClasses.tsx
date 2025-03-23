import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import React from 'react'
import { isNull } from 'util'

function UpcomingClasses({
    ongoingClasses,
    upcomingClasses,
}: {
    ongoingClasses: any
    upcomingClasses: any
}) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                {ongoingClasses?.length > 0
                    ? ongoingClasses.map((classObj: any) => (
                          <ClassCard
                              classData={classObj}
                              key={classObj.meetingId}
                              classType="ongoing"
                              activeTab={'ongoing'}
                              studentSide={true}
                              getClasses={() => console.log('')}
                          />
                      ))
                    : null}
                {upcomingClasses?.length > 0
                    ? upcomingClasses.map((classObj: any) => (
                          <ClassCard
                              classData={classObj}
                              key={classObj.meetingId}
                              classType="Upcoming"
                              activeTab={'upcoming'}
                              studentSide={true}
                              getClasses={() => console.log('')}
                          />
                      ))
                    : null}
            </div>
            {upcomingClasses?.length === 0 && <p>No upcoming classes found</p>}
        </>
    )
}

export default UpcomingClasses
