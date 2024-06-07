import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function ellipsis(text: string | undefined, maxLength: number): string {
    if (!text) {
        return ''
    }
    if (text.length <= maxLength) {
        return text
    }
    return text.slice(0, maxLength - 3) + '...'
}

export function isPlural(count: number): boolean {
    return count !== 1
}

export function difficultyColor(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 'text-secondary'
        case 'medium':
            return 'text-yellow-dark'
        case 'hard':
            return 'text-destructive'
        default:
            return 'text-gray-500'
    }
}

export const getAttendanceColorClass = (attendance: any) => {
    if (attendance === 100) {
        return 'bg-green-500 text-white'
    } else if (attendance >= 75) {
        return 'bg-yellow-500 text-black'
    } else if (attendance < 50) {
        return 'bg-red-500 text-white'
    } else {
        return 'bg-gray-500 text-white'
    }
}
