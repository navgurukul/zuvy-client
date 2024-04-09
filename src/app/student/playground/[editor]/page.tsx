'use client'
import { useEffect, useRef } from 'react'
import IDE from './editor'

export default function Page({ params }: { params: { editor: string } }) {
    const section1Ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (section1Ref.current !== null) {
            window.scrollTo({
                top: section1Ref.current.offsetTop,
                behavior: 'smooth',
            })
        }
    }, [])

    return (
        <div ref={section1Ref}>
            <IDE params={params} />
        </div>
    )
}
