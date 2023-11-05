import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  return (
    <div className="flex flex-col w-full py-10 items-center bg-gradient-to-r from-slate-900 to-slate-950">
      <h1>
        Made with love by{" "}
        <Link href="#" className="text-blue-400">
          Pape
        </Link>
      </h1>
      <h1>2023</h1>

      {/* <Link href="/login">
        <p>Login</p>
      </Link>
      <Link href="/login">
        <p>Explore</p>
      </Link>
      <Link href="/login">
        <p>Action</p>
      </Link> */}
    </div>
  );
}
