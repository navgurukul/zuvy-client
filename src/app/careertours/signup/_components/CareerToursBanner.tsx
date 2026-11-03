'use client'

import { useState } from 'react'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { useThemeStore } from '@/store/store'
import { ArrowDown, Languages, MessageCircle, PlayCircle, ShieldCheck, Users, X } from 'lucide-react'

type CareerToursBannerProps = {
    onLogin?: () => void
    onSignup?: () => void
}

export function CareerToursBanner({ onLogin, onSignup }: CareerToursBannerProps) {
    const [open, setOpen] = useState(true)
    const { isDark } = useThemeStore()
    const headerClass = isDark ? 'bg-primary-dark' : 'bg-primary'
    const accentTextClass = isDark ? 'text-accent' : 'text-secondary-dark'
    const accentSurfaceClass = isDark ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
    const bannerSurfaceClass = isDark ? 'bg-card border-border text-card-foreground' : 'bg-card border-border text-card-foreground'

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (!nextOpen) localStorage.setItem('CAREER_TOURS_BANNER_STORAGE_KEY', 'false')
    }

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[calc(100%-1rem)] max-h-[calc(100vh-1rem)] max-w-xl overflow-y-auto rounded-3xl border-0 bg-background p-0 shadow-2xl sm:w-full">
            <DialogClose className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white/70 transition hover:bg-black/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Close Career Tours banner">
                <X className="h-5 w-5" />
            </DialogClose>
            <section className={`w-full  rounded-3xl border shadow-2xl shadow-black/20 ${bannerSurfaceClass}`} aria-label="Career tours">
        <header className={`relative overflow-hidden p-5 text-primary-foreground sm:p-6 ${headerClass}`}>
            <div className={`absolute -right-10 -top-16 h-40 w-40 rounded-full border-[18px] ${isDark ? 'border-accent/20' : 'border-secondary/20'}`} aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-4">
                <div className="text-left">
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] `}>Amazon Future Engineer</p>
                    <h5 className="max-w-sm text-md font-semibold tracking-tight ">Career tours for grades 5–12</h5>
                </div>
                {/* <span className="shrink-0 rounded-full bg-[#d6f36b] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#15232b]">Free</span> */}
            </div>
        </header>

        <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:p-5">
            <div className="rounded-2xl bg-card-elevated p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</p><p className="mt-1 text-xl font-bold sm:text-2xl">30–60 min</p></div>
            <div className="rounded-2xl bg-card-elevated p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Format</p><p className="mt-1 text-xl font-bold sm:text-2xl">Self-paced</p></div>
        </div>

        <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"><span className={`h-2 w-2 rounded-full ${isDark ? 'bg-accent' : 'bg-secondary'}`} /> Your tour plan</div>
            <div className="relative text-left space-y-5 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-border">
                <div className="relative flex gap-3 sm:gap-4"><span className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${accentSurfaceClass}`}><Languages className="h-5 w-5" /></span><div className="min-w-0 flex-1 pt-1"><h2 className="text-lg font-bold leading-snug">Choose your language.</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Pick the one you like best.</p></div></div>
                <div className="relative flex gap-3 sm:gap-4"><span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning text-warning-foreground shadow-sm"><Users className="h-5 w-5" /></span><div className="pt-1"><h2 className="text-lg font-bold">Tell your friends.</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Invite classmates to join you.</p></div></div>
                <div className="relative flex gap-3 sm:gap-4"><span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info text-info-foreground shadow-sm"><ShieldCheck className="h-5 w-5" /></span><div className="pt-1"><h2 className="text-lg font-bold">Check the videos.</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">If YouTube is blocked, ask your teacher to get the video links unblocked.</p></div></div>
                <div className="relative flex gap-3 sm:gap-4"><span className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${isDark ? 'bg-primary-dark text-primary-foreground' : 'bg-primary text-primary-foreground'}`}><PlayCircle className="h-5 w-5" /></span><div className="pt-1"><h2 className="text-lg font-bold">Watch and answer.</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Watch each video, then answer the quiz.</p></div></div>
                <div className="relative flex gap-3 sm:gap-4"><span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm"><MessageCircle className="h-5 w-5" /></span><div className="pt-1"><h2 className="text-lg font-bold">Talk about it.</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Finish by sharing what you learned with your group.</p></div></div>
            </div>
        </div>

        {(onLogin || onSignup) && <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:justify-end sm:p-5">
            {onLogin && <button type="button" onClick={onLogin} className="rounded-xl border border-border px-5 py-3 font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Log in</button>}
            {onSignup && <button type="button" onClick={onSignup} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Create a student account</button>}
        </div>}
        <div className="flex justify-center pb-4 text-muted-foreground"><ArrowDown aria-hidden="true" className="h-4 w-4" /></div>
            </section>
        </DialogContent>
    </Dialog>
}
