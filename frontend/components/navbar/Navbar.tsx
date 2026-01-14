import { secureGet } from "@/lib/secureFetch";
import NavbarContent from "./NavbarContent";

export default async function Navbar() {
  const scheduledWishes = await secureGet<number>(`/wishes/scheduled/count`, {
    cache: "force-cache",
    next: {
      revalidate: 43200, // 12 hours
      tags: ["scheduled-wishes-count"],
    },
  });

  const scheduledWishesCount = scheduledWishes.ok ? scheduledWishes.data : 0;

  return (
    <div className="text-lg fixed items-center flex flex-grow-1 p-3 w-screen z-20 bg-background ">
      <NavbarContent scheduledWishesCount={scheduledWishesCount} />
    </div>
  );
}
