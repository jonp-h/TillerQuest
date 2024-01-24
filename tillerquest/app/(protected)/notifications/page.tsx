export default function Notficiations() {
  let xp: string = "80%";
  let hp: string = "44%";
  let mana: string = "30%";
  let totalXp: string = "145";
  let totalHp: string = "324";
  let totalMana: string = "456";

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl "></div>
    </main>
  );
}
