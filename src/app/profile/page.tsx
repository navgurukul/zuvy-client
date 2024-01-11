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
              <button className='absolute bottom-0 right-0 bg-[#2f433a] text-white rounded-full p-2 shadow-md hover:bg-[#518672] focus:outline-none'>
                <Pencil />
              </button>
            </div>
            <div className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
              <p className='text-sm font-semibold text-gray-700 '>
                Priyomjeet Nath
              </p>
            </div>
            <div className='cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
              <p className='text-sm font-semibold text-gray-700 '>
                Share Profile Link
              </p>
            </div>
          </div>
          <div className='bg-gray-100 p-3 mx-auto '>
            <div className='flex items-center justify-center'>
              <button
                onClick={() => handleTabChange("notifications")}
                className={`${
                  activeTab === "notifications"
                    ? "bg-[#2f433a] text-white"
                    : "text-[#2f433a]"
                } font-semibold py-2 px-4 rounded-l-md focus:outline-none`}
              >
                Notifications
              </button>
              <button
                onClick={() => handleTabChange("applications")}
                className={`${
                  activeTab === "applications"
                    ? "bg-[#2f433a] text-white"
                    : "text-{#2f433a}"
                } font-semibold py-2 px-4 rounded-r-md focus:outline-none`}
              >
                Applications
              </button>
              <button
                onClick={() => handleTabChange("grades")}
                className={`${
                  activeTab === "grades"
                    ? "bg-[#2f433a] text-white"
                    : "text-{#2f433a}"
                } font-semibold py-2 px-4 rounded-r-md focus:outline-none`}
              >
                Grades
              </button>
            </div>
            <div className='mt-4'>
              {activeTab === "notifications" && (
                <div className='bg-white p-4 shadow-md '>
                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Started ReactJS Foundation batch
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Dont Forget To signup for Slack & Discord
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      You&apos;ve Enrolled DSA basics
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "applications" && (
                <div className='bg-white p-4 shadow-md'>
                  {/* Replace this content with your application items */}

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Application for Harvard
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Medical Leave Application
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Submit Your application here
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "grades" && (
                <div className='bg-white p-4 shadow-md '>
                  {/* Replace this content with your application items */}

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Adv Java: 9.0
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      C++: 8.0
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Javascript: 7.0
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <section className='py-8 bg-gray-50 sm:pt-16 lg:pt-24'>
            <div className='px-24 mx-auto sm:px-6 lg:px-8 max-w-7xl'>
              <div className='grid grid-cols-2 md:col-span-3 lg:grid-cols-6 gap-y-10 gap-x-12'>
                <div className='col-span-2 md:col-span-3 lg:col-span-2 lg:pr-6'>
                  <p className='font-semibold text-3xl tracking-widest text-black uppercase '>
                    Education
                  </p>
                  <p className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
                    Bachelors in Psychology from Delhi University
                  </p>
                  <p className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
                    Masters in Statistics and Data Science from BITS
                  </p>
                  <Button className='className=bg-[#2f433a] p-2 mt-3 h-12   w-[100px]'>
                    Add More
                  </Button>
                  <ul className='flex items-center space-x-3 mt-9'></ul>
                </div>
                <div className='col-span-2 md:col-span-3 lg:col-span-2 lg:pr-6'>
                  <p className='font-semibold text-3xl tracking-widest text-black uppercase '>
                    Projects
                  </p>
                  <Link
                    href={"/"}
                    className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '
                  >
                    LMS end to end
                  </Link>
                  <Link
                    href={"/"}
                    className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '
                  >
                    Ecommerce Website
                  </Link>
                  <Button className='className=bg-[#2f433a] p-2 mt-3 h-12   w-[100px]'>
                    Add More
                  </Button>
                  <ul className='flex items-center space-x-3 mt-9'></ul>
                </div>

                <div className='col-span-2 md:col-span-1 lg:col-span-2 lg:pl-8'>
                  <p className='font-semibold text-3xl tracking-widest text-black uppercase'>
                    Socials
                  </p>
                  <div className='flex flex-col items-center justify-between'>
                    <div className='flex items-center justify-between w-full  '>
                      <a
                        href='#'
                        title=''
                        className='flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600'
                      >
                        <svg
                          className='w-8 h-8'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                        >
                          <path d='M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z'></path>
                        </svg>
                      </a>
                      <span className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50'>
                        Zuvy@org
                      </span>
                    </div>
                    <div className='flex items-center justify-between w-full '>
                      <a
                        href='#'
                        title=''
                        className='flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600'
                      >
                        <svg
                          className='w-8 h-8'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                        >
                          <path d='M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z'></path>
                          <circle cx='16.806' cy='7.207' r='1.078'></circle>
                          <path d='M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.08 5.08 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z'></path>
                        </svg>
                      </a>
                      <span className=' cursor-pointer mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50'>
                        Zuvy@orgInsta
                      </span>
                    </div>
                  </div>
                  <form action='#' method='POST' className='mt-2'>
                    <div>
                      <label htmlFor='email' className='sr-only'>
                        Enter Your Socials
                      </label>
                      <input
                        type='email'
                        name='email'
                        id='email'
                        placeholder='Enter your Socials'
                        className='block w-full p-2 text-black placeholder-black transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600'
                      />
                    </div>

                    <Button className='className=bg-[#2f433a] p-2 mt-3 h-12   w-[100px]'>
                      Add More
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
