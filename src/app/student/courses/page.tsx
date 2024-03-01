"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Video } from "lucide-react";
import Loader from "./_components/Loader";
import Image from "next/image";
import api from "@/utils/axios.config";
import { useLazyLoadedStudentData } from "@/store/store";

interface EnrolledCourse {
  name: string;
  coverImage: string;
  id: number;
  progress: number;
}

interface ResumeCourse {
  bootcamp_name?: string;
  module_name?: string;
  bootcampId?: number;
  moduleId?: number;
}

type pageProps = {};

const Page: React.FC<pageProps> = () => {
  const { studentData } = useLazyLoadedStudentData();
  const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([]);
  const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({});
  const [courseStarted, setCourseStarted] = useState<boolean>(true);
  const userID = studentData?.id && studentData?.id;

  useEffect(() => {
    const getEnrolledCourses = async () => {
      try {
        const response = await api.get(`/student/${userID}`);
        console.log(response.data, "enrolled courses");
        setEnrolledCourse(response.data);
      } catch (error) {
        console.error("Error getting enrolled courses:", error);
      }
    };
    if (userID) getEnrolledCourses();
  }, [userID]);

  useEffect(() => {
    const getResumeCourse = async () => {
      try {
        const response = await api.get(`/tracking/latest/learning/${userID}`);
        console.log(response.data, "resume course");
        setResumeCourse(response.data);
        // If we get res, then course started, hence courseStarted: true;
        setCourseStarted(true);
      } catch (error) {
        console.error("Error getting resume course:", error);
        if (
          (error as any)?.response?.data?.message ===
          `Cannot read properties of undefined (reading 'moduleId')`
        ) {
          setCourseStarted(false);
          console.log("hello");
        }
      }
    };
    if (userID) getResumeCourse();
  }, [userID]);

  return (
    // <MaxWidthWrapper className=" flex flex-col ">
    <>
      <div className="mx-2 p-5 flex  items-center justify-between bg-gradient-to-bl from-blue-50 to-violet-50 rounded-lg">
        <h1 className="p-1  text-xl font-semibold">My Courses</h1>
      </div>
      <div className="px-2 py-2 md:px-6 md:py-10 ">
        {enrolledCourse.length > 0 && courseStarted ? (
          <div className="flex items-center justify-start">
            <h1 className="text-lg font-semibold mb-2">
              Start from where you left
            </h1>
          </div>
        ) : (
          <></>
        )}

        {/* If Course Already Started then Below Message will be displayed: */}
        {enrolledCourse?.length > 0 && courseStarted ? (
          <div className="bg-gradient-to-bl from-blue-50 to-violet-50 rounded-xl  sm:w-full md:w-1/2 lg:w=1/3 p-2 mb-10">
            <div className="px-1 py-4 flex items-start">
              <p className="text-gray-900 text-base">
                {resumeCourse?.bootcamp_name}
              </p>
            </div>
            <div className=" flex flex-col ">
              <div className="flex items-center justify-start">
                <span className=" rounded-full bg-gray-100 p-3 text-black">
                  <Video size={15} />
                </span>
                <Link
                  href={`/student/courses/${resumeCourse?.bootcampId}`}
                  className="text-lg capitalize text-black"
                >
                  {resumeCourse?.module_name}
                </Link>
              </div>
              <div className="flex p-2 items-center justify-end">
                <Link
                  href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                  className="text-lg capitalize "
                >
                  Resume Learning
                </Link>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ) : (
          // If No Course Started then Below Message will be displayed:
          <></>
        )}
        <div className=" flex flex-col items-center justify-center">
          <div className="x-5 flex items-center justify-start w-full">
            <h1 className="p-1 mx-4 text-xl font-semibold ">
              Enrolled Courses
            </h1>
          </div>
          <div className="container  mx-auto p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {enrolledCourse.length > 0 ? (
                enrolledCourse.map(
                  ({
                    name,
                    coverImage,
                    id,
                    progress,
                  }: {
                    name: string;
                    coverImage: string;
                    id: number;
                    progress: number;
                  }) => (
                    <Link
                      key={id}
                      href={`courses/${id}`}
                      className="text-gray-900 text-base"
                    >
                      <div className="bg-white rounded-lg border p-4">
                        <Image
                          src={coverImage}
                          alt="Placeholder Image"
                          className="w-full h-48 rounded-md object-cover"
                          width={100}
                          height={48}
                        />
                        <div className="px-1 py-4">{name}</div>
                        <Loader progress={progress} />
                      </div>
                    </Link>
                  )
                )
              ) : (
                <p>No courses available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
    // </MaxWidthWrapper>
  );
};
export default Page;
