/**
 * Utility functions for attendance calculations
 */

/**
 * Calculate the attendance streak based on a list of class attendance records
 * A streak is broken if a class is missed
 */
export function calculateAttendanceStreak(classes: { attended: boolean }[]): number {
  // Sort classes by date (most recent first) if they have dates
  // This assumes the classes are already sorted by date (newest first)
  
  let streak = 0;
  
  // Count consecutive attended classes from the most recent
  for (const cls of classes) {
    if (cls.attended) {
      streak++;
    } else {
      // Streak breaks on the first missed class
      break;
    }
  }
  
  return streak;
}

/**
 * Get a motivational message based on the current streak
 */
export function getMotivationalMessage(streak: number): string {
  if (streak === 0) return "Start your attendance streak by joining the next class!";
  if (streak === 1) return "Great start! Keep the momentum going.";
  if (streak >= 2 && streak <= 4) return "Impressive streak! Keep up the great momentum!";
  if (streak >= 5 && streak <= 9) return "Amazing dedication! Your consistency is paying off.";
  return "Outstanding commitment! You're truly mastering the discipline of learning.";
}

/**
 * Calculate the number of attended classes out of the last n classes
 */
export function calculateAttendedCount(classes: { attended: boolean }[], limit = 3): number {
  const recentClasses = classes.slice(0, limit);
  return recentClasses.filter(cls => cls.attended).length;
}

/**
 * Get the appropriate CSS class based on attendance status
 */
export function getAttendanceStatusClass(attended: boolean): string {
  return attended ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10";
} 