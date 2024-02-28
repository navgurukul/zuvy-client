"use client";
import React, { useEffect, useState } from "react";
import StudentsBatchTable from "./studentsBatchDataTable";
import { columns } from "./column";
import api from "@/utils/axios.config";
import { usePathname, useSearchParams } from "next/navigation";
import { useStudentData } from "@/store/store";
import { Input } from "@/components/ui/input";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Trash2 } from "lucide-react";
import { Pencil } from "lucide-react";
import { CalendarDays } from "lucide-react";
import { Hand } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";

type Props = {};
export type StudentData = {
  email: string;
  name: string;
  userId: string;
  bootcampId: number;
  batchName: string;
  batchId: number;
  progress: number;
  profilePicture: string;
  id: string;
};

const BatchesInfo = (props: Props) => {
  const { studentsInfo, setStudentsInfo } = useStudentData();

  const pathname = usePathname();
  const matches = pathname.match(/\/(\d+)\/(\d+)\/(\d+)/);
  const [studentsData, setStudentData] = useState<StudentData[]>([]);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");

  const crumbs = [
    {
      crumb: "My Courses",
      href: `/admin/courses/${
        studentsData.length > 0 ? studentsData[0].bootcampId : ""
      }`,
    },
    {
      crumb: `Batches`,
      href: `/admin/courses/${
        studentsData.length > 0 ? studentsData[0].bootcampId : ""
      }/${studentsData.length > 0 ? studentsData[0].batchId : ""}/${
        studentsData.length > 0 ? studentsData[0].batchId : ""
      }`,
    },
    {
      crumb: `${studentsData.length > 0 ? studentsData[0].batchName : ""}`,
      href: `/admin/courses/${
        studentsData.length > 0 ? studentsData[0].bootcampId : ""
      }/${studentsData.length > 0 ? studentsData[0].batchId : ""}/${
        studentsData.length > 0 ? studentsData[0].batchId : ""
      }`,
    },
  ];
  const formattedDate = `${year}-${month}-${day}`;
  useEffect(() => {
    const fetchBatchesInfo = async () => {
      try {
        if (matches) {
          const [firstValue, bootcampId, batchId] = matches;
          const response = await api.get(
            `/bootcamp/students/${bootcampId}?batch_id=${batchId}`
          );
          console.log(response.data);
          setStudentData(response.data.studentsEmails);
          setStudentsInfo(response.data.studentsEmails);
        }
      } catch (error) {}
    };
    fetchBatchesInfo();
  }, [matches, setStudentsInfo]);
  console.log(studentsData);

  return (
    <>
      <Breadcrumb crumbs={crumbs} />
      <MaxWidthWrapper className='p-4'>
        <div className='flex justify-between'>
          <div className='w-1/2 flex flex-col items-start '>
            <div className=''>
              <h1 className=' text-start text-[30px] font-semibold'>
                {studentsData.length > 0 ? studentsData[0].batchName : ""}
              </h1>
              <div className='flex w-full gap-3 items-center justify-center'>
                <p className='gap-x-3 flex text-sm font-normal'>
                  <CalendarDays />
                  {formattedDate}
                </p>
                <p className='gap-x-3 flex text-sm font-normal'>
                  <Hand />
                  Prajakta Kishori
                </p>
              </div>
            </div>
            <Input
              type='search'
              placeholder='Student Name, Email'
              className='w-1/2 my-12'
            />
          </div>
          <div className='flex m-4'>
            <div className='flex mx-4 text-sm'>
              <Pencil size={20} className='text-gray-500 mx-4' />
              <p>Edit Details</p>
            </div>
            <div className='flex text-sm'>
              <Trash2 size={20} className='text-red-500 mx-4' />
              <p className='text-red-500'>Delete</p>
            </div>
          </div>
        </div>
        <StudentsBatchTable columns={columns} data={studentsInfo} />
      </MaxWidthWrapper>
    </>
  );
};

export default BatchesInfo;
