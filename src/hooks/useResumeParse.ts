import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

type ResumeParseApiResponse = {
    [key: string]: any
}

export function useResumeParse() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const parseResume = useCallback(async (file: File) => {
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await api.post<ResumeParseApiResponse>(
                '/resume/parse',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )

            const payload = res?.data
            const parsedData = payload?.data ?? payload?.result ?? payload

            return {
                success: true,
                data: parsedData,
                raw: payload,
            }
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to parse resume.'
            setError(message)
            return {
                success: false,
                error: message,
            }
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        parseResume,
        loading,
        error,
    }
}

export default useResumeParse





// import { useCallback, useState } from 'react'
// import { api } from '@/utils/axios.config'

// type ResumeParseApiResponse = {
//     [key: string]: any
// }

// export function useResumeParse() {
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     const parseResume = useCallback(async (file: File) => {
//         setLoading(true)
//         setError(null)

//         try {
//             const formData = new FormData()
//             formData.append('file', file)

//             const res = await api.post<ResumeParseApiResponse>(
//                 '/resume/parse',
//                 formData,
//                 {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 }
//             )

//             const payload = res?.data
//             const parsedData = payload?.data ?? payload?.result ?? payload

//             return {
//                 success: true,
//                 data: parsedData,
//                 raw: payload,
//             }
//         } catch (err: any) {
//             const message =
//                 err?.response?.data?.message ||
//                 err?.message ||
//                 'Failed to parse resume.'
//             setError(message)
//             return {
//                 success: false,
//                 error: message,
//             }
//         } finally {
//             setLoading(false)
//         }
//     }, [])

//     return {
//         parseResume,
//         loading,
//         error,
//     }
// }

// export default useResumeParse