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
import Moment from 'react-moment';
// import ClassCard from "src\app\admin\courses\[courseId]\_components\classCard.tsx"
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
  const [courseModules, setCourseModules] = useState([]);
  const userID = studentData?.id && studentData?.id;
  const [modulesProgress, setModulesProgress] = useState([]);
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
      crumb: "AFE + Navgurukul Coding Bootcamp",
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
    const getCourseModules = async () => {
      try {
        const response = await api.get(
          `/Content/modules/${params.viewcourses}`
        );
        setCourseModules(response.data);
      } catch (error) {
        console.error("Error deleting:", error);
      }
    };
    getCourseModules();
  }, [params.viewcourses]);

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
        console.error("Error deleting:", error);
      }
    };
    if (userID) getModulesProgress();
  }, [userID, params.viewcourses]);

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
                    <h1> AFE + Navgurukul Coding Bootcamp</h1>
                  </div>
                  <Loader />
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

            {courseModules.length > 0 ? (
              courseModules.map(
                ({ name, id }: { name: string; id: number }) => (
                  <Link
                    key={id}
                    href={`/student/courses/${params.viewcourses}/modules/${id}`}
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

                      {modulesProgress.map((module: any) => {
                        if (module.id == id) {
                          return (
                            <div key={module.id} className="">
                              <CircularProgress
                                size="md"
                                value={module.progress}
                                color="warning"
                                showValueLabel={true}
                              />
                            </div>
                          );
                        } else {
                          return null;
                        }
                      })}
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
                src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="w-10 h-10 rounded-full "
                alt="mentor profile pic"
                width={10}
                height={10}
              />
              <span className="text-lg font-semibold">Shilpa Mishra</span>
              <p>
                Ask doubts or general questions about the programs anytime and
                get answers within a few hours
              </p>
              <Button className="bg-gray-300 px-4 py-2 rounded-lg mt-2 w-[200px] ">
                Start New Chat
              </Button>
              <Button className=" px-4 py-2 rounded-lg mt-2 w-[200px] ">
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
