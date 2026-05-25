"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mentor, useMentors } from "@/hooks/useMentors";
import { api } from "@/utils/axios.config";
import { SearchBox } from "@/utils/searchBox";
import { useStudentMentorMetrics } from "@/hooks/useStudentMentorMetrics";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import MentorshipTabs from "../_components/MentorshipTabs";
import MentorBookingDrawer from "@/app/student/_components/MentorBookingDrawer";


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
    const [showAllMentors, setShowAllMentors] = useState(false)
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const { mentors, total, loading, error, refetchMentors } = useMentors(
        searchQuery,
        showAllMentors,
        limit,
        offset
    )

    const {
        mentors: availableMentorPool,
        loading: availableMentorPoolLoading,
        error: availableMentorPoolError,
    } = useMentors(searchQuery, !showAllMentors, 1000, 0)

    const { metrics, loading: metricsLoading } = useStudentMentorMetrics()

    const availableMentors = useMemo(() => {
        return availableMentorPool.filter((mentor) => {
            return mentor.availabilityStatus?.trim().toLowerCase() === "available"
        })
    }, [availableMentorPool])

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

    const fetchMentorsData = useCallback((nextOffset: number) => {
        if (!showAllMentors) return

        refetchMentors({
            searchTerm: searchQuery,
            limit,
            offset: nextOffset,
        })
    }, [showAllMentors, refetchMentors, searchQuery, limit])
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        try {
            const response = await api.get<MentorsSearchResponse>(
                `/student/mentors?search=${encodeURIComponent(query)}`
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
    }, []);

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

            <MentorshipTabs courseId={courseId} />

            {/* Booking Metrics Banner */}
            {!metricsLoading && metrics && (
                <div className={`mb-6 rounded-2xl border px-4 py-3 ${
                    metrics.canBook
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                }`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3 text-left">
                            <Calendar className={`w-5 h-5 flex-shrink-0 ${
                                metrics.canBook ? 'text-green-700' : 'text-yellow-700'
                            }`} />
                            <p className={`truncate text-sm font-medium ${
                                metrics.canBook ? 'text-green-900' : 'text-yellow-900'
                            }`}>
                                {metrics.canBook
                                    ? 'You can book a session now!'
                                    : `You can book your next session from ${formatEligibleDate(metrics.nextEligible)}`}
                            </p>
                        </div>
                        <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            metrics.canBook
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            Remaining Credits: {metrics.remainingCredits}
                        </span>
                    </div>
                </div>
            )}

            {/* Filter buttons */}
            <div className="mb-6 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                    
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
                </div>

                <p className="text-xs text-gray-500">
                    {showAllMentors
                        ? `${totalForPagination} mentors shown`
                        : `${totalForPagination} available`}
                </p>

            </div>

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
                <p className="text-sm text-gray-500">No mentors available right now.</p>
            ) : (
                <div className="grid w-full grid-cols-1 gap-5  md:grid-cols-2 lg:grid-cols-3">
                    {visibleMentors.map((mentor) => {
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
                                        <div className="h-10 w-10 rounded-full bg-green-800 flex items-center justify-center text-white text-sm font-bold">
                                            {initials}
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate text-left text-base font-semibold">
                                                {mentor.name}
                                            </p>
                                            <p className="truncate text-left text-xs text-gray-500">
                                                {mentor.email}
                                            </p>
                                            <div className="flex min-w-0 flex-wrap gap-2 pt-1">
                                                <span className="inline-flex max-w-full items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                                                    {mentor.orgName || 'Unknown org'}
                                                </span>
                                            </div>
                                            <p className="truncate text-left text-sm text-gray-500">
                                                {mentor.title || mentor.role}
                                            </p>
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
                                        <span className="inline-flex shrink-0 items-center rounded-full px-5 h-7 text-xs font-medium bg-gray-100 text-gray-500">
                                            Unavailable
                                        </span>
                                    )}
                                </div>

                                {/* Skills */}
                                <div className="mt-4 min-h-[30px]">

                                    {expertise.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic text-left">
                                            No expertise listed
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">

                                            {expertise.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="text-xs bg-gray-200 px-2 py-1 rounded-md"
                                                >
                                                    {skill}
                                                </span>
                                            ))}

                                        </div>
                                    )}

                                </div>

                                {/* Divider */}
                                <div className="border-t mt-4 pt-3 flex justify-between">
                                    <p className="text-sm text-gray-400">
                                       {mentor.availableSlots}
                                       <span className="ml-2 text-sm">Available Slots</span>
                                    </p>

                                </div>

                            </>
                        );

                        if (showUnavailableState) {
                            return (
                                <div
                                    key={`${mentor.userId}-${mentor.organizationId}`}
                                    className="relative block overflow-hidden rounded-3xl border border-gray-200 p-5 shadow-sm opacity-50 cursor-not-allowed pointer-events-none"
                                >
                                    {mentorCardBody}
                                </div>
                            );
                        }

                        return (
                            <button
                                key={`${mentor.userId}-${mentor.organizationId}`}
                                type="button"
                                onClick={() => handleMentorClick(mentor)}
                                className="group relative block w-full overflow-hidden rounded-3xl border border-gray-200 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
            />
        </div>
    );
}