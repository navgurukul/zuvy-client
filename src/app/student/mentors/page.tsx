"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMentors } from "@/app/student/hooks/useMentors";
import { api } from "@/utils/axios.config";
import { SearchBox } from "@/utils/searchBox";
import { useStudentMentorMetrics } from "@/app/student/hooks/useStudentMentorMetrics";
import { useMentorSkills } from "@/app/student/hooks/useMentorSkills";
import { MentorExpertiseChips, MentorExpertiseDropdown } from "@/app/student/_components/MentorExpertiseFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import MentorshipTabs from "../_components/MentorshipTabs";
import MentorBookingDrawer from "@/app/student/_components/MentorBookingDrawer";
import { Mentor } from "../hooks/hookTypes";
import { useMentorProfile } from "../hooks/useMentorProfile";

type MentorsSearchResponse = Mentor[] | { data?: Mentor[] };
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination';

const formatEligibleDate = (dateString: string | null): string => {
    if (!dateString) return "Soon";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const parseMentors = (response: MentorsSearchResponse): Mentor[] => {
    if (Array.isArray(response)) {
        return response;
    }

    if (response && Array.isArray(response.data)) {
        return response.data;
    }

    return [];
};

export default function MentorsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const searchQuery = searchParams.get("search")?.trim() || ""
    const courseId = searchParams.get("courseId") || ""
    const orgId = searchParams.get("orgId") || ""
    const mentorIdToOpen = searchParams.get("mentorId") || ""
    // Selected expertise lives in the URL (?expertise=React,SQL) like search/page
    const expertiseParam = searchParams.get("expertise") || ""
    const selectedExpertise = useMemo(
        () => expertiseParam.split(",").map((skill) => skill.trim()).filter(Boolean),
        [expertiseParam]
    )
    const [showAllMentors, setShowAllMentors] = useState(false)
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Full skill list (no search) - used for the mentor counts on the selected chips
    const { skills } = useMentorSkills()

    const { mentors, total, loading, error, refetchMentors } = useMentors(
        searchQuery,
        showAllMentors,
        limit,
        offset,
        orgId || undefined,
        selectedExpertise
    )

    const {
        mentors: availableMentorPool,
        loading: availableMentorPoolLoading,
        error: availableMentorPoolError,
    } = useMentors(searchQuery, !showAllMentors, 10, 0, orgId || undefined, selectedExpertise)

    const { mentorProfile: requestedMentorProfile, loading: requestedMentorLoading } = useMentorProfile(
        mentorIdToOpen || undefined,
        Boolean(mentorIdToOpen),
        orgId || undefined
    )

    const { metrics, loading: metricsLoading } = useStudentMentorMetrics()

    const availableMentors = useMemo(() => {
        return availableMentorPool.filter((mentor) => {
            return mentor.availabilityStatus?.trim().toLowerCase() === "available"
        })
    }, [availableMentorPool])

    useEffect(() => {
        if (!mentorIdToOpen || availableMentorPoolLoading || requestedMentorLoading) return

        const mentorToOpen = availableMentorPool.find(
            (mentor) => String(mentor.userId) === mentorIdToOpen
        )

        if (mentorToOpen) {
            setSelectedMentor(mentorToOpen)
            setIsDrawerOpen(true)
            return
        }

        if (requestedMentorProfile) {
            setSelectedMentor({
                userId: String(requestedMentorProfile.mentorUserId || mentorIdToOpen),
                name: requestedMentorProfile.name || `Mentor ${mentorIdToOpen}`,
                email: "",
                role: requestedMentorProfile.title || null,
                bio: requestedMentorProfile.bio || null,
                pastExperiences: requestedMentorProfile.pastExperiences || null,
                expertise: requestedMentorProfile.expertise,
                title: requestedMentorProfile.title || null,
                availabilityStatus: "available",
                availableSlots: 0,
                organizationId: orgId ? Number(orgId) : undefined,
            })
            setIsDrawerOpen(true)
        }
    }, [availableMentorPool, availableMentorPoolLoading, mentorIdToOpen, requestedMentorLoading, requestedMentorProfile, orgId])

    const totalForPagination = showAllMentors ? total : availableMentors.length
    const totalPages = Math.max(1, Math.ceil(totalForPagination / limit))
    const visibleMentors = useMemo(() => {
        if (showAllMentors) return mentors

        return availableMentors.slice(offset, offset + limit)
    }, [showAllMentors, mentors, availableMentors, offset, limit])

    const pageLoading = showAllMentors ? loading : availableMentorPoolLoading
    const pageError = showAllMentors ? error : availableMentorPoolError

    const handleShowAllMentorsToggle = useCallback((pressed: boolean) => {
        setShowAllMentors(pressed)

        const params = new URLSearchParams(searchParams.toString())
        params.set("page", "1")
        router.replace(`?${params.toString()}`)
    }, [router, searchParams])

    const handleExpertiseChange = useCallback((next: string[]) => {
        const params = new URLSearchParams(searchParams.toString())
        if (next.length > 0) {
            params.set("expertise", next.join(","))
        } else {
            params.delete("expertise")
        }
        params.set("page", "1")
        router.replace(`?${params.toString()}`, { scroll: false })
    }, [router, searchParams])

    const fetchMentorsData = useCallback((nextOffset: number) => {
        if (!showAllMentors) return

        refetchMentors({
            searchTerm: searchQuery,
            limit,
            offset: nextOffset,
            organizationId: orgId || undefined,
            expertise: selectedExpertise,
        })
    }, [showAllMentors, refetchMentors, searchQuery, limit, orgId, selectedExpertise])
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        try {
            const response = await api.get<MentorsSearchResponse>(
                `/student/mentors?search=${encodeURIComponent(query)}${orgId ? `&organizationId=${encodeURIComponent(orgId)}` : ""}`
            );

            const mentorList = parseMentors(response.data);

            return mentorList.map((mentor) => ({
                ...mentor,
                id: mentor.userId,
            }));
        } catch (fetchError) {
            console.error("Error fetching mentor suggestions:", fetchError);
            return [];
        }
    }, [orgId]);

    const fetchSearchResultsApi = useCallback(async () => {
        return [];
    }, []);

    const defaultFetchApi = useCallback(async () => {
        return [];
    }, []);

    const handleMentorClick = (mentor: Mentor) => {
        setSelectedMentor(mentor)
        setIsDrawerOpen(true)
    }

    return (
        // <div className="w-full max-w-full min-w-0 overflow-x-hidden px-6 py-8 font-manrope">
        <div className="mx-auto w-full max-w-[90rem] min-w-0 px-6 py-8 font-manrope space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-left text-gray-900">Mentorship</h1>
                {/* <p className="mt-1 text-sm text-gray-500 text-left">Browse mentors or review your booked sessions.</p> */}
            </div>

            <MentorshipTabs courseId={courseId} orgId={orgId} />

            {/* Booking Metrics Banner */}
            {!metricsLoading && metrics && (
                <div className={`rounded-2xl border px-4 py-3 sm:px-5 ${
                    metrics.canBook
                        ? 'bg-green-50 border-green-200 dark:bg-success/5 dark:border-success/20'
                        : 'bg-yellow-50 border-yellow-200 dark:bg-warning/5 dark:border-warning/20'
                }`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0 text-left">
                            <p className="text-sm font-semibold text-foreground">
                                {metrics.canBook
                                    ? 'You can book a session now'
                                    : `You can book your next session from ${formatEligibleDate(metrics.nextEligible)}`}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                Each session uses 1 credit. Sessions need to be 2 weeks apart.
                            </p>
                        </div>
                        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                            <span className={`h-2 w-2 rounded-full ${
                                metrics.canBook && metrics.remainingCredits > 0 ? 'bg-green-600' : 'bg-yellow-500'
                            }`} />
                            {typeof metrics.quotaUsed === 'number'
                                ? `${metrics.remainingCredits} of ${metrics.remainingCredits + metrics.quotaUsed} credits left`
                                : `${metrics.remainingCredits} credits left`}
                        </span>
                    </div>
                </div>
            )}

            {/* Filter buttons */}
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:gap-4">

                    <SearchBox
                        placeholder="Search mentors..."
                        fetchSuggestionsApi={fetchSuggestionsApi}
                        fetchSearchResultsApi={fetchSearchResultsApi}
                        defaultFetchApi={defaultFetchApi}
                        getSuggestionLabel={(mentor) => (
                            <div>
                                <p className="text-sm font-medium">{mentor.name}</p>
                                <p className="text-xs text-gray-500">{mentor.email}</p>
                            </div>
                        )}
                        inputWidth="w-full sm:w-[400px]"
                    />
                    <Toggle
                        pressed={showAllMentors}
                        onPressedChange={handleShowAllMentorsToggle}
                        className="
                            h-10
                            rounded-xl
                            border
                            px-4
                            shadow-none
                            flex
                            items-center
                            gap-2
                            bg-white
                            dark:bg-card
                            dark:hover:bg-card
                            mt-2
                            border-gray-300
                            text-gray-700
                            hover:bg-white
                            hover:text-gray-700
                            hover:border-gray-300
                            data-[state=on]:bg-[#eef7ee]
                            data-[state=on]:text-[#2f6b3d]
                            data-[state=on]:border-[#cfe3cf]
                            data-[state=on]:hover:bg-[#eef7ee]
                            data-[state=on]:hover:text-[#2f6b3d]
                        "
                        >
                        <div
                            className={`
                            relative flex h-5 w-9 items-center rounded-full transition-all
                            ${showAllMentors ? "bg-[#2f6b3d]" : "bg-gray-300"}
                            `}
                        >
                            <div
                            className={`
                                h-4 w-4 rounded-full bg-white shadow-sm transition-all
                                ${showAllMentors ? "translate-x-4" : "translate-x-0.5"}
                            `}
                            />
                        </div>

                        <span className="text-sm font-medium whitespace-nowrap">
                            Show all mentors
                        </span>
                    </Toggle>

                    <MentorExpertiseDropdown
                        selected={selectedExpertise}
                        onChange={handleExpertiseChange}
                        className="sm:mt-2"
                    />
                </div>

                <p className="text-left text-xs text-muted-foreground lg:text-right">
                    {showAllMentors
                        ? `${totalForPagination} mentors shown`
                        : `${totalForPagination} available`}
                </p>

            </div>

            <MentorExpertiseChips
                skills={skills}
                selected={selectedExpertise}
                onRemove={(name) =>
                    handleExpertiseChange(
                        selectedExpertise.filter((skill) => skill.toLowerCase() !== name.toLowerCase())
                    )
                }
                onClearAll={() => handleExpertiseChange([])}
            />

            {pageLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-64 rounded-3xl" />
                        <Skeleton className="h-64 rounded-3xl" />
                        <Skeleton className="h-64 rounded-3xl" />
                    </div>
                    <div className="flex justify-center">
                        <Skeleton className="h-10 w-56 rounded-lg" />
                    </div>
                </div>
            ) : pageError ? (
                <p className="text-sm text-red-500">{pageError}</p>
            ) : visibleMentors.length === 0 ? (
                <p className="text-left text-sm text-muted-foreground">
                    {selectedExpertise.length > 0
                        ? "No mentors match the selected expertise. Try removing a filter."
                        : "No mentors available right now."}
                </p>
            ) : (
                <div className="grid w-full grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {visibleMentors.map((mentor, index) => {
                        const expertise = Array.isArray(mentor.expertise)
                            ? mentor.expertise
                            : [];
                        const availabilityStatus = mentor.availabilityStatus?.trim() || "Unavailable";
                        const isAvailable = availabilityStatus.toLowerCase() === "available";
                        const showUnavailableState = showAllMentors && !isAvailable;

                        const initials = mentor.name
                            .split(" ")
                            .map((namePart) => namePart[0])
                            .join("")
                            .toUpperCase();

                        const mentorCardBody = (
                            <>
                                {/* Top */}
                                <div className="flex min-w-0 justify-between gap-3">
                                    <div className="flex min-w-0 gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-900 text-sm font-bold text-white dark:bg-green-800">
                                            {initials.slice(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-left text-base font-semibold text-foreground">
                                                {mentor.name}
                                            </p>
                                            <p className="mt-0.5 truncate text-left text-xs text-muted-foreground">
                                                {mentor.email}
                                            </p>
                                            <div className="mt-1 flex min-w-0 flex-wrap gap-2">
                                                <span className="inline-flex max-w-full items-center truncate rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                                                    {mentor.orgName || 'Unknown org'}
                                                </span>
                                            </div>
                                            {(mentor.title || mentor.role) && (
                                                <p className="mt-1 truncate text-left text-sm text-muted-foreground">
                                                    {mentor.title || mentor.role}
                                                </p>
                                            )}
                                            {/* <p className="truncate text-left text-xs text-gray-500">
                                                {mentor.email}
                                            </p>
                                            <div className="flex min-w-0 flex-wrap gap-2 pt-1">
                                                <span className="inline-flex max-w-full items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                                                    {mentor.orgName || 'Unknown org'}
                                                </span>
                                            </div> */}
                                        </div>
                                    </div>
                                    {showAllMentors && !isAvailable && (
                                        <span className="inline-flex shrink-0 items-center rounded-full px-5 h-7 text-xs font-medium bg-gray-100 dark:bg-gray-600 dark:text-gray-100 text-gray-500">
                                            Unavailable
                                        </span>
                                    )}
                                </div>

                                {/* Skills */}
                                <div className="mt-4 min-h-[30px]">

                                    {expertise.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic text-left">
                                            No expertise listed
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">

                                            {expertise.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-md bg-muted px-2 py-1 text-xs text-foreground/80"
                                                >
                                                    {skill}
                                                </span>
                                            ))}

                                        </div>
                                    )}

                                </div>

                                {/* Divider */}
                                <div className="mt-4 border-t border-border pt-3 text-left">
                                    <p className="text-sm text-muted-foreground">
                                        {mentor.availableSlots} Available Slots
                                    </p>
                                </div>

                            </>
                        );

                        if (showUnavailableState) {
                            return (
                                <div
                                    key={`${mentor.userId}-${mentor.organizationId}`}
                                    className="relative block min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-5 text-left opacity-50 cursor-not-allowed pointer-events-none"
                                >
                                    {mentorCardBody}
                                </div>
                            );
                        }

                        return (
                            <button
                                id={index === 0 ? "tour-mentor-card" : undefined}
                                key={`${mentor.userId}-${mentor.organizationId}`}
                                type="button"
                                onClick={() => handleMentorClick(mentor)}
                                className="group relative block w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                {mentorCardBody}
                            </button>
                        );
                    })}

                </div>
            )}
            <DataTablePagination
                totalStudents={totalForPagination}
                lastPage={totalPages}
                pages={totalPages}
                fetchStudentData={fetchMentorsData}
            />

            <MentorBookingDrawer
                mentor={selectedMentor}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                courseId={courseId}
                orgId={orgId}
            />
        </div>
    );
}
