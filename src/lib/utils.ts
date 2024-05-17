import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function ellipsis(text: string, maxLength: number): string {
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
