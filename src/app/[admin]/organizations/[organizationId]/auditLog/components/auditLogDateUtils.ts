export const parseAuditLogDate = (value: string) => {
  const normalizedValue = value
    .trim()
    .replace(' ', 'T')
    .replace(/([+-]\d{2})$/, '$1:00');

  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? null : date;
};