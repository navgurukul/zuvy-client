import { useState, useEffect, useCallback } from 'react';
import { api } from '@/utils/axios.config';
import{UseUserCompletedClassesReturn, CompletedClassesData} from '@/hooks/hookType'
import { ClassData } from '@/app/[admin]/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType';
import { getAttendancePercentage, getCompletedClasses } from '@/store/store';

export const useUserCompletedClasses = ({ statusFilter = 'all', courseId, studentId, fromDate, toDate, searchTerm }: { courseId: string; studentId: string; statusFilter?: string; fromDate?: string; toDate?: string; searchTerm?: string }): UseUserCompletedClassesReturn => {
//   const [completedClasses, setCompletedClasses] = useState<CompletedClassesData[] | []>([]);
//   const [attendancePercentage, setAttendancePercentage] = useState<number>(0)
    const { completedClasses, setCompletedClasses } = getCompletedClasses()
    const { attendancePercentage, setAttendancePercentage } = getAttendancePercentage()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
    
    const fetchCompletedClasses = async (isRefetch = false, searchTermParam?: string) => {
        try {
             if (isRefetch) {
                setIsRefetching(true);
            } else {
                setLoading(true);
            }
            setError(null)

            const params = new URLSearchParams({
                userId: studentId.toString()
            })

            const currentSearchTerm = searchTermParam !== undefined ? searchTermParam : searchTerm
            
            if (currentSearchTerm && currentSearchTerm.trim()) {
                params.append('searchTerm', currentSearchTerm.trim())
            }
            
            if (statusFilter !== 'all') {
                params.append('attendanceStatus', statusFilter)
            }
            
            // Only add date filters if BOTH dates are selected and valid
            if (fromDate && toDate && fromDate <= toDate) {
                params.append('fromDate', fromDate)
                params.append('toDate', toDate)
            }

            const endpoint = `/student/bootcamp/${courseId}/completed-classes?${params.toString()}`             
            const response = await api.get(endpoint)

            const classes = response.data?.data?.classes || []
            setCompletedClasses(classes)

            const stats = response.data?.data?.attendanceStats
            if (stats) {
                setAttendancePercentage(Math.round(stats.attendancePercentage || 0))
            } else if (classes.length > 0) {
                const totalClasses = classes.length
                const attendedClasses = classes.filter((c: ClassData) => c.attendanceStatus === 'present').length
                const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0
                setAttendancePercentage(percentage)
            } else {
                setAttendancePercentage(0)
            }

        } catch (error: any) {
            console.error('API Error:', error)

            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch completed classes'
            setError(errorMessage)

            // toast.error({
            //     title: 'API Error',
            //     description: errorMessage,            
            // })
        } finally {
            if (isRefetch) {
                setIsRefetching(false);
            } else {
                setLoading(false);
            }
        }
    }

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    };

    // const fetchCompletedClasses = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);
        
    //     const response = await api.get(`/student/bootcamp/${courseId}/completed-classes`);
        
    //     if (response.data && response.data.isSuccess) {
    //       setCompletedClasses(response.data.data);
    //     } else {
    //       setCompletedClasses(null);
    //       setError(response.data.message || 'Failed to fetch completed classes');
    //     }
    //   } catch (err: any) {
    //     console.error('Error fetching completed classes:', err);
    //     setError(err.response?.data?.message || 'Failed to fetch completed classes');
    //     setCompletedClasses(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchCompletedClasses();
//   }, [courseId]);
}, [courseId, studentId, statusFilter, fromDate, toDate, searchTerm]);

  const refetchCompletedClasses = (searchTermParam: string) => {
    fetchCompletedClasses(true, searchTermParam);
  };

  return { completedClasses, loading, error, attendancePercentage, refetchCompletedClasses };
}; 