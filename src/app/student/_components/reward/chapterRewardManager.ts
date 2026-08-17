const PENDING_REWARD_KEY = 'zuvy_pending_reward_chapter_id';
const PENDING_HIDE_SPARKS_KEY = 'zuvy_pending_reward_hide_sparks';

let memoryPendingChapterId: string | null = null;
let memoryHideSparks = false;

export const chapterRewardManager = {
  /**
   * Registers a chapter completion action initiated by the student.
   * Call this when a completion/submission API succeeds.
   * @param hideSparks - If true, the reward card shows only a message (no sparks counter).
   *                     Use for chapter types that don't award sparks (e.g. feedback forms).
   */
  markChapterCompleted(chapterId: string | number, hideSparks = false) {
    if (!chapterId) return;
    const strId = String(chapterId);
    memoryPendingChapterId = strId;
    memoryHideSparks = hideSparks;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(PENDING_REWARD_KEY, strId);
        window.sessionStorage.setItem(PENDING_HIDE_SPARKS_KEY, hideSparks ? '1' : '0');
      }
    } catch {
      // ignore storage errors
    }
  },

  /**
   * Checks if there is a pending chapter completion event awaiting reward animation.
   */
  getPendingChapterId(): string | null {
    if (memoryPendingChapterId) {
      return memoryPendingChapterId;
    }
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(PENDING_REWARD_KEY);
      }
    } catch {
      // ignore storage errors
    }
    return null;
  },

  /**
   * Returns whether the pending reward should hide sparks.
   */
  getPendingHideSparks(): boolean {
    if (memoryPendingChapterId) {
      return memoryHideSparks;
    }
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(PENDING_HIDE_SPARKS_KEY) === '1';
      }
    } catch {
      // ignore storage errors
    }
    return false;
  },

  /**
   * Consumes and clears the pending chapter completion ID, ensuring it is triggered at most once.
   */
  consumePendingCompletion(): { id: string; hideSparks: boolean } | null {
    const id = this.getPendingChapterId();
    const hideSparks = this.getPendingHideSparks();
    memoryPendingChapterId = null;
    memoryHideSparks = false;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(PENDING_REWARD_KEY);
        window.sessionStorage.removeItem(PENDING_HIDE_SPARKS_KEY);
      }
    } catch {
      // ignore storage errors
    }
    return id ? { id, hideSparks } : null;
  },
};

