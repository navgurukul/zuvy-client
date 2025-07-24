import { useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'

export const useCourseExistenceCheck = (courseId: string | number | undefined) => {
  const [isCourseDeleted, setIsCourseDeleted] = useState(false)
  const [loadingCourseCheck, setLoadingCourseCheck] = useState(true)

  const checkIfCourseExists = async () => {
    if (!courseId) return
    try {
      await api.get(`/bootcamp/${courseId}`)
      setIsCourseDeleted(false)
    } catch (error) {
      setIsCourseDeleted(true)
      getCourseData.setState({ courseData: null })
    } finally {
      setLoadingCourseCheck(false)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (!isCourseDeleted) {
      interval = setInterval(() => {
        checkIfCourseExists()
      }, 500)
    }

    return () => clearInterval(interval)
  }, [courseId, isCourseDeleted])

  return { isCourseDeleted, loadingCourseCheck }
}
