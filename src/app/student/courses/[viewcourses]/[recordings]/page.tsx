"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React,{useState,useEffect} from "react";
import api from "@/utils/axios.config";
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
type Props = {};

function Page({}: Props) {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const crumbs = [
    { crumb: "My Courses", href: "/student/courses" },
    {
      crumb: "AFE + Navgurukul Coding Bootcamp",
      href: "/student/courses/:course-name",
    },
    {
      crumb: " Classes and Recordings",
      href: "/student/courses/:course-name/recordings",
    },
  ];
  useEffect(() => {
    const userIdLocal = JSON.parse(localStorage.getItem("AUTH") || "");

    api.get(`/bootcamp/studentClasses/1`, {
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


  return (
    <MaxWidthWrapper>
      <Breadcrumb crumbs={crumbs} />
      
      {  ongoingClasses.length>0?
      <div className="gap-y-3 flex flex-col items-center mx-4 my-10">
        <div className="flex left-0  ">
          <h1 className="text-lg p-1 font-semibold">Ongoing Class</h1>
        </div>
         {ongoingClasses.map((classObj, index) => (
    
    <ClassCard classData={classObj} key={index} classType="active"/>
  ))}
      
      </div>:null}
      <div className="gap-y-3 flex flex-col items-center mx-4 my-10">
        <div className="flex left-0  ">
          <h1 className="text-lg p-1 font-semibold">Upcoming Classes</h1>
        </div>
         {upcomingClasses.map((classObj, index) => (
    
    <ClassCard classData={classObj} key={index} classType="upcoming"/>
  ))}
        
      </div>
      <div className="gap-y-3 flex flex-col items-center mx-4 ">
        <div className="">
          <h1 className="text-lg p-1 font-semibold">Past Class Recordings</h1>
        </div>
          {completedClasses.map((classObj, index) => (
    
    <ClassCard classData={classObj} key={index} classType="complete"/>
  ))}
       
      </div>
    </MaxWidthWrapper>
  );
}

export default Page;
