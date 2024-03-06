import { ChevronRight } from "lucide-react";
import React from "react";
import Moment from 'react-moment';
import { toast } from "@/components/ui/use-toast";
import moment from "moment";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
function StudentClassCard({ classData, classType }: { classData: any; classType: any }) {
  const isVideo = classData.s3link
  const truncateStyle = {
    maxWidth: '20ch',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };
  
  const isToday = (startTime: any) => {
    const today = moment();
    const classStartTime = moment(startTime);

    return today.isSame(classStartTime, 'day');
  };


  const handleViewRecording = () => {
    if (isVideo) {
      window.open(classData.s3link);
    }
    else {
      toast({
        title: "Recording not yet updated",
        variant: "default",
        className: "text-start capitalize",
      });
    }
  };

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


            <div className={`text-md font-semibold capitalize text-black`}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger style={truncateStyle}>{classData.title}</TooltipTrigger>
                  <TooltipContent>
                    <p>{classData.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center justify-start">
            <p className="text-md font-semibold capitalize text-gray-600">
              <Moment format="hh:mm">{classData.startTime}</Moment> - <Moment format="hh:mm">{classData.endTime}</Moment>
            </p>
          </div>

        </div>
        <div className="flex items-center">
          {classType === "complete" && (
            <>
              <a href={classData.s3link} target="_blank">view</a>
              <ChevronRight size={20} />
            </>
          )}
          {classType !== "complete" && (
            <>
              {isToday(classData.startTime) ? (
                <>
                  <a href={classData.hangoutLink} target="_blank">Join Class</a>
                  <ChevronRight size={20} />
                </>
              ) : (
                <>
                <p>Available soon</p>
                </>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentClassCard;
