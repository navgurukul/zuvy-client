import Link from 'next/link'
import { headers } from 'next/headers'

export default function NotFound() {
    const headersList = headers()

    return (
        <div>
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/">Return Home</Link>
        </div>
    )
}
