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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserInitials } from '@/utils/common'

interface ProfileDropDownProps {
    studentData: any
    handleLogoutClick: () => void
    showLogoutDialog: boolean
    setShowLogoutDialog: (value: boolean) => void
    handleLogout: () => void
}

const ProfileDropDown = ({
    studentData,
    handleLogoutClick,
    showLogoutDialog,
    setShowLogoutDialog,
    handleLogout,
}: ProfileDropDownProps) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                        <AvatarImage
                            src={studentData?.profile_picture}
                            alt="Student"
                        />
                        <AvatarFallback className="bg-gray-200 text-muted-foreground text-md font-medium">
                            {getUserInitials(studentData?.name)}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 text-left" align="end">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {studentData?.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {studentData?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Role
                            </p>
                            <p className="text-sm capitalize">
                                {studentData?.rolesList?.join(', ')}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleLogoutClick}
                        className="text-red-600 hover:bg-primary hover:!text-primary-foreground cursor-pointer"
                    >
                        {/* <LogOut className="mr-2 h-4 w-4" /> */}
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

export default ProfileDropDown
