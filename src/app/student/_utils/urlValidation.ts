/**
 * Validates that a string is a well-formed http/https URL.
 *
 * Checks:
 * - Protocol must be http or https
 * - Hostname must be present
 * - localhost is allowed (useful for dev/testing)
 * - Hostname must not end with a trailing dot
 * - Must have at least two hostname parts (e.g. example.com)
 * - TLD must be alphabetic and at least 2 characters
 * - Each hostname part must only contain alphanumeric characters or hyphens
 */
export const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (!url.hostname) return false;
    if (url.hostname === 'localhost') return true;
    if (url.hostname.endsWith('.')) return false;
    const hostnameParts = url.hostname.split('.');
    if (hostnameParts.length < 2) return false;
    const tld = hostnameParts[hostnameParts.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
    return hostnameParts.every((part) => /^[a-zA-Z0-9-]+$/.test(part) && part.length > 0);
  } catch {
    return false;
  }
};
