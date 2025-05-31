import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ItemContentView from './ItemContentView'

describe('ItemContentView', () => {
  // Mock navigate function
  const mockOnNavigate = jest.fn()
  
  // Mock module items
  const mockModuleItems = [
    {
      id: 'item1',
      title: 'Introduction to JavaScript',
      type: 'liveClass',
      status: 'upcoming',
      date: '2024-03-15T10:00:00Z',
      duration: 60,
      instructor: 'Sarah Johnson',
      description: 'Overview of JavaScript'
    },
    {
      id: 'item2',
      title: 'Variables and Data Types',
      type: 'video',
      status: 'completed',
      duration: 15,
      description: 'Learn about variables'
    },
    {
      id: 'item3',
      title: 'Functions and Scope',
      type: 'article',
      status: 'completed',
      readTime: 10,
      description: 'Understand functions'
    },
    {
      id: 'item4',
      title: 'Module Assessment',
      type: 'assessment',
      status: 'locked',
      timeLimit: 45,
      questionCount: 20,
      description: 'Test your knowledge'
    }
  ]
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('renders the item title and description', () => {
    render(
      <ItemContentView
        item={mockModuleItems[0]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    expect(screen.getByText('Introduction to JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Overview of JavaScript')).toBeInTheDocument()
  })
  
  it('renders live class content correctly', () => {
    render(
      <ItemContentView
        item={mockModuleItems[0]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    expect(screen.getByText('Live Class')).toBeInTheDocument()
    expect(screen.getByText('Instructor: Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText(/Add to Calendar/i)).toBeInTheDocument()
  })
  
  it('renders video content correctly', () => {
    render(
      <ItemContentView
        item={mockModuleItems[1]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    expect(screen.getByText('Video Lesson')).toBeInTheDocument()
    expect(screen.getByText('15 min')).toBeInTheDocument()
    expect(screen.getByText('About this video')).toBeInTheDocument()
    expect(screen.getByText('Rewatch Video')).toBeInTheDocument()
  })
  
  it('renders article content correctly', () => {
    render(
      <ItemContentView
        item={mockModuleItems[2]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    expect(screen.getByText('Reading Material')).toBeInTheDocument()
    expect(screen.getByText('10 min read')).toBeInTheDocument()
    expect(screen.getByText('Article Content')).toBeInTheDocument()
    expect(screen.getByText('Download PDF')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
  
  it('navigates to previous item when previous button is clicked', () => {
    render(
      <ItemContentView
        item={mockModuleItems[1]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    fireEvent.click(screen.getByText('Previous'))
    expect(mockOnNavigate).toHaveBeenCalledWith('item1')
  })
  
  it('navigates to next item when next button is clicked', () => {
    render(
      <ItemContentView
        item={mockModuleItems[1]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    fireEvent.click(screen.getByText('Next'))
    expect(mockOnNavigate).toHaveBeenCalledWith('item3')
  })
  
  it('disables navigation buttons for locked items', () => {
    // Render the view with the last non-locked item selected
    render(
      <ItemContentView
        item={mockModuleItems[2]}
        moduleItems={mockModuleItems}
        onNavigate={mockOnNavigate}
      />
    )
    
    // Next button should be disabled because next item is locked
    const nextButton = screen.getByText('Next').closest('button')
    expect(nextButton).toBeDisabled()
    
    // Previous button should be enabled
    const prevButton = screen.getByText('Previous').closest('button')
    expect(prevButton).not.toBeDisabled()
  })
}) 