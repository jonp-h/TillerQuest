import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import PlayerList from "@/components/ui/PlayerList";
import RoleGate from "@/components/ui/RoleGate";

export default function Action() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <RoleGate allowedRole="ADMIN">
        <div className="flex flex-col gap-12 items-center w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
          <div className="flex flex-col gap-5 items-center">
            <h1 className="text-2xl font-extrabold">Damage players</h1>
            <input type="number" className="bg-slate-600" />
            <div className="flex gap-5">
              <div className="flex flex-col gap-3 cursor-pointer max-w-screen hover:text-purple-600 hover:border-purple-600 border-white-600 border-2 rounded-lg p-3 items-center">
                <FontAwesomeIcon icon={faMagnifyingGlass} className=" h-10" />
                <p>Select all</p>
              </div>
              <div className="flex flex-col gap-3 cursor-pointer max-w-screen hover:text-purple-600 hover:border-purple-600 border-red-600 border-2 rounded-lg p-3 items-center">
                <FontAwesomeIcon icon={faBolt} className="text-red-600 h-10" />
                <p className="text-red-600">Damage all selected</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-10">
            <PlayerList />
          </div>
        </div>
      </RoleGate>
    </main>
  );
}
