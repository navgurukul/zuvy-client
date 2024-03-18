import { toast } from "@/components/ui/use-toast";
import api from "./axios.config";



export const fetchStudentData = async (
  id: string,
  setStoreStudentData: any
) => {
  try {
    const response = await api.get(`/bootcamp/students/${id}`);
    const data = response.data;
    setStoreStudentData(data.studentsEmails);
  } catch (error) {
    // Handle error appropriately
    console.error("Error fetching student data:", error);
  }
};

export async function onBatchChange(
  selectedvalue: any,
  rowData: any,
  student: any
) {
  await api
    .post(
      `/bootcamp/students/${student.bootcampId}?batch_id=${selectedvalue}`,
      {
        students: [
          {
            email: student.email,
            name: student.name,
          },
        ],
      }
    )
    .then((res) => {
      toast({
        title: "Students Batch Updated Succesfully",
        className: "text-start capitalize",
      });
    });
}

export async function deleteStudentHandler(
  userId: any,
  bootcampId: any,
  setDeleteModalOpen: any,
  setStudentData: any
) {
  try {
    await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
      toast({
        title: res.data.status,
        description: res.data.message,
        className: "text-start capitalize",
      });
      fetchStudentData(bootcampId, setStudentData);
    });
  } catch (error) {
    toast({
      title: "Failed",
      variant: "destructive",
    });
  }
  setDeleteModalOpen(false);
}