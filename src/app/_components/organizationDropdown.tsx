'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import Link from 'next/link'

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
        // <div className="relative w-full max-w-xs">
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white border-none border-gray-200 rounded-lg hover:bg-gray-50"
            >
                <div className="flex items-center gap-3">
                    <div className={`${getBackgroundColor(selected.code)} text-white w-8 h-8 rounded flex items-center justify-center text-sm font-bold`}>
                        {selected.code}
                    </div>
                    <span className="text-gray-900 font-medium">{selected.name}</span>
                </div>
                <ChevronDown size={20} className="text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border-b border-gray-200 focus:outline-none text-sm"
                    />

                    <div className="py-2">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Switch Organization
                        </p>

                        {filtered.map(org => (
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
                        ))}
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 border-t border-gray-200 text-left text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        ← Back to all orgs
                    </button>
                </div>
            )}
        </div>
    );
}