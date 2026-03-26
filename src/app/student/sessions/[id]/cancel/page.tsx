"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCancelMentorSlotBooking } from "@/hooks/useCancelMentorSlotBooking";

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

export default function CancelBookingPage() {
	const params = useParams();
	const bookingId = getBookingIdFromParam(
		params["id"] as string | string[] | undefined
	);

	const [reason, setReason] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const { cancelBooking, isCancelling, error, message } = useCancelMentorSlotBooking();

	const handleCancelBooking = async () => {
		const trimmedReason = reason.trim();

		if (trimmedReason.length < 10) {
			setValidationError("Reason must be at least 10 characters.");
			return;
		}

		if (!bookingId) {
			setValidationError("Invalid booking id.");
			return;
		}

		setValidationError(null);
		await cancelBooking(bookingId, trimmedReason, "student");
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
				<h1 className="text-xl font-semibold text-left">Cancel Booking</h1>
				<p className="text-sm text-gray-500 text-left">
					Booking ID: {bookingId ?? "-"}
				</p>

				<div className="space-y-2">
					<label className="text-sm font-medium block text-left">Reason for cancellation</label>
					<textarea
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Unable to attend due to schedule conflict"
						className="w-full min-h-[120px] border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
					/>
					<p className="text-xs text-gray-500 text-left">Minimum 10 characters required.</p>
				</div>

				{validationError && <p className="text-sm text-red-500 text-left">{validationError}</p>}
				{error && <p className="text-sm text-red-500 text-left">{error}</p>}

				{message && (
					<div className="text-sm text-left rounded-xl border border-green-100 bg-green-50 text-green-700 p-3">
						<p className="font-semibold">{message}</p>
						<p>Status: cancelled</p>
					</div>
				)}

				<button
					onClick={handleCancelBooking}
					disabled={isCancelling || !!message}
					className="bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isCancelling ? "Cancelling..." : "Confirm Cancel Booking"}
				</button>
			</div>
		</div>
	);
}
