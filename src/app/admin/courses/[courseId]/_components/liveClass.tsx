import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import ClassCard from "./classCard";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import NewClassDialog from "./newClassDialog";
import api from "@/utils/axios.config";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import Moment from "react-moment";

function LiveClass() {
  const [classType, setClassType] = useState("active");
  const [allClasses, setAllClasses] = useState([]);
  const [bootCampIdInput, setBootCampIdInput] = useState("");

  useEffect(() => {
    api
      .post(`/classes/getClassesByBootcampId/${bootCampIdInput}`)
      .then((response) => {
        console.log(response);
        setAllClasses(response.data.classesLink);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [bootCampIdInput]);

  const handleClassType = (type: "active" | "complete") => {
    setClassType(type);
  };

  const handleBootCampIdInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setBootCampIdInput(event.target.value);
  };

  const data = [
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
  ];
  return (
    <div>
      <div className="flex gap-6 my-6 max-w-[800px]">
        <Combobox data={data} title={"Select Batch"} />
        <input
          type="text"
          placeholder="Enter BootCamp ID"
          value={bootCampIdInput}
          onChange={handleBootCampIdInputChange}
        />
        <Combobox data={data} title={"Select Module"} />
      </div>
      <div className="flex justify-between">
        <div className="w-[400px] pr-3">
          <Combobox data={data} title={"Search Classes"} />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-white bg-secondary">
              {/* <Plus className="w-5 mr-2" /> */}
              <p>Create New Class</p>
            </Button>
          </DialogTrigger>
          <DialogOverlay />
          <NewClassDialog />
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
          variant={classType === "complete" ? "default" : "outline"}
          onClick={() => handleClassType("complete")}
          className="rounded-md"
        >
          Completed Classes
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {allClasses && allClasses.length > 0 ? (
          allClasses.map((classData: any, index) => (
            <div
              key={index}
              className="bg-gradient-to-bl p-3 from-blue-50 to-violet-50 flex rounded-xl"
            >
              <div className="px-1 py-4 flex items-start">
                <div className="text-gray-900 text-base flex ">
                  <div className="flex flex-col items-center justify-center ">
                    <span className=" text-xl">
                      <Moment format="DD">{classData.startTime}</Moment>
                    </span>
                    <span className=" text-xl">
                      <Moment format="MMM">{classData.startTime}</Moment>
                    </span>
                  </div>
                  <div className="bg-gray-500 w-[2px] h-15 mx-2 " />
                </div>
              </div>
              <div className="w-full flex items-center justify-between gap-y-2">
                <div>
                  <div className="flex items-center justify-start">
                    <div className="text-md font-semibold capitalize text-black">
                      {classData.title}
                    </div>
                  </div>
                  <div className="flex items-center justify-start">
                    <p className="text-md font-semibold capitalize text-gray-600">
                      <Moment format="hh:mm">{classData.startTime}</Moment> -{" "}
                      <Moment format="hh:mm">{classData.endTime}</Moment>
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <a href={classData.hangoutLink}>Join Class</a>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No classes available.</p>
        )}
      </div>
    </div>
  );
}

export default LiveClass;
