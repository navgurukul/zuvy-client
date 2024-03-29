"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import ClassCard from "../../_components/classCard";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import NewClassDialog from "../../_components/newClassDialog";
import api from "@/utils/axios.config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { getCourseData } from "@/store/store";

function Page() {
  const [classType, setClassType] = useState("upcoming");
  const [allClasses, setAllClasses] = useState([]);
  const [bootcampData, setBootcampData] = useState([]);
  const [batchId, setBatchId] = useState(0);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [limit, setLimit] = useState(6);
  const [offset, setOffset] = useState(1);

  const { courseData } = getCourseData();

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };
  const isFutureDate = (date: any) => {
    const currentDate = new Date();
    return date >= currentDate;
  };

  const handleClassType = (type: string | "active" | "complete" | "upcoming") => {
    if (classType == type) {
      setOffset(offset)
    }
    else {
      setOffset(1)
    }
    setClassType(type);
  };

  const handleComboboxChange = (value: string) => {
    setBatchId((prevBatchId: number) =>
      prevBatchId.toString() === value ? 0 : parseInt(value)
    );
  };

 

  useEffect(() => {
    if (courseData?.id) {
      api
        .get(`/bootcamp/batches/${courseData?.id}`)
        .then((response) => {
          const transformedData = response.data.data.map(
            (item: { id: any; name: any }) => ({
              value: item.id.toString(),
              label: item.name,
            })
          );

          setBootcampData(transformedData);
        })
        .catch((error) => {
          console.log("Error fetching data:", error);
        });
    }
  }, [courseData]);

  useEffect(() => {
    if (classType === "active") {
      setAllClasses(ongoingClasses);
    } else if (classType === "complete") {
      setAllClasses(completedClasses);
    } else if (classType === "upcoming") {
      setAllClasses(upcomingClasses);
    }
  }, [classType, ongoingClasses, completedClasses, upcomingClasses]);

  useEffect(() => {
    let fetchId;
    let fetchUrl;
    if (!batchId) {
      fetchId = courseData?.id;
      fetchUrl = "getClassesByBootcampId";
    } else {
      fetchId = batchId;
      fetchUrl = "getClassesByBatchId";
    }

    if (courseData?.id) {
      api
        .get(`/classes/${fetchUrl}/${fetchId}?offset=${offset}&limit=${limit}`)
        .then((response) => {
          setUpcomingClasses(response.data.upcomingClasses);
          setOngoingClasses(response.data.ongoingClasses);
          setCompletedClasses(response.data.completedClasses);
          handleClassType(classType);
        })
        .catch((error) => {
          console.log("Error fetching classes:", error);
        });
    }
  }, [courseData, batchId, classType, offset, limit]);

  return (
    <div>
      <div className=" relative flex text-start gap-6 my-6 max-w-[800px]">
        <Combobox
          data={bootcampData}
          title={"Select Batch"}
          onChange={handleComboboxChange}
        />
        <Combobox
          data={[]}
          title={"Select Module"}
          onChange={function (selectedValue: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
      <div className="flex justify-between">
        <div className="w-[400px] pr-3">
          <Input
            type="text"
            placeholder="Search Classes"
            className="max-w-[500px]"
            disabled
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-white bg-secondary">
              <p>Create New Class</p>
            </Button>
          </DialogTrigger>
          <DialogOverlay />
          <NewClassDialog courseId={courseData?.id || 0} bootcampData={bootcampData} />
        </Dialog>
      </div>
      <div className="flex justify-start gap-6 my-6">
        <Badge
          variant={classType === "active" ? "default" : "outline"}
          onClick={() => handleClassType("active")}
          className="rounded-md"
        >
          Active Classes
        </Badge>
        <Badge
          variant={classType === "upcoming" ? "default" : "outline"}
          onClick={() => handleClassType("upcoming")}
          className="rounded-md"
        >
          Upcoming Classes
        </Badge>
        <Badge
          variant={classType === "complete" ? "default" : "outline"}
          onClick={() => handleClassType("complete")}
          className="rounded-md"
        >
          Completed Classes
        </Badge>
      </div>
      {allClasses && allClasses.length > 0 ? (
  <div className="grid grid-cols-3 gap-6">
    {allClasses.map((classData: any, index: any) => (
      <ClassCard
        classData={classData}
        key={index}
        classType={classType}
      />
    ))}
   <div className="flex justify-center items-center my-4 col-span-3">
      <Button onClick={() => { setOffset(offset - 1) }} disabled={offset === 1}>Previous</Button>
      <h1 className="mx-4">{offset}</h1>
      <Button onClick={() => { setOffset(offset + 1) }} disabled={allClasses.length < limit}>Next</Button>
    </div>
  </div>
      ) : (
        <div className="w-full flex mb-10 items-center flex-col gap-y-3 justify-center  absolute text-center mt-2">
          <Image
            src={"/emptyStates/undraw_online_learning_re_qw08.svg"}
            height={200}
            width={200}
            alt="batchEmpty State"
          />
          <p>
            Create a session to start engagement with the learners for course
            lessons or doubts
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-white bg-secondary">
                <span>+ Create Session</span>
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <NewClassDialog
              courseId={courseData?.id || 0}
              bootcampData={bootcampData}
            />
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default Page;
