import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faMagnifyingGlass,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";
import Classes from "@/app/ui/Classes";

export default function Accounts() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col gap-4 items-center w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-2xl font-extrabold">Add new user</h1>
          <Classes />
          <div className="flex flex-col gap-10">
            <h1></h1>
            <form>
              {/* Name input */}
              <div className="flex flex-col items-start mb-6">
                <input
                  type="text"
                  id="Name"
                  placeholder="Name"
                  className="peer px-4 py-2.5 w-full 
            border border-slate-600 rounded-md placeholder-transparent bg-slate-900 "
                />
                <label
                  htmlFor="Name"
                  className="absolute ml-4 text-xs 
            text-white
            peer-placeholder-shown:mt-3.5
            peer-placeholder-shown:text-base 
            duration-300 select-none cursor-text"
                >
                  Name
                </label>
              </div>

              {/* Lastname input */}
              <div className="flex flex-col items-start mb-6">
                <input
                  type="text"
                  id="Lastname"
                  placeholder="Lastname"
                  className="peer px-4 py-2.5 w-full 
            border border-slate-600 rounded-md placeholder-transparent bg-slate-900 "
                />
                <label
                  htmlFor="Lastname"
                  className="absolute ml-4 text-xs 
            text-white
            peer-placeholder-shown:mt-3.5
            peer-placeholder-shown:text-base 
            duration-300 select-none cursor-text"
                >
                  Lastname
                </label>
              </div>

              {/* Username input */}
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

              {/* Password again input */}
              <div className="flex flex-col items-start mb-6">
                <input
                  type="password"
                  id="passwordagain"
                  placeholder="Password again"
                  className="peer px-4 py-2.5 w-full 
              border border-slate-600 rounded-md placeholder-transparent bg-slate-900 "
                />
                <label
                  htmlFor="passwordagain"
                  className="absolute ml-4 text-xs 
            text-white 
            peer-placeholder-shown:mt-3.5
            peer-placeholder-shown:text-base 
            duration-300 select-none cursor-text"
                >
                  Password again
                </label>
              </div>
            </form>
          </div>
          <a href="#">
            <FontAwesomeIcon icon={faUserPlus} className="h-10" />
          </a>
          <h1>Add user</h1>
        </div>
      </div>
    </main>
  );
}
