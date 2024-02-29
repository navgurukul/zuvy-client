"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookMinus, ChevronRight, Lock } from "lucide-react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useLazyLoadedStudentData } from "@/store/store";
import { CircularProgress } from "@nextui-org/react";
import Loader from "../_components/Loader";
import Image from "next/image";
import api from "@/utils/axios.config";
import { Button } from "@/components/ui/button";

interface CourseProgress {
  status: string;
  info: {
    progress: number;
    bootcamp_name: string;
    instructor_name: string;
    instructor_profile_picture: string;
  };
  code: number;
}

import Moment from 'react-moment';
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
type PageProps = {
  params: {
    viewcourses: string;
  };
};

function Page({
  params,
}: {
  params: { viewcourses: string; moduleID: string };
}) {
  const { studentData } = useLazyLoadedStudentData();
  const userID = studentData?.id && studentData?.id;
  const [modulesProgress, setModulesProgress] = useState([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );
  const [classType, setClassType] = useState("active");
  const [allClasses, setAllClasses] = useState([]);
  const [bootcampData, setBootcampData] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const crumbs = [
    { crumb: "My Courses", href: "/student/courses" },
    {
      crumb: courseProgress?.info?.bootcamp_name || "Course",
      href: `/student/courses/${params.viewcourses}`,
    },
  ];
  useEffect(() => {
    const userIdLocal = JSON.parse(localStorage.getItem("AUTH") || "");

    api.get(`/bootcamp/studentClasses/${params.viewcourses}`, {
      params: {
        userId: userIdLocal.id
      }
    })
      .then((response) => {
        const { upcomingClasses, ongoingClasses, completedClasses } = response.data;
        setUpcomingClasses(upcomingClasses);
        setOngoingClasses(ongoingClasses);
        setCompletedClasses(completedClasses);
        console.log(upcomingClasses)
      })
      .catch((error) => {
        console.log("Error fetching classes:", error);
      });
  }, []);

  useEffect(() => {
    console.log(upcomingClasses, ongoingClasses, completedClasses);
  }, [upcomingClasses, ongoingClasses, completedClasses]);

  useEffect(() => {
    const getModulesProgress = async () => {
      try {
        const response = await api.get(
          `/Content/modules/${params.viewcourses}?user_id=${userID}`
        );
        response.data.map((module: any) => {
          setModulesProgress(response.data);
        });
      } catch (error) {
        console.error("Error getting modules progress", error);
      }
    };
    if (userID) getModulesProgress();
  }, [userID, params.viewcourses]);

  useEffect(() => {
    const getCourseProgress = async () => {
      try {
        const response = await api.get(
          `/bootcamp/${userID}/progress?bootcamp_id=${params.viewcourses}`
        );
        setCourseProgress(response.data);
      } catch (error) {
        console.error("Error getting course progress:", error);
      }
    };
    if (userID) getCourseProgress();
  }, [userID]);

  return (
    <MaxWidthWrapper>
      <Breadcrumb crumbs={crumbs} />

      <div className="md:grid grid-cols-2 lg:grid-cols-3 gap-10  my-10">
        <div className="lg:col-span-2">
          <div className="flex flex-col items-start mb-10">
            <div className="block gap-y-4 mt-4   ">
              <div className="flex items-center justify-center gap-3  ">
                <div>
                  <BookMinus size={40} />
                </div>
                <div className="flex items-center justify-center flex-col  ">
                  <div className="">
                    <h1> {courseProgress?.info?.bootcamp_name}</h1>
                  </div>
                  <Loader progress={courseProgress?.info?.progress} />
                </div>
              </div>
            </div>
          </div>
          <div className="gap-y-3 flex flex-col">
            <div className="flex flex-start">
              <h1 className="text-lg p-1 font-semibold">Upcoming Classes</h1>
            </div>


            {upcomingClasses.map((classObj, index) => (

              <ClassCard classData={classObj} key={index} classType="Upcomng" />
            ))}

            <div className="flex flex-start">
              <Link href={`/student/courses/${params.viewcourses}/recordings`}>
                <div className="flex items-center">
                  <h1 className="text-lg p-1 font-semibold">See All Classes and Recording</h1>
                  <ChevronRight size={20} />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex flex-start">
              <h1 className="text-lg p-1 font-semibold">Course Modules</h1>
            </div>

            {modulesProgress.length > 0 ? (
              modulesProgress.map(
                ({
                  name,
                  id,
                  lock,
                  progress,
                }: {
                  name: string;
                  id: number;
                  lock: boolean;
                  progress: number;
                }) => (
                  <Link
                    key={id}
                    href={`/student/courses/${params.viewcourses}/modules/${id}`}
                    className={
                      lock
                        ? "bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl "
                        : "bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl pointer-events-none opacity-50"
                    }
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

                      {lock ? (
                        <div key={id} className="">
                          <CircularProgress
                            size="md"
                            value={progress}
                            color="warning"
                            showValueLabel={true}
                          />
                        </div>
                      ) : (
                        <>
                          <Lock opacity={50} width={35} height={20} />
                        </>
                      )}
                    </div>
                  </Link>
                )
              )
            ) : (
              <div>No Modules Found</div>
            )}
          </div>
        </div>

        <div className="gap-y-3 flex flex-col">
          <div className="flex flex-start">
            <h1 className="text-lg p-1 font-semibold">Instructor</h1>
          </div>
          <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  ">
            <div className="flex flex-col items-center justify-center p-4 gap-3">
              <Image
                src={courseProgress?.info?.instructor_profile_picture ?? ""}
                className="w-10 h-10 rounded-full "
                alt="instructor profile pic"
                width={10}
                height={10}
              />
              <span className="text-lg font-semibold">
                {courseProgress?.info?.instructor_name}
              </span>
              <p>
                Ask doubts or general questions about the programs anytime and
                get answers within a few hours
              </p>
              <Button className="px-4 py-2 rounded-lg mt-2 w-[200px] ">
                Start New Chat
              </Button>
              <Button disabled className="px-4 py-2 rounded-lg mt-2 w-[200px] ">
                View Past Chat
              </Button>
            </div>
          </div>

          <div className="flex flex-start">
            <h1 className="text-lg p-1 font-semibold">Upcoming Assignments</h1>
          </div>
          <div>
            <div className="bg-gradient-to-bl mb-3 text-start p-5 from-blue-50 to-violet-50 rounded-xl  ">
              <Link
                href={"/"}
                className="text-md font-semibold capitalize text-black "
              >
                Intro to vairables
              </Link>

              <p className="text-md font-semibold capitalize text-gray-600 mt-2">
                Deadline 5 Feb 2024
              </p>
            </div>
            <div className="bg-gradient-to-bl mb-3 text-start p-5 from-blue-50 to-violet-50 rounded-xl  ">
              <Link
                href={"/"}
                className="text-md font-semibold capitalize text-black"
              >
                Intro to vairables
              </Link>
              <p className="text-md font-semibold capitalize text-gray-600 mt-2">
                Deadline 5 Feb 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default Page;
