'use client'

import LoginPage from './auth/login/_components/LoginPage'
import {
    GoogleLogin,
    GoogleOAuthProvider,
    CredentialResponse,
} from '@react-oauth/google'

export default function Home() {
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return (
            <>
                <GoogleOAuthProvider
                    clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                >
                    <LoginPage />
                </GoogleOAuthProvider>
            </>
        )
    }
}
