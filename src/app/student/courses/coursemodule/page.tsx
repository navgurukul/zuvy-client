"use client";
import React, { useState } from "react";
import Sidebar from "../_components/Sidebar";
import { ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Loader from "../_components/Loader";

type Props = {};

function Page({}: Props) {
  const [display, setDisplay] = useState(true);
  const sidebarObjProps = {
    Chapter1: "Intro to python",
    Chapter2: "Intro to variables",
    article: "Article",
    Quiz: "Complete the Quiz",
    codingProject: "Coding Projext",
  };

  return (
    <div className='flex'>
      <div>
        <button
          onClick={() => setDisplay(!display)}
          className='flex  items-center   font-semibold '
        >
          <ChevronLeft size={20} />
          {display ? "Hide" : "Unhide"}
        </button>
        {display && <Sidebar {...sidebarObjProps} />}
      </div>
      <div className=' flex max-w-xxl mx-auto bg-white rounded-xl overflow-hidden shadow-md'>
        {/* Image */}
        <div>
          <img
            className=' h-100 object-cover my-5'
            src='https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt='Kitten'
          />
          <Loader />

          <div className='p-2'>
            <h2 className='font-bold text-xl mb-2'>intro to Python</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
