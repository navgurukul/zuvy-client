import { useState, useEffect } from 'react';
import { api } from "@/utils/axios.config";

interface InstructorDetails {
  id: number;
  name: string;
  profilePicture: string | null;
}

interface UpcomingEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  bootcampId: number;
  bootcampName: string;
  batchId: number;
  eventDate: string;
  type: string;
}

interface Bootcamp {
  id: number;
  name: string;
  coverImage: string;
  duration: string;
  language: string;
  bootcampTopic: string;
  description: string | null;
  batchId: number;
  batchName: string;
  progress: number;
  instructorDetails: InstructorDetails;
  upcomingEvents: UpcomingEvent[];
}

interface StudentData {
  completedBootcamps: Bootcamp[];
  inProgressBootcamps: Bootcamp[];
  totalCompleted: number;
  totalInProgress: number;
  totalPages: number;
}

export const useStudentData = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/student');
      setStudentData(response.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchStudentData();
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  return {
    studentData,
    loading,
    error,
    refetch
  };
}; 