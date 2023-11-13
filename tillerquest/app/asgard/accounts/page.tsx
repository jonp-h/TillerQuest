import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faMagnifyingGlass,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import PlayerList from "@/app/ui/PlayerList";

export default function Action() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col gap-4 items-center w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-2xl font-extrabold">Add user</h1>
          <input type="text" placeholder="username" className="bg-slate-600" />
          <input
            type="password"
            placeholder="password"
            className="bg-slate-600"
          />
          <input
            type="password"
            placeholder="password again"
            className="bg-slate-600"
          />
        </div>
        <a href="#">
          <FontAwesomeIcon icon={faUserPlus} className="h-10" />
        </a>
        <h1>Add user</h1>
      </div>
    </main>
  );
}
