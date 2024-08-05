"use server";

import { headers } from "next/headers";

export async function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  var ip = headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;

  if (forwardedFor) {
    ip = forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  switch (ip) {
    case FALLBACK_IP_ADDRESS:
      return false;
    case "::ffff:127.0.0.1":
      return true;
    default:
      return false;
  }
}
