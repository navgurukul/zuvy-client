"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import api from "@/utils/axios.config";
import ClassCard from "@/app/admin/courses/[courseId]/_components/classCard";
import { useLazyLoadedStudentData } from "@/store/store";
type PageProps = {
  params: {
    viewcourses: string;
  };
};

interface Bootcamp {
  id: number;
  name: string;
  coverImage: string;
  bootcampTopic: string;
  startTime: string;
  duration: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  students_in_bootcamp: number;
  unassigned_students: number;
}

interface BootcampData {
  status: string;
  message: string;
  code: number;
  bootcamp: Bootcamp;
}

function Page({
  params,
}: {
  params: { viewcourses: string; moduleID: string };
}) {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const { studentData } = useLazyLoadedStudentData();
  const [bootcampData, setBootcampData] = useState({} as BootcampData);
  const userID = studentData?.id && studentData?.id;
  const crumbs = [
    { crumb: "My Courses", href: "/student/courses" },
    {
      crumb: `${bootcampData?.bootcamp?.name}` || `Bootcamp name`,
      href: `/student/courses/${params.viewcourses}`,
    },
    {
      crumb: " Classes and Recordings",
      href: `/student/courses/${params.viewcourses}/recordings`,
    },
  ];
  useEffect(() => {
    api
      .get(`/bootcamp/studentClasses/${params.viewcourses}`, {
        params: {
          userId: userID,
        },
      })
      .then((response) => {
        const { upcomingClasses, ongoingClasses, completedClasses } =
          response.data;
        setUpcomingClasses(upcomingClasses);
        setOngoingClasses(ongoingClasses);
        setCompletedClasses(completedClasses);
      })
      .catch((error) => {
        console.log("Error fetching classes:", error);
      });
  }, [userID]);

  useEffect(() => {
    api
      .get(`/bootcamp/${params.viewcourses}`)
      .then((response) => {
        setBootcampData(response.data);
      })
      .catch((error) => {
        console.log("Error fetching bootcamp data:", error);
      });
  }, []);

  useEffect(() => {}, [upcomingClasses, ongoingClasses, completedClasses]);

  return (
    <MaxWidthWrapper>
      <Breadcrumb crumbs={crumbs} />
      <div className="gap-y-3 flex flex-col items-center mx-4 my-10 w-[720px]">
        <div className="flex left-0">
          <h1 className="text-lg p-1 font-semibold">Upcoming Classes</h1>
        </div>
        {ongoingClasses?.length > 0
          ? ongoingClasses.map((classObj, index) => (
              <ClassCard classData={classObj} key={index} classType="ongoing" />
            ))
          : null}
        {upcomingClasses?.length > 0 ? (
          upcomingClasses.map((classObj, index) => (
            <ClassCard classData={classObj} key={index} classType="Upcoming" />
          ))
        ) : (
          <p>No upcoming classes found</p>
        )}
      </div>
      <div className="gap-y-3 flex flex-col items-center mx-4 w-[720px]">
        <div className="">
          <h1 className="text-lg p-1 font-semibold">Past Class Recordings</h1>
        </div>
        {completedClasses?.length > 0 ? (
          completedClasses.map((classObj, index) => (
            <ClassCard classData={classObj} key={index} classType="complete" />
          ))
        ) : (
          <p>No past classes found</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}

export default Page;
