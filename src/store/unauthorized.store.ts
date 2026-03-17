'use client'

import { create } from 'zustand'

type UnauthorizedStore = {
    showModal: boolean
    setShowModal: (value: boolean) => void
}

export const useUnauthorizedModalStore = create<UnauthorizedStore>((set) => ({
    showModal: false,
    setShowModal: (value) => set({ showModal: value }),
}))
