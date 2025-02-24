import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

const Notfound = ({ error, reset }: { error: Error; reset: () => void }) => {
    return (
        <main className="grid min-h-screen place-items-center px-6 py-20 sm:py-32 lg:px-6 ">
            <div className="text-center">
            <p className="text-base font-semibold text-secondary dark:text-default">
                    There was a problem.
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 ">
                    Something went wrong.
                </h1>
                <p className="mt-6 text-base leading-7 text-zinc-900 dark:text-black">
                    Please go back, youve typed the wrong link.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href={'/'}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Home
                    </Link>
                </div>
            </div>
        </main>
    )
}
export default Notfound
