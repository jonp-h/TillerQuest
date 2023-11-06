import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faSchool,
  faCalculator,
  faStarAndCrescent,
} from "@fortawesome/free-solid-svg-icons";

export default function Action() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col gap-10 md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div></div>
      </div>
    </main>
  );
}
