import { api } from '@/utils/axios.config'

export interface Organization {
    id: number
    title: string
    code: string
    isManagedByZuvy: boolean
    logoUrl: string
    pocName: string
    pocEmail: string
    zuvyPocName: string
    zuvyPocEmail: string
    isVerified: boolean
    createdAt: string
    updatedAt: string
    version: string | null
}

export interface OrganizationApiResponse {
    status: string
    message: string
    statusCode: number
    data: Organization[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface GetOrganizationsParams {
    search?: string
    page?: number
    limit?: number
    filterType?: string
    all?: boolean
}

export const getOrganizations = async ({
    search,
    page,
    limit,
    filterType,
    all = false,
}: GetOrganizationsParams = {}): Promise<OrganizationApiResponse> => {
    const queryParams = new URLSearchParams()

    if (search) {
        queryParams.append('search', search)
    }

    if (all) {
        queryParams.append('limit', (limit ?? 100).toString())
        queryParams.append('page', '1')
    } else {
        if (limit) {
            queryParams.append('limit', limit.toString())
        }
        if (page) {
            queryParams.append('page', page.toString())
        }
    }

    if (filterType) {
        queryParams.append('filterType', filterType)
    }

    const url = `/org/getAllOrgs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await api.get<OrganizationApiResponse>(url)
    return response.data
}
