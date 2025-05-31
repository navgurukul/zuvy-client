import React from 'react'
import { render, screen } from '@testing-library/react'
import AttendanceSection from './AttendanceSection'
import * as attendanceLogic from '@/lib/utils/attendanceLogic'

// Mock the attendance logic module
jest.mock('@/lib/utils/attendanceLogic', () => ({
  calculateAttendanceStreak: jest.fn(),
  getMotivationalMessage: jest.fn(),
  calculateAttendedCount: jest.fn()
}))

describe('AttendanceSection', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Set up default mock return values
    (attendanceLogic.calculateAttendanceStreak as jest.Mock).mockReturnValue(2)
    (attendanceLogic.getMotivationalMessage as jest.Mock).mockReturnValue('Impressive streak! Keep up the great momentum!')
    (attendanceLogic.calculateAttendedCount as jest.Mock).mockReturnValue(2)
  })
  
  it('renders the attendance section with title', () => {
    render(<AttendanceSection />)
    expect(screen.getByText('Attendance')).toBeInTheDocument()
  })
  
  it('displays the correct streak count', () => {
    render(<AttendanceSection />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('class streak')).toBeInTheDocument()
  })
  
  it('shows the motivational message', () => {
    render(<AttendanceSection />)
    expect(screen.getByText('Impressive streak! Keep up the great momentum!')).toBeInTheDocument()
  })
  
  it('displays the attendance summary correctly', () => {
    render(<AttendanceSection />)
    expect(screen.getByText('2/3')).toBeInTheDocument()
    expect(screen.getByText('classes attended recently')).toBeInTheDocument()
  })
  
  it('renders the recent classes', () => {
    render(<AttendanceSection />)
    expect(screen.getByText('Recent Classes')).toBeInTheDocument()
    expect(screen.getByText('JavaScript Event Handling')).toBeInTheDocument()
    expect(screen.getByText('DOM Manipulation Workshop')).toBeInTheDocument()
    expect(screen.getByText('Async JavaScript Introduction')).toBeInTheDocument()
  })
  
  it('uses the correct status badges for classes', () => {
    render(<AttendanceSection />)
    const attendedBadges = screen.getAllByText('Attended')
    const missedBadge = screen.getByText('Missed')
    
    expect(attendedBadges).toHaveLength(2)
    expect(missedBadge).toBeInTheDocument()
  })
  
  it('calls the attendance utility functions with the correct data', () => {
    render(<AttendanceSection />)
    
    // Mock data inside the component contains 3 classes
    expect(attendanceLogic.calculateAttendanceStreak).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ attended: true }),
      expect.objectContaining({ attended: true }),
      expect.objectContaining({ attended: false })
    ]))
    
    expect(attendanceLogic.calculateAttendedCount).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ attended: true }),
      expect.objectContaining({ attended: true }),
      expect.objectContaining({ attended: false })
    ]))
    
    expect(attendanceLogic.getMotivationalMessage).toHaveBeenCalledWith(2)
  })
}) 