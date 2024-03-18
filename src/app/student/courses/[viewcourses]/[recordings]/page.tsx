"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import api from "@/utils/axios.config";
import ClassCard from "@/app/admin/courses/[courseId]/_components/classCard";
import { useLazyLoadedStudentData } from "@/store/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpcomingClasses from "./_components/UpcomingClasses";
import Recordings from "./_components/Recordings";

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
      crumb: `${bootcampData?.bootcamp?.name}` || `Course`,
      href: `/student/courses/${params.viewcourses}`,
    },
    {
      crumb: " Classes and Recordings",
      href: `/student/courses/${params.viewcourses}/recordings`,
    },
  ];

  const classMenu = [
    {
      title: "Upcoming Classes",
      value: "upcomingClasses",
      component: (
        <UpcomingClasses
          ongoingClasses={ongoingClasses}
          upcomingClasses={upcomingClasses}
        />
      ),
    },
    {
      title: "Recordings",
      value: "recordings",
      component: <Recordings completedClasses={completedClasses} />,
    },
  ];

  useEffect(() => {
    if (userID) {
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
    }
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

  return (
    <>
      <Breadcrumb crumbs={crumbs} />
      <Tabs defaultValue="upcomingClasses" className="w-full  mt-10">
        <div className="text-start border-b-2 border-muted">
          <TabsList className="rounded-none rounded-t-sm ">
            {classMenu.map(({ title, value }) => (
              <TabsTrigger key={value} value={value}>
                {title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="text-center mt-10">
          {classMenu.map(({ component, value }) => (
            <TabsContent key={value} value={value}>
              {component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </>
  );
}

export default Page;
