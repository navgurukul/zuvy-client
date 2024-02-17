"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/axios.config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLazyLoadedStudentData } from "@/store/store";
// Define the type for module data
interface ModuleDataItem {
  id: number;
  label: string;
  name?: string;
  content?: string;
  questions?: Question[];
}
interface Question {
  id: number;
  question: string;
  options: Option[];
}
interface Option {
  text: string;
  correct: boolean;
  number: number;
}
// Create a component to render the HTML content with Tailwind CSS styles applied
const ContentComponent: React.FC<{ content: any; isQuiz?: boolean }> = ({
  content,
  isQuiz,
}) => {
  // Remove inline styles for quiz questions as it has text color white:-
  const sanitizedContent = isQuiz
    ? content.replace(/style=".*?"/g, "")
    : content;
  return (
    <div className={`max-w-3xl mx-auto p-4 ${isQuiz ? "text-black" : ""}`}>
      {/* Render the HTML content */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
};

function Page({
  params,
}: {
  params: { viewcourses: string; moduleId: string };
}) {
  const moduleID = params.moduleId;
  const { studentData } = useLazyLoadedStudentData();
  // Use optional chaining to handle null or undefined
  const id = studentData?.id;
  console.log(id);

  const [moduleData, setModuleData] = useState<ModuleDataItem[]>([]);
  const [selectedModuleID, setSelectedModuleID] = useState<number | null>(null);
  const [assignmentLink, setAssignmentLink] = useState("");
  const [assignmentId, setAssignmentId] = useState(0);

  useEffect(() => {
    const getModuleData = async () => {
      try {
        const response = await api.get(`/Content/chapter/${moduleID}`);
        const data: ModuleDataItem[] = response.data;
        const assignmentItem = data.find(
          (item: ModuleDataItem) => item.label === "assignment"
        ); // Explicitly define the type of 'item'
        if (assignmentItem) {
          setAssignmentId(assignmentItem.id);
        }
        console.log(response.data);
        setModuleData(data);
      } catch (error) {
        console.error("Error fetching module data:", error);
      }
    };
    getModuleData();
  }, [moduleID]);

  const handleAssignmentLinkChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssignmentLink(event.target.value);
  };

  const handleAssignmentSubmit = async () => {
    console.log(id);
    try {
      if (id !== null && id !== undefined) {
        const response = await api.post("/tracking/assignment", {
          userId: id,
          assignmentId: assignmentId,
          moduleID: moduleID,
          projectUrl: assignmentLink,
        });

        // Handle the response data
        const data = response.data;
        console.log(data);
      } else {
        console.error("User id is null or undefined");
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar with labels */}
      <div className="w-1/4 border-r-2 text-left p-4">
        <h4 className="text-lg font-bold mb-2">Chapter List</h4>
        <ul>
          {moduleData.map((item, index) => (
            <li
              key={index}
              className={`cursor-pointer capitalize py-2 px-4 hover:bg-gray-300 ${
                selectedModuleID === item.id ? "font-bold" : ""
              }`}
              onClick={() => setSelectedModuleID(item.id)}
            >
              {`${item.label}: ${item.name ? item.name : "No name"}`}
              {/* Show the number of questions for Quiz and MCQ */}
              {["quiz"].includes(item.label) && (
                <span className="text-sm ml-2 text-gray-500">
                  ({item.questions ? item.questions.length : 0} questions)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Right side content */}
      <div className="w-3/4 p-4">
        <h2 className="text-lg font-semibold mb-2">{moduleID}</h2>
        {selectedModuleID &&
          moduleData
            .filter((item) => item.id === selectedModuleID)
            .map((item, index) => (
              <div key={index}>
                {/* Render different types of content based on label */}
                {item.label === "article" && item.content && (
                  <ContentComponent content={item.content} />
                )}
                {item.label === "assignment" && (
                  <div>
                    <ContentComponent content={item.content} />
                    {/* Only render form if label is "assignment" */}
                    <form onSubmit={handleAssignmentSubmit}>
                      <input
                        type="text"
                        placeholder="Assignment Link"
                        value={assignmentLink}
                        onChange={handleAssignmentLinkChange}
                      />
                      <button type="submit">Submit</button>
                    </form>
                  </div>
                )}
                {item.label === "quiz" && (
                  <div>
                    <h3 className="font-semibold">Quiz</h3>
                    <ul>
                      {item.questions &&
                        item.questions.map((question) => (
                          <li key={question.id}>
                            <ContentComponent
                              content={question.question}
                              isQuiz={true}
                            />
                            {/* Assuming each question has options */}
                            <RadioGroup
                              onValueChange={(value) =>
                                console.log("Selected option:", value)
                              }
                              className="flex"
                            >
                              {question.options.map((option) => (
                                <div
                                  key={option.number}
                                  className={
                                    option.correct ? "text-green-500" : ""
                                  }
                                >
                                  <RadioGroupItem
                                    value={option.text}
                                    className="mr-2"
                                  />
                                  <label>{option.text}</label>
                                </div>
                              ))}
                            </RadioGroup>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}

export default Page;
