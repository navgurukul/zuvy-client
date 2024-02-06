"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { saveCourseId } from "@/redux/slices/userSlice";
import { AppDispatch } from "@/redux/store/store";
import Batches from "./_components/batches";
import GeneralDetails from "./_components/generalDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Breadcrumb from "@/components/ui/breadcrumb";
import api from "@/utils/axios.config";

import styles from "../_components/cources.module.css";
import LiveClass from "./_components/liveClass";
import Settings from "./_components/settings";
import Students from "./_components/students";

interface Page {}

const Page = ({ params }: { params: { courseId: string } }) => {
  const dispatch = useDispatch<AppDispatch>();
  // const [duration, setDuration] = useState<number | null>(null);
  const [courseData, setCourseData] = useState({
    id: "",
    name: "",
    bootcampTopic: "",
    // courseDescription: "",
    coverImage: "",
    // startDate: "",
    duration: 0,
    language: "The bootcamp language",
    capEnrollment: 0,
  });

  const courseMenu = [
    {
      title: "General Details",
      value: "generalDetails",
      component: (
        <GeneralDetails
          id={params.courseId}
          courseData={courseData}
          setCourseData={setCourseData}
        />
      ),
    },
    {
      title: "Batches",
      value: "batches",
      component: <Batches />,
    },
    {
      title: "Curriculum",
      value: "curriculum",
      // component: <Batches />,
    },
    {
      title: "Live Class",
      value: "liveClass",
      component: <LiveClass />,
    },
    {
      title: "Settings",
      value: "settings",
      component: <Settings id={params.courseId} />,
    },
    {
      title: "Students",
      value: "students",
      component: <Students />,
    },
  ];

  const crumbs = [
    { crumb: "My Courses", href: "/admin/courses" },
    {
      crumb: courseData.name,
      href: `/admin/courses/${courseData.id}`,
    },
  ];

  // async
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/bootcamp/${params.courseId}`);
        dispatch(saveCourseId(params.courseId));
        const data = response.data;
        setCourseData(data.bootcamp);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseDetails();
  }, [params.courseId, dispatch]);

  return (
    <div>
      <Breadcrumb crumbs={crumbs} />
      <h1 className='text-3xl text-start font-bold my-6'>{courseData.name}</h1>
      <div className={styles.contentContainer}>
        <Tabs defaultValue='generalDetails' className='w-full'>
          <div className='text-start border-b-2 border-muted'>
            <TabsList className='rounded-none rounded-t-sm '>
              {courseMenu.map(({ title, value }) => (
                <TabsTrigger key={value} value={value}>
                  {title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className='text-center mt-10'>
            {courseMenu.map(({ component, value }) => (
              <TabsContent key={value} value={value}>
                {component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
