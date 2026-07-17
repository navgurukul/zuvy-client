import { api } from '@/utils/axios.config'

const inFlightRequests = new Map<string, Promise<any>>()

export function getWithCache(url: string) {
  const existing = inFlightRequests.get(url)
  if (existing) return existing

  const req = api.get(url).finally(() => {
    inFlightRequests.delete(url)
  })

  inFlightRequests.set(url, req)
  return req
}

export function clearCacheFor(url: string) {
  inFlightRequests.delete(url)
}
