import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import ClassCard from "./classCard";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import NewClassDialog from "./newClassDialog";
import api from "@/utils/axios.config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LiveClassEmptyState from "../../../../../../public/emptyStates/liveClassEmptyState";
import Image from "next/image";

function LiveClass({ courseId }: { courseId: string }) {
  // state and variables
  const [classType, setClassType] = useState("upcoming");
  const [allClasses, setAllClasses] = useState([]);
  const [bootcampData, setBootcampData] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [completedClasses, setCompletedClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // func

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
  };
  const isFutureDate = (date: any) => {
    const currentDate = new Date();
    return date >= currentDate;
  };

  const handleClassType = (
    type: string | "active" | "complete" | "upcoming"
  ) => {
    setClassType(type);
  };

  const handleComboboxChange = (value: string) => {
    setBatchId((prevBatchId: string) => (prevBatchId === value ? "" : value));
  };

  // async
  useEffect(() => {
    api
      .get(`/bootcamp/batches/${courseId}`)
      .then((response) => {
        const transformedData = response.data.map(
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
  }, [courseId]);

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
      fetchId = courseId;
      fetchUrl = "getClassesByBootcampId";
    } else {
      fetchId = batchId;
      fetchUrl = "getClassesByBatchId";
    }

    api
      .get(`/classes/${fetchUrl}/${fetchId}`)
      .then((response) => {
        setUpcomingClasses(response.data.upcomingClasses);
        setOngoingClasses(response.data.ongoingClasses);
        setCompletedClasses(response.data.completedClasses);
        handleClassType(classType);
      })
      .catch((error) => {
        console.log("Error fetching classes:", error);
      });
  }, [courseId, batchId]);

  return (
    <div>
      <div className=' relative flex text-start gap-6 my-6 max-w-[800px]'>
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
      <div className='flex justify-between'>
        <div className='w-[400px] pr-3'>
          <Input
            type='text'
            placeholder='Search Classes'
            // className={styles.searchInput}
            className='max-w-[500px]'
            disabled
            //  value={searchQuery}
            //  onChange={handleSearchChange}
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className='text-white bg-secondary'>
              <p>Create New Class</p>
            </Button>
          </DialogTrigger>
          <DialogOverlay />
          <NewClassDialog courseId={courseId} />
        </Dialog>
      </div>
      <div className='flex justify-start gap-6 my-6'>
        <Badge
          variant={classType === "active" ? "default" : "outline"}
          onClick={() => handleClassType("active")}
          className='rounded-md'
        >
          Active Classes
        </Badge>
        <Badge
          variant={classType === "upcoming" ? "default" : "outline"}
          onClick={() => handleClassType("upcoming")}
          className='rounded-md'
        >
          Upcoming Classes
        </Badge>
        <Badge
          variant={classType === "complete" ? "default" : "outline"}
          onClick={() => handleClassType("complete")}
          className='rounded-md'
        >
          Completed Classes
        </Badge>
      </div>
      {allClasses && allClasses.length > 0 ? (
        <div className='grid grid-cols-3 gap-6'>
          {allClasses.map((classData: any, index: any) => (
            <ClassCard
              classData={classData}
              key={index}
              classType={classType}
            />
          ))}
        </div>
      ) : (
        <div className='w-full flex mb-10 items-center flex-col gap-y-3 justify-center  absolute text-center mt-2'>
          <Image
            src={"/emptyStates/undraw_online_learning_re_qw08.svg"}
            height={200}
            width={200}
            alt='batchEmpty State'
          />
          <p>
            Create a session to start engagement with the learners for course
            lessons or doubts
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className='text-white bg-secondary'>
                <span>+ Create Session</span>
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <NewClassDialog courseId={courseId} />
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default LiveClass;
