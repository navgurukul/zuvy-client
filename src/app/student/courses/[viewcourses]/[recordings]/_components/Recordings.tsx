"use client";

import ClassCard from "@/app/admin/courses/[courseId]/_components/classCard";

function Recordings({ completedClasses }: { completedClasses: any }) {
  return (
    <div className="gap-y-3 flex flex-col items-center mx-4 lg:w-[800px]">
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
  );
}

export default Recordings;
