import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { BookMinus, ChevronRight, Lock } from "lucide-react";
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
        </ol>
      </nav>

      <div className='  grid grid-cols-2 '>
        <div className='w-[1150px]'>
          <div className='flex flex-col items-start justify-start p-10 '>
            <div className='block gap-y-4 mt-4   '>
              <div className='flex items-center justify-center gap-3  '>
                <div>
                  <BookMinus size={40} />
                </div>
                <div className='flex items-center justify-center flex-col  '>
                  <div className=''>
                    <h1> AFE + Navgurukul Coding Bootcamp</h1>
                  </div>
                  <div className='w-full mt-3 h-[3px] bg-gray-400 ' />
                </div>
              </div>
            </div>
          </div>
          <div className=''>
            <div>
              <div className='gap-y-3 flex flex-col mx-4 '>
                <div className='flex flex-start'>
                  <h1 className='text-lg p-1 font-semibold'>
                    Upcoming Classes
                  </h1>
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
                <div className='flex flex-start'>
                  <Link href={"/courses/:id/:id"}>
                    <div className='flex items-center'>
                      <h1 className='text-lg p-1 font-semibold'>
                        See All Classes and Recording
                      </h1>
                      <ChevronRight size={20} />
                    </div>
                  </Link>
                </div>
              </div>
              <div className='mt-10'>
                <div className='flex flex-start'>
                  <h1 className='text-lg p-1 font-semibold'>Course Modules</h1>
                </div>
                <div className='flex items-center gap-x-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 ' />
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Programming Basics 1
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Time Commitment: 2weeks
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='rounded-full p-6 h-10 w-10 items-center flex justify-center border border-black '>
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 ' />
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Programming Basics 1
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Time Commitment: 2weeks
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='rounded-full p-6 h-10 w-10 items-center flex justify-center border border-black '>
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 ' />
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Programming Basics 1
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Time Commitment: 2weeks
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='rounded-full p-6 h-10 w-10 items-center flex justify-center border border-black '>
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 ' />
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Programming Basics 1
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Time Commitment: 2weeks
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='rounded-full p-6 h-10 w-10 items-center flex justify-center border border-black '>
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 ' />
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Programming Basics 1
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Time Commitment: 2weeks
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='rounded-full p-6 h-10 w-10 items-center flex justify-center border border-black '>
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-x-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 ' />
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Certificate
                          </Link>
                        </div>
                      </div>
                      <div className='flex items-center  justify-center'>
                        <Lock size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
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
          </div>
        </div>
        <div className='w-[1150px]'>
          <div className='gap-y-3 flex flex-col mx-4 '>
            <div className='flex flex-start'>
              <h1 className='text-lg p-1 font-semibold'>Instructor</h1>
            </div>
            <div className='bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
              <div className='flex flex-col items-center justify-center p-4 gap-3'>
                <img
                  src='https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                  className='w-10 h-10 rounded-full '
                />
                <span className='text-lg font-semibold'>Shilpa Mishra</span>
                <p>
                  Ask doubts or general questions about the programs anytime and
                  get answers within a few hours
                </p>
                <button className='bg-gray-300 px-4 py-2 rounded-lg mt-2 w-[200px] '>
                  Start New Chat
                </button>
                <button className=' px-4 py-2 rounded-lg mt-2 w-[200px] '>
                  Start New Chat
                </button>
              </div>
            </div>
            <div className='flex flex-col items-start '>
              <div className=''>
                <h1 className='text-lg p-2 font-semibold w-[300px] items-start '>
                  Upcoming Assignments
                </h1>
                <div className='flex flex-col  items-start gap-y-6 w-[900px]'>
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Intro to vairables
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Deadline 5 Feb 2024
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-gradient-to-bl  p-3 from-blue-50 to-violet-50 flex rounded-xl  sm:w-full md:w-1/3 lg:w=1/3 '>
                    <div className='w-full flex items-center justify-between gap-y-2  '>
                      <div className='flex gap-y-2 flex-col p-2  '>
                        <div className='flex items-center justify-start  '>
                          <Link
                            href={"/"}
                            className='text-md font-semibold capitalize text-black'
                          >
                            Intro to vairables
                          </Link>
                        </div>
                        <div className='flex items-center justify-start  '>
                          <p className='text-md font-semibold capitalize text-gray-600'>
                            Deadline 5 Feb 2024
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default page;