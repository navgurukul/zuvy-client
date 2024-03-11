import { CircularProgress } from "@nextui-org/react";
import { Lock } from "lucide-react";
import Link from "next/link";
import React from "react";

function CourseCard({
  param,
  name,
  id,
  lock,
  progress,
}: {
  param: String;
  name: string;
  id: number;
  lock: boolean;
  progress: number;
}) {
  return (
    <Link
      key={id}
      href={`/student/courses/${param}/modules/${id}`}
      className={
        lock
          ? "bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl "
          : "bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl pointer-events-none opacity-50"
      }
    >
      <div className="flex items-center justify-between w-full ">
        <div className="text-xl font-bold capitalize ">{name}</div>
        <div>
          {lock ? (
            <div key={id} className="">
              <CircularProgress
                size="sm"
                value={progress}
                color="secondary"
                // showValueLabel={true}
              />
            </div>
          ) : (
            <Lock opacity={50} size={30} />
          )}
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
