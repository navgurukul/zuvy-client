import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {};

function Page({}: Props) {
  const crumbs = [
    { crumb: "My Courses", href: "/courses" },
    { crumb: "AFE + Navgurukul Coding Bootcamp", href: "/courses/:id" },
    { crumb: " Classes and Recordings", href: "/courses/:id/:id" },
  ];

  return (
    <MaxWidthWrapper>
      <Breadcrumb crumbs={crumbs} />
      <div className='gap-y-3 flex flex-col items-center mx-4 my-10'>
        <div className='flex left-0  '>
          <h1 className='text-lg p-1 font-semibold'>Upcoming Classes</h1>
        </div>
        <div className='bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
          <div className='px-1 py-4 flex items-start'>
            <div className='text-gray-900 text-base flex '>
              <div className='flex flex-col items-center justify-center '>
                <span className=' text-xl'>26</span>
                <span className=' text-xl'>Jan</span>
              </div>
              <div className='bg-gray-500 w-[2px] h-15 mx-2 ' />
            </div>
          </div>
          <div className='w-full flex items-center justify-between gap-y-2  '>
            <div>
              <div className='flex items-center justify-start  '>
                <Link
                  href={"/"}
                  className='text-md font-semibold capitalize text-black'
                >
                  Intro to Variables
                </Link>
              </div>
              <div className='flex items-center justify-start  '>
                <p className='text-md font-semibold capitalize text-gray-600'>
                  4:00 PM - 5:00 PM
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <p>Join Class</p>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
        <div className='bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
          <div className='px-1 py-4 flex items-start'>
            <div className='text-gray-900 text-base flex '>
              <div className='flex flex-col items-center justify-center '>
                <span className=' text-xl'>26</span>
                <span className=' text-xl'>Jan</span>
              </div>
              <div className='bg-gray-500 w-[2px] h-15 mx-2 ' />
            </div>
          </div>
          <div className='w-full flex items-center justify-between gap-y-2  '>
            <div>
              <div className='flex items-center justify-start  '>
                <Link
                  href={"/"}
                  className='text-md font-semibold capitalize text-black'
                >
                  Intro to Variables
                </Link>
              </div>
              <div className='flex items-center justify-start  '>
                <p className='text-md font-semibold capitalize text-gray-600'>
                  4:00 PM - 5:00 PM
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <p>Join Class</p>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className='gap-y-3 flex flex-col items-center mx-4 '>
        <div className=''>
          <h1 className='text-lg p-1 font-semibold'>Past Class Recordings</h1>
        </div>
        <div className='bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
          <div className='px-1 py-4 flex items-start'>
            <div className='text-gray-900 text-base flex '>
              <div className='flex flex-col items-center justify-center '>
                <span className=' text-xl'>26</span>
                <span className=' text-xl'>Jan</span>
              </div>
              <div className='bg-gray-500 w-[2px] h-15 mx-2 ' />
            </div>
          </div>
          <div className='w-full flex items-center justify-between gap-y-2  '>
            <div>
              <div className='flex items-center justify-start  '>
                <Link
                  href={"/"}
                  className='text-md font-semibold capitalize text-black'
                >
                  Intro to Variables
                </Link>
              </div>
              <div className='flex items-center justify-start  '>
                <p className='text-md font-semibold capitalize text-gray-600'>
                  4:00 PM - 5:00 PM
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <p>Join Class</p>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
        <div className='bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
          <div className='px-1 py-4 flex items-start'>
            <div className='text-gray-900 text-base flex '>
              <div className='flex flex-col items-center justify-center '>
                <span className=' text-xl'>26</span>
                <span className=' text-xl'>Jan</span>
              </div>
              <div className='bg-gray-500 w-[2px] h-15 mx-2 ' />
            </div>
          </div>
          <div className='w-full flex items-center justify-between gap-y-2  '>
            <div>
              <div className='flex items-center justify-start  '>
                <Link
                  href={"/"}
                  className='text-md font-semibold capitalize text-black'
                >
                  Intro to Variables
                </Link>
              </div>
              <div className='flex items-center justify-start  '>
                <p className='text-md font-semibold capitalize text-gray-600'>
                  4:00 PM - 5:00 PM
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <p>Join Class</p>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default Page;
