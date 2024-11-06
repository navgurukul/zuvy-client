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

// Text Color as per difficulty:
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

// Background Color as per difficulty:
export function difficultyBgColor(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 'bg-green-100'
        case 'medium':
            return 'bg-orange-100'
        case 'hard':
            return 'bg-red-100'
        default:
            return 'bg-gray-100'
    }
}

export function statusColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'accepted':
            return 'text-secondary'
        case 'pending':
            return 'text-yellow-dark'
        case 'wrong answer':
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

export function getAssesmentBackgroundColorClass(totalNo: number, no: number) {
    const percentage = (no / totalNo) * 100
    if (percentage < 33) {
        return 'bg-red-600'
    } else if (percentage < 60 && percentage > 45) {
        return 'bg-yellow-300'
    } else if (percentage > 75) {
        return 'bg-secondary'
    }

    return 'bg-gray-300'
}

export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    }

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', options)
}
