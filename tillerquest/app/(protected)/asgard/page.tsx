import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faSchool,
  faCalculator,
  faStarAndCrescent,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function Asgard() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col gap-10 md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <Link
          href={"asgard/damage"}
          className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
        >
          <FontAwesomeIcon icon={faBolt} className=" h-10" />
          <p>Damage</p>
        </Link>
        <Link
          href={"asgard/attendance"}
          className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
        >
          <FontAwesomeIcon icon={faSchool} className=" h-10" />
          <p>Attendance</p>
        </Link>
        <Link
          href={"asgard/give-xp"}
          className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
        >
          <FontAwesomeIcon icon={faCalculator} className=" h-10" />
          <p>Give XP</p>
        </Link>
        <Link
          href={"asgard/cosmic-event"}
          className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
        >
          <FontAwesomeIcon icon={faStarAndCrescent} className=" h-10" />
          <p>Cosmic Event</p>
        </Link>
        <Link
          href={"asgard/accounts"}
          className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
        >
          <FontAwesomeIcon icon={faUserPlus} className=" h-10" />
          <p>Accounts</p>
        </Link>
      </div>
    </main>
  );
}
