"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Mentor, useMentors } from "@/hooks/useMentors";
import { api } from "@/utils/axios.config";
import { SearchBox } from "@/utils/searchBox";
import { ArrowLeft } from "lucide-react"
type MentorsSearchResponse = Mentor[] | { data?: Mentor[] };
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination';

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
    // const searchParams = useSearchParams();
    // const searchQuery = searchParams.get("search")?.trim() || "";
    // const { mentors, loading, error } = useMentors(searchQuery);

    const searchParams = useSearchParams()

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const searchQuery = searchParams.get("search")?.trim() || ""
    const courseId = searchParams.get("courseId") || ""

    const { mentors, total, loading, error, refetchMentors } = useMentors(
        searchQuery,
        true,
        limit,
        offset
    )

    const totalPages = Math.max(1, Math.ceil(total / limit))

    const fetchMentorsData = useCallback((nextOffset: number) => {
        refetchMentors({
            searchTerm: searchQuery,
            limit,
            offset: nextOffset,
        })
    }, [limit, refetchMentors, searchQuery])
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        try {
            const response = await api.get<MentorsSearchResponse>(
                `/mentors?search=${encodeURIComponent(query)}`
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

    return (
        // <div className="w-full max-w-full min-w-0 overflow-x-hidden px-6 py-8 font-manrope">
        <div className="w-full max-w-full min-w-0 px-6 py-8 font-manrope">

            <Link
                 href={courseId ? `/student/course/${courseId}` : "/student"}
                className="flex items-center mb-6 gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft size={16} />
                Back to {courseId ? "course" : "dashboard"}
            </Link>
            {/* Filter buttons */}
            <div className="mb-6 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

                <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex gap-2 flex-wrap">
                           <h1 className="text-xl font-semibold text-left">All Mentors</h1>
                    </div>

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
                </div>

                <p className="text-xs text-gray-400">
                    {mentors.length} results
                </p>

            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Loading mentors...</p>
            ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : mentors.length === 0 ? (
                <p className="text-sm text-gray-500">No mentors available right now.</p>
            ) : (
                <div className="grid w-full grid-cols-1 gap-5 bg-white md:grid-cols-2 lg:grid-cols-3">
                    {mentors.map((mentor) => {
                        const expertise = Array.isArray(mentor.expertise)
                            ? mentor.expertise
                            : [];
                        const availabilityStatus = mentor.availabilityStatus?.trim() || "Unavailable";
                        const normalizedAvailabilityStatus = availabilityStatus.toLowerCase();
                        const availabilityStatusClassName =
                            normalizedAvailabilityStatus === "available"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700";

                        const initials = mentor.name
                            .split(" ")
                            .map((namePart) => namePart[0])
                            .join("")
                            .toUpperCase();

                        return (
                            <Link
                                key={mentor.userId}
                                href={`/student/mentors/${mentor.userId}`}
                                className="group relative block overflow-hidden rounded-3xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Top */}
                                <div className="flex min-w-0 justify-between gap-2">
                                    <div className="flex min-w-0 gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-800 flex items-center justify-center text-white text-sm font-bold">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-left text-base font-semibold">
                                                {mentor.name}
                                            </p>
                                            <p className="truncate text-left text-sm text-gray-500">
                                                {mentor.title || mentor.role}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex shrink-0 items-center rounded-full px-5 h-7 text-xs font-medium ${availabilityStatusClassName}`}
                                    >
                                        {mentor.availabilityStatus}
                                    </span>
                                    
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

                                    <div className="flex items-center gap-1 text-sm">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        {"0.0"}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                       {mentor.availableSlots}
                                       <span className="ml-2">Available Slots</span>
                                    </p>

                                </div>
                                {/* View Profile Button */}
                                <div className="absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="block text-center bg-green-800 text-white py-2 rounded-b-3xl text-xs font-semibold">
                                        View Profile →
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                </div>
            )}
            <DataTablePagination
                totalStudents={total}
                lastPage={totalPages}
                pages={totalPages}
                fetchStudentData={fetchMentorsData}
            />
        </div>
    );
}