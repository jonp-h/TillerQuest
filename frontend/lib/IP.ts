"use server";

import { headers } from "next/headers";

export async function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = await headers().then((headers) =>
    headers.get("x-forwarded-for"),
  );

  let ip =
    (await headers().then((headers) => headers.get("x-real-ip"))) ??
    FALLBACK_IP_ADDRESS;

  if (forwardedFor) {
    ip = forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  switch (ip) {
    case FALLBACK_IP_ADDRESS:
      return false;
    case process.env.MAGICAL_AREA:
      return true;
    default:
      return false;
  }
}
