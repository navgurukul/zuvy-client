'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrganizationsByUser } from '@/hooks/useOrganizationsByUser';
import { useOrganizations, Organization } from '@/hooks/useOrganizations';
import { getUser } from '@/store/store';

export default function OrganizationDropdown({ orgId }: { orgId: string }) {
    const pathname = usePathname();
    const role = pathname.split('/')[1]; // Extract role from pathname
    const { user } = getUser();
    const userId = user?.id ? parseInt(user.id) : null;
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<Organization | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Always call both hooks (Rules of Hooks), pick result based on role
    const byUser = useOrganizationsByUser(isSuperAdmin ? null : userId, searchTerm);
    const allOrgs = useOrganizations({ auto: isSuperAdmin, search: searchTerm });

    const { organizations, loading, error } = isSuperAdmin ? allOrgs : byUser;

    useEffect(() => {
        const found = organizations.find(org => org.id === parseInt(orgId));
        if (found) {
            setSelected(found);
        } else if (!selected && organizations.length > 0 && !searchTerm) {
            setSelected(organizations[0]);
        }
    }, [loading, organizations, orgId]);

    const handleSelect = (org: Organization) => {
        setSelected(org);
        setIsOpen(false);
        setSearchTerm('');
    };

    const getInitials = (org: Organization) => {
        const name = org.title || org.code || '';
        const words = name.split(' ');
        if (words.length > 1) {
            return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const shouldShowDropdown = isSuperAdmin || organizations.length > 1 || searchTerm !== '';

    return (
        <>
            {
                !shouldShowDropdown ? (
                    <Button
                        variant="ghost"
                        className="w-auto flex items-center justify-between px-4 py-3 h-auto hover:bg-gray-50 border-none"
                    >
                        <div className="flex items-center gap-3">
                            {selected ? (
                                <>
                                    <div className="bg-orange-500 text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {/* {getInitials(selected)} */}
                                        {selected.code}
                                    </div>
                                    <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                        {selected.title}
                                    </span>
                                </>
                            ) : (
                                <span className="text-gray-500">Loading...</span>
                            )}
                        </div>
                    </Button>
                ) : (
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-auto flex items-center justify-between px-4 py-3 h-auto hover:bg-gray-50 border-none"
                            >
                                <div className="flex items-center gap-3">
                                    {selected ? (
                                        <>
                                            <div className="bg-orange-500 text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {/* {getInitials(selected)} */}
                                                {selected.code}
                                            </div>
                                            <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                {selected.title}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">Loading...</span>
                                    )}
                                </div>
                                <ChevronDown size={20} className="text-gray-400 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-72 p-0 max-h-[29rem] flex flex-col"
                            align="start"
                            side="bottom"
                        >
                            {/* Search Input */}
                            <div className="flex-none p-3 border-b">
                                <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        className="pl-10 border-0 focus:ring-0 focus-visible:ring-0"
                                    />
                                </div>
                            </div>

                            {/* Organizations List */}
                            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                                <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    Switch Organization
                                </DropdownMenuLabel>

                                {loading ? (
                                    <div className="px-4 py-3 text-gray-500 text-sm">Loading organizations...</div>
                                ) : error ? (
                                    <div className="px-4 py-3 text-red-500 text-sm">Failed to load organizations</div>
                                ) : organizations.length === 0 ? (
                                    <div className="px-4 py-3 text-gray-500 text-sm">No organizations found</div>
                                ) : (
                                    organizations
                                        .map(org => (
                                            <DropdownMenuItem key={org.id} className="px-0 py-0 focus:bg-gray-50 cursor-pointer">
                                                <Link
                                                    key={org.id}
                                                    href={`/${role}/organizations/${org.id}/courses`}
                                                    onClick={() => handleSelect(org)}
                                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 ${selected?.id === org.id ? 'bg-green-50' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-orange-500 text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                            {/* {getInitials(org)} */}
                                                            {org.code}
                                                        </div>
                                                        <span className={`text-sm ${selected?.id === org.id ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                                            {org.title}
                                                        </span>
                                                    </div>
                                                    {selected?.id === org.id && (
                                                        <Check size={16} className="text-green-600 ml-2" />
                                                    )}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))
                                )}
                            </div>

                            <DropdownMenuSeparator className="m-0" />

                            {/* Back to all orgs - Fixed at bottom */}
                            <div className="flex-none p-1">
                                <DropdownMenuItem className="px-0 py-0 focus:bg-gray-50 cursor-pointer rounded-md">
                                    <Link
                                        href={`/${role}/organizations`}
                                        onClick={() => setIsOpen(false)}
                                        className="w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
                                    >
                                        ← Back to all orgs
                                    </Link>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }

        </>
    );
}