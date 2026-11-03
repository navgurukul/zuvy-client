import { useEffect } from 'react'
import { useStudentDataStore } from '@/store/studentDataStore'

/**
 * Thin wrapper around the Zustand studentDataStore.
 *
 * Deduplication guarantee:
 * - All components sharing this hook share ONE fetch.
 * - The store's `fetched` flag acts as a mutex: the first component to call
 *   fetchStudentData sets it atomically; all subsequent callers see it already
 *   set and bail out immediately — no duplicate /student requests.
 * - Calling `refetch` (e.g. after enroll) bypasses the cache and forces a fresh fetch.
 *
 * Return shape is identical to the original hook — no consumer changes needed.
 */
export const useStudentData = () => {
  const { studentData, loading, error, fetchStudentData, refetch } =
    useStudentDataStore()

  useEffect(() => {
    fetchStudentData()
  }, [])

  return { studentData, loading, error, refetch }
}
