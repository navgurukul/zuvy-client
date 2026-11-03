'use client'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { api } from '@/utils/axios.config'
import { getUser } from '@/store/store'
import { useParams } from 'next/navigation'
import { UsersResponse, User } from './hookType'

// Multiple effects can ask for the same page while it is mounting (including
// React Strict Mode in development). Keep only one network request per URL
// until that request has settled.
const pendingUserRequests = new Map<string, Promise<UsersResponse>>()

const fetchUsers = (url: string): Promise<UsersResponse> => {
    const pendingRequest = pendingUserRequests.get(url)
    if (pendingRequest) return pendingRequest

    const request = api
        .get<UsersResponse>(url)
        .then((res) => res.data)
        .finally(() => {
            pendingUserRequests.delete(url)
        })

    pendingUserRequests.set(url, request)
    return request
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
    const orgId = Number(organizationId) || user?.orgId; 
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
            if (orgId === undefined) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const roleIdParam = filterRoleId || roleId
                const roleQuery = roleIdParam ? `&roleId=${roleIdParam}` : ''
                const url = `/users/get/all/users/${orgId}?limit=${stableLimit}&offset=${offset}${roleQuery}`
                const allUsers = await fetchUsers(url)

                setUsers(allUsers.data)
                setTotalRows(allUsers.totalRows)
                setTotalPages(allUsers.totalPages)

                if (allUsers.permissions) {
                    setPermissions(allUsers.permissions)
                }
                setError(null)
            } catch (err) {
                setError(err)
                console.error('Error fetching users:', err)
            } finally {
                setLoading(false)
            }
        },
        [orgId, roleId, stableLimit]
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
