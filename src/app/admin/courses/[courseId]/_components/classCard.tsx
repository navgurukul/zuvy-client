import { ChevronRight } from "lucide-react";
import React from "react";
import Moment from 'react-moment';

function ClassCard({ classData, classType }: { classData: any; classType: any }) {
  return (
    <div className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl">
      <div className="px-1 py-4 flex items-start">
        <div className="text-gray-900 text-base flex">
          <div className="flex flex-col items-center justify-center">
            <span className="text-xl"><Moment format="DD">{classData.startTime}</Moment></span>
            <span className="text-xl"><Moment format="MMM">{classData.startTime}</Moment></span>
          </div>
          <div className="bg-gray-500 w-[2px] h-15 mx-2" />
        </div>
      </div>
      <div className="w-full flex items-center justify-between gap-y-2">
        <div>
          <div className="flex items-center justify-start">
            <div className="text-md font-semibold capitalize text-black">{classData.title}</div>
          </div>
          <div className="flex items-center justify-start">
            <p className="text-md font-semibold capitalize text-gray-600">
              <Moment format="hh:mm">{classData.startTime}</Moment> - <Moment format="hh:mm">{classData.endTime}</Moment>
            </p>
          </div>
          {classType === "complete" && (
            <div>
              <p onClick={() => handleViewRecording(classData)}>View Recording</p>
            </div>
          )}
        </div>
        <div className="flex items-center">
          {classType !== "complete" && (
            <>
              <a href={classData.hangoutLink} target="_blank">Join Class</a>
              <ChevronRight size={20} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function handleViewRecording(classData: any) {
  console.log("View Recording clicked for class:", classData);
}

export default ClassCard;
