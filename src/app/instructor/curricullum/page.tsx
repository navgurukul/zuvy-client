import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import React from "react";
import { Book, Clock } from "lucide-react";
import { FileText } from "lucide-react";
import CurricullumCard from "../_components/curricullumCard";

type Props = {};

function Curricullum({}: Props) {
  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='items-start w-2/5'>
        <h1 className='font-semibold text-xl text-start mb-2 '>
          Courses has 5 Modules
        </h1>
      </div>
      <CurricullumCard
        chapterTitle={"Module 1: Programming Basics 1"}
        chapterdescription={
          "Students learn basic concepts of programming and create their first program"
        }
        time={"2 weeks"}
        assignments={3}
        quiz={1}
      />
      <CurricullumCard
        chapterTitle={"Module 1: Programming Basics 1"}
        chapterdescription={
          "Students learn basic concepts of programming and create their first program"
        }
        time={"2 weeks"}
        assignments={3}
        quiz={1}
      />
      <CurricullumCard
        chapterTitle={"Module 1: Programming Basics 1"}
        chapterdescription={
          "Students learn basic concepts of programming and create their first program"
        }
        time={"2 weeks"}
        assignments={3}
        quiz={1}
      />
    </div>
  );
}

export default Curricullum;
