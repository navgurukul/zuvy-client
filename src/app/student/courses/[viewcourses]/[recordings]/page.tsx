import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {};

function page({}: Props) {
  return (
    <MaxWidthWrapper>
      <nav className='flex' aria-label='Breadcrumb'>
        <ol className='inline-flex items-center space-x-1 md:space-x-3'>
          <li className='inline-flex items-center'>
            <Link
              href={"/courses"}
              className='ml-1 inline-flex text-sm font-medium text-gray-800 hover:underline md:ml-2'
            >
              My Courses
            </Link>
          </li>
          <li>
            <div className='flex items-center'>
              <span className='mx-2.5 text-gray-800 '>/</span>
              <Link
                href={"/courses/:id"}
                className='ml-1 text-sm font-medium text-gray-800 hover:underline md:ml-2'
              >
                {" "}
                AFE + Navgurukul Coding Bootcamp
              </Link>
            </div>
          </li>
          <li>
            <div className='flex items-center'>
              <span className='mx-2.5 text-gray-800 '>/</span>
              <Link
                href={"/courses/:id/:id"}
                className='ml-1 text-sm font-medium text-gray-800 hover:underline md:ml-2'
              >
                {" "}
                Classes and Recordings
              </Link>
            </div>
          </li>
        </ol>
      </nav>
      <div className='w-full flex items-start ml-2 p-4 '>
        <p className='flex items-center justify-center '>
          <ChevronLeft />
          <Link href={"/courses"}>Back To Course</Link>
        </p>
      </div>
      <div className='gap-y-3 flex flex-col items-center mx-4 '>
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

export default page;
