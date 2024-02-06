import fallback from "../../public/logo_white.png";
import Image from "next/image";

function OptimizedImageWithFallback({
  src,
  alt,
  fallBackSrc = fallback.src,
  className,
}: {
  src: string;
  alt: string;
  fallBackSrc: string;
  className: any;
}) {
  return (
    <>
      {src && src.trim() !== "" ? (
        <Image src={src} alt={alt} />
      ) : (
        <Image
          src={fallBackSrc}
          alt={alt}
          width={100}
          height={100}
          className={className}
          //   objectFit="cover"
        />
      )}
    </>
  );
}

export default OptimizedImageWithFallback;
