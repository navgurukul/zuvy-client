import React from "react";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import styles from "./cources.module.css";

interface newCourseDialogProps {
  newCourseName: string;
  handleNewCourseNameChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleCreateCourse: () => void;
}

const NewCourseDialog: React.FC<newCourseDialogProps> = ({
  newCourseName,
  handleNewCourseNameChange,
  handleCreateCourse,
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className={styles.newCourse}>New Course</DialogTitle>
        <DialogDescription>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="name" className={styles.dialogname}>
              Course Name:
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter course name"
              className={styles.inputBox}
              value={newCourseName}
              onChange={handleNewCourseNameChange}
            />
          </div>
          <div className="text-end">
            <Button
              onClick={() => handleCreateCourse()}
              // className={styles.createCourseBtnDialog}
            >
              Create Course
            </Button>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
};

export default NewCourseDialog;
