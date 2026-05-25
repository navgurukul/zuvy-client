'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface Notification {
    id: number
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
}

type NotificationsApiResponse = Notification[] | { data: Notification[] }

const parseNotificationsResponse = (
    response: NotificationsApiResponse
): Notification[] => {
    if (Array.isArray(response)) {
        return response
    }

    if (response && Array.isArray(response.data)) {
        return response.data
    }

    return []
}

const getErrorMessage = (error: unknown): string => {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

    return message || 'Failed to fetch notifications'
}

export function useNotifications(initialFetch = true) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState<boolean>(!!initialFetch)
    const [error, setError] = useState<string | null>(null)
    const [markingRead, setMarkingRead] = useState<Set<number>>(new Set())

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get<NotificationsApiResponse>('/notifications')
            const parsed = parseNotificationsResponse(response.data)
            setNotifications(parsed)
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }, [])

    const markAsRead = useCallback(async (notificationId: number) => {
        setMarkingRead((prev) => new Set(prev).add(notificationId))
        try {
            await api.post(`/notifications/${notificationId}/read`)
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            )
        } catch {
            // silently fail – the UI will remain unchanged if the mark fails
        } finally {
            setMarkingRead((prev) => {
                const next = new Set(prev)
                next.delete(notificationId)
                return next
            })
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        const unread = notifications.filter((n) => !n.isRead)
        await Promise.allSettled(unread.map((n) => markAsRead(n.id)))
    }, [notifications, markAsRead])

    useEffect(() => {
        if (initialFetch) {
            fetchNotifications()
        }
    }, [fetchNotifications, initialFetch])

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return {
        notifications,
        loading,
        error,
        markingRead,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    }
}
