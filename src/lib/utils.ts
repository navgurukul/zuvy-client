import DOMPurify from 'dompurify'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function stripHtmlTags(html: string): string {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
}

export function ellipsis(text: string | undefined, maxLength: number): string {
    const purifiedText = DOMPurify.sanitize(text || '')
    if (!purifiedText) {
        return ''
    }
    if (purifiedText.length <= maxLength) {
        return purifiedText
    }
    return purifiedText.slice(0, maxLength - 3) + '...'
}

export function isPlural(count: number): boolean {
    return count !== 1
}

export const formattedRole = (role: string) => {
     return role
        .toLowerCase()
        .replace('_', ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Text Color as per difficulty:
export function difficultyColor(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 'bg-success-light text-success border-success dark:text-white '
        case 'medium':
            return 'bg-warning-light text-warning border-warning dark:text-white'
        case 'hard':
            return 'bg-destructive-light text-destructive border-destructive dark:text-white '
        default:
            return 'bg-muted text-muted-foreground dark:text-white'
    }
}

export function difficultyQuestionBgColor(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 'bg-secondary'
        case 'medium':
            return 'bg-yellow-dark'
        case 'hard':
            return 'bg-destructive'
        default:
            return 'bg-gray-500'
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

export const COLOR_PALETTE = [
  { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', hex: '#f97316' },
  { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', hex: '#3b82f6' },
  { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', hex: '#22c55e' },
  { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', hex: '#a855f7' },
  { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500', hex: '#ec4899' },
  { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', hex: '#6366f1' },
  { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', hex: '#ef4444' },
  { bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500', hex: '#14b8a6' },
  { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500', hex: '#eab308' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', hex: '#06b6d4' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', hex: '#10b981' },
  { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', hex: '#8b5cf6' },
  { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', border: 'border-fuchsia-500', hex: '#d946ef' },
  { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', hex: '#f43f5e' },
  { bg: 'bg-lime-500', text: 'text-lime-500', border: 'border-lime-500', hex: '#84cc16' },
];

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
        month: 'short',
        day: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
        // second: '2-digit',
        // timeZoneName: 'short',
    }

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', options)
}

export const formatDateTime = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', options)
}

// Assessment utility functions
export const formatToIST = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    };

    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(date);

    const getPart = (type: string) =>
        parts.find(part => part.type === type)?.value || '';

    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const dayPeriod = getPart('dayPeriod');

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
};

export const formatTimeLimit = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
};

export const calculateCountdown = (startTime: string) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const distance = start - now;

    if (distance < 0) {
        return '';
    }

    const oneSecond = 1000;
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    const days = Math.floor(distance / oneDay);
    const hours = Math.floor((distance % oneDay) / oneHour);
    const minutes = Math.floor((distance % oneHour) / oneMinute);
    const seconds = Math.floor((distance % oneMinute) / oneSecond);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const startPolling = (
    pollIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
    refetch: () => void,
    delay: number = 2000
) => {
    if (pollIntervalRef.current) {
        return;
    }

    const timerId = setTimeout(() => {
        refetch();
    }, delay);

    pollIntervalRef.current = timerId;
};

export const stopPolling = (pollIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>) => {
    if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = null;
    }
};

export const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success-light text-success';
      case 'Medium': return 'bg-warning-light text-warning';
      case 'Hard': return 'bg-destructive-light text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  