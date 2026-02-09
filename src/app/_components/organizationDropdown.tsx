'use client';

import { useState } from 'react';
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

interface Organization {
    id: string;
    name: string;
    code: string;
    managementType: 'Self Managed' | 'Zuvy Managed';
    poc: {
        name: string;
        email: string;
    };
    assignee?: {
        name: string;
        email: string;
    };
    createdAt: string;
}

const organizations: Organization[] = [
    {
        id: '1',
        name: 'Amazon Future Engineer',
        code: 'AF',
        managementType: 'Self Managed',
        poc: { name: 'John Doe', email: 'john.doe@amazon.com' },
        assignee: { name: 'Alex Kumar', email: 'alex.kumar@zuvy.com' },
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Microsoft',
        code: 'M',
        managementType: 'Zuvy Managed',
        poc: { name: 'Sarah Smith', email: 'sarah.smith@microsoft.com' },
        assignee: { name: 'Alex Kumar', email: 'alex.kumar@zuvy.com' },
        createdAt: '2024-02-20',
    },
    {
        id: '3',
        name: 'Global Solutions Inc',
        code: 'GS',
        managementType: 'Self Managed',
        poc: { name: 'Michael Johnson', email: 'michael@globalsolutions.com' },
        assignee: { name: 'Priya Sharma', email: 'priya.sharma@zuvy.com' },
        createdAt: '2024-03-10',
    },
    {
        id: '4',
        name: 'Enterprise Solutions',
        code: 'ES',
        managementType: 'Self Managed',
        poc: { name: 'David Wilson', email: 'david.wilson@enterprisesol.com' },
        assignee: { name: 'Priya Sharma', email: 'priya.sharma@zuvy.com' },
        createdAt: '2024-05-12',
    },
];

export default function OrganizationDropdown({orgName}: {orgName: string}) {
    const pathname = usePathname();
    const role = pathname.split('/')[1]; // Extract role from pathname
    
    const filteredSelectedOrg = organizations.filter(org =>
        orgName.toLowerCase() === org.name.toLowerCase()
    );
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(filteredSelectedOrg[0] || organizations[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (org: Organization) => {
        setSelected(org);
        setIsOpen(false);
        setSearchTerm('');
    };

    const getBackgroundColor = (code: string) => {
        const colors: { [key: string]: string } = {
            AF: 'bg-orange-500',
            M: 'bg-orange-500',
            GS: 'bg-orange-500',
            ES: 'bg-orange-500',
        };
        return colors[code] || 'bg-orange-500';
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-auto flex items-center justify-between px-4 py-3 h-auto hover:bg-gray-50 border-none"
                >
                    <div className="flex items-center gap-3">
                        <div className={`${getBackgroundColor(selected.code)} text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold`}>
                            {selected.code}
                        </div>
                        <span className="text-gray-900 font-medium">{selected.name}</span>
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
                        />
                    </div>
                </div>

                {/* Organizations List */}
                <div className="py-2">
                    <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Switch Organization
                    </DropdownMenuLabel>
                    
                    {filtered.map(org => (
                        <DropdownMenuItem key={org.id} className="px-0 py-0 focus:bg-gray-50">
                            <Link
                                key={org.id}
                                href={`/admin/${org.name}/courses`}
                                onClick={() => handleSelect(org)}
                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 ${
                                    selected.id === org.id ? 'bg-green-50' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`${getBackgroundColor(org.code)} text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold`}>
                                        {org.code}
                                    </div>
                                    <span className={selected.id === org.id ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                                        {org.name}
                                    </span>
                                </div>
                                {selected.id === org.id && (
                                    <Check size={18} className="text-green-600" />
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))}
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