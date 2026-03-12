"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRescheduleMentorSlotBooking } from "@/hooks/useRescheduleMentorSlotBooking";

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
	const bookingId = getBookingIdFromParam(
		params["id"] as string | string[] | undefined
	);

	const [newSlotIdInput, setNewSlotIdInput] = useState("");
	const [reason, setReason] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	const { proposeReschedule, isRescheduling, error, responseData } =
		useRescheduleMentorSlotBooking();

	const handleProposeReschedule = async () => {
		if (!bookingId) {
			setValidationError("Invalid booking id.");
			return;
		}

		const newSlotId = Number(newSlotIdInput);
		if (!Number.isFinite(newSlotId) || newSlotId <= 0) {
			setValidationError("Please enter a valid new slot id.");
			return;
		}

		if (reason.trim().length === 0) {
			setValidationError("Reason is required.");
			return;
		}

		setValidationError(null);
		await proposeReschedule(bookingId, newSlotId, reason.trim());
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

				<div className="space-y-2">
					<label className="text-sm font-medium block text-left">New Slot ID</label>
					<input
						type="number"
						value={newSlotIdInput}
						onChange={(event) => setNewSlotIdInput(event.target.value)}
						placeholder="35"
						className="w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
					/>
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
