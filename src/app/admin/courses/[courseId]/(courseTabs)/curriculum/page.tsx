"use client";

import { Button } from "@/components/ui/button";
import { getCourseData } from "@/store/store";
import api from "@/utils/axios.config";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Clock, Copy, FileText } from "lucide-react";
import Image from "next/image";

function Page() {
  // state and variables
  const [curriculum, setCurriculum] = useState([]);
  const { courseData } = getCourseData();
  //   async
  useEffect(() => {
    if (courseData?.id) {
      const fetchCourseModules = async () => {
        try {
          const response = await api.get(`/content/modules/${courseData?.id}`);
          const data = response.data;
          setCurriculum(data);
        } catch (error) {
          console.error("Error fetching course details:", error);
        }
      };

      fetchCourseModules();
    }
  }, [courseData?.id]);

  return (
    <div className='mt-10 relative'>
      <div className='flex flex-start'>
        <h1 className='text-lg p-1 font-semibold'>
          {curriculum.length > 0 ? "Course Modules" : ""}
        </h1>
      </div>
      {curriculum.length > 0 ? (
        curriculum.map(({ name, id }, index) => (
          <>
            <Link
              href={`/admin/courses/${courseData?.id}/module/${id}`}
              className='bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  '
            >
              <div className='w-full flex items-center justify-between gap-y-2  '>
                <div className='flex gap-y-2 flex-col p-2  '>
                  <div className='flex items-center justify-start  '>
                    <div className='text-md font-semibold capitalize text-black'>
                      {name}
                    </div>
                  </div>
                  <div className='flex items-center justify-start  '>
                    <p className='text-md font-semibold capitalize text-gray-600'>
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
        ))
      ) : (
        <div className='absolute w-full mt-80 flex flex-col gap-y-5 items-center justify-center'>
          <Image
            src={"/emptyStates/curricullumEmptyState.svg"}
            height={100}
            width={100}
            alt='Curricullum State'
          />
          <p>Create new modules for the curriculum on Strapi CMS</p>
          <Link href={"https://strapi.io/"} target='blank'>
            <Button>Go to Strapi</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Page;
