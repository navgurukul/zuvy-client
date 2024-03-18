// "use client";

import { Button } from "@/components/ui/button";
import api from "@/utils/axios.config";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Clock, Copy, FileText } from "lucide-react";
import Image from "next/image";

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
  console.log(curriculum);
  return (
    <div className=' w-full flex flex-col items-center justify-center relative'>
      {curriculum.length !== 0 && (
        <div className='bg-gradient-to-bl w-1/3 my-3 p-4 from-blue-50 to-violet-50 flex rounded-xl'>
          <p className='w-2/3 font-normal '>
            The curriculum is view only. To edit it, please use the Strapi CMS
          </p>
          <Link href={""}>
            <Button>Go to Strapi</Button>
          </Link>
        </div>
      )}
      <div className='flex flex-start'>
        <h1 className='text-lg p-1 font-semibold '>
          {curriculum.length > 0 ? `${curriculum.length} Modules` : ""}
        </h1>
      </div>
      {curriculum.length > 0 ? (
        curriculum.map(({ name, id }, index) => (
          <>
            <Link
              href={`/admin/courses/${courseId}/curriculum/${id}`}
              className='bg-gradient-to-bl w-1/3 my-3 p-4 from-blue-50 to-violet-50 flex rounded-xl  '
            >
              <div className='w-full flex items-center justify-between gap-y-2  '>
                <div className='flex gap-y-2 flex-col p-2  '>
                  <div className='flex items-center justify-start  '>
                    <div className='text-md flex flex-col items-start  capitalize text-black'>
                      <div className='ml-1 flex gap-x-2 font-semibold'>
                        <span>Module:{index + 1} </span>
                        <span>{name}</span>
                      </div>
                      <span className='font-normal text-wrap '>
                        Students learn basic concepts of programming and create
                        their first program
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-start gap-x-6 p-3 '>
                    <p className='text-md items-center gap-x-2 flex font-semibold capitalize text-gray-800'>
                      <Clock size={15} /> 2weeks
                    </p>
                    <p className='text-md items-center gap-x-2 flex font-semibold capitalize text-gray-800'>
                      <FileText size={15} /> 4 Assignments
                    </p>
                    <p className='text-md items-center gap-x-2 flex font-semibold capitalize text-gray-800'>
                      <Copy size={15} /> 1 Quiz
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

export default Curriculum;
