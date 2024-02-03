"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { setCookie } from "cookies-next";
import "./styles/login.css";

type Props = {};

function LoginPage({}: Props) {
  function reverseJwtBody(jwt: string): string {
    const [header, body, signature] = jwt.split(".");
    const reversedBody = body.split("").reverse().join("");
    return [header, reversedBody, signature].join(".");
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenVal = urlParams.get("token");
    const loggedOutToken = urlParams.get("loggedOutToken");

    const sendGoogleUserData = async (token: any) => {
      try {
        const resp = await axios.get(`${BASE_URL}/users/me`, {
          headers: {
            accept: "application/json",
            Authorization: token,
          },
        });
        localStorage.setItem("AUTH", JSON.stringify(resp.data.user));
        if (!resp.data.user.rolesList[0]) {
          setCookie("secure_typeuser", JSON.stringify(btoa("student")));
          return router.push("/student");
        } else if (resp.data.user.rolesList[0]) {
          setCookie(
            "secure_typeuser",
            JSON.stringify(btoa(resp.data.user.rolesList[0]))
          );
          return router.push(`/${resp.data.user.rolesList[0]}`);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (tokenVal) {
      setLoading(true);
      localStorage.setItem("loggedOutToken", JSON.stringify(loggedOutToken));
      localStorage.setItem("token", reverseJwtBody(tokenVal));
      sendGoogleUserData(reverseJwtBody(tokenVal));
    } else {
      setLoading(false);
    }

    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", "");
    }
    if (!localStorage.getItem("loggedOut")) {
      localStorage.setItem("loggedOut", String(false));
    }
  }, [BASE_URL, router]);

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="loading"></div>
          <div id="loading-text">Loading..</div>
        </div>
      ) : (
        <>
          <div className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
            <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50">
              <p className="text-sm font-semibold text-gray-700">
                Zuvy is under construction
              </p>
            </div>
            <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-6xl">
              Embark your learning journey with
              <span className="text-[#2f433a]"> Zuvy </span>
              <span className="text-yellow-900">in Seconds.</span>
            </h1>
            <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
              The Future of Learning Begins with a Simple Sign-in. Start Your
              Journey Today!
            </p>
            <Button className="bg-[#2f433a] p-4 mt-3 h-30 w-70 w-[250px]">
              <a href="https://dev.dcckrjm3h0sxm.amplifyapp.com/?loggedOut=true">
                <span className="text-lg">Login to Zuvy</span>
              </a>
            </Button>
          </div>
          <div className="">
            <div className="top-70 isolate">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              >
                <div
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                  className="relative left-[calc(50% -11rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[300deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-3rem)] sm:w-[72.1875rem]"
                />
              </div>
              <div></div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              >
                <div
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                  className="relative left-[calc(50% -14rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default LoginPage;
