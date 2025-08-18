import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

function BreadcrumbComponent({
    crumbs,
}: {
    crumbs: { crumb: string; href?: string; isLast: boolean }[]
}) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs?.map((item, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem
                            key={item.crumb}
                            className={` ${
                                !item.isLast ? 'text-[rgb(81,134,114)]' : ''
                            }`}
                        >
                            <BreadcrumbLink href={item.href}>
                                {item.crumb}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < crumbs.length - 1 && (
                            <BreadcrumbSeparator key={`separator-${index}`} />
                        )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export default BreadcrumbComponent
