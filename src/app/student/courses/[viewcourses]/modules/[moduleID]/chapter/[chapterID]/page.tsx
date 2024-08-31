'use client'

import { useEffect } from 'react'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'
import IDE from '@/app/student/playground/[editor]/editor'

function Page({ params }: any) {
    useEffect(() => {
        requestFullScreen(document.documentElement)
        console.log('Full Screen')
    }, [])
    const remainingTime = null
    const assessmentSubmitId = 1
    const selectedCodingOutsourseId = ''

    return (
        <>
            <IDE
                params={{ editor: String(2) }}
                onBack={() => console.log('Here..!')}
                remainingTime={remainingTime}
                assessmentSubmitId={assessmentSubmitId}
                selectedCodingOutsourseId={selectedCodingOutsourseId}
            />
        </>
    )
}

export default Page
