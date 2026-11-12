'use client'

import { useState, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

export interface RevokeCertificateOptions {
    onSuccess?: (resData: any) => void
    onError?: (err: any) => void
}

export function useRevokeCertificate() {
    const [isRevoking, setIsRevoking] = useState(false)

    const revokeCertificate = useCallback(
        async (
            userId: string | number,
            bootcampId: string | number,
            reason: string,
            options?: RevokeCertificateOptions
        ) => {
            if (isRevoking) return

            setIsRevoking(true)
            try {
                const res = await api.patch(
                    `/bootcamp/${bootcampId}/student/${userId}/certificate/revoke`,
                    { reason }
                )
                toast.success({
                    title: 'Certificate Revoked',
                    description: res.data?.message || 'The certificate has been revoked successfully.',
                })
                options?.onSuccess?.(res.data)
            } catch (error: any) {
                toast.error({
                    title: 'Revocation Failed',
                    description:
                        error.response?.data?.message || 'An error occurred while revoking the certificate.',
                })
                options?.onError?.(error)
            } finally {
                setIsRevoking(false)
            }
        },
        [isRevoking]
    )

    return { revokeCertificate, isRevoking }
}
