import Link from "next/link";
import React from "react";

export default function LoginForm() {
  return (
    <div>
      {/* Username login */}
      <div className="flex flex-col items-start mb-6">
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
      <div className="flex flex-col items-start mb-6">
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
        </button>

        <Link href="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
}
