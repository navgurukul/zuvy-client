'use client'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { api } from '@/utils/axios.config'

export interface User {
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
}

export function useAllUsers({
    initialFetch,
    limit,
    searchTerm,
    offset}: UseAllUsersArgs) {
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
        async (offset: number) => {
            try {
                // setLoading(true)
                setLoading(false)
                setError(null)
                const res = await api.get<UsersResponse>(`/rbac/get/all/users?limit=${stableLimit}&offset=${offset}`)
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
        [limit]
    )

    useEffect(() => {
        if (initialFetch) getAllUsers(offset)
    }, [initialFetch, getAllUsers, offset, searchTerm, stableLimit])

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
