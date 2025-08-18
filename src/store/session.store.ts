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
