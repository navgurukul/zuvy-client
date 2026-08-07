/**
 * Resolves a mentor ID from a Next.js page parameter (string, array of strings, or undefined).
 * If the parameter is an array, returns the first element.
 */
export const getMentorId = (idParam: string | string[] | undefined): string | undefined => {
  if (Array.isArray(idParam)) {
    return idParam[0];
  }

  return idParam;
};
