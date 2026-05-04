import { secureGet } from "@/lib/secureFetch";
import NavbarContent from "./NavbarContent";
import { getSessionFromBackend } from "@/lib/redirectUtils";
import { DateToString } from "@/types/dateToString";

export default async function Navbar() {
  // Check if user has session before making authenticated requests
  const session = await getSessionFromBackend();

  let scheduledWishesCount = 0;
  let scheduledAppEventsCount: Date | null = null;

  // Only fetch if user is authenticated
  if (
    session?.user &&
    session.user.role !== "NEW" &&
    session.user.role !== "INACTIVE"
  ) {
    const scheduledEvents = await secureGet<{
      wishes: number;
      appEvents: {
        scheduled: Date | null;
      };
    }>(`/scheduled/events`, {
      cache: "force-cache",
      next: {
        revalidate: 1800, // 30 minutes
        tags: ["scheduled-events"],
      },
    });

    scheduledWishesCount = scheduledEvents.ok ? scheduledEvents.data.wishes : 0;
    if (scheduledEvents.ok && scheduledEvents.data.appEvents?.scheduled) {
      scheduledAppEventsCount = new Date(
        scheduledEvents.data.appEvents.scheduled,
      );
    } else {
      scheduledAppEventsCount = null;
    }
  }

  return (
    <div className="text-lg fixed items-center flex flex-grow-1 p-3 w-screen z-20 bg-background ">
      <NavbarContent
        session={session}
        scheduledWishesCount={scheduledWishesCount}
        scheduledAppEventsCount={scheduledAppEventsCount}
      />
    </div>
  );
}
