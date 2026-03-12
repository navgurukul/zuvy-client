"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useMentors } from "@/hooks/useMentors";

export default function MentorsPage() {
    const { mentors, loading, error } = useMentors();

    return (
        <div className=" p-6">

            {/* Filter buttons */}
            <div className="flex justify-between mb-6">

                <div className="flex gap-2">
                    <button className="bg-green-800 text-white text-xs px-4 py-1.5 rounded-full">
                        All mentors
                    </button>

                    <button className="border text-xs px-4 py-1.5 rounded-full">
                        Accepting sessions
                    </button>

                    <button className="border text-xs px-4 py-1.5 rounded-full">
                        Verified only
                    </button>
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
                                    <p className="inline-flex items-center text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                                        <span className="mr-1 text-green-500">•</span>
                                        Accepting
                                    </p>
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