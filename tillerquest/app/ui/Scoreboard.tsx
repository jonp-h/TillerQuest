import Image from "next/image";

export default function Scoreboard() {
  return (
    <div className="flex flex-col">
      <h1 className=" text-6xl p-10">Scoreboard</h1>
      <div className="flex flex-col m-10">
        <div className="flex flex-row gap-5 justify-between items-center border-b-2 border-dashed">
          <div className="flex items-center">
            <h1 className="text-2xl mr-5 font-semibold">Position</h1>

            <h1 className="text-2xl font-semibold">Username</h1>
          </div>
          <h1 className="text-2xl text-slate-300 justify-end">Score</h1>
        </div>
        <div className="flex flex-row gap-5 justify-between items-center border-b-2 border-dashed">
          <div className="flex items-center">
            <div className="p-4 m-3 rounded-full border-2 border-white">
              <h1 className="text-2xl font-semibold">1</h1>
            </div>
            <h1 className="text-2xl font-semibold">Ola Nordmann</h1>
          </div>
          <h1 className="text-2xl text-slate-300 justify-end">9001</h1>
        </div>
        <div className="flex flex-row gap-5 justify-between items-center border-b-2 border-dashed">
          <div className="flex items-center">
            <div className="p-4 m-3 rounded-full border-2 border-white">
              <h1 className="text-2xl font-semibold">2</h1>
            </div>
            <h1 className="text-2xl font-semibold">Kari Nordmann</h1>
          </div>
          <h1 className="text-2xl text-slate-300 justify-end">666</h1>
        </div>
      </div>
    </div>
  );
}
