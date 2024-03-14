import ClassCard from "@/app/admin/courses/[courseId]/_components/classCard";
import React from "react";

function UpcomingClasses({
  ongoingClasses,
  upcomingClasses,
}: {
  ongoingClasses: any;
  upcomingClasses: any;
}) {
  return (
    <div>
      {ongoingClasses?.length > 0
        ? ongoingClasses.map((classObj: any) => (
            <ClassCard
              classData={classObj}
              key={classObj.meetingid}
              classType="ongoing"
            />
          ))
        : null}
      {upcomingClasses?.length > 0 ? (
        upcomingClasses.map((classObj: any) => (
          <ClassCard
            classData={classObj}
            key={classObj.meetingid}
            classType="Upcoming"
          />
        ))
      ) : (
        <p>No upcoming classes found</p>
      )}
    </div>
  );
}

export default UpcomingClasses;
