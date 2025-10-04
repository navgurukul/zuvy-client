'use client'
import { useCallback, useEffect, useState } from 'react'
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

export function useAllUsers(initialFetch = true, page = 1, limit = 10) {
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

    const getAllUsers = useCallback(
        async (pageNum = page) => {
            try {
                setLoading(true)
                // For now, fetch all users since the API might not support pagination
                const res = await api.get<UsersResponse>('/rbac/get/all/users')
                const allUsers = res.data.data || []

                // Client-side pagination
                const startIndex = (pageNum - 1) * limit
                const endIndex = startIndex + limit
                const paginatedUsers = allUsers.slice(startIndex, endIndex)

                setUsers(paginatedUsers)
                setTotalRows(allUsers.length)
                setTotalPages(Math.ceil(allUsers.length / limit))

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
        if (initialFetch) getAllUsers(page)
    }, [initialFetch, getAllUsers, page])

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
