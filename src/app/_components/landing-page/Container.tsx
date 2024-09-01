import React from 'react'

function Container({ children }: any) {
    return (
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-14 lg:px-12">
            {children}
        </div>
    )
}

export default Container
