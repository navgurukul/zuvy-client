import React from "react";
import MaxWidthWrapper from "../MaxWidthWrapper";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
type Props = {};

function LoginPage({}: Props) {
  return (
    <MaxWidthWrapper className='mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center'>
      <div className='mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50 '>
        <p className='text-sm font-semibold text-gray-700 '>
          Zuvy is under costuction
        </p>
      </div>
      <Button color='secondary'>
        <GoogleIcon />
        Login With Google
      </Button>
    </MaxWidthWrapper>
  );
}

export default LoginPage;
