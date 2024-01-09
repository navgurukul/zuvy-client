"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

import React, { useState } from "react";

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
              <img
                className='h-40 w-40 rounded-full object-cover'
                src='https://github.com/shadcn.png'
                alt='Profile'
              />
              <button className='absolute bottom-0 right-0 bg-[#2f433a] text-white rounded-full p-2 shadow-md hover:bg-[#518672] focus:outline-none'>
                Edit
              </button>
            </div>
            <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
              <p className='text-sm font-semibold text-gray-700 '>
                Priyomjeet Nath
              </p>
            </div>
          </div>
          <div className='bg-gray-100 p-4 mx-auto '>
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
                      Notification 1
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Notification 2
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Notification
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "applications" && (
                <div className='bg-white p-4 shadow-md'>
                  {/* Replace this content with your application items */}

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Application 1
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Application 2
                    </p>
                  </div>

                  <div className='mx-auto mt-4 mb-4 flex max-w-fit items-center justify-center space-x-2   bg-white px-7 py-2 shadow-md backdrop-blur hover:bg-white/50 '>
                    <p className='text-sm font-semibold text-gray-700 '>
                      Application 3
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
          <section className='py-10 bg-white sm:py-16 lg:py-24'>
            <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
              <div className='grid grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-3 lg:gap-y-16'>
                <div>
                  <div className='relative flex items-center justify-center mx-auto'>
                    <img
                      src={"/profile1.svg"}
                      alt='profile1'
                      height={250}
                      width={250}
                    />
                  </div>
                  <h3 className='mt-8 text-lg font-semibold text-black'>
                    Secured End To End
                  </h3>
                  <p className='mt-4 text-base text-gray-600'>
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. Velit officia consequat duis enim velit
                    mollit.
                  </p>
                </div>

                <div>
                  <div className='relative flex items-center justify-center mx-auto'>
                    <img
                      src={"/profile2.svg"}
                      alt='profile1'
                      height={90}
                      width={90}
                    />
                  </div>
                  <h3 className='mt-8 text-lg font-semibold text-black'>
                    Ongoing Applications
                  </h3>
                  <p className='mt-4 text-base text-gray-600'>
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. Velit officia consequat duis enim velit
                    mollit.
                  </p>
                </div>

                <div>
                  <div className='relative flex items-center justify-center mx-auto'>
                    <img
                      src={"/profile3.svg"}
                      alt='profile1'
                      height={80}
                      width={80}
                    />
                  </div>
                  <h3 className='mt-8 text-lg font-semibold text-black'>
                    Notifications
                  </h3>
                  <p className='mt-4 text-base text-gray-600'>
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. Velit officia consequat duis enim velit
                    mollit.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
