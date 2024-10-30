import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import Image from "next/image";
const Navbar = () => {
  return (
    <nav className='sticky h-14 inset-x-0 top-0 border-b border-gray-200 bg-white/50 backdrop-blur-lg transition-all  '>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-green-[#2f433a]'>
          <Link href={"/"} className='flex z-40 '>
            <Image
              src={"/logo.PNG"}
              alt='logo'
              className='p-2'
              width={"100"}
              height={"100"}
            />
          </Link>
          <div className='hidden items-center space-x-4 sm:flex '>
            <></>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export { Navbar };
