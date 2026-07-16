import { create } from 'zustand'
import { api } from '@/utils/axios.config'
import { StudentData } from '@/hooks/hookType'

interface StudentDataState {
  studentData: StudentData | null
  loading: boolean
  error: string | null
  /**
   * Tracks whether a fetch has been initiated.
   * Used to deduplicate concurrent calls from multiple components
   * (e.g. StudentDashboard + TourProvider both mount at the same time).
   */
  fetched: boolean

  fetchStudentData: () => Promise<void>
  refetch: () => Promise<void>
}

export const useStudentDataStore = create<StudentDataState>((set, get) => ({
  studentData: null,
  loading: false,
  error: null,
  fetched: false,

  fetchStudentData: async () => {
    // Already cached or in-flight — deduplicate
    if (get().fetched) return

    // Mark in-flight atomically so concurrent callers bail out
    set({ loading: true, error: null, fetched: true })

    try {
      const response = await api.get('/student')
      set({ studentData: response.data, loading: false })
    } catch (err: any) {
      console.error('Error fetching student data:', err)
      set({
        error: 'Failed to load student data',
        loading: false,
        // Clear fetched so a retry (explicit refetch) is allowed
        fetched: false,
      })
    }
  },

  refetch: async () => {
    // Force a fresh fetch by resetting the dedup flag first
    set({ fetched: false, loading: true, error: null })

    try {
      const response = await api.get('/student')
      set({ studentData: response.data, loading: false, fetched: true })
    } catch (err: any) {
      console.error('Error fetching student data:', err)
      set({
        error: 'Failed to load student data',
        loading: false,
        fetched: false,
      })
    }
  },
}))
