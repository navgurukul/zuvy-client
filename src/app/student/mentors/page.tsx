"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Mentor, useMentors } from "@/hooks/useMentors";
import { api } from "@/utils/axios.config";
import { SearchBox } from "@/utils/searchBox";
import {ArrowLeft } from "lucide-react"
type MentorsSearchResponse = Mentor[] | { data?: Mentor[] };

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
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search")?.trim() || "";
    const { mentors, loading, error } = useMentors(searchQuery);

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
        <div className=" p-6">
<Link
                href="/student"
                className="flex items-center mb-6 gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft size={16} />
                Back to dashboard
            </Link>
            {/* Filter buttons */}
            <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-start lg:justify-between">

                <div className="flex flex-col gap-3">
                    <div className="flex gap-2 flex-wrap">
                        <button className="bg-green-800 text-white text-xs px-4 py-1.5 rounded-full">
                            All mentors
                        </button>

                        <button className="border text-xs px-4 py-1.5 rounded-full">
                            Accepting sessions
                        </button>
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
                        inputWidth="w-full sm:w-[300px]"
                    />
                </div>

                <p className="text-xs text-gray-400 whitespace-nowrap">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-white">

                    {mentors.map((mentor) => {
                        const expertise = Array.isArray(mentor.expertise)
                            ? mentor.expertise
                            : [];

                        const initials = mentor.name
                            .split(" ")
                            .map((namePart) => namePart[0])
                            .join("")
                            .toUpperCase();

                        return (
                            <div
                                key={mentor.userId}
                                className="group relative overflow-hidden rounded-3xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Top */}
                                <div className="flex justify-between">
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-800 flex items-center justify-center text-white text-sm font-bold">
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold  text-left">
                                                {mentor.name}
                                            </p>
                                            <p className="text-sm text-gray-500 text-left">
                                                {mentor.title || mentor.role}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                       • Accepting
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
                                        0 sessions
                                    </p>

                                </div>
                                {/* View Profile Button */}
                                <div className="absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <Link
                                        href={`/student/mentors/${mentor.userId}`}
                                        className="block text-center bg-green-800 text-white py-2 rounded-b-3xl text-xs font-semibold"
                                    >
                                        View Profile →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}