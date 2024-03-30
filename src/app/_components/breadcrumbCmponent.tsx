import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'

function BreadcrumbCmponent({
    crumbs,
}: {
    crumbs: { crumb: string; href?: string; isLast: Boolean }[]
}) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs?.map((item, index) => (
                    <>
                        <BreadcrumbItem
                            key={item.crumb}
                            className={`${
                                !item.isLast ? 'text-secondary' : ''
                            }`}
                        >
                            <BreadcrumbLink href={item.href}>
                                {item.crumb}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < crumbs.length - 1 && <BreadcrumbSeparator />}
                    </>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default BreadcrumbCmponent
