import React, { useState } from "react";
import { useRouter } from "next/navigation";

import DeleteConfirmationModal from "./deleteModal";
import { Button } from "@/components/ui/button";
import api from "@/utils/axios.config";
import { DropdownMenuDemo } from "./DropdownMenu";

const Settings = ({ courseId }: { courseId: string }) => {
  // misc
  const router = useRouter();

  // state and variables
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // async
  const handleDelete = async () => {
    try {
      const response = await api.delete(`/bootcamp/${courseId}`);
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
          modalText="Are you sure you want to delete this project?"
          buttonText="Delete Course"
        />
      </div>
    </div>
  );
};

export default Settings;
