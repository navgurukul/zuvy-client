/**
 * Wording for the mentorship rule numbers. The numbers themselves always come
 * from the backend (`rules` on eligibility, the session lists and the mentor
 * week view); these helpers only turn them into text. No number: no text, so a
 * screen never shows a guessed rule.
 */

/** 14 -> "2 weeks", 7 -> "1 week", 10 -> "10 days", 1 -> "1 day"; unknown -> null */
export const formatGapPhrase = (days?: number | null): string | null => {
    if (typeof days !== 'number' || !Number.isFinite(days) || days <= 0) return null
    if (days % 7 === 0) {
        const weeks = days / 7
        return `${weeks} week${weeks === 1 ? '' : 's'}`
    }
    return `${days} day${days === 1 ? '' : 's'}`
}

/** 1 -> "once", 2 -> "twice", 3 -> "3 times"; unknown -> null */
export const formatTimesPhrase = (count?: number | null): string | null => {
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 1) return null
    if (count === 1) return 'once'
    if (count === 2) return 'twice'
    return `${count} times`
}
