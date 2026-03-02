import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getUserInitials } from '@/utils/common'
import { LogOut, UserRound } from 'lucide-react'

interface StudentProfileDropDownProps {
    studentData: any
    handleLogoutClick: () => void
    showLogoutDialog: boolean
    setShowLogoutDialog: (value: boolean) => void
    handleLogout: () => void
    onProfileClick: () => void
}

const StudentProfileDropDown = ({
    studentData,
    handleLogoutClick,
    showLogoutDialog,
    setShowLogoutDialog,
    handleLogout,
    onProfileClick,
}: StudentProfileDropDownProps) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer transition-all">
                        <AvatarFallback className="bg-[#2f6f3e] text-white text-base font-semibold">
                            {getUserInitials(studentData?.name)}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[300px] rounded-lg border border-zinc-200 bg-white p-0 text-left text-zinc-800 shadow-md"
                    align="end"
                    sideOffset={12}
                >
                    <DropdownMenuLabel className="px-4 py-3 font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-foreground font-semibold">
                                {studentData?.name}
                            </p>
                            <p className="text-[14px] leading-none text-[#78908a]">
                                {studentData?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="-mx-0 my-0 bg-zinc-200" />
                    <DropdownMenuItem
                        onClick={onProfileClick}
                        className="cursor-pointer gap-3 rounded-none px-4 py-4 text-[1.08rem] text-zinc-800 focus:bg-zinc-50"
                    >
                        <UserRound className="h-5 w-5" />
                        <span>View/Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="-mx-0 my-0 bg-zinc-200" />
                    <DropdownMenuItem
                        onClick={handleLogoutClick}
                        className="cursor-pointer gap-3 rounded-none px-4 py-4 text-[1.08rem] text-red-500 focus:bg-red-50 focus:text-red-600"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to logout?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of your account and
                            redirected to the login page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-primary hover:bg-primary-dark"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default StudentProfileDropDown
