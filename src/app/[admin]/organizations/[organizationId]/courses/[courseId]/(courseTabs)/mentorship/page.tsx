'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Settings, UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCourseData, getUser } from '@/store/store'
import { api } from '@/utils/axios.config'

type MentorshipState = 'loading' | 'off' | 'on'

export default function MentorshipPage() {
    const { organizationId, courseId } = useParams()
    const pathname = usePathname()
    const { user } = getUser()
    const { Permissions } = getCourseData()
    const role = pathname.split('/')[1]
    const orgId = Number(organizationId) || user?.orgId
    const courseID = Array.isArray(courseId) ? courseId[0] : courseId
    const [mentorshipState, setMentorshipState] =
        useState<MentorshipState>('loading')

    useEffect(() => {
        if (!courseID) {
            setMentorshipState('off')
            return
        }

        let isCurrent = true

        api.get(`/bootcamp/bootcampSetting/${courseID}`)
            .then((response) => {
                if (!isCurrent) return

                const settings = response.data?.bootcampSetting?.[0]
                setMentorshipState(
                    settings?.mentorshipEnabled ? 'on' : 'off'
                )
            })
            .catch(() => {
                // A forbidden settings request must not break direct navigation.
                if (isCurrent) setMentorshipState('off')
            })

        return () => {
            isCurrent = false
        }
    }, [courseID])

    if (mentorshipState === 'loading') {
        return <div className="min-h-[320px]" aria-busy="true" />
    }

    if (mentorshipState === 'on') {
        return (
            <div className="p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                    Mentorship
                </h2>
            </div>
        )
    }

    const settingsHref = `/${role}/organizations/${orgId}/courses/${courseID}/settings`

    return (
        <div className="px-6 py-3">
            <p className="text-sm text-muted-foreground text-left">
                No Mentorship tab: mentorship is off for this course.
            </p>
            <div className="flex min-h-[420px] items-center justify-center">
                <Card className="w-full max-w-xl border-border shadow-sm">
                    <CardContent className="flex flex-col items-center px-8 py-11 text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                        <UserCheck
                            className="h-7 w-7 text-green-800"
                            aria-hidden="true"
                        />
                    </div>
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                        Mentorship isn&apos;t turned on for this course
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                        Turn it on in Settings so students can book mentors.
                        Bookings, live sessions and recordings will then appear
                        here.
                    </p>
                    {Permissions?.viewSetting && (
                        <Button asChild className="mt-6">
                            <Link href={settingsHref}>
                                <Settings className="mr-2 h-4 w-4" />
                                Go to Settings
                            </Link>
                        </Button>
                    )}
                    <p className="mt-5 max-w-md text-xs leading-5 text-muted-foreground">
                        Shown when someone opens /mentorship directly. The
                        button appears only with the View Settings permission.
                    </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
