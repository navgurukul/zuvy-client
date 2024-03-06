"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLazyLoadedStudentData } from "@/store/store";
import React, { useState, useEffect } from "react";
import api from "@/utils/axios.config";
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import StudentClassCard from "@/app/student/courses/_components/studentClassCard"
type PageProps = {
  params: {
    viewcourses: string;
  };
};
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
function Page({
  params,
}: {
  params: { viewcourses: string; moduleID: string };
}) {
  const { studentData } = useLazyLoadedStudentData();
  const userID = studentData?.id && studentData?.id;
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );

  const crumbs = [
    { crumb: "My Courses", href: "/student/courses" },
    {
      crumb: courseProgress?.info?.bootcamp_name || "BOOTCAMP",
      href: `/student/courses/${params.viewcourses}`,
    },
    {
      crumb: " Classes and Recordings",
      href: `/student/courses/${params.viewcourses}/recordings`,
    },
  ];
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

  useEffect(() => {
    api.get(`/bootcamp/studentClasses/${params.viewcourses}`, {
      params: {
        userId: userID
      }
    })
      .then((response) => {
        const { upcomingClasses, ongoingClasses, completedClasses } = response.data;
        setUpcomingClasses(upcomingClasses);
        setOngoingClasses(ongoingClasses);
        setCompletedClasses(completedClasses);

      })
      .catch((error) => {
        console.log("Error fetching classes:", error);
      });
  }, []);

  useEffect(() => {

  }, [upcomingClasses, ongoingClasses, completedClasses]);


  return (
    <MaxWidthWrapper>
      <Breadcrumb crumbs={crumbs} />

      <div className="gap-y-3 flex flex-col w-1/3 mx-auto ">
        {ongoingClasses?.length > 0 && (
          <div className="flex left-0">
            <h1 className="text-lg p-1 font-semibold">Ongoing Class</h1>
          </div>
        )}
        {ongoingClasses?.map((classObj, index) => (
          <StudentClassCard classData={classObj} key={index} classType="active" />
        ))}
      </div>


      <div className="gap-y-3 flex flex-col w-1/3 mx-auto ">
        <div className="flex left-0  ">
          <h1 className="text-lg p-1 font-semibold">Upcoming Classes</h1>
        </div>
        {upcomingClasses?.length > 0 ? (
          upcomingClasses.map((classObj, index) => (
            <StudentClassCard classData={classObj} key={index} classType="Upcoming" />
          ))
        ) : (
          <p>No upcoming classes found</p>
        )}
      </div>
      <div className="gap-y-3 flex flex-col w-1/3 mx-auto ">
        {completedClasses?.length > 0 && (
          <div className="flex left-0">
            <h1 className="text-lg p-1 font-semibold">Past Class Recordings</h1>
          </div>
        )}
        {completedClasses?.length > 0 ? (
          completedClasses.map((classObj, index) => (
            <StudentClassCard classData={classObj} key={index} classType="complete" />
          ))
        ) : (
          <p>No past classes found</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
}

export default Page;
