"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { ArrowRight, ChevronRight, Copy } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Loader from "./_components/Loader";
import Image from "next/image";

type pageProps = {};

const Page: React.FC<pageProps> = () => {
  const [progress, setProgress] = useState(23);

  return (
    // <MaxWidthWrapper className=" flex flex-col ">
    <>
      <div className="mx-2 p-5 flex  items-center justify-between bg-gradient-to-bl from-blue-50 to-violet-50 rounded-lg">
        <h1 className="p-1  text-xl font-semibold">My Courses</h1>
      </div>
      <div className="px-2 py-2 md:px-6 md:py-10 ">
        <div className="flex items-center justify-start">
          <h1 className="text-lg font-semibold mb-2">
            Start from where you left
          </h1>
        </div>
        <div className="bg-gradient-to-bl from-blue-50 to-violet-50 rounded-xl  sm:w-full md:w-1/2 lg:w=1/3 p-2 mb-10">
          <div className="px-1 py-4 flex items-start">
            <p className="text-gray-900 text-base">
              AFE + Navgurukul Coding Bootcamp - Module 2
            </p>
          </div>
          <div className=" flex flex-col ">
            <div className="flex items-center justify-start">
              <span className=" rounded-full bg-gray-100 p-3 text-black">
                <Video size={15} />
              </span>
              <Link href={"/"} className="text-lg capitalize text-black">
                Video- Intro to Variables
              </Link>
            </div>
            <div className="flex p-2 items-center justify-end">
              <Link href={"/"} className="text-lg capitalize ">
                Resume Learning
              </Link>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
        <div className=" flex flex-col items-center justify-center">
          <div className="x-5 flex items-center justify-start w-full">
            <h1 className="p-1 mx-4 text-xl font-semibold ">
              Enrolled Courses
            </h1>
          </div>

          <div className="container  mx-auto p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              <Link href={"courses/:id"} className="text-gray-900 text-base">
                <div className="bg-white rounded-lg border p-4">
                  <Image
                    src="https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVhY3R8ZW58MHx8MHx8fDA%3D"
                    alt="Placeholder Image"
                    className="w-full h-48 rounded-md object-cover"
                  />
                  <div className="px-1 py-4">
                    AFE + Navgurukul Coding Bootcamp
                  </div>
                  <Loader />
                </div>
              </Link>
              <Link
                href={"courses/:course-name"}
                className="text-gray-900 text-base"
              >
                <div className="bg-white rounded-lg border p-4">
                  <Image
                    src="https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amF2YXNjcmlwdHxlbnwwfHwwfHx8MA%3D%3D"
                    alt="Placeholder Image"
                    className="w-full h-48 rounded-md object-cover"
                  />
                  <div className="px-1 py-4">
                    AFE + Navgurukul Coding Bootcamp
                  </div>
                  <Loader />
                </div>
              </Link>
              <Link href={"courses/AFE"} className="text-gray-900 text-base">
                <div className="bg-white rounded-lg border p-4">
                  <Image
                    src="https://images.unsplash.com/photo-1633933703119-5d25460ad829?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWMlMjBwcm9kdWN0aW9ufGVufDB8fDB8fHww"
                    alt="Placeholder Image"
                    className="w-full h-48 rounded-md object-cover"
                  />
                  <div className="px-1 py-4">
                    AFE + Navgurukul Coding Bootcamp
                  </div>
                  <Loader />
                </div>
              </Link>
              <Link href={"courses/AFE"} className="text-gray-900 text-base">
                <div className="bg-white rounded-lg border p-4">
                  <Image
                    src="https://plus.unsplash.com/premium_photo-1661499751432-a5ee116ae3f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRhY3RpY3N8ZW58MHx8MHx8fDA%3D"
                    alt="Placeholder Image"
                    className="w-full h-48 rounded-md object-cover"
                  />
                  <div className="px-1 py-4">
                    AFE + Navgurukul Coding Bootcamp
                  </div>
                  <Loader />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
    // </MaxWidthWrapper>
  );
};
export default Page;
