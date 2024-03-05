"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLazyLoadedStudentData } from "@/store/store";

type Props = {};

export default function Profile({}: Props) {
  const { studentData } = useLazyLoadedStudentData();
  return (
    <>
      {/* <div className='flex flex-col items-start w-[800px] mx-80  '>
        <h1 className='text-[25px] font-semibold'>Profile</h1>
        <div className=' flex w-[800px] items-center justify-center mx-auto my-10 bg-white rounded-lg shadow-md p-5'>
          <div className='w-2/3'>
            <img
              className='w-32 h-32 rounded-full mx-auto'
              src={studentData?.profile_picture}
              alt='Profile picture'
            />
            <h2 className='text-center text-2xl font-semibold mt-3'>
              {studentData?.name}
            </h2>
            <p className='text-center text-gray-600 mt-1'>
              MS in Computer Science
            </p>
            <div className='flex gap-x-6 justify-center mt-5'>
              <p className='bg-gray-200 p-2 rounded-lg'>Python</p>
              <p className='bg-gray-200 p-2 rounded-lg'>System Design</p>
            </div>
          </div>
          <div className='mt-5 w-1/3 '>
            <div className='flex flex-col gap-y-3 items-start'>
              <h1 className='font-semibold'>Contact Details</h1>
              <p className='text-gray-600'>Email: {studentData?.email}</p>
              <p className='text-gray-600'>Phone: +91456789142</p>
            </div>
            <h3 className='text-xl font-semibold text-start my-5 '>Bio</h3>
            <p className='text-gray-600 mt-2  '>
              What does the instructor do all day. They are teaching the
              students great many things.
            </p>
          </div>
        </div>
        <Link href={"/instructor/profile/EditProfile"}>
          <Button>Edit Profile</Button>
        </Link>
      </div> */}
    </>
  );
}
