import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import StudentSidebar from "./student-sidebar";
import { Bell, Menu, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileStudentSidebar from "./mobile-student-navbar";

const StudentNavbar = () => {
  return (
    <nav className="bg-muted">
      {/* <MaxWidthWrapper> */}
      <div className="flex items-center justify-between border-green-[#2f433a]">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger>
              <div className="bg-white p-4 rounded-r-lg">
                <Menu />
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[540px]">
              <StudentSidebar />
            </SheetContent>
          </Sheet>
          <Link href={"/"} className="flex z-40 ">
            <Image
              src={"/logo.PNG"}
              alt="logo"
              // className="py-2"
              width={"70"}
              height={"70"}
            />
          </Link>
        </div>
        <div className="mr-2 px-2">
          <div className="sm:items-center space-x-4 hidden md:flex">
            <Search />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="25"
              height="25"
              viewBox="0 0 48 48"
            >
              <path
                fill="#8c9eff"
                d="M40,12c0,0-4.585-3.588-10-4l-0.488,0.976C34.408,10.174,36.654,11.891,39,14c-4.045-2.065-8.039-4-15-4s-10.955,1.935-15,4c2.346-2.109,5.018-4.015,9.488-5.024L18,8c-5.681,0.537-10,4-10,4s-5.121,7.425-6,22c5.162,5.953,13,6,13,6l1.639-2.185C13.857,36.848,10.715,35.121,8,32c3.238,2.45,8.125,5,16,5s12.762-2.55,16-5c-2.715,3.121-5.857,4.848-8.639,5.815L33,40c0,0,7.838-0.047,13-6C45.121,19.425,40,12,40,12z M17.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C21,28.209,19.433,30,17.5,30z M30.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C34,28.209,32.433,30,30.5,30z"
              ></path>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="25"
              height="25"
              viewBox="0 0 48 48"
            >
              <path
                fill="#33d375"
                d="M33,8c0-2.209-1.791-4-4-4s-4,1.791-4,4c0,1.254,0,9.741,0,11c0,2.209,1.791,4,4,4s4-1.791,4-4	C33,17.741,33,9.254,33,8z"
              ></path>
              <path
                fill="#33d375"
                d="M43,19c0,2.209-1.791,4-4,4c-1.195,0-4,0-4,0s0-2.986,0-4c0-2.209,1.791-4,4-4S43,16.791,43,19z"
              ></path>
              <path
                fill="#40c4ff"
                d="M8,14c-2.209,0-4,1.791-4,4s1.791,4,4,4c1.254,0,9.741,0,11,0c2.209,0,4-1.791,4-4s-1.791-4-4-4	C17.741,14,9.254,14,8,14z"
              ></path>
              <path
                fill="#40c4ff"
                d="M19,4c2.209,0,4,1.791,4,4c0,1.195,0,4,0,4s-2.986,0-4,0c-2.209,0-4-1.791-4-4S16.791,4,19,4z"
              ></path>
              <path
                fill="#e91e63"
                d="M14,39.006C14,41.212,15.791,43,18,43s4-1.788,4-3.994c0-1.252,0-9.727,0-10.984	c0-2.206-1.791-3.994-4-3.994s-4,1.788-4,3.994C14,29.279,14,37.754,14,39.006z"
              ></path>
              <path
                fill="#e91e63"
                d="M4,28.022c0-2.206,1.791-3.994,4-3.994c1.195,0,4,0,4,0s0,2.981,0,3.994c0,2.206-1.791,3.994-4,3.994	S4,30.228,4,28.022z"
              ></path>
              <path
                fill="#ffc107"
                d="M39,33c2.209,0,4-1.791,4-4s-1.791-4-4-4c-1.254,0-9.741,0-11,0c-2.209,0-4,1.791-4,4s1.791,4,4,4	C29.258,33,37.746,33,39,33z"
              ></path>
              <path
                fill="#ffc107"
                d="M28,43c-2.209,0-4-1.791-4-4c0-1.195,0-4,0-4s2.986,0,4,0c2.209,0,4,1.791,4,4S30.209,43,28,43z"
              ></path>
            </svg>
            <Bell />
            <Link href="/profile">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>NAME</AvatarFallback>
              </Avatar>
            </Link>
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>NAME</AvatarFallback>
                </Avatar>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[540px]">
                <MobileStudentSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {/* </MaxWidthWrapper> */}
    </nav>
  );
};

export default StudentNavbar;
