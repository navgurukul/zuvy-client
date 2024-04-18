import { DataTable } from '@/app/_components/datatable/data-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'
import { columns } from './columns'

type Props = {}

const PraticeProblems = (props: Props) => {
    return (
        <div className="flex flex-col">
            <h1 className="text-start text-xl font-bold capitalize text-primary">
                Invert a Binary Tree
            </h1>

            <div className="text-start flex gap-x-3">
                <div className="p-4 rounded-lg shadow-md ">
                    <h1 className="text-gray-600 font-semibold text-xl">100</h1>
                    <p className="text-gray-500 ">Total Students</p>
                </div>
                <div className="p-4 rounded-lg shadow-md ">
                    <h1 className="text-gray-600 font-semibold text-xl">70</h1>
                    <p className="text-gray-500 ">Submissions Received</p>
                </div>
                <div className="p-4 rounded-lg shadow-md">
                    <h1 className="text-gray-600 font-semibold text-xl">30</h1>
                    <p className="text-gray-500 ">Not Yet Submitted</p>
                </div>
            </div>
            <div className="relative">
                <Input
                    placeholder="Search for Name, Email"
                    className="w-1/3 my-6 input-with-icon pl-8" // Add left padding for the icon
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
            </div>
            <DataTable data={[]} columns={columns} />
        </div>
    )
}

export default PraticeProblems
