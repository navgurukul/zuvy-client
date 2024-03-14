import { CircularProgress } from "@nextui-org/react";
import { File, Lock, Clock3, ShieldQuestion } from "lucide-react";
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
      style={{ width: "800px" }}
      className={
        lock
          ? "bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl"
          : "bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl pointer-events-none opacity-50"
      }
    >
      <div className="flex  justify-between ">
        <div
          className="flex text-start flex-col p-5"
          style={{ width: "750px" }}
        >
          <div className="flex justify-between text-xl font-bold capitalize ">
            {name}
            <div>
              {lock ? (
                <>
                  <div key={id} className="flex items-center">
                    <CircularProgress
                      color="secondary"
                      size="md"
                      value={progress}
                      showValueLabel={true}
                      style={{ width: "30px", height: "30px", fontSize: "0" }}
                    />
                    <div
                      className={`ml-2 ${
                        progress > 9 && progress < 100 ? "mr-1" : ""
                      } ${progress < 10 ? "mr-2" : ""}`}
                    >
                      {progress}%
                    </div>
                  </div>
                </>
              ) : (
                <Lock opacity={50} size={30} />
              )}
            </div>
          </div>
          <div className="flex justify-start mt-10">
            <Clock3 size={15} className="inline mr-1 mt-1" color="#4A4A4A" /> 2
            weeks
            <File className="inline ml-5 mr-1" size={20} color="#4A4A4A" /> 4
            Assignments
            <ShieldQuestion
              className="inline ml-5 mr-1"
              size={20}
              color="#4A4A4A"
            />
            1 Quiz
          </div>
          <p className="mt-10">
            Master the basic concepts of programming and create your first
            program in Python
          </p>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
