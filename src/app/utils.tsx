import CryptoJS from 'crypto-js'

const secretKey = 'your-secret-key' // Use a strong secret key

export const encryptId = (id: string | number) => {
    // const base64Encrypted =
    return encodeURIComponent(
        CryptoJS.AES.encrypt(id.toString(), secretKey).toString()
    )
    // const urlSafeEncrypted = base64Encrypted
    //     .replace(/\+/g, '-')
    //     .replace(/\//g, '_')
    //     .replace(/=+$/, '')
    // return urlSafeEncrypted
}

// export const decryptId = (encryptedId: string) => {
//     const bytes = CryptoJS.AES.decrypt(
//         decodeURIComponent(encryptedId),
//         secretKey
//     )
//     console.log('bytes', bytes)
//     return bytes.toString(CryptoJS.enc.Utf8)
// }

export const decryptId = (encryptedId: string): number => {
    try {
        // First decrypt to bytes
        const bytes = CryptoJS.AES.decrypt(
            decodeURIComponent(encryptedId),
            secretKey
        )

        // Convert bytes to UTF8 string
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8)

        // Convert string to number
        const decryptedNumber = Number(decryptedString)

        // Validate the result is actually a number
        if (isNaN(decryptedNumber)) {
            throw new Error('Decrypted value is not a valid number')
        }

        return decryptedNumber
    } catch (error) {
        console.error('Error decrypting ID:', error)
        throw error
    }
}

// import CryptoJS from 'crypto-js'

// const secretKey = 'your-secret-key' // Use a strong secret key

// // Encrypt the ID and make the output URL-safe
// export const encryptId = (id: string | number) => {
//     const base64Encrypted = CryptoJS.AES.encrypt(
//         id.toString(),
//         secretKey
//     ).toString()

//     // Make it URL-safe by replacing characters that may break URLs
//     const urlSafeEncrypted = base64Encrypted
//         .replace(/\+/g, '-') // Replace '+' with '-'
//         .replace(/\//g, '_') // Replace '/' with '_'
//         .replace(/=+$/, '') // Remove any trailing '=' characters

//     return urlSafeEncrypted
// }

// // Decrypt the URL-safe encrypted ID
// export const decryptId = (encryptedId: string) => {
//     // Convert the URL-safe string back to regular Base64 format
//     const base64Encrypted = encryptedId
//         .replace(/-/g, '+') // Replace '-' back to '+'
//         .replace(/_/g, '/') // Replace '_' back to '/'

//     // Perform decryption
//     const bytes = CryptoJS.AES.decrypt(base64Encrypted, secretKey)

//     // Convert bytes back to UTF-8 string
//     const decryptedId = bytes.toString(CryptoJS.enc.Utf8)

//     // Handle cases where decryption fails (empty result means something went wrong)
//     if (!decryptedId) {
//         throw new Error(
//             'Decryption failed. Invalid encrypted ID or secret key.'
//         )
//     }

//     return decryptedId
// }
