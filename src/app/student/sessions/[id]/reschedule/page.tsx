"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useRescheduleMentorSlotBooking } from "@/hooks/useRescheduleMentorSlotBooking";
import { useMentorAvailability } from "@/hooks/useMentorAvailability";
import { useMentorProfile } from "@/hooks/useMentorProfile";

const getBookingIdFromParam = (
	idParam: string | string[] | undefined
): number | null => {
	const id = Array.isArray(idParam) ? idParam[0] : idParam;

	if (!id) {
		return null;
	}

	const parsedId = Number(id);
	return Number.isFinite(parsedId) ? parsedId : null;
};

export default function RescheduleBookingPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const bookingId = getBookingIdFromParam(
		params["id"] as string | string[] | undefined
	);
	const mentorId = searchParams.get("mentorId") || undefined;
	const currentSlotIdParam = searchParams.get("currentSlotId");
	const currentSlotId = currentSlotIdParam ? Number(currentSlotIdParam) : null;

	const [selectedNewSlotId, setSelectedNewSlotId] = useState<number | null>(null);
	const [reason, setReason] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	const {
		availability,
		loading: availabilityLoading,
		error: availabilityError,
		refetchMentorAvailability,
	} = useMentorAvailability(mentorId);

	const { mentorProfile } = useMentorProfile(mentorId);
	const mentorDisplayName =
		mentorProfile?.name?.trim() || (mentorId ? `Mentor ${mentorId}` : "-");

	const formatDateOnly = (value?: string | null) => {
		if (!value) return "-";

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTimeOnly = (value?: string | null) => {
		if (!value) return "-";

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";

		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatTimeRange = (start?: string | null, end?: string | null) => {
		const startTime = formatTimeOnly(start);
		const endTime = formatTimeOnly(end);

		if (startTime === "-" && endTime === "-") return "-";
		if (startTime === "-") return endTime;
		if (endTime === "-") return startTime;

		return `${startTime} - ${endTime}`;
	};

	const { proposeReschedule, isRescheduling, error, responseData } =
		useRescheduleMentorSlotBooking();

	const handleProposeReschedule = async () => {
		if (!bookingId) {
			setValidationError("Invalid booking id.");
			return;
		}

		if (!mentorId) {
			setValidationError("Missing mentor id for slot availability.");
			return;
		}

		if (!selectedNewSlotId || selectedNewSlotId <= 0) {
			setValidationError("Please select a new slot.");
			return;
		}

		if (Number.isFinite(currentSlotId) && currentSlotId !== null && selectedNewSlotId === currentSlotId) {
			setValidationError("Cannot reschedule to the same slot.");
			return;
		}

		if (reason.trim().length < 10) {
			setValidationError("Reschedule reason must be at least 10 characters.");
			return;
		}

		setValidationError(null);
		await proposeReschedule(bookingId, selectedNewSlotId, reason.trim());
	};

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<Link
				href="/student/sessions"
				className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
			>
				<ArrowLeft size={16} />
				Back to Sessions
			</Link>

			<div className="border rounded-2xl bg-white p-6 space-y-4">
				<h1 className="text-xl font-semibold text-left">Propose Reschedule</h1>
				<p className="text-sm text-gray-500 text-left">Booking ID: {bookingId ?? "-"}</p>
				<p className="text-sm text-gray-500 text-left">Mentor: {mentorDisplayName}</p>

				<div className="space-y-2">
					<label className="text-sm font-medium block text-left">Select New Slot</label>

					{availabilityLoading && (
						<p className="text-sm text-muted-foreground text-left">Loading available slots...</p>
					)}

					{!availabilityLoading && availabilityError && (
						<div className="space-y-2">
							<p className="text-sm text-red-500 text-left">{availabilityError}</p>
							<button
								onClick={refetchMentorAvailability}
								className="text-xs border px-3 py-1.5 rounded-full"
							>
								Retry slots
							</button>
						</div>
					)}

					{!availabilityLoading && !availabilityError && availability.length === 0 && (
						<p className="text-sm text-muted-foreground text-left">No slots available for reschedule.</p>
					)}

					{!availabilityLoading && !availabilityError && availability.length > 0 && (
						<div className="space-y-2 max-h-72 overflow-y-auto pr-1">
							{availability.map((slot) => {
								const isCurrent = Number.isFinite(currentSlotId) && currentSlotId !== null && slot.id === currentSlotId;
								const isSelectable = !isCurrent;
								const isSelected = selectedNewSlotId === slot.id;

								return (
									<button
										key={slot.id}
										type="button"
										onClick={() => isSelectable && setSelectedNewSlotId(slot.id)}
										disabled={!isSelectable}
										className={`w-full border rounded-xl p-3 text-left ${
											isSelected
												? "border-green-700 bg-green-50"
												: "border-gray-200 bg-white"
										} ${!isSelectable ? "opacity-60 cursor-not-allowed" : ""}`}
									>
										<p className="text-sm font-semibold">Slot ID: {slot.id}</p>
										<div className="mt-1 space-y-1 text-xs text-muted-foreground">
											<p className="flex items-center gap-2">
												<Calendar size={12} />
												{formatDateOnly(slot.slotStartDateTime || slot.slotEndDateTime)}
											</p>
											<p className="flex items-center gap-2">
												<Clock size={12} />
												{formatTimeRange(slot.slotStartDateTime, slot.slotEndDateTime)}
											</p>
											<p>
												{isCurrent
													? "Current booked slot"
													: `Status: ${slot.status} · Capacity: ${slot.currentBookedCount}/${slot.maxCapacity}`}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					)}

					{Number.isFinite(currentSlotId) && currentSlotId !== null && (
						<p className="text-xs text-muted-foreground text-left">
							Current slot id: {currentSlotId} (do not use this same id)
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium block text-left">Reason</label>
					<textarea
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Need to move to another time"
						className="w-full min-h-[120px] border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
					/>
				</div>

				{validationError && <p className="text-sm text-red-500 text-left">{validationError}</p>}
				{error && <p className="text-sm text-red-500 text-left">{error}</p>}

				{responseData && (
					<div className="text-sm text-left rounded-xl border border-green-100 bg-green-50 text-green-700 p-3">
						<p className="font-semibold">{responseData.message || "Reschedule request submitted."}</p>
						<p>
							Reschedule status: {responseData.rescheduleStatus || "pending"}
						</p>
						<p>
							Session lifecycle: {responseData.sessionLifecycleState || "RESCHEDULE_PENDING"}
						</p>
					</div>
				)}

				<button
					onClick={handleProposeReschedule}
					disabled={isRescheduling}
					className="bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isRescheduling ? "Submitting..." : "Submit Reschedule Request"}
				</button>
			</div>
		</div>
	);
}
