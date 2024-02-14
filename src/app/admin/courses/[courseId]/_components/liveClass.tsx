import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import ClassCard from "./classCard";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import NewClassDialog from "./newClassDialog";
import api from "@/utils/axios.config";

function LiveClass({ courseId }: { courseId: string }) {
  const [classType, setClassType] = useState("active");
  const [allClasses, setAllClasses] = useState([]);
  const [bootcampData, setBootcampData] = useState([]);

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
        console.error("Error fetching data:", error);
      });
  }, [courseId]);

  const handleClassType = (type: "active" | "complete") => {
    setClassType(type);
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
        <Combobox
          data={bootcampData}
          title={"Select Batch"}
          onChange={function (selectedValue: string): void {
            throw new Error("Function not implemented.");
          }}
        />

        <Combobox
          data={data}
          title={"Select Module"}
          onChange={function (selectedValue: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
      <div className="flex justify-between">
        <div className="w-[400px] pr-3">
          <Combobox
            data={data}
            title={"Search Classes"}
            onChange={function (selectedValue: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-white bg-secondary">
              {/* <Plus className="w-5 mr-2" /> */}
              <p>Create New Class</p>
            </Button>
          </DialogTrigger>
          <DialogOverlay />
          <NewClassDialog courseId={courseId} />
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
          allClasses.map((classData, index) => (
            <ClassCard classData={classData} key={index} />
          ))
        ) : (
          <p>No classes available.</p>
        )}
      </div>
    </div>
  );
}

export default LiveClass;
