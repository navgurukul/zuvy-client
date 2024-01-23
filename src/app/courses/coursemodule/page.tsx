"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    <div>
      <div className='h-14 flex items-center justify-between z-10 '>
        <X size={22} />
        <p className='font-semibold'>Module:AFE + Navgurukul Coding Boocamp </p>
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
              <DropdownMenuRadioItem value='top'>English</DropdownMenuRadioItem>
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
      <div className='w-[1000px] mx-auto '>
        <div className='flex flex-start p-4'>
          <h1 className='font-semibold'>Intro To python</h1>
        </div>

        <AspectRatio ratio={4 / 3}>
          <img
            src='https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt='Image'
            className='rounded object-cover '
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
  );
}

export default CourseModule;
