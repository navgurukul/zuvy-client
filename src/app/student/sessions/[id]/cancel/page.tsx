"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCancelMentorSlotBooking } from "@/app/student/hooks/useCancelMentorSlotBooking";
import { useStudentMentorMetrics } from "@/app/student/hooks/useStudentMentorMetrics";
import { useMyMentorSessions } from "@/hooks/useMyMentorSessions";
import { getSessionsHref } from "@/utils/studentMentorshipRoutes";

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

// e.g. "Fri, 6 Nov at 6:00 PM"
const formatSessionTiming = (value?: string | null): string | null => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;

	const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
	const dayMonth = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
	const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

	return `${weekday}, ${dayMonth} at ${time}`;
};

export default function CancelBookingPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const bookingId = getBookingIdFromParam(
		params["id"] as string | string[] | undefined
	);
	const courseId = searchParams.get("courseId") || "";
	const orgId = searchParams.get("orgId") || "";
	const sessionsHref = getSessionsHref({ courseId, orgId });

	const [reason, setReason] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const { cancelBooking, isCancelling, error, message } = useCancelMentorSlotBooking();

	// Booking details (mentor name, timing) come from the student's upcoming sessions
	const { sessions, loading: sessionsLoading } = useMyMentorSessions(
		bookingId !== null,
		"/student/mentor-sessions/my",
		"upcoming"
	);
	const session = useMemo(
		() => sessions.find((item) => Number(item.id) === bookingId) || null,
		[sessions, bookingId]
	);

	const { metrics } = useStudentMentorMetrics(true);
	const creditsAfterCancel =
		typeof metrics?.remainingCredits === "number" ? metrics.remainingCredits + 1 : null;

	const mentorName = session?.mentorName?.trim() || null;
	const sessionTiming = formatSessionTiming(session?.slotStart || session?.slotEnd);
	const bookingMeta = [
		`Booking #${bookingId ?? "-"}`,
		mentorName,
		sessionTiming,
	].filter(Boolean);

	const isReasonValid = reason.trim().length >= 10;

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
				href={sessionsHref}
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft size={16} />
				Back to Sessions
			</Link>

			<div className="border border-border rounded-2xl bg-card p-6 space-y-5">
				<div className="space-y-2">
					<h1 className="text-xl font-semibold text-left">Cancel Booking</h1>
					{sessionsLoading && !session ? (
						<div className="h-5 w-72 max-w-full animate-pulse rounded bg-muted" />
					) : (
						<p className="text-sm text-muted-foreground text-left">
							{bookingMeta.join(" · ")}
						</p>
					)}
				</div>

				{!message && (
					<div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 text-left text-sm text-foreground dark:bg-green-950/30">
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700 dark:text-green-400" />
						<p>
							Your credit comes back
							{creditsAfterCancel !== null ? (
								<>
									, so you&apos;ll have{" "}
									<span className="font-semibold">{creditsAfterCancel} left</span>
								</>
							) : null}
							, and you can book again straight away.
						</p>
					</div>
				)}

				<div className="space-y-2">
					<label htmlFor="cancel-reason" className="text-sm font-medium block text-left">
						Reason for cancellation
					</label>
					<textarea
						id="cancel-reason"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Unable to attend due to schedule conflict"
						disabled={!!message}
						className="w-full min-h-[120px] border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
					/>
					<p className="text-xs text-muted-foreground text-left">
						Minimum 10 characters. Your mentor will see this.
					</p>
				</div>

				{validationError && <p className="text-sm text-destructive text-left">{validationError}</p>}
				{error && <p className="text-sm text-destructive text-left">{error}</p>}

				{message && (
					<div className="text-sm text-left rounded-xl border border-success/30 bg-success/10 text-success-dark p-3">
						<p className="font-semibold">{message}</p>
						<p>Status: cancelled</p>
					</div>
				)}

				<div className="flex flex-wrap items-center gap-3">
					<button
						onClick={handleCancelBooking}
						disabled={isCancelling || !!message || !isReasonValid}
						className="bg-primary text-primary-foreground hover:bg-primary-dark px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isCancelling ? "Cancelling..." : "Confirm Cancel Booking"}
					</button>
					{!message && (
						<Link
							href={sessionsHref}
							className="border border-border bg-background px-5 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
						>
							Keep session
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
