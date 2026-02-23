'use client'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { api } from '@/utils/axios.config'
import { getUser } from '@/store/store'
import { useParams } from 'next/navigation'
export interface User {
    createdAt: any
    id: number
    roleId: number
    userId: number
    name: string
    email: string
    roleName: string
}

export interface UsersResponse {
    status: string
    message: string
    code: number
    data: User[]
    totalRows: number
    totalPages: number
    permissions?: {
        createUser: boolean
        viewUsers: boolean
        editUser: boolean
        deleteUser: boolean
    }
}

type UseAllUsersArgs = {
    limit: number | string
    searchTerm: string
    offset: number
    initialFetch?: boolean
    roleId?: string | number
}

export function useAllUsers({
    initialFetch,
    limit,
    searchTerm,
    offset,
    roleId}: UseAllUsersArgs) {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<unknown>(null)
    const [totalRows, setTotalRows] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [permissions, setPermissions] = useState({
        createUser: false,
        viewUsers: false,
        editUser: false,
        deleteUser: false,
    })

    const stableLimit = useMemo(() => {
        const n = typeof limit === 'string' ? Number(limit) : limit
        return Number.isFinite(n) ? n : 10
    }, [limit])

    const getAllUsers = useCallback(
        async (offset: number, filterRoleId?: string | number) => {
            try {
                // setLoading(true)
                setLoading(false)
                setError(null)
                const roleIdParam = filterRoleId || roleId
                const roleQuery = roleIdParam ? `&roleId=${roleIdParam}` : ''
                const res = await api.get<UsersResponse>(`/users/get/all/users?orgId=${orgId}&limit=${stableLimit}&offset=${offset}${roleQuery}`)
                const allUsers = res.data || []

                setUsers(allUsers.data)
                setTotalRows(allUsers.totalRows)
                setTotalPages(allUsers.totalPages)

                if (res.data.permissions) {
                    setPermissions(res.data.permissions)
                }
                setError(null)
            } catch (err) {
                setError(err)
                console.error('Error fetching users:', err)
            } finally {
                setLoading(false)
            }
        },
        [roleId, stableLimit]
    )

    useEffect(() => {
        if (initialFetch) getAllUsers(offset)
    }, [initialFetch, getAllUsers, offset, searchTerm, stableLimit, roleId])

    return {
        users,
        loading,
        error,
        totalRows,
        totalPages,
        refetchUsers: getAllUsers,
        permissions,
    }
}
