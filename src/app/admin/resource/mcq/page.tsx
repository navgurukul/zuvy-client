'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/spinner'

// Re-export types for other components that import them
export type { Tag } from './McqComponent'

// Dynamically import the entire MCQ component with no SSR
const McqComponent = dynamic(() => import('./McqComponent'), {
    ssr: false,
    loading: () => (
        <div className="flex justify-center items-center h-screen">
            <Spinner className="text-secondary" />
        </div>
    )
})

export default function Page(props: any) {
    return <McqComponent {...props} />
}
