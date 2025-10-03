'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export function useCalendarAccessCheck(auto = true) {
  const [hasAccess, setHasAccess] = useState<boolean>(true)
  const [checking, setChecking] = useState<boolean>(!!auto)
  const [error, setError] = useState<unknown>(null)

  const checkAccess = useCallback(async () => {
    try {
      setChecking(true)
      const res = await api.get('/classes/check-calendar-access')
      setHasAccess(res.data.status !== 'not success')
      setError(null)
    } catch (err) {
      setError(err)
      // default to true to avoid blocking UI if endpoint fails unexpectedly
      setHasAccess(true)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    if (auto) checkAccess()
  }, [auto, checkAccess])

  return { hasAccess, checking, error, refetchAccess: checkAccess }
}

export function useCalendarAccessAction() {
  const giveAccess = useCallback(async (userID?: number, email?: string) => {
    const res = await api.get('/classes', { params: { userID, email } })
    return res.data?.url as string
  }, [])
  return { giveAccess }
}
