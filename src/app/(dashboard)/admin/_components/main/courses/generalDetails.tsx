import React, { useState } from "react";
import styles from "./cources.module.css";
import { Input } from "@/components/ui/input";

const GeneralDetails: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [courseData, setCourseData] = useState({
    courseName: "",
    topic: "",
    courseDescription: "",
  });

  const handleDurationChange = (months: number) => {
    setDuration(months);
  };

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCourseData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
        //TODO: CHANGE THIS END POINT TO THE ORIGINAL ONE
      const response = await fetch("API_ENDPOINT_FOR_POSTING_GENERAL_DETAILS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...courseData,
          duration,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      console.log("Changes saved successfully");
      setCourseData({
        courseName: "",
        topic: "",
        courseDescription: "",
      });
      setDuration(null);
      setLanguage(null);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <div className={styles.centeredContainer}>
      <img
        src="https://t4.ftcdn.net/jpg/03/78/40/11/360_F_378401105_9LAka9cRxk5Ey2wwanxrLTFCN1U51DL0.jpg"
        alt="Course Image"
        className={styles.courseImage}
      />

      <button type="submit" className={styles.uploadImageButton}>
        Upload course Image
      </button>

      <div className={styles.labelInputContainer}>
        <label htmlFor="courseName" className={styles.label}>
          Name:
        </label>
        <Input
          type="text"
          id="courseName"
          placeholder="Enter course name"
          name="courseName"
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label htmlFor="topic" className={styles.label}>
          Topic:
        </label>
        <Input
          type="text"
          id="topic"
          placeholder="Enter topic"
          name="topic"
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label htmlFor="courseDescription" className={styles.label}>
          Course Description:
        </label>
        <textarea
          id="courseDescription"
          placeholder="Enter course description"
          className={styles.textBox}
          name="courseDescription"
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.labelInputContainer}>
        <label htmlFor="duration" className={styles.label}>
          Duration (in months):
        </label>

        <div className={styles.durationButtons}>
          <button
            onClick={() => handleDurationChange(6)}
            className={`${styles.durationButton} ${
              duration === 6 ? styles.active : ""
            }`}
          >
            6
          </button>
          <button
            onClick={() => handleDurationChange(12)}
            className={`${styles.durationButton} ${
              duration === 12 ? styles.active : ""
            }`}
          >
            12
          </button>
          <button
            onClick={() => handleDurationChange(18)}
            className={`${styles.durationButton} ${
              duration === 18 ? styles.active : ""
            }`}
          >
            18
          </button>
        </div>
      </div>

      <div className={styles.labelInputContainer}>
        <label className={styles.label}>Language:</label>
        <div>
          <div className={styles.languageButtons}>
            <button
              onClick={() => handleLanguageChange("Hindi")}
              className={`${styles.languageButton} ${
                language === "Hindi" ? styles.active : ""
              }`}
            >
              Hindi
            </button>
            <button
              onClick={() => handleLanguageChange("English")}
              className={`${styles.languageButton} ${
                language === "English" ? styles.active : ""
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange("Kannada")}
              className={`${styles.languageButton} ${
                language === "Kannada" ? styles.active : ""
              }`}
            >
              Kannada
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSaveChanges} className={styles.saveChangesButton}>
        Save Changes
      </button>
    </div>
  );
};

export default GeneralDetails;
