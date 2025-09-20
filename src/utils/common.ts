// Generate user initials from name
export const getUserInitials = (name: string | undefined): string => {
    if (!name) return 'JD' // fallback

    const words = name.trim().split(' ')
    if (words.length >= 2) {
        // First and last name initials
        return (
            words[0].charAt(0) + words[words.length - 1].charAt(0)
        ).toUpperCase()
    } else if (words.length === 1) {
        // Just first name, take first two characters or duplicate first character
        return words[0].length >= 2
            ? (words[0].charAt(0) + words[0].charAt(1)).toUpperCase()
            : (words[0].charAt(0) + words[0].charAt(0)).toUpperCase()
    }
    return 'JD' // fallback
}
