"use client";
import { ColumnDef } from "@tanstack/react-table";
import { StudentData } from "./students";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/utils/axios.config";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
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
import DeleteConfirmationModal from "./deleteModal";

type Status = {
  value: string;
  label: string;
};

export function GetdataHandler({ params }: { params: { courseId: number } }) {
  const [bootcampData, setBootcampData] = useState<any[]>([]);
  const { anotherStudentState, setAnotherStudentState } = useStudentData();
  const [isStudentDataUpdated, setIsStudentDataUpdated] = useState(1);

  function onDeleteHandler(id: string) {
    console.log("HEllo from delete");
    const updatedData = anotherStudentState.filter(
      (students) => students.batchId !== id
    );

    setAnotherStudentState(updatedData);
    console.log(updatedData, "updatedData");
    setIsStudentDataUpdated(2);
  }

  useEffect(() => {
    api
      .get(`/bootcamp/batches/${params.courseId}`)
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
  }, [isStudentDataUpdated, params.courseId]);

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

  return {
    onDeleteHandler,
    ComboboxPopover,
    setIsStudentDataUpdated,
    isStudentDataUpdated,
  };
}

export const columns: ColumnDef<StudentData>[] = [
  {
    header: "Students Name",
    accessorKey: "name",
    cell: ({ row }) => {
      const student = row.original;
      const profilePitcure = student.profilePicture;
      const ImageContainer = () => {
        return profilePitcure ? (
          <Image
            src={profilePitcure}
            alt="profilePic"
            height={30}
            width={30}
            className="rounded-full ml-2"
          />
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

      return (
        <div className="flex items-center">
          {ImageContainer()}
          <span className="ml-2">{student.name}</span>
        </div>
      );
    },
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
      const { ComboboxPopover } = GetdataHandler({
        params: { courseId: student.bootcampId },
      });

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

                const { setIsStudentDataUpdated, isStudentDataUpdated } =
                  GetdataHandler({
                    params: { courseId: student.bootcampId },
                  });
                setIsStudentDataUpdated(isStudentDataUpdated == 1 ? 2 : 1);
              });
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
      const { onDeleteHandler } = GetdataHandler({
        params: { courseId: bootcampId },
      });
      const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

      const deleteStudentHandler = async () => {
        try {
          await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
            // onDeleteHandler(row.id);
            toast({
              title: res.data.status,
              description: res.data.message,
              className: "text-start capitalize",
            });
          });
          const { setIsStudentDataUpdated, isStudentDataUpdated } =
            GetdataHandler({
              params: { courseId: student.bootcampId },
            });
          setIsStudentDataUpdated(isStudentDataUpdated == 1 ? 2 : 1);
        } catch (error) {
          toast({
            title: "Failed",
            variant: "destructive",
          });
        }
        setDeleteModalOpen(false);
      };

      return (
        <>
          <Trash2
            onClick={() => setDeleteModalOpen(true)}
            className="text-red-600 cursor-pointer"
            size={20}
          />
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={deleteStudentHandler}
            modalText="This action cannot be undone. This will permanently delete the student from this bootcamp"
            buttonText="Delete Course"
          />
        </>
      );
    },
  },
];
