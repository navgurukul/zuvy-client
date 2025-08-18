// LoginPage
export interface DecodedGoogleToken {
    iss: string
    azp: string
    aud: string
    sub: string
    email: string
    email_verified: boolean
    name: string
    picture: string
    given_name: string
    family_name: string
    iat: number
    exp: number
}

export interface User {
  id: string;
  name: string;
  email: string;
  rolesList: string[]; 
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

