import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";
import Image from "next/image";
import logo from "../../../public/logo.PNG";
const Navbar = () => {
  return (
    <nav className='sticky h-14 inset-x-0 top-0 border-b border-gray-200 bg-white/50 backdrop-blur-lg transition-all  '>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-center border-green-[#2f433a]'>
          <Link href={"/"}>
            <Image src={logo} alt='logo' width={"64"} height={"64"} />
          </Link>
          <div className='hidden items-center space-x-4 sm:flex '>
            <>
              <Link href={"/"} className={""}>
                there
              </Link>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
