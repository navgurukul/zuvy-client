import fallback from "../../public/logo_white.png";
import Image from "next/image";

function OptimizedImageWithFallback({
  src,
  alt,
  fallBackSrc = fallback.src,
}: {
  src: string;
  alt: string;
  fallBackSrc?: string;
}) {

  return (
    <>
      {src && src.trim() !== "" ? (
        <div className="relative h-[200px] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="w-full h-full object-cover relative"
          />
        </div>
      ) : (
        <Image src={fallBackSrc} alt={alt} width={200} height={200} priority />
      )}
    </>
  );
}

export default OptimizedImageWithFallback;
