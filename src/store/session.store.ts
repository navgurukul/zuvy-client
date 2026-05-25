'use client'

import { create } from 'zustand'

type SessionStore = {
    showModal: boolean
    setShowModal: (value: boolean) => void
}

export const useSessionModalStore = create<SessionStore>((set) => ({
    showModal: false,
    setShowModal: (value) => set({ showModal: value }),
}))

type UnauthorizedStore = {
    showModal: boolean
    setShowModal: (value: boolean) => void
}

export const useUnauthorizedModalStore = create<UnauthorizedStore>((set) => ({
    showModal: false,
    setShowModal: (value) => set({ showModal: value }),
}))

type UnauthorizedMessageStore = {
    message: string
    setMessage: (value: string) => void
}

export const unauthorizedMessage = create<UnauthorizedMessageStore>((set) => ({
    message: '',
    setMessage: (value) => set({ message: value }),
}))

