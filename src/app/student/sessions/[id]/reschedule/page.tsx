"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useRescheduleMentorSlotBooking } from "@/hooks/useRescheduleMentorSlotBooking";
import { useGetRescheduleSlots } from "@/app/student/hooks/useGetRescheduleSlots";
import { useMentorProfile } from "@/app/student/hooks/useMentorProfile";
import { getSessionsHref } from "@/utils/studentMentorshipRoutes";
import { formatDateOnly, formatTimeRange } from "@/utils/sessionDateTime";

const getBookingIdFromParam = (
	idParam: string | string[] | undefined
): number | undefined => {
	const id = Array.isArray(idParam) ? idParam[0] : idParam;

	if (!id) {
		return undefined;
	}

	const parsedId = Number(id);
	return Number.isFinite(parsedId) ? parsedId : undefined;
};

export default function RescheduleBookingPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const bookingId = getBookingIdFromParam(
		params["id"] as string | string[] | undefined
	);
	const mentorId = searchParams.get("mentorId") || undefined;
	const courseId = searchParams.get("courseId") || "";
	const orgId = searchParams.get("orgId") || "";
	const organizationId = searchParams.get("organizationId") || orgId || undefined;
	const currentSlotIdParam = searchParams.get("currentSlotId");
	const currentSlotId = currentSlotIdParam ? Number(currentSlotIdParam) : null;

	const [selectedNewSlotId, setSelectedNewSlotId] = useState<number | null>(null);
	const [reason, setReason] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	const {
		slots,
		loading: slotsLoading,
		error: slotsError,
		refetchSlots,
	} = useGetRescheduleSlots(bookingId, true);

	const { mentorProfile } = useMentorProfile(mentorId, true, organizationId);
	const mentorDisplayName =
		mentorProfile?.name?.trim() || (mentorId ? `Mentor ${mentorId}` : "-");

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
				href={getSessionsHref({ courseId, orgId })}
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

					{slotsLoading && (
						<p className="text-sm text-muted-foreground text-left">Loading available slots...</p>
					)}

					{!slotsLoading && slotsError && (
						<div className="space-y-2">
							<p className="text-sm text-red-500 text-left">{slotsError}</p>
							<button
								onClick={refetchSlots}
								className="text-xs border px-3 py-1.5 rounded-full"
							>
								Retry slots
							</button>
						</div>
					)}

					{!slotsLoading && !slotsError && slots.length === 0 && (
						<p className="text-sm text-muted-foreground text-left">No slots available for reschedule.</p>
					)}

					{!slotsLoading && !slotsError && slots.length > 0 && (
						<div className="space-y-2 max-h-72 overflow-y-auto pr-1">
							{slots.map((slot) => {
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
										{/* Slot id removed from UI for students */}
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

					{/* Current slot id hidden from UI — retained only in URL params for logic */}
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
