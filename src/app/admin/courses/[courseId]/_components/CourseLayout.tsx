"use client";

import { useEffect, useState } from "react";

import Breadcrumb from "@/components/ui/breadcrumb";
import { Tabs, TabsList } from "@/components/ui/tabs";

import styles from "../../_components/cources.module.css";
import TabItem from "./TabItem";
import { getCourseData } from "@/store/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function CourseBreadcrumb() {
  const { courseData } = getCourseData();
  const [courseId, setCourseId] = useState<string>("");

  // const crumbs = [
  //   { crumb: "My Courses", href: "/admin/courses" },
  //   {
  //     crumb: "",
  //     href: "My",
  //   },
  // ];

  const courseMenu = [
    {
      title: "General Details",
      value: "generalDetails",
      href: `/admin/courses/${courseId}/details`,
    },
    {
      title: "Batches",
      value: "batches",
      href: `/admin/courses/${courseId}/batches`,
    },
    {
      title: "Curriculum",
      value: "curriculum",
      href: `/admin/courses/${courseId}/curriculum`,
    },
    {
      title: "Sessions",
      value: "sessions",
      href: `/admin/courses/${courseId}/sessions`,
    },
    {
      title: "Settings",
      value: "settings",
      href: `/admin/courses/${courseId}/settings`,
    },
    {
      title: "Students",
      value: "students",
      href: `/admin/courses/${courseId}/students`,
    },
  ];

  useEffect(() => {
    const storedCourseId = localStorage.getItem("courseId");
    if (storedCourseId) {
      setCourseId(storedCourseId);
      getCourseData.getState().fetchCourseDetails(storedCourseId);
    }
  }, []);

  return (
    <>
      {/* <Breadcrumb crumbs={crumbs} /> */}
      <Link href={"/admin/courses"} className="flex space-x-2">
        <ArrowLeft size={20} />
        <p className="ml-1 inline-flex text-sm font-medium text-gray-800 md:ml-2">
          My Courses
        </p>
      </Link>
      <h1 className="text-3xl text-start font-bold my-6">{courseData?.name}</h1>
      <div className={styles.contentContainer}>
        <Tabs defaultValue="generalDetails" className="w-full">
          <div className="text-start border-b-2 border-muted">
            <TabsList className="rounded-none rounded-t-sm ">
              {courseMenu.map(({ title, href }) => (
                <TabItem key={href} title={title} href={href} />
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </>
  );
}

export default CourseBreadcrumb;
