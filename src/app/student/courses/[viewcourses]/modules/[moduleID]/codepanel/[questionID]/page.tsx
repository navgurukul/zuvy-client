'use client'

import { useEffect } from 'react'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'
import IDE from '@/app/student/playground/[editor]/editor'

function Page({ params }: any) {
    const { questionID } = params

    useEffect(() => {
        requestFullScreen(document.documentElement)
    }, [])
    const remainingTime = null
    const assessmentSubmitId = 1
    const selectedCodingOutsourseId = ''

    return (
        <>
            <IDE
                params={{ editor: String(questionID) }}
                onBack={() => console.log('Here..!')}
                remainingTime={remainingTime}
                assessmentSubmitId={assessmentSubmitId}
                selectedCodingOutsourseId={selectedCodingOutsourseId}
            />
        </>
    )
}

export default Page
