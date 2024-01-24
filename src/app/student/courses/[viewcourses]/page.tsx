import React from "react";
import Link from "next/link";
import { BookMinus, ChevronRight, Lock } from "lucide-react";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Breadcrumb from "@/components/ui/breadcrumb";
import CircularLoader from "../_components/circularLoader/circularLoader";
import Loader from "../_components/loader/Loader";

type Props = {};

function Page({}: Props) {
  const crumbs = [
    { crumb: "My Courses", href: "/courses" },
    {
      crumb: "AFE + Navgurukul Coding Bootcamp",
      href: "/courses/:course-name",
    },
  ];

  return (
    <MaxWidthWrapper>
      <Breadcrumb crumbs={crumbs} />

      <div className="md:grid grid-cols-2 lg:grid-cols-3 gap-10  my-10">
        <div className="lg:col-span-2">
          <div className="flex flex-col items-start mb-10">
            <div className="block gap-y-4 mt-4   ">
              <div className="flex items-center justify-center gap-3  ">
                <div>
                  <BookMinus size={40} />
                </div>
                <div className="flex items-center justify-center flex-col  ">
                  <div className="">
                    <h1> AFE + Navgurukul Coding Bootcamp</h1>
                  </div>
                  <Loader />
                </div>
              </div>
            </div>
          </div>
          <div className="gap-y-3 flex flex-col ">
            <div className="flex flex-start">
              <h1 className="text-lg p-1 font-semibold">Upcoming Classes</h1>
            </div>
            <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl">
              <div className="px-1 py-4 flex items-start">
                <div className="text-gray-900 text-base flex ">
                  <div className="flex flex-col items-center justify-center ">
                    <span className=" text-xl">26</span>
                    <span className=" text-xl">Jan</span>
                  </div>
                  <div className="bg-gray-500 w-[2px] h-15 mx-2 " />
                </div>
              </div>
              <div className="w-full flex items-center justify-between gap-y-2  ">
                <div>
                  <div className="flex items-center justify-start  ">
                    <Link
                      href={"/:intro-to-variables"}
                      className="text-md font-semibold capitalize text-black"
                    >
                      Intro to Variables
                    </Link>
                  </div>
                  <div className="flex items-center justify-start  ">
                    <p className="text-md font-semibold capitalize text-gray-600">
                      4:00 PM - 5:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p>Join Class</p>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl">
              <div className="px-1 py-4 flex items-start">
                <div className="text-gray-900 text-base flex ">
                  <div className="flex flex-col items-center justify-center ">
                    <span className=" text-xl">26</span>
                    <span className=" text-xl">Jan</span>
                  </div>
                  <div className="bg-gray-500 w-[2px] h-15 mx-2 " />
                </div>
              </div>
              <div className="w-full flex items-center justify-between gap-y-2  ">
                <div>
                  <div className="flex items-center justify-start  ">
                    <div className="text-md font-semibold capitalize text-black">
                      Intro to Variables
                    </div>
                  </div>
                  <div className="flex items-center justify-start  ">
                    <p className="text-md font-semibold capitalize text-gray-600">
                      4:00 PM - 5:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p>Join Class</p>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
            <div className="flex flex-start">
              <Link href={"/courses/:course-name/recordings"}>
                <div className="flex items-center">
                  <h1 className="text-lg p-1 font-semibold">
                    See All Classes and Recording
                  </h1>
                  <ChevronRight size={20} />
                </div>
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex flex-start">
              <h1 className="text-lg p-1 font-semibold">Course Modules</h1>
            </div>
            <Link
              href={"/courses/:course-name/:module-name"}
              className="bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  "
            >
              <div className="w-full flex items-center justify-between gap-y-2  ">
                <div className="flex gap-y-2 flex-col p-2  ">
                  <div className="flex items-center justify-start  ">
                    <div className="text-md font-semibold capitalize text-black">
                      Programming Basics 1
                    </div>
                  </div>
                  <div className="flex items-center justify-start  ">
                    <p className="text-md font-semibold capitalize text-gray-600">
                      Time Commitment: 2weeks
                    </p>
                  </div>
                </div>
                <div className="">
                  <CircularLoader />
                </div>
              </div>
            </Link>
            <Link
              href={"/courses/:course-name/:module-name"}
              className="bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  "
            >
              <div className="w-full flex items-center justify-between gap-y-2  ">
                <div className="flex gap-y-2 flex-col p-2  ">
                  <div className="flex items-center justify-start  ">
                    <div className="text-md font-semibold capitalize text-black">
                      Programming Basics 1
                    </div>
                  </div>
                  <div className="flex items-center justify-start  ">
                    <p className="text-md font-semibold capitalize text-gray-600">
                      Time Commitment: 2weeks
                    </p>
                  </div>
                </div>
                <div className="">
                  <CircularLoader />
                </div>
              </div>
            </Link>

            <div className="bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  ">
              <div className="w-full flex items-center justify-between gap-y-2  ">
                <div className="flex gap-y-2 flex-col p-2  ">
                  <div className="flex items-center justify-start  ">
                    <Link
                      href={"/"}
                      className="text-md font-semibold capitalize text-black"
                    >
                      Certificate
                    </Link>
                  </div>
                </div>
                <div className="flex items-center  justify-center">
                  <Lock size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-y-3 flex flex-col">
          <div className="flex flex-start">
            <h1 className="text-lg p-1 font-semibold">Instructor</h1>
          </div>
          <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl  ">
            <div className="flex flex-col items-center justify-center p-4 gap-3">
              <img
                src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="w-10 h-10 rounded-full "
              />
              <span className="text-lg font-semibold">Shilpa Mishra</span>
              <p>
                Ask doubts or general questions about the programs anytime and
                get answers within a few hours
              </p>
              <button className="bg-gray-300 px-4 py-2 rounded-lg mt-2 w-[200px] ">
                Start New Chat
              </button>
              <button className=" px-4 py-2 rounded-lg mt-2 w-[200px] ">
                View Past Chat
              </button>
            </div>
          </div>

          <div className="flex flex-start">
            <h1 className="text-lg p-1 font-semibold">Upcoming Assignments</h1>
          </div>
          <div>
            <div className="bg-gradient-to-bl mb-3 text-start p-5 from-blue-50 to-violet-50 rounded-xl  ">
              <Link
                href={"/"}
                className="text-md font-semibold capitalize text-black "
              >
                Intro to vairables
              </Link>

              <p className="text-md font-semibold capitalize text-gray-600 mt-2">
                Deadline 5 Feb 2024
              </p>
            </div>
            <div className="bg-gradient-to-bl mb-3 text-start p-5 from-blue-50 to-violet-50 rounded-xl  ">
              <Link
                href={"/"}
                className="text-md font-semibold capitalize text-black"
              >
                Intro to vairables
              </Link>
              <p className="text-md font-semibold capitalize text-gray-600 mt-2">
                Deadline 5 Feb 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default Page;
