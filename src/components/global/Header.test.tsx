import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

// Mock next/image since it doesn't work well in tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

describe('Header', () => {
  it('renders the Zuvy logo', () => {
    render(<Header />)
    
    const logoImage = screen.getByAltText('Zuvy')
    expect(logoImage).toBeInTheDocument()
    expect(logoImage).toHaveAttribute('src', '/zuvy-logo.svg')
  })
  
  it('renders the user avatar with default initials', () => {
    render(<Header />)
    
    const avatar = screen.getByText('ST')
    expect(avatar).toBeInTheDocument()
  })
  
  it('renders custom user name and initials when provided', () => {
    render(<Header userName="Jane Doe" userInitials="JD" />)
    
    // Open the dropdown menu to see the user name
    fireEvent.click(screen.getByText('JD'))
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
  
  it('renders the dropdown menu when avatar is clicked', () => {
    render(<Header />)
    
    // Check dropdown is not visible initially
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    
    // Click on the avatar to open dropdown
    fireEvent.click(screen.getByText('ST'))
    
    // Check dropdown menu items are now visible
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })
  
  it('has correct link to dashboard', () => {
    render(<Header />)
    
    const logoLink = screen.getByRole('link')
    expect(logoLink).toHaveAttribute('href', '/student')
  })
}) 