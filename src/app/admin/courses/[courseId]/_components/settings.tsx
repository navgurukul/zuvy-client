import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { RootState, useAppSelector } from "@/redux/store/store";
import { Button } from "@/components/ui/button";

import DeleteConfirmationModal from "./deleteModal";
import api from "@/utils/axios.config";

type Props = {};

const Settings = (props: Props) => {
  // misc
  const router = useRouter();
  const courseID = useAppSelector(
    (state: RootState) => state.saveUserReducer.courseID
  );

  // state and variables
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // async
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
    <div>
      <div className=" w-full text-start mb-5">
        <h1 className="text-lg font-semibold">Course Status</h1>
        <p>
          This course has not been published yet. You will able to unpublish it
          at any time if new enrollments have to be stopped
        </p>
      </div>
      <div className="w-full text-start my-5">
        <div className="mb-3 text-start">
          <h1 className="text-lg font-semibold">Permanant Deletion</h1>
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
        />
      </div>
    </div>
  );
};

export default Settings;
