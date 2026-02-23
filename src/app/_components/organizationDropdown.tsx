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
import { useOrganizationsByUser, Organization } from '@/hooks/useOrganizationsByUser';
import { getUser } from '@/store/store';

export default function OrganizationDropdown({orgName}: {orgName: string}) {
    const pathname = usePathname();
    const role = pathname.split('/')[1]; // Extract role from pathname
    const { user } = getUser();
    const userId = user?.id ? parseInt(user.id) : null;
    const { organizations, loading, error } = useOrganizationsByUser(userId);   
    const filteredSelectedOrg = organizations.filter(org =>
        orgName.toLowerCase() === org.displayName.toLowerCase()
    );
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(filteredSelectedOrg[0] || organizations[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''

    const filtered = organizations.filter(org =>
        org.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setSelected(filteredSelectedOrg[0] || organizations[0]);
    }, [loading, organizations]);

    const handleSelect = (org: Organization) => {
        setSelected(org);
        setIsOpen(false);
        setSearchTerm('');
    };

    // Generate code from displayName (first 1-2 letters)
    const getCodeFromName = (displayName: string) => {
        try{
                const words = displayName.split(' ');
            if (words.length > 1) {
                return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
            }
            return displayName.substring(0, 2).toUpperCase();
        } catch (e) {
            return '??';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-auto flex items-center justify-between px-4 py-3 h-auto hover:bg-gray-50 border-none"
                >
                    <div className="flex items-center gap-3">
                        {selected ? (
                            <>
                                <div className={`bg-orange-500 text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold`}>
                                    {getCodeFromName(selected.displayName)}
                                </div>
                                <span className="text-gray-900 font-medium">{selected.displayName}</span>
                            </>
                        ) : (
                            <span className="text-gray-500">Loading...</span>
                        )}
                    </div>
                    <ChevronDown size={20} className="text-gray-400" />
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                className="w-72 p-0" 
                align="start"
                side="bottom"
            >
                {/* Search Input */}
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-0 focus:ring-0 focus-visible:ring-0"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Organizations List */}
                <div className="py-2">
                    <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Switch Organization
                    </DropdownMenuLabel>
                    
                    {loading ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">Loading organizations...</div>
                    ) : error ? (
                        <div className="px-4 py-3 text-red-500 text-sm">Failed to load organizations</div>
                    ) : filtered.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No organizations found</div>
                    ) : (
                        filtered.map(org => (
                            <DropdownMenuItem key={org.id} className="px-0 py-0 focus:bg-gray-50">
                                <Link
                                    key={org.id}
                                    href={`/${role}/${org.displayName}/courses`}
                                    onClick={() => handleSelect(org)}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 ${
                                        selected?.id === org.id ? 'bg-green-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`bg-orange-500 text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold`}>
                                            {getCodeFromName(org.displayName)}
                                        </div>
                                        <span className={selected?.id === org.id ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                                            {org.displayName}
                                        </span>
                                    </div>
                                    {selected?.id === org.id && (
                                        <Check size={18} className="text-green-600" />
                                    )}
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator />
                
                {/* Back to all orgs */}
                <DropdownMenuItem className="px-0 py-0 focus:bg-gray-50">
                    <Link
                        href={`/${role}/organizations`}
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 text-left text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        ← Back to all orgs
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}