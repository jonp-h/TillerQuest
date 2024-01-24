import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Error() {
  return (
    <main className="flex min-h-screen flex-col items-center md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="grid justify-items-center justify-center w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="text-5xl text-red-600"
        />
        <p className="p-5 text-3xl">Oops! Something went wrong</p>
      </div>
    </main>
  );
}
