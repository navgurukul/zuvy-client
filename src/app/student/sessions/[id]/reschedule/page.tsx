"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRescheduleMentorSlotBooking } from "@/hooks/useRescheduleMentorSlotBooking";
import { useMyMentorSessions } from "@/hooks/useMyMentorSessions";
import { useGetRescheduleSlots } from "@/app/student/hooks/useGetRescheduleSlots";
import { useMentorProfile } from "@/app/student/hooks/useMentorProfile";
import { getSessionsHref } from "@/utils/studentMentorshipRoutes";
import { cn } from "@/lib/utils";

// Slots offered by GET .../reschedule/slots start at least this far ahead (backend notice hours)
const RESCHEDULE_NOTICE_HOURS = 24;
const REASON_MIN_LENGTH = 10;

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

const toDate = (value?: string | null): Date | null => {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const formatTime = (date: Date): string =>
	date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// e.g. "Fri, 6 Nov"
const formatDay = (date: Date): string =>
	`${date.toLocaleDateString("en-GB", { weekday: "short" })}, ${date.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	})}`;

// e.g. "Fri, 6 Nov at 6:00 PM"
const formatSessionTiming = (value?: string | null): string | null => {
	const date = toDate(value);
	return date ? `${formatDay(date)} at ${formatTime(date)}` : null;
};

// e.g. "Sat, 7 Nov at 11:00 AM - 11:45 AM"
const formatSlotLabel = (start?: string | null, end?: string | null): string => {
	const startDate = toDate(start);
	const endDate = toDate(end);
	if (!startDate) return "Time not available";
	const range = endDate
		? `${formatTime(startDate)} - ${formatTime(endDate)}`
		: formatTime(startDate);
	return `${formatDay(startDate)} at ${range}`;
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
	const sessionsHref = getSessionsHref({ courseId, orgId });

	const [selectedNewSlotId, setSelectedNewSlotId] = useState<number | null>(null);
	const [reason, setReason] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	const {
		slots,
		loading: slotsLoading,
		error: slotsError,
		refetchSlots,
	} = useGetRescheduleSlots(bookingId, true);

	// Booking details (mentor name, current timing) come from the student's upcoming sessions
	const { sessions, loading: sessionsLoading } = useMyMentorSessions(
		bookingId !== undefined,
		"/student/mentor-sessions/my",
		"upcoming"
	);
	const session = useMemo(
		() => sessions.find((item) => Number(item.id) === bookingId) || null,
		[sessions, bookingId]
	);

	const { mentorProfile } = useMentorProfile(mentorId, true, organizationId);
	const mentorName =
		session?.mentorName?.trim() || mentorProfile?.name?.trim() || null;
	const mentorFirstName = mentorName?.split(/\s+/)[0] || "Your mentor";
	const currentTiming = formatSessionTiming(session?.slotStart || session?.slotEnd);

	const bookingMeta = [
		`Booking #${bookingId ?? "-"}`,
		mentorName,
		currentTiming ? `Now on ${currentTiming}` : null,
	].filter(Boolean);

	const selectableSlots = useMemo(
		() =>
			slots
				.filter((slot) => !(currentSlotId !== null && Number.isFinite(currentSlotId) && slot.id === currentSlotId))
				.sort(
					(a, b) =>
						(toDate(a.slotStartDateTime)?.getTime() ?? 0) -
						(toDate(b.slotStartDateTime)?.getTime() ?? 0)
				),
		[slots, currentSlotId]
	);

	const { proposeReschedule, isRescheduling, error, responseData } =
		useRescheduleMentorSlotBooking();
	const isSubmitted = !!responseData;
	const canSubmit =
		!!selectedNewSlotId && reason.trim().length >= REASON_MIN_LENGTH && !isRescheduling && !isSubmitted;

	const handleProposeReschedule = async () => {
		if (!bookingId) {
			setValidationError("Invalid booking id.");
			return;
		}

		if (!selectedNewSlotId || selectedNewSlotId <= 0) {
			setValidationError("Please select a new slot.");
			return;
		}

		if (reason.trim().length < REASON_MIN_LENGTH) {
			setValidationError(`Reason must be at least ${REASON_MIN_LENGTH} characters.`);
			return;
		}

		setValidationError(null);
		await proposeReschedule(bookingId, selectedNewSlotId, reason.trim());
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
			<Link
				href={sessionsHref}
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft size={16} />
				Back to Sessions
			</Link>

			<div className="space-y-5 rounded-2xl border border-border bg-card p-5 text-left sm:p-8">
				<div className="space-y-2">
					<h1 className="text-xl font-bold text-foreground sm:text-2xl">Propose Reschedule</h1>
					{sessionsLoading && !session ? (
						<div className="h-5 w-72 max-w-full animate-pulse rounded bg-muted" />
					) : (
						<p className="text-sm text-muted-foreground sm:text-base">
							{bookingMeta.join(" · ")}
						</p>
					)}
				</div>

				{!isSubmitted && (
					<div className="rounded-xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-foreground dark:bg-blue-950/30">
						{mentorFirstName} needs to accept the new time. Your session stays as it is until then.
						Your credit doesn&apos;t change. You can reschedule a booking once.
					</div>
				)}

				<div className="space-y-3">
					<p className="text-sm font-semibold text-foreground">
						{mentorName ? `${mentorFirstName}'s` : "Mentor's"} slots, {RESCHEDULE_NOTICE_HOURS}+ hours away
					</p>

					{slotsLoading && (
						<div className="space-y-3">
							{[0, 1, 2].map((item) => (
								<div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />
							))}
						</div>
					)}

					{!slotsLoading && slotsError && (
						<div className="space-y-2">
							<p className="text-sm text-destructive">{slotsError}</p>
							<button
								type="button"
								onClick={refetchSlots}
								className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
							>
								Retry slots
							</button>
						</div>
					)}

					{!slotsLoading && !slotsError && selectableSlots.length === 0 && (
						<p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
							{mentorFirstName} has no open slots {RESCHEDULE_NOTICE_HOURS}+ hours away right now.
							Check back later, or keep your current time.
						</p>
					)}

					{!slotsLoading && !slotsError && selectableSlots.length > 0 && (
						<div role="radiogroup" aria-label="New slot" className="max-h-80 space-y-3 overflow-y-auto pr-1">
							{selectableSlots.map((slot) => {
								const isSelected = selectedNewSlotId === slot.id;

								return (
									<button
										key={slot.id}
										type="button"
										role="radio"
										aria-checked={isSelected}
										disabled={isSubmitted}
										onClick={() => {
											setSelectedNewSlotId(slot.id);
											setValidationError(null);
										}}
										className={cn(
											"flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm text-foreground transition-colors sm:text-base",
											isSelected
												? "border-green-800 bg-green-50 dark:border-green-600 dark:bg-green-950/30"
												: "border-border bg-card hover:bg-muted/50",
											isSubmitted && "cursor-not-allowed opacity-60"
										)}
									>
										<span
											className={cn(
												"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
												isSelected
													? "border-green-800 dark:border-green-500"
													: "border-muted-foreground/50"
											)}
										>
											{isSelected && (
												<span className="h-2.5 w-2.5 rounded-full bg-green-800 dark:bg-green-500" />
											)}
										</span>
										<span>{formatSlotLabel(slot.slotStartDateTime, slot.slotEndDateTime)}</span>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* The API requires a reason (min 10 characters) for a reschedule request */}
				<div className="space-y-2">
					<label htmlFor="reschedule-reason" className="block text-sm font-semibold text-foreground">
						Reason
					</label>
					<textarea
						id="reschedule-reason"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Need to move to another time"
						disabled={isSubmitted}
						className="min-h-[96px] w-full rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
					/>
					<p className="text-xs text-muted-foreground">
						Minimum {REASON_MIN_LENGTH} characters. {mentorFirstName} will see this.
					</p>
				</div>

				{validationError && <p className="text-sm text-destructive">{validationError}</p>}
				{error && <p className="text-sm text-destructive">{error}</p>}

				{responseData && (
					<div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-foreground dark:bg-green-950/30">
						<p className="font-semibold">{responseData.message || "Reschedule request sent."}</p>
						<p className="text-muted-foreground">
							{mentorFirstName} needs to accept it. Your session stays as it is until then.
						</p>
					</div>
				)}

				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={handleProposeReschedule}
						disabled={!canSubmit}
						className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isRescheduling ? "Sending..." : "Send Reschedule Request"}
					</button>
					{isSubmitted && (
						<Link
							href={sessionsHref}
							className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
						>
							Back to Sessions
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
