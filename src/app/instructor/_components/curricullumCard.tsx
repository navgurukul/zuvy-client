import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Book, Clock, FileText } from "lucide-react";
import React from "react";

type Props = {
  chapterTitle: string;
  chapterdescription: string;
  time: string;
  assignments: number;
  quiz: number;
};

export default function CurricullumCard({
  chapterTitle,
  chapterdescription,
  time,
  assignments,
  quiz,
}: Props) {
  return (
    <MaxWidthWrapper className='flex flex-col items-center '>
      <div className=' rounded-lg px-2 py-2 gap-y-2 '>
        <div className='bg-gray-200 rounded-lg px-5 py-6 gap-y-5'>
          <h1 className='text-start font-semibold'>{chapterTitle}</h1>
          <p>{chapterdescription}</p>
          <div className='flex justify-between w-2/3 p-5'>
            <span className='flex items-center'>
              <Clock size={15} className='mx-2' /> {time}
            </span>
            <span className='flex items-center'>
              <FileText size={15} className='mx-2' />
              {assignments} Assignments
            </span>{" "}
            <span className='flex items-center'>
              <Book size={15} className='mx-2' /> {quiz} Quiz
            </span>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
