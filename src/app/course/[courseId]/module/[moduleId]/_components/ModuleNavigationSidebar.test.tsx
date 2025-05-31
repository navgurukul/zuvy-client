import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ModuleNavigationSidebar from './ModuleNavigationSidebar'

describe('ModuleNavigationSidebar', () => {
  const mockItems = [
    {
      id: 'item1',
      title: 'Introduction to JavaScript',
      type: 'liveClass',
      status: 'upcoming',
      date: '2024-03-15T10:00:00Z',
      description: 'Overview of JavaScript'
    },
    {
      id: 'item2',
      title: 'Variables and Data Types',
      type: 'video',
      status: 'completed',
      description: 'Learn about variables'
    },
    {
      id: 'item3',
      title: 'Module Assessment',
      type: 'assessment',
      status: 'locked',
      description: 'Test your knowledge'
    }
  ]
  
  const mockOnItemSelect = jest.fn()
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('renders the sidebar with all items', () => {
    render(
      <ModuleNavigationSidebar
        items={mockItems}
        selectedItemId="item1"
        onItemSelect={mockOnItemSelect}
      />
    )
    
    expect(screen.getByText('Module Content')).toBeInTheDocument()
    expect(screen.getByText('Introduction to JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Variables and Data Types')).toBeInTheDocument()
    expect(screen.getByText('Module Assessment')).toBeInTheDocument()
  })
  
  it('shows correct item type labels', () => {
    render(
      <ModuleNavigationSidebar
        items={mockItems}
        selectedItemId="item1"
        onItemSelect={mockOnItemSelect}
      />
    )
    
    expect(screen.getByText('Live Class')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Assessment')).toBeInTheDocument()
  })
  
  it('calls onItemSelect when clicking a non-locked item', () => {
    render(
      <ModuleNavigationSidebar
        items={mockItems}
        selectedItemId="item1"
        onItemSelect={mockOnItemSelect}
      />
    )
    
    fireEvent.click(screen.getByText('Variables and Data Types'))
    expect(mockOnItemSelect).toHaveBeenCalledWith('item2')
  })
  
  it('does not call onItemSelect when clicking a locked item', () => {
    render(
      <ModuleNavigationSidebar
        items={mockItems}
        selectedItemId="item1"
        onItemSelect={mockOnItemSelect}
      />
    )
    
    fireEvent.click(screen.getByText('Module Assessment'))
    expect(mockOnItemSelect).not.toHaveBeenCalled()
  })
  
  it('highlights the selected item', () => {
    const { rerender } = render(
      <ModuleNavigationSidebar
        items={mockItems}
        selectedItemId="item1"
        onItemSelect={mockOnItemSelect}
      />
    )
    
    // The background color class for the selected item should be applied
    const selectedItem = screen.getByText('Introduction to JavaScript').closest('button')
    expect(selectedItem).toHaveClass('bg-primary')
    
    // Change the selected item
    rerender(
      <ModuleNavigationSidebar
        items={mockItems}
        selectedItemId="item2"
        onItemSelect={mockOnItemSelect}
      />
    )
    
    // Now the second item should be highlighted
    const newSelectedItem = screen.getByText('Variables and Data Types').closest('button')
    expect(newSelectedItem).toHaveClass('bg-primary')
  })
}) 