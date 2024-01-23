"use client";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronLeft, ChevronsLeft, X } from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Loader from "../../_components/loader/Loader";
import Sidebar from "../../_components/sidebar/Sidebar";
type Props = {};

export default function Page({}: Props) {
  const [display, setDisplay] = useState<boolean>(false);
  const [position, setPosition] = useState("bottom");

  const [progress, setProgress] = useState(13);

  const onDisplayhandler = () => {
    setDisplay(!display);
  };
  const SidearPropObj = {
    Chapter1: "Video Intro to python",
    Chapter2: "Video Intro to variables",
    article: "Article What are constants ?",
    Quiz: "Quiz",
    codingProject: "Coding Project",
  };
  return (
    <div className="flex">
      <div>
        <div
          onClick={onDisplayhandler}
          className="flex flex-row justify-end p-3 items-center  hover:underline font-semibold cursor-pointer "
        >
          <ChevronLeft size={18} />
          <h1 className="text-black">{display ? "Hide" : "Unhide"}</h1>
        </div>
        {display && <Sidebar {...SidearPropObj} />}
      </div>
      <div className="flex flex-col mx-auto">
        <nav className="h-14 flex items-center justify-between z-10 sm:justify-between md:justify-between ">
          <X size={22} />
          <p className="font-semibold">
            Module:AFE + Navgurukul Coding Boocamp{" "}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="flex font-semibold ">
                English
                <ChevronDown />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={position}
                onValueChange={setPosition}
              >
                <DropdownMenuRadioItem value="top">
                  English
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="bottom">
                  Hindi
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="right">
                  German
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <article className="max-w-2xl mx-auto my-8 p-4">
          <AspectRatio ratio={4 / 3}>
            <img
              src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog Post Image"
              className="w-full h-auto mb-4 rounded"
            />
          </AspectRatio>

          <Loader />

          <p className="text-lg mb-4">
            When you will move forward in this course, you will find examples of
            python code in different ways. You have to run these examples on
            python shell.
          </p>
          <p className="text-lg mb-4">
            Vestibulum efficitur augue ut tristique hendrerit. Aenean auctor
            velit id justo hendrerit congue. Sed auctor mi id dui dictum, a
            fringilla odio maximus.
          </p>
          <p className="text-lg mb-4">
            Integer consectetur risus vel nisi volutpat, ut semper arcu lacinia.
            Sed ut dui vel libero luctus tristique a vel velit.
          </p>
        </article>
      </div>
    </div>
  );
}
