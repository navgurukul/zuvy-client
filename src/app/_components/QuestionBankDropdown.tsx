'use client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { Database } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePathname, useParams } from 'next/navigation'
import { useRef, useState } from 'react'

const QuestionBankDropdown = () => {
  const pathname = usePathname()
  const role = pathname.split('/')[1]
  const { organizationId } = useParams()
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive =
      pathname === `/${role}/organizations/${organizationId}/resource/` ||
      pathname.startsWith(`/${role}/organizations/${organizationId}/resource/`)

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleOpen = () => {
    clearCloseTimeout()
    setOpen(true)
  }

  const handleClose = () => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 120)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div>
        <DropdownMenuTrigger
          asChild
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          <Button
            variant="ghost"
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium',
              isActive
                ? 'bg-primary text-primary-foreground'
                : open
                ? 'bg-muted-foreground/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
            )}
          >
            <Database className="h-4 w-4" />
            <span>Question Bank</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-40"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          {/* Coding */}
          <Link
            href={`/${role}/organizations/${organizationId}/resource/coding`}
            className={cn(
              'block w-full px-3 py-2 rounded text-sm',
              pathname === `/${role}/organizations/${organizationId}/resource/coding`
                ? 'bg-background text-foreground'
                : 'text-foreground hover:bg-background'
            )}
          >
            Coding Problems
          </Link>

          {/* MCQ */}
          <Link
            href={`/${role}/organizations/${organizationId}/resource/mcq`}
            className={cn(
              'block w-full px-3 py-2 rounded text-sm',
              pathname === `/${role}/organizations/${organizationId}/resource/mcq`
                ? 'bg-background text-foreground'
                : 'text-foreground hover:bg-background'
            )}
          >
            MCQ
          </Link>

          {/* Open Ended */}
          <Link
            href={`/${role}/organizations/${organizationId}/resource/open-ended`}
            className={cn(
              'block w-full px-3 py-2 rounded text-sm',
              pathname === `/${role}/organizations/${organizationId}/resource/open-ended`
                ? 'bg-background text-foreground'
                : 'text-foreground hover:bg-background'
            )}
          >
            Open Ended
          </Link>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  )
}
export default QuestionBankDropdown




















