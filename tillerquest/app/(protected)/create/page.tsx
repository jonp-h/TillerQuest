"use client";
import { auth } from "@/auth";
import Classes from "@/components/ui/Classes";
import { Button } from "@/components/ui/Button";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Create() {
  const { update } = useSession();

  const router = useRouter();

  const tekst = process.env.NEW_USER_SECRET;

  const [secret, setSecret] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");

  // updates the user with the role of USER
  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (secret !== tekst) {
      alert(tekst);
      return;
    }

    alert("yes");
    update({ role: "USER" });

    // necessary refreshes before redirecting to profile
    getSession();
    router.refresh();
    await update().then(() => {
      router.push("profile");
    });
  };

  return (
    <main className="flex min-h-screen flex-col gap-10 items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="bg-slate-900 flex justify-center flex-col p-10 rounded-xl">
        <form onSubmit={handleSubmit}>
          <div className="grid w-full h-full bg-gray-900 rounded-lg place-items-center">
            <div className="w-72">
              <div className="relative h-10 w-full min-w-[200px]">
                <input
                  type="text"
                  className="peer h-full w-full rounded-[7px] border border-white border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal  !text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-white focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                  onChange={(e) => setSecret(e.target.value)}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight !text-white transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-white before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-white after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-white peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-white peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-white peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Secret
                </label>
              </div>
            </div>
          </div>
          <Classes />
          <div className="grid w-full h-full bg-gray-900 rounded-lg place-items-center">
            <div className="w-72">
              <div className="relative h-10 w-full min-w-[200px]">
                <input
                  type="text"
                  className="peer h-full w-full rounded-[7px] border border-white border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal  !text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-white focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight !text-white transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-white before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-white after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-white peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-white peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-white peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Username
                </label>
              </div>
            </div>
          </div>
          <div className="grid w-full h-full bg-gray-900 rounded-lg place-items-center">
            <div className="w-72">
              <div className="relative h-10 w-full min-w-[200px]">
                <input
                  type="text"
                  className="peer h-full w-full rounded-[7px] border border-white border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal  !text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-white focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                  onChange={(e) => setName(e.target.value)}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight !text-white transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-white before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-white after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-white peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-white peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-white peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Name
                </label>
              </div>
            </div>
          </div>
          <div className="grid w-full h-full bg-gray-900 rounded-lg place-items-center">
            <div className="w-72">
              <div className="relative h-10 w-full min-w-[200px]">
                <input
                  type="text"
                  className="peer h-full w-full rounded-[7px] border border-white border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal  !text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-white focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                  onChange={(e) => setLastname(e.target.value)}
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight !text-white transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-white before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-white after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-white peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-white peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-white peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Last name
                </label>
              </div>
            </div>
          </div>
          <input type="submit" />
          <Button variant={"default"}>Create user</Button>
        </form>
      </div>
    </main>
  );
}
