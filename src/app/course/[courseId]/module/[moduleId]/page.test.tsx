import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CourseModulePage from './page'

// Mock the ModuleNavigationSidebar component
jest.mock('./_components/ModuleNavigationSidebar', () => {
  return {
    __esModule: true,
    default: ({ items, selectedItemId, onItemSelect }: any) => (
      <div data-testid="module-navigation">
        <span>Navigation Items: {items.length}</span>
        <span>Selected Item: {selectedItemId}</span>
      </div>
    )
  }
})

// Mock the ItemContentView component
jest.mock('./_components/ItemContentView', () => {
  return {
    __esModule: true,
    default: ({ item, moduleItems, onNavigate }: any) => (
      <div data-testid="item-content">
        <span>Item Title: {item.title}</span>
        <span>Total Items: {moduleItems.length}</span>
      </div>
    )
  }
})

describe('CourseModulePage', () => {
  const mockParams = {
    courseId: 'course1',
    moduleId: 'module1'
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the setTimeout to speed up the tests
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  it('shows loading state initially', () => {
    render(<CourseModulePage params={mockParams} />)
    
    expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(3) // Skeletons are role="status"
  })
  
  it('renders the module content after loading', async () => {
    render(<CourseModulePage params={mockParams} />)
    
    // Fast-forward timers
    jest.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(screen.getByText(/JavaScript Fundamentals/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/Master the core concepts/i)).toBeInTheDocument()
    expect(screen.getByTestId('module-navigation')).toBeInTheDocument()
    expect(screen.getByTestId('item-content')).toBeInTheDocument()
  })
  
  it('displays breadcrumbs with course and module information', async () => {
    render(<CourseModulePage params={mockParams} />)
    
    // Fast-forward timers
    jest.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(screen.getByText(/Web Development Bootcamp/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/Course Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/JavaScript Fundamentals/i)).toBeInTheDocument()
  })
  
  it('has a back button to return to dashboard', () => {
    render(<CourseModulePage params={mockParams} />)
    
    const backButton = screen.getByText(/Back to Dashboard/i)
    expect(backButton).toBeInTheDocument()
    expect(backButton.closest('a')).toHaveAttribute('href', '/student')
  })
}) 