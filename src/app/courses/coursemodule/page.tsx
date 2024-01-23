"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Wallet,
  Newspaper,
  BellRing,
  Paperclip,
  Brush,
  Wrench,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Props = {};

function CourseModule({}: Props) {
  const [position, setPosition] = useState("bottom");
  const [progress, setProgress] = useState(13);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className='flex gap-y-2 '>
      <aside className='flex h-screen w-64 flex-col overflow-y-auto border-r bg-white px-3 py-5 z-100 relative '>
        <div className='mt-6 flex flex-1 flex-col justify-between absolute '>
          <nav className='-mx-3 space-y-6 '>
            <div className='space-y-2 '>
              <label className='px-3 flex flex-start text-sm font-semibold uppercase text-black'>
                Chapter List
              </label>
              <a
                className='flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700'
                href='#'
              >
                <span className='mx-2 text-sm font-medium'>
                  Video Intro to python
                </span>
              </a>
              <a
                className='flex transform items-center rounded-lg px-2 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700'
                href='#'
              >
                <span className='mx-2 text-sm font-medium'>
                  Video Intro to Variables
                </span>
              </a>
              <a
                className='flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700'
                href='#'
              >
                <span className='mx-2 text-sm font-medium'>
                  Article:What are constants?
                </span>
              </a>
              <a
                className='flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700'
                href='#'
              >
                <span className='mx-2 text-sm font-medium'>
                  Quiz 10 Questoins{" "}
                </span>
              </a>
              <a
                className='flex transform items-center rounded-lg px-3 py-2  transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700'
                href='#'
              >
                <span className='mx-2 text-sm font-medium'>Coding Project</span>
              </a>
            </div>
          </nav>
        </div>
      </aside>

      <div>
        <div className='h-14 flex items-center justify-between z-10 sm:justify-between md:justify-between '>
          <X size={22} />
          <p className='font-semibold'>
            Module:AFE + Navgurukul Coding Boocamp{" "}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant='secondary'>
                English
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={position}
                onValueChange={setPosition}
              >
                <DropdownMenuRadioItem value='top'>
                  English
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value='bottom'>
                  Hindi
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value='right'>
                  German
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='w-[1000px] mx-auto px-7'>
          <div className='flex flex-start p-4'>
            <h1 className='font-semibold'>Intro To python</h1>
          </div>

          <AspectRatio ratio={4 / 3}>
            <img
              src='https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              alt='Image'
              className='h-auto max-w-full'
            />
          </AspectRatio>
          <Progress value={progress} className='w-[100%] bg-gray-500 ' />
          <article className='p-6 text-base bg-white rounded-lg dark:bg-gray-900  w-1/2 flex flex-col  '>
            <span className='text-black flex flex-start font-semibold py-4 '>
              Related Discussion
            </span>
            <footer className='flex justify-between items-center mb-2'>
              <div className='flex items-center'>
                <p className='inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold'>
                  <img
                    className='mr-2 w-6 h-6 rounded-full'
                    src='https://flowbite.com/docs/images/people/profile-picture-2.jpg'
                    alt='Michael Gough'
                  />
                  Username
                </p>
              </div>
            </footer>
            <p className='text-black'>
              Post description of something about the video Post description of
              something about the video Post description of something about the
              video Post description of something about the video
            </p>
            <div className='flex items-center mt-4 space-x-4'>
              <button
                type='button'
                className='flex items-center text-sm text-black hover:underline  font-medium'
              >
                Reply
              </button>
              <button
                type='button'
                className='flex items-center text-sm text-black hover:underline  font-medium'
              >
                See 15 comments
              </button>
            </div>
          </article>
          <article className='p-6 text-base bg-white rounded-lg dark:bg-gray-900  w-1/2 flex flex-col  '>
            <span className='text-black flex flex-start font-semibold py-4 '>
              Related Discussion
            </span>
            <footer className='flex justify-between items-center mb-2'>
              <div className='flex items-center'>
                <p className='inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold'>
                  <img
                    className='mr-2 w-6 h-6 rounded-full'
                    src='https://flowbite.com/docs/images/people/profile-picture-2.jpg'
                    alt='Michael Gough'
                  />
                  Username
                </p>
              </div>
            </footer>
            <p className='text-black'>
              Post description of something about the video Post description of
              something about the video Post description of something about the
              video Post description of something about the video
            </p>
            <div className='flex items-center mt-4 space-x-4'>
              <button
                type='button'
                className='flex items-center text-sm text-black hover:underline  font-medium'
              >
                Reply
              </button>
              <button
                type='button'
                className='flex items-center text-sm text-black hover:underline  font-medium'
              >
                See 15 comments
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default CourseModule;
