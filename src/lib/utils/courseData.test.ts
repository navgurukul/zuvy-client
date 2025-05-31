import {
  getCourseById,
  getModuleById,
  getUpcomingItems,
  updateItemProgress,
  markItemAsCompleted
} from './courseData';

// Mock the setTimeout function
jest.useFakeTimers();

describe('courseData utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourseById', () => {
    it('returns course data for a valid course ID', async () => {
      const coursePromise = getCourseById('course1');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const course = await coursePromise;
      
      expect(course).not.toBeNull();
      expect(course?.id).toBe('course1');
      expect(course?.name).toBe('Web Development Bootcamp');
      expect(course?.modules.length).toBeGreaterThan(0);
    });
  });

  describe('getModuleById', () => {
    it('returns module data for valid course and module IDs', async () => {
      const modulePromise = getModuleById('course1', 'module1');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const module = await modulePromise;
      
      expect(module).not.toBeNull();
      expect(module.id).toBe('module1');
      expect(module.title).toBe('JavaScript Fundamentals');
      expect(module.items.length).toBeGreaterThan(0);
    });
  });

  describe('getUpcomingItems', () => {
    it('returns upcoming items with the specified limit', async () => {
      const itemsPromise = getUpcomingItems('course1', 3);
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const items = await itemsPromise;
      
      expect(items).toHaveLength(3);
      expect(items[0].type).toBe('liveClass');
    });

    it('returns all upcoming items when no limit is specified', async () => {
      const itemsPromise = getUpcomingItems('course1');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const items = await itemsPromise;
      
      expect(items).toHaveLength(5);
    });
  });

  describe('updateItemProgress', () => {
    it('returns true on successful progress update', async () => {
      const updatePromise = updateItemProgress('course1', 'module1', 'item1', 50);
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const result = await updatePromise;
      
      expect(result).toBe(true);
    });
  });

  describe('markItemAsCompleted', () => {
    it('returns true on successfully marking an item as completed', async () => {
      const markPromise = markItemAsCompleted('course1', 'module1', 'item1');
      
      // Fast-forward timers to resolve the promise
      jest.runAllTimers();
      
      const result = await markPromise;
      
      expect(result).toBe(true);
    });
  });
}); 