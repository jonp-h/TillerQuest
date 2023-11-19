import Abilities from "@/app/ui/Abilities";

export default function Levelup() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <h2 className="font-extrabold text-2xl">Abilites</h2>
        <div className="grid grid-cols-3 gap-5 md:gap-10 md:grid-cols-4">
          <Abilities />
        </div>
      </div>
    </main>
  );
}
