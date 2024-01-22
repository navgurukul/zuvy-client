import React, { useState } from "react";
import styles from "./cources.module.css";
import Batches from "./batches";
import GeneralDetails from "./generalDetails";
interface CourseDetailsProps {

}

const CourseDetails: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"generalDetails" | "batches" | "curriculum" | "certificates">("generalDetails");


  const handleFilterClick = (filter: "generalDetails" | "batches" | "curriculum" | "certificates") => {
    setActiveFilter(filter);
  };

  return (
    <div>
      <div className={styles.bootcampName}>Courses / AFE Bootcamp</div>
      <h1 className={styles.bootcampHeading}>
   AFE Bootcamp
      </h1>
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <span
            className={activeFilter === "generalDetails" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("generalDetails")}
          >
            General Details
          </span>
          <span
            className={activeFilter === "batches" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("batches")}
          >
            Batches
          </span>
          <span
            className={activeFilter === "curriculum" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("curriculum")}
          >
            Curriculum
          </span>
          <span
            className={activeFilter === "certificates" ? `${styles.active}` : ""}
            onClick={() => handleFilterClick("certificates")}
          >
            Certificates
          </span>
        </div>
      </div>
      <hr className={styles.hrLine}/>
      {activeFilter === "generalDetails" && (
      <div>
        <GeneralDetails/>

      </div>
      )}
      {activeFilter === "batches" && (
        <div>
          <Batches/>
          </div>
      )}
    </div>
  );
};

export default CourseDetails;
