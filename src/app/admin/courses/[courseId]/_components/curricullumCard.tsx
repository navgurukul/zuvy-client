import { Clock1, Copy, FileText } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  index: number;
  name: string;
};

const CurricullumCard = ({ index, name }: Props) => {
  return (
    <div className='w-full flex items-center justify-between gap-y-2  '>
      <div className='flex gap-y-2 flex-col p-2  '>
        <div className='flex items-center justify-start  '>
          <div className='text-md font-semibold capitalize text-black'>
            {`Module ${index + 1}`} : {name}
          </div>
        </div>
        <p>
          Students learn basic concepts of programming and create their first
          program
        </p>
        <div className='flex  gap-x-4'>
          <div className='flex   items-center justify-start gap-x-2 '>
            <Clock1 size={15} />
            <p className='text-md font-semibold capitalize text-gray-600'>
              2 weeks
            </p>
          </div>
          <div className='flex  items-center justify-start gap-x-2 '>
            <Copy size={15} />
            <p className='text-md font-semibold capitalize text-gray-600'>
              4 assignments
            </p>
          </div>{" "}
          <div className='flex  items-center justify-start gap-x-2 '>
            <FileText size={15} />
            <p className='text-md font-semibold capitalize text-gray-600'>
              1 Quiz
            </p>
          </div>
        </div>
      </div>
      {/* <div className="">
                <CircularLoader />
              </div> */}
    </div>
  );
};

export default CurricullumCard;
