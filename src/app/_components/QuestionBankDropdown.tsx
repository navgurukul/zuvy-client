"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { Database } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const QuestionBankDropdown = () => {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium",
            isActive("/admin/question-bank")

          ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-700 hover:text-black hover:bg-gray-100"

          )}
        >
          <Database className="h-4 w-4" />
          <span>Question Bank</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-33">
        <Link
          href="/admin/question-bank/coding"
          className={cn(
            "block w-full px-3 py-2 rounded text-black  hover:text-black text-sm text-left"
          )}
        >
          Coding Problems
        </Link>

        <Link
          href="/admin/question-bank/mcq"
          className={cn(
            "block w-full px-3 py-2 rounded text-black  hover:text-black text-sm text-left"
          )}
        >
          MCQ
        </Link>

        <Link
          href="/admin/question-bank/open-ended"
          className={cn(
            "block w-full px-3 py-2 rounded text-black  hover:text-black text-sm text-left"
          )}
        >
          Open Ended
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuestionBankDropdown





