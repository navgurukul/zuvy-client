"use client";
import React from "react";
import Link from "next/link";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useLazyLoadedStudentData } from "@/store/store";
import InstructorCard from "./_components/instructorCard";
import RadioCheckbox from "./_components/radioCheckbox";

type Props = {};

const InstructorPage = (props: Props) => {
  const { studentData } = useLazyLoadedStudentData();
  const username: string[] | undefined = studentData?.name?.split(" ");
  const newUserName: string | undefined =
    username?.[0]?.charAt(0)?.toUpperCase() +
    (username?.[0]?.slice(1)?.toLowerCase() || "");
  let batches = true;
  return (
    <MaxWidthWrapper>
      <div className='flex items-center justify-start'>
        <Avatar>
          <AvatarImage src={studentData?.profile_picture} />
        </Avatar>{" "}
        <p className='text-[30px]'>
          {`Hi, ${newUserName}! Here's Your Schedule`}
        </p>
      </div>
      <RadioCheckbox />
      <div className='p-3'>
        <h1 className='text-start font-semibold '>5 Upcoming Classes </h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4'>
          <InstructorCard
            batchName={"AFE + Navgurukul Basics"}
            date1={26}
            month={"Jan"}
            topicTitle={"Intro to Variables"}
            classesTiming={"4:00 PM - 5:00 PM"}
            typeClass={"Join"}
          />
          <InstructorCard
            batchName={"AFE + Navgurukul Basics"}
            date1={26}
            month={"Jan"}
            topicTitle={"Intro to Variables"}
            classesTiming={"4:00 PM - 5:00 PM"}
            typeClass={"Join"}
          />
          <InstructorCard
            batchName={"AFE + Navgurukul Basics"}
            date1={26}
            month={"Jan"}
            topicTitle={"Intro to Variables"}
            classesTiming={"4:00 PM - 5:00 PM"}
            typeClass={"Join"}
          />
          <InstructorCard
            batchName={"AFE + Navgurukul Basics"}
            date1={26}
            month={"Jan"}
            topicTitle={"Intro to Variables"}
            classesTiming={"4:00 PM - 5:00 PM"}
            typeClass={"Join"}
          />
          <InstructorCard
            batchName={"AFE + Navgurukul Basics"}
            date1={26}
            month={"Jan"}
            topicTitle={"Intro to Variables"}
            classesTiming={"4:00 PM - 5:00 PM"}
            typeClass={"Join"}
          />
          <InstructorCard
            batchName={"AFE + Navgurukul Basics"}
            date1={26}
            month={"Jan"}
            topicTitle={"Intro to Variables"}
            classesTiming={"4:00 PM - 5:00 PM"}
            typeClass={"Join"}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default InstructorPage;
