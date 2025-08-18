import React from 'react'

const Heading = ({ title }: { title: string }) => {
    return (
        <div className="text-start">
            <h1 className="text-2xl text-gray-600 font-bold">{title}</h1>
        </div>
    )
}
export default Heading
