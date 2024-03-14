import { ChevronRight, Clock3 } from "lucide-react";
import React from "react";
import Moment from "react-moment";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
function ClassCard({
  classData,
  classType,
}: {
  classData: any;
  classType: any;
}) {
  const isVideo = classData.s3link;

  const handleViewRecording = () => {
    if (isVideo) {
      window.open(classData.s3link, "_blank");
    } else {
      toast({
        title: "Recording not yet updated",
        variant: "default",
        className: "text-start capitalize",
      });
    }
  };

  return (
    <Card className="w-full p-6" key={classData.id}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-lg flex flex-col">
            <Moment format="DD">{classData.startTime}</Moment>{" "}
            <Moment format="MMM">{classData.startTime}</Moment>
          </div>
          <Separator
            orientation="vertical"
            className="bg-foreground h-[90px]"
          />
          <div className="text-start">
            {classType === "ongoing" ? (
              <Badge variant="yellow" className="mb-3">
                Ongoing
              </Badge>
            ) : null}
            <h3 className="text-xl font-bold mb-3">{classData.title}</h3>
            <div className="text-md flex font-semibold capitalize items-center">
              <Clock3 className="mr-2" width={20} height={20} />
              <Moment format="hh:mm A">{classData.startTime}</Moment>
              <p className="mx-2">-</p>
              <Moment format="hh:mm A">{classData.endTime}</Moment>
            </div>
          </div>
        </div>
        <div className="flex items-center text-lg font-bold">
          {classType !== "complete" ? (
            <Link
              target="_blank"
              href={classData.hangoutLink}
              className="gap-3 flex items-center text-secondary"
            >
              <p>Join Class</p>
              <ChevronRight size={15} />
            </Link>
          ) : (
            <div
              onClick={handleViewRecording}
              className="gap-3 flex items-center text-secondary cursor-pointer"
            >
              <p>Watch</p>
              <ChevronRight size={15} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ClassCard;
