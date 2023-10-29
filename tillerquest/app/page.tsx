import Image from "next/image";
import Link from "next/link";
import TQ from "../public/TQ.png";

export default function Home() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="relative flex place-items-center ">
        {/* The React image component, width and height in RENDERED pixels*/}
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src={TQ}
          alt="Tiller Quest logo"
          width={280}
          height={150}
          priority
        />
      </div>
      <h1 className="text-6xl font-extrabold transition-transform hover:-translate-y-1 motion-reduce:transform-none">
        Tiller Quest
      </h1>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <Link
          href="/explore"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Explore{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Tiller Quest and its uses in the classroom
          </p>
        </Link>

        <Link
          href="/login"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Login{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Continue your journey in the world of Tiller Quest!
          </p>
        </Link>

        <Link
          href="/signup"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Sign up{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Create an account to start your journey to Valhalla!
          </p>
        </Link>

        <Link
          href="/about"
          className=" rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            About us{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Read about the gods behind Tiller Quest
          </p>
        </Link>
      </div>
    </main>
  );
}
