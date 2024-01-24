"use client";
import Image from "next/image";
import Link from "next/link";
import { julius_Sans_One } from "../fonts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import ErrorBox from "@/components/ui/ErrorBox";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export default function Login() {
  const onClick = () => {
    signIn("github", {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="grid justify-items-center justify-center w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        {/* The React image component, width and height in RENDERED pixels*/}
        <Image
          src="/logo/TQ.png"
          alt="Tiller Quest logo"
          width={180}
          height={150}
          priority
        />
        <div className={julius_Sans_One.className}>
          <h1 className="text-6xl md:text-6xl">Tiller Quest</h1>
        </div>
        <p className="pt-6 md:pt-8 mb-4">Please login to enter Valhalla</p>
        <form>
          {/* Username login */}
          {/* <div className="flex flex-col items-start mb-6">
            <input
              type="text"
              id="username"
              placeholder="username"
              className="peer px-4 py-2.5 w-full 
            border border-slate-600 rounded-md placeholder-transparent bg-slate-900 "
            />
            <label
              htmlFor="username"
              className="absolute ml-4 text-xs 
            text-white
            peer-placeholder-shown:mt-3.5
            peer-placeholder-shown:text-base 
            duration-300 select-none cursor-text"
            >
              Username
            </label>
          </div>

          {/* Password input */}
          {/* <div className="flex flex-col items-start mb-6">
            <input
              type="password"
              id="password"
              placeholder="password"
              className="peer px-4 py-2.5 w-full 
              border border-slate-600 rounded-md placeholder-transparent bg-slate-900 "
            />
            <label
              htmlFor="password"
              className="absolute ml-4 text-xs 
            text-white 
            peer-placeholder-shown:mt-3.5
            peer-placeholder-shown:text-base 
            duration-300 select-none cursor-text"
            >
              Password
            </label>
          </div>

          <div className="mb-12 pb-1 pt-1 text-center">
            <button
              className="mb-4 w-full rounded px-6 pb-2 pt-2.5 text-sm font-medium uppercase shadow-xl transition duration-200 ease-in-out bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 active:bg-purple-900"
              type="button"
              data-te-ripple-init
              data-te-ripple-color="light"
            >
              Log in
            </button> */}

          {/* <Link href="/forgot-password">Forgot password?</Link> */}
          {/* </div> */}
          <div className="mb-2 pb-1 pt-3 text-center">
            <button
              className="mb-4 w-full rounded px-6 pb-2 pt-2.5 gap-x-3 flex items-center justify-center text-xl font-medium uppercase shadow-xl transition duration-200 ease-in-out bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 active:bg-purple-900"
              type="button"
              data-te-ripple-init
              data-te-ripple-color="light"
              onClick={() => {
                onClick();
              }}
            >
              <FontAwesomeIcon
                icon={faGithub as IconProp}
                className="text-2xl"
              />
              Github
            </button>
          </div>

          <div className="flex items-center justify-between mb-10">
            <p className="mr-4">{"Don't have an account?"}</p>
            <Link href="/apply">
              <button
                type="button"
                className="inline-block rounded px-6 pb-2 pt-2 text-xs font-medium uppercase transition duration-200 ease-in-out hover:animate-pulse bg-purple-950 dark:hover:bg-purple-900"
              >
                Apply
              </button>
            </Link>
          </div>
        </form>
        {/* Sends an error if an error message is passed */}
        <ErrorBox message="" />
      </div>
    </main>
  );
}
