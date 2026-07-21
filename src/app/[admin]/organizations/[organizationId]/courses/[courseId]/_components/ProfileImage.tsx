import Image from 'next/image'

interface ProfileImageProps {
  src?: string | null
  alt?: string
  size?: number
}

export function ProfileImage({
  src,
  alt = 'profilePic',
  size = 35,
}: ProfileImageProps) {
  return (
    <Image
      src={
        src ||
        'https://avatar.iran.liara.run/public/boy?username=Ash'
      }
      alt={alt}
      width={size}
      height={size}
      className="rounded-full ml-2"
    />
  )
}