// 'use client'

// import { useCallback, useEffect, useState } from 'react'
// import { api } from '@/utils/axios.config'
// import type {
//     Course,
//     CoursesResponse,
// } from '@/app/admin/courses/[courseId]/submissionVideo/submissionVideoIdPageType'

// type UseBootcampsArgs = {
//     limit: number | string
//     searchTerm: string
//     offset: number
//     auto?: boolean
// }

// export function useBootcamps({
//     limit,
//     searchTerm,
//     offset,
//     auto = true,
// }: UseBootcampsArgs) {
//     const [courses, setCourses] = useState<Course[]>([])
//     const [loading, setLoading] = useState<boolean>(!!auto)
//     const [error, setError] = useState<unknown>(null)
//     const [totalBootcamps, setTotalBootcamps] = useState(0)
//     const [totalPages, setTotalPages] = useState(0)

//     const getBootcamp = useCallback(
//         async (newOffset?: number) => {
//             console.log('Loop')
//             try {
//                 setLoading(true)
//                 const resolvedOffset =
//                     typeof newOffset === 'number' ? newOffset : offset
//                 let url = `/bootcamp?limit=${limit}&offset=${resolvedOffset}`
//                 if (searchTerm) {
//                     url = `/bootcamp?limit=${limit}&searchTerm=${encodeURIComponent(
//                         searchTerm
//                     )}`
//                 }
//                 const res = await api.get<CoursesResponse>(url)
//                 setCourses(res.data.data)
//                 setTotalBootcamps(res.data.totalBootcamps)
//                 setTotalPages(res.data.totalPages)
//                 setError(null)
//             } catch (err) {
//                 setError(err)
//                 // console.error('Error fetching courses:', err)
//             } finally {
//                 setLoading(false)
//             }
//         },
//         [limit, offset, searchTerm]
//     )

//     useEffect(() => {
//         if (auto) getBootcamp()
//     }, [auto, getBootcamp])

//     return {
//         courses,
//         loading,
//         error,
//         totalBootcamps,
//         totalPages,
//         refetchBootcamps: getBootcamp,
//     }
// }

'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import type {
    Course,
    CoursesResponse,
} from '@/app/admin/courses/[courseId]/submissionVideo/submissionVideoIdPageType'

type UseBootcampsArgs = {
    limit: number | string
    searchTerm: string
    offset: number
    auto?: boolean
}

export function useBootcamps({
    limit,
    searchTerm,
    offset,
    auto = true,
}: UseBootcampsArgs) {
    const stableLimit = useMemo(() => {
        const n = typeof limit === 'string' ? Number(limit) : limit
        return Number.isFinite(n) ? n : 10
    }, [limit])

    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState<boolean>(!!auto)
    const [error, setError] = useState<unknown>(null)
    const [totalBootcamps, setTotalBootcamps] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // track last completed request to avoid duplicate fetches with same inputs
    const lastKeyRef = useRef<string>('') // last successful key
    const inFlightKeyRef = useRef<string>('') // key currently fetching
    const abortRef = useRef<AbortController | null>(null)

    const buildKey = (off: number) =>
        `${stableLimit}|${off}|${searchTerm ?? ''}`

    const doFetch = useCallback(
        async (off: number) => {
            console.log('BBBBBB')

            const key = buildKey(off)

            // If we are already fetching this exact key, or it already finished, skip
            if (key === inFlightKeyRef.current || key === lastKeyRef.current) {
                return
            }

            inFlightKeyRef.current = key
            setLoading(true)
            setError(null)

            // optional cancellation (Axios v1+)
            abortRef.current?.abort()
            const ctrl = (abortRef.current = new AbortController())

            try {
                const base = `/bootcamp?limit=${stableLimit}&offset=${off}`
                const url = searchTerm
                    ? `${base}&searchTerm=${encodeURIComponent(searchTerm)}`
                    : base
                const res = await api.get<CoursesResponse>(url)
                setCourses(res.data.data)
                setTotalBootcamps(res.data.totalBootcamps)
                setTotalPages(res.data.totalPages)

                lastKeyRef.current = key
            } catch (err: any) {
                if (!ctrl.signal.aborted) setError(err)
            } finally {
                if (inFlightKeyRef.current === key) inFlightKeyRef.current = ''
                if (abortRef.current === ctrl) abortRef.current = null
                setLoading(false)
            }
        },
        [stableLimit, searchTerm]
    )

    // auto fetch on primitive inputs change
    useEffect(() => {
        if (!auto) return
        doFetch(offset)
    }, [auto, stableLimit, searchTerm, offset, doFetch])

    // manual refetch API
    const refetchBootcamps = useCallback(
        async (newOffset?: number) => {
            await doFetch(typeof newOffset === 'number' ? newOffset : offset)
        },
        [doFetch, offset]
    )

    useEffect(() => {
        return () => {
            abortRef.current?.abort()
        }
    }, [])

    return {
        courses,
        loading,
        error,
        totalBootcamps,
        totalPages,
        refetchBootcamps,
    }
}
