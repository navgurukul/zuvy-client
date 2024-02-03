import { ChevronRight } from "lucide-react";
import React from "react";

function ClassCard() {
  return (
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
            <div
              //   href={"/:intro-to-variables"}
              className="text-md font-semibold capitalize text-black"
            >
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
  );
}

export default ClassCard;
