"use client";
import { ColumnDef } from "@tanstack/react-table";
import { StudentData } from "./students";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useStudentData } from "@/store/store";

const GetdataHandler = (id: number) => {
  const [bootcampData, setBootcampData] = useState<any[]>([]);
  const { anotherStudentState, setAnotherStudentState } = useStudentData();
  function onDeleteHandler(id: string) {
    console.log("HEllo from delete");
    const updatedData = anotherStudentState.filter(
      (students) => students.batchId !== id
    );
    setAnotherStudentState(updatedData);
  }
  // useEffect(() => {
  //   api
  //     .get(`/bootcamp/batches/${id}`)
  //     .then((response) => {
  //       const transformedData = response.data.map(
  //         (item: { id: any; name: any }) => ({
  //           value: item.id.toString(),
  //           label: item.name,
  //         })
  //       );

  //       setBootcampData(transformedData);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, [id]);

  return {
    bootcampData,
    onDeleteHandler,
    setAnotherStudentState,
  };
};

type Status = {
  value: string;
  label: string;
};

function ComboboxPopover({
  id,
  title,
  onChange,
  rowData, // Add a new prop for row data
}: {
  id: number;
  title: string;
  onChange: (selectedValue: string, rowData: any) => void; // Pass rowData to the onChange function
  rowData: any; // Define the type for rowData
}) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const { bootcampData } = GetdataHandler(id);

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selectedStatus ? <>{selectedStatus.label}</> : <>{title}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="flex ">
                {bootcampData.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      setSelectedStatus(
                        bootcampData.find(
                          (priority) => priority.value === value
                        ) || null
                      );
                      setOpen(false);
                      onChange(value, rowData); // Pass rowData to the onChange function
                    }}
                  >
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const columns: ColumnDef<StudentData>[] = [
  {
    header: "Profile Picture",
    accessorKey: "profilePicture",
    cell: ({ row }) => {
      const student = row.original;
      const profilePitcure = student.profilePicture;
      const ImageContainer = () => {
        return profilePitcure ? (
          <Image src={profilePitcure} alt="profilePic" height={50} width={50} />
        ) : (
          <Image
            src={"https://avatar.iran.liara.run/public/boy?username=Ash"}
            alt="profilePic"
            height={35}
            width={35}
            className="rounded-[50%] ml-2"
          />
        );
      };

      return ImageContainer();
    },
  },
  {
    header: "Students Name",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },

  {
    header: "Batch Asigned To",
    id: "batch",
    cell: ({ row }) => {
      const student = row.original;
      const title = student.batchName;

      return (
        <ComboboxPopover
          id={student.bootcampId}
          title={title}
          onChange={async function (selectedvalue, rowData) {
            await api
              .post(
                `/bootcamp/students/${student.bootcampId}?batch_id=${selectedvalue}`,
                {
                  students: [
                    {
                      email: student.email,
                      name: student.name,
                    },
                  ],
                }
              )
              .then((res) => {
                toast({
                  title: "Students Batch Updated Succesfully",

                  className: "text-start capitalize",
                });
              });

            // Now you have access to rowData
            // console.log("Row Data:", rowData);
          }}
          rowData={student} // Pass the row data
        />
      );
    },
  },

  {
    header: "Progress",
    accessorKey: "progress",
    cell: ({ row }) => {
      const student = row.original;
      //   console.log(student.progress);
      return (
        <div className="relative size-9">
          <svg
            className="size-full"
            width="24"
            height="24"
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-current text-gray-200 dark:text-gray-700"
              strokeWidth="2"
            ></circle>
            <g className="origin-center -rotate-90 transform">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-secondary dark:text-red-400"
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset={`${100 - student.progress}`}
              ></circle>
            </g>
          </svg>

          <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <span className="text-center text-md font-bold text-gray-800 dark:text-white">
              {student.progress}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      const { userId, bootcampId } = student;
      const { onDeleteHandler } = GetdataHandler(bootcampId);

      const deleteStudentHandler = async () => {
        try {
          await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
            onDeleteHandler(row.id);
            toast({
              title: res.data.status,
              description: res.data.message,
              className: "text-start capitalize",
            });
          });
        } catch (error) {
          toast({
            title: "Failed",
            variant: "destructive",
          });
        }
      };
      return (
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 className="text-red-600" size={20} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                student from this bootcamp
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600"
                onClick={deleteStudentHandler}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
