'use client'

import { useState } from 'react'
import { StudentLogin, StudentSignup } from '@/app/auth/_components/StudentAuth'
import { CareerToursGoogleLoginButton } from './CareerToursGoogleLoginButton'

type AuthTab = 'signup' | 'login'

export function CareerToursAuth() {
    const [activeTab, setActiveTab] = useState<AuthTab>('signup')

    return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-6">
        <section className="w-full max-w-md" aria-label="Student account access">
            <div role="tablist" aria-label="Choose sign up or login" className="mb-4 grid grid-cols-2 rounded-xl border bg-muted/60 p-1">
                <button type="button" role="tab" id="careertours-signup-tab" aria-selected={activeTab === 'signup'} aria-controls="careertours-auth-panel" onClick={() => setActiveTab('signup')} className={`rounded-lg px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeTab === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    Sign up
                </button>
                <button type="button" role="tab" id="careertours-login-tab" aria-selected={activeTab === 'login'} aria-controls="careertours-auth-panel" onClick={() => setActiveTab('login')} className={`rounded-lg px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeTab === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    Login
                </button>
            </div>
            <div id="careertours-auth-panel" role="tabpanel" aria-labelledby={activeTab === 'signup' ? 'careertours-signup-tab' : 'careertours-login-tab'}>
                {activeTab === 'signup'
                    ? <StudentSignup onLoginClick={() => setActiveTab('login')} googleFooter={<GoogleAuthFooter />} />
                    : <StudentLogin onSignupClick={() => setActiveTab('signup')} googleFooter={<GoogleAuthFooter />} />}
            </div>
        </section>
    </main>
}

function GoogleAuthFooter() {
    return <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
        <CareerToursGoogleLoginButton />
    </div>
}
