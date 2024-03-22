"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import DeleteConfirmationModal from "../../_components/deleteModal";
import { Button } from "@/components/ui/button";
import api from "@/utils/axios.config";
import { DropdownMenuDemo } from "../../_components/DropdownMenu";
import { Toast } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCourseData } from "@/store/store";
const Page = () => {
  // misc
  const router = useRouter();
  const { courseData } = getCourseData();

  // state and variables
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // async
  const handleDelete = async () => {
    try {
      await api.delete(`/bootcamp/${courseData?.id}`).then((res) => {
        toast({
          title: res.data.status,
          description: res.data.message,
          className: "text-start capitalize",
        });
      });
      router.push("/admin/courses");
    } catch (error: any) {
      toast({
        title: error.data.status,
        description: error.data.message,
        className: "text-start capitalize",
      });
      console.error("Error deleting:", error);
    }
    setDeleteModalOpen(false);
  };
  const handlePrivate = async (e: any) => {
    const transFormedObj = {
      type: `${e.target.value}`,
    };
    console.log(transFormedObj);
    try {
      await api
        .put(`/bootcamp/bootcampSetting/${courseData?.id}`, transFormedObj)
        .then((res) => {
          toast({
            title: res.data.status,
            description: res.data.message,
            className: "text-start capitalize",
          });
        });
    } catch (error: any) {
      toast({
        title: error.data.status,
        description: error.data.message,
        className: "text-start capitalize",
      });
    }
  };

  return (
    <div>
      <div className=' w-full text-start mb-5'>
        <div>
          <h1 className='text-lg font-semibold'>Course Type</h1>
          <div className='flex mt-2 flex-col gap-y-3 items-start'>
            <div className='flex items-center space-x-2'>
              <RadioGroup
                className='flex flex-col justify-start items-start '
                defaultValue='comfortable'
              >
                <div className='flex flex-col   space-x-2'>
                  <div className='flex gap-x-3'>
                    <RadioGroupItem
                      value='Private'
                      id='r2'
                      onClick={handlePrivate}
                    />
                    <Label htmlFor='r2'>Invite Only</Label>
                  </div>
                  <p>
                    The students will need to be added to the invite only
                    courses. They have access the courses without enrollement.
                  </p>
                </div>
                <div className='flex flex-col  space-x-2'>
                  <div className='flex gap-x-3'>
                    <RadioGroupItem
                      value='Public'
                      id='r3'
                      onClick={handlePrivate}
                    />
                    <Label htmlFor='r3'>Open</Label>
                  </div>
                  <p>
                    The students will need to be added to the invite only
                    courses. They have access the courses without enrollement.
                  </p>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <h1 className='text-lg font-semibold'>Course Status</h1>
        <p>
          This course has not been published yet. You will able to unpublish it
          at any time if new enrollments have to be stopped
        </p>
      </div>
      <div className='w-full text-start my-5'>
        <div className='mb-3 text-start'>
          <h1 className='text-lg font-semibold'>Permanant Deletion</h1>
          <p>
            Courses can only be deleted if they didn’t have any enrollment since
            the start
          </p>
        </div>
        <Button
          variant={"destructive"}
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete Course
        </Button>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          modalText='Are you sure you want to delete this Bootcamp?'
          buttonText='Delete Course'
          input={false}
          modalText2=''
          batchName=''
        />
      </div>
    </div>
  );
};

export default Page;