import {
  calculateAttendanceStreak,
  getMotivationalMessage,
  calculateAttendedCount,
  getAttendanceStatusClass
} from './attendanceLogic'

describe('attendanceLogic', () => {
  describe('calculateAttendanceStreak', () => {
    it('returns 0 if no classes are provided', () => {
      expect(calculateAttendanceStreak([])).toBe(0)
    })
    
    it('returns the count of consecutive attended classes from the start', () => {
      const classes = [
        { attended: true },
        { attended: true },
        { attended: false },
        { attended: true }
      ]
      
      expect(calculateAttendanceStreak(classes)).toBe(2)
    })
    
    it('stops counting at the first missed class', () => {
      const classes = [
        { attended: true },
        { attended: false },
        { attended: true },
        { attended: true }
      ]
      
      expect(calculateAttendanceStreak(classes)).toBe(1)
    })
    
    it('returns 0 if the first class was missed', () => {
      const classes = [
        { attended: false },
        { attended: true },
        { attended: true }
      ]
      
      expect(calculateAttendanceStreak(classes)).toBe(0)
    })
    
    it('returns the total count if all classes were attended', () => {
      const classes = [
        { attended: true },
        { attended: true },
        { attended: true }
      ]
      
      expect(calculateAttendanceStreak(classes)).toBe(3)
    })
  })
  
  describe('getMotivationalMessage', () => {
    it('returns appropriate message for streak of 0', () => {
      expect(getMotivationalMessage(0)).toBe('Start your attendance streak by joining the next class!')
    })
    
    it('returns appropriate message for streak of 1', () => {
      expect(getMotivationalMessage(1)).toBe('Great start! Keep the momentum going.')
    })
    
    it('returns appropriate message for streak between 2 and 4', () => {
      expect(getMotivationalMessage(2)).toBe('Impressive streak! Keep up the great momentum!')
      expect(getMotivationalMessage(4)).toBe('Impressive streak! Keep up the great momentum!')
    })
    
    it('returns appropriate message for streak between 5 and 9', () => {
      expect(getMotivationalMessage(5)).toBe('Amazing dedication! Your consistency is paying off.')
      expect(getMotivationalMessage(9)).toBe('Amazing dedication! Your consistency is paying off.')
    })
    
    it('returns appropriate message for streak of 10 or more', () => {
      expect(getMotivationalMessage(10)).toBe('Outstanding commitment! You\'re truly mastering the discipline of learning.')
      expect(getMotivationalMessage(15)).toBe('Outstanding commitment! You\'re truly mastering the discipline of learning.')
    })
  })
  
  describe('calculateAttendedCount', () => {
    it('returns 0 if no classes are provided', () => {
      expect(calculateAttendedCount([])).toBe(0)
    })
    
    it('returns the count of attended classes up to the limit', () => {
      const classes = [
        { attended: true },
        { attended: false },
        { attended: true }
      ]
      
      expect(calculateAttendedCount(classes)).toBe(2)
    })
    
    it('respects the provided limit parameter', () => {
      const classes = [
        { attended: true },
        { attended: true },
        { attended: true },
        { attended: false },
        { attended: true }
      ]
      
      expect(calculateAttendedCount(classes, 2)).toBe(2)
      expect(calculateAttendedCount(classes, 4)).toBe(3)
    })
  })
  
  describe('getAttendanceStatusClass', () => {
    it('returns primary-themed class for attended classes', () => {
      expect(getAttendanceStatusClass(true)).toBe('text-primary bg-primary/10')
    })
    
    it('returns destructive-themed class for missed classes', () => {
      expect(getAttendanceStatusClass(false)).toBe('text-destructive bg-destructive/10')
    })
  })
}) 