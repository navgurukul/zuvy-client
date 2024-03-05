import { Copy } from "lucide-react";
import Link from "next/link";
import { title } from "process";
import React from "react";

type Props = {
  batchName: string;
  date1: number;
  month: string;
  topicTitle: string;
  classesTiming: string;
  typeClass: string;
};

function InstructorCard({
  batchName,
  date1,
  month,
  topicTitle,
  classesTiming,
  typeClass,
}: Props) {
  return (
    <div className=''>
      <div className='py-2'>
        <div className='bg-gray-200 rounded-lg border p-4'>
          <p className='bg-white rounded-xl w-2/3 p-1 text-sm'>{batchName}</p>
          <div className='px-1 py-4 m-2 flex h-2/3'>
            <div className=' flex flex-col font-semibold text-xl m-2'>
              <span>{date1}</span>
              <span>{month}</span>
            </div>
            <div className='h-200 w-[1px] bg-black' />
            <div className='px-3 flex flex-col  gap-y-3 '>
              <h1 className='font-semibold'>{topicTitle}</h1>
              <h1 className=''>{classesTiming}</h1>
              <Link className='font-semibold flex items-center ' href={""}>
                {typeClass} Class <Copy className='ml-3' size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorCard;
