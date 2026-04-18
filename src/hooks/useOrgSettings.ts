import { api } from '@/utils/axios.config'
import { useCallback } from 'react'

export type OrgResponse = {
    id: number
    title: string
    displayName: string
    isManagedByZuvy: boolean
    logoUrl: string | null
    pocName: string
    pocEmail: string
    zuvyPocName: string
    zuvyPocEmail: string
    isVerified: boolean
    createdAt: string
    updatedAt: string
    version: number | null
}

type ImageUploadResponse = {
    urls: string[]
}

export type OrgUpdatePayload = Partial<{
    title: string
    displayName: string
    logoUrl: string | null
    pocName: string
    pocEmail: string
    isManagedByZuvy: boolean
    zuvyPocEmail: string | null
    zuvyPocName: string | null
}>

const useOrgSettings = () => {
    const fetchOrgById = useCallback(async (orgId: string | number) => {
        const response = await api.get<OrgResponse>(`/org/getOrgById/${orgId}`)
        return response.data
    }, [])

    const uploadOrgLogo = useCallback(async (file: File): Promise<string | null> => {
        const formData = new FormData()
        formData.append('images', file)

        const uploadRes = await api.post<ImageUploadResponse>(
            '/Content/curriculum/upload-images',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        )

        const uploadedUrls = Array.isArray(uploadRes.data?.urls)
            ? uploadRes.data.urls
            : []

        return uploadedUrls.length ? uploadedUrls[0] : null
    }, [])

    const completeOrgSetup = useCallback(async (
        orgId: string | number,
        payload: OrgUpdatePayload
    ) => {
        return api.patch(`/org/complete-setup/${orgId}`, payload)
    }, [])

    const updateOrgById = useCallback(async (
        orgId: string | number,
        payload: OrgUpdatePayload
    ) => {
        return api.patch(`/org/updateOrgById/${orgId}`, payload)
    }, [])

    return {
        fetchOrgById,
        uploadOrgLogo,
        completeOrgSetup,
        updateOrgById,
    }
}

export default useOrgSettings
