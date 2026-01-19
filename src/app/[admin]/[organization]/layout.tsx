import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    params: {
        organization: string;
    };
}

export default function Layout({ children, params }: LayoutProps) {
    return (
        <div className="organization-layout">
            <header className="org-header">
                <h1>Organization: {params.organization}</h1>
            </header>
            <main className="org-content">
                {children}
            </main>
        </div>
    );
}