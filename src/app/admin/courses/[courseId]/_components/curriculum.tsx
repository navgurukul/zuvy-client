import api from "@/utils/axios.config";
import React, { useEffect, useState } from "react";

function Curriculum({ id }: { id: string }) {
  // state and variables
  const [curriculum, setCurriculum] = useState([]);

  //   async
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/bootcamp/${id}?isContent=true`);
        const data = response.data;
        setCurriculum(data.bootcamp.content.data.attributes);
        console.log(
          "data.bootcamp.content",
          data.bootcamp.content.data.attributes
        );
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseDetails();
  }, [id]);

  return <div>Curriculum</div>;
}

export default Curriculum;
