// "use client";

import api from "@/utils/axios.config";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function Curriculum({ courseId }: { courseId: string }) {
  // state and variables
  const [curriculum, setCurriculum] = useState([]);

  //   async
  useEffect(() => {
    const fetchCourseModules = async () => {
      try {
        const response = await api.get(`/content/modules/${courseId}`);
        const data = response.data;
        setCurriculum(data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseModules();
  }, [courseId]);

  return (
    <div className="mt-10">
      <div className="flex flex-start">
        <h1 className="text-lg p-1 font-semibold">Course Modules</h1>
      </div>
      {curriculum.map(({ name, id }) => (
        <>
          <Link
            href={`/admin/courses/${courseId}/${id}`}
            className="bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  "
          >
            <div className="w-full flex items-center justify-between gap-y-2  ">
              <div className="flex gap-y-2 flex-col p-2  ">
                <div className="flex items-center justify-start  ">
                  <div className="text-md font-semibold capitalize text-black">
                    {name}
                  </div>
                </div>
                <div className="flex items-center justify-start  ">
                  <p className="text-md font-semibold capitalize text-gray-600">
                    Time Commitment: 2weeks
                  </p>
                </div>
              </div>
              {/* <div className="">
                <CircularLoader />
              </div> */}
            </div>
          </Link>
        </>
      ))}
    </div>
  );
}

export default Curriculum;
