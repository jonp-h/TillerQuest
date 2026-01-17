import { secureGet } from "@/lib/secureFetch";
import NavbarContent from "./NavbarContent";
import { getSessionFromBackend } from "@/lib/redirectUtils";

export default async function Navbar() {
  // Check if user has session before making authenticated requests
  const session = await getSessionFromBackend();

  let scheduledWishesCount = 0;

  // Only fetch if user is authenticated
  if (session?.user) {
    const scheduledWishes = await secureGet<number>(`/wishes/scheduled/count`, {
      cache: "force-cache",
      next: {
        revalidate: 43200, // 12 hours
        tags: ["scheduled-wishes-count"],
      },
    });
    scheduledWishesCount = scheduledWishes.ok ? scheduledWishes.data : 0;
  }

  return (
    <div className="text-lg fixed items-center flex flex-grow-1 p-3 w-screen z-20 bg-background ">
      <NavbarContent
        session={session}
        scheduledWishesCount={scheduledWishesCount}
      />
    </div>
  );
}
