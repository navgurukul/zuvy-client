import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import ClassCard from "./classCard";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import NewClassDialog from "./newClassDialog";

function LiveClass() {
  const [classType, setClassType] = useState("active");

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
        <Combobox data={data} title={"Select Batch"} />
        <Combobox data={data} title={"Select Module"} />
      </div>
      <div className="flex justify-between">
        <div className="w-[400px] pr-3">
          <Combobox data={data} title={"Search Classes"} />
        </div>
        <Dialog>
          <DialogTrigger>
            <Button className="text-white bg-secondary">
              {/* <Plus className="w-5 mr-2" /> */}
              <p>Creat New Class</p>
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
        <ClassCard />
        <ClassCard />
        <ClassCard />
        <ClassCard />
      </div>
    </div>
  );
}

export default LiveClass;
