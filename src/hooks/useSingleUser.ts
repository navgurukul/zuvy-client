// 'use client'
// import { useCallback, useEffect, useState, useMemo } from 'react'
// import { api } from '@/utils/axios.config'

// export interface User {
//     id: number
//     roleId: number
//     userId: number
//     name: string
//     email: string
//     roleName: string
// }

// export interface UsersResponse {
//     status: string
//     message: string
//     code: number
//     data: User[]
//     totalRows: number
//     totalPages: number
//     permissions?: {
//         createUser: boolean
//         viewUsers: boolean
//         editUser: boolean
//         deleteUser: boolean
//     }
// }

// export function useUser(userId: number | undefined) {
//     const [user, setUser] = useState<User | null>(null) 
//     const [loading, setLoading] = useState<boolean>(false)
//     const [error, setError] = useState<unknown>(null)

//     const getUser = useCallback(
//         async (userId: number) => {
//             try {
//                 setLoading(true)
//                 // setError(null)
//                 const res = await api.get<UsersResponse>(`/rbac/getUser/${userId}`)
//                 console.log('User fetch response:', res.data)
//                 const selectedUser = res.data || []
//                 console.log('selectedUser', selectedUser)
//                 setUser(selectedUser.data[0] || null)
//                 setError(null)
//             } catch (err) {
//                 setError(err)
//                 console.error('Error fetching user:', err)
//             } finally {
//                 setLoading(false)
//             }
//         },
//         [userId]
//     )

//     useEffect(() => {
//         if (userId) {
//             getUser(userId)
//         } else {
//             setUser(null)
//             setLoading(false)
//         }
//     }, [userId, getUser])

//     return {
//         user,
//         loading,
//         error,
//         // refetchUsers: getUser,
//     }
// }


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

export function useUser(userId: number | null) {
    const [user, setUser] = useState<User | null>(null) // Changed to single User, not array
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)

    console.log('userId', userId)

    const getUser = useCallback(async (userId: number) => {
        try {
            if (!userId) return

            setLoading(true)
            setError(null)
            const res = await api.get<UsersResponse>(`/users/getUser/${userId}`)
            console.log('User fetch response:', res.data)
            
            // Assuming the API returns a single user in data array
            const selectedUser = res.data?.data?.[0] || null
            console.log('selectedUser', selectedUser)
            setUser(selectedUser)
        } catch (err) {
            setError(err)
            console.error('Error fetching user:', err)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, []) 

    useEffect(() => {
        if (userId) {
            getUser(userId)
        } else {
            setUser(null)
            setLoading(false)
        }
    }, [userId, getUser])

    return {
        user,
        loading,
        error,
    }
}