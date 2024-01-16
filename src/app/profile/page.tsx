"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import { Pencil } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {};

export default function Profile({}: Props) {
  const [activeTab, setActiveTab] = useState<string>("notifications");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <>
      <MaxWidthWrapper className='flex flex-col items-center justify-between sm:flex-col '>
        <div className='flex items-center justify-between min-w-full flex-col  '>
          <div className='flex flex-col items-center mx-auto justify-center'>
            <div className='relative'>
              <Avatar className='h-40 w-40'>
                <AvatarImage src='https://github.com/shadcn.png' />
                <AvatarFallback>NAME</AvatarFallback>
              </Avatar>
            </div>
            <div className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full  bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
              <p className='text-sm font-semibold text-gray-700 '>
                Divya Sharma
              </p>
            </div>
            <div className='cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full  bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
              <p className='text-sm font-semibold text-gray-700 '>
                divyasharma20@gmail.com
              </p>
            </div>
            <div className='cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full  bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
              <p className='text-sm font-semibold text-gray-700 '>
                +14567892145
              </p>
            </div>
            <button className='bg-[#f0f0f0] p-1 mt-3 h-30 w-70 w-[100px]'>
              <Link href='/editprofile'>
                <span className='text-sm font-semibold text-gray-700 '>
                  Edit Profile
                </span>
              </Link>
            </button>
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
