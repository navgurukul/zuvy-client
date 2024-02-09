"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import api from "@/utils/axios.config";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { moduleId: string } }) {
  // state and variables
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState("");

  const handleActiveChapter = (content: string) => {
    setActiveChapter(content);
  };
  useEffect(() => {
    const getChapters = async () => {
      try {
        const response = await api.get(`/content/chapter/${params.moduleId}`);
        const data = response.data;
        setChapters(data);
        console.log("data.bootcamp.content", data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    getChapters();
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel onClick={() => console.log("first", chapters)}>
        <div>
          {chapters.map((chapter: { name: string; content: string }) => (
            <div onClick={() => handleActiveChapter(chapter.content)}>
              {chapter.name}
            </div>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>{/* <Tiptap data={activeChapter} /> */}</ResizablePanel>
    </ResizablePanelGroup>
  );
}
