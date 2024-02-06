import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { RootState, useAppSelector } from "@/redux/store/store";
import { Button } from "@/components/ui/button";

import DeleteConfirmationModal from "./deleteModal";
import api from "@/utils/axios.config";

type Props = {
  id: string;
};

const Settings = (props: Props) => {
  const router = useRouter();
  const courseID = props.id;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDelete = async () => {
    try {
      const response = await api.delete(`/bootcamp/${courseID}`);
      console.log(response.data);
      router.push("/admin/courses");
    } catch (error) {
      console.error("Error deleting:", error);
    }
    setDeleteModalOpen(false);
  };
  return (
    <div className='flex flex-col w-full gap-y-3 '>
      <div className=' w-full flex flex-col items-start'>
        <h1 className='font-semibold'>Course Status</h1>
        <p>
          This course has not been published yet. You will able to unpublish it
          at any time if new enrollments have to be stopped
        </p>
      </div>
      <div className='w-full flex flex-col items-start gap-y-2'>
        <h1 className='font-semibold'>Permanant Deletion</h1>
        <p>
          Courses can only be deleted if they didn’t have any enrollment since
          the start
        </p>
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
        />
      </div>
    </div>
  );
};

export default Settings;
