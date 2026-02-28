import { headers } from "next/headers";

export async function getClientIp() {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export function nowMinuteBucket() {
  return Math.floor(Date.now() / 60000);
}
