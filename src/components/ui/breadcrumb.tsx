import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  crumb: string;
  href: string;
}

function Breadcrumb({ crumbs }: { crumbs: BreadcrumbItem[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {crumbs.map((breadcrumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <span className="mx-2.5 text-gray-800">/</span>}
            <Link
              href={breadcrumb.href}
              className="ml-1 inline-flex text-sm font-medium text-gray-800 hover:underline md:ml-2"
            >
              {breadcrumb.crumb}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
