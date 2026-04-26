import { NextResponse } from "next/server";
import { DEMO_ADMIN_COOKIE } from "@/lib/demoAdmin";

const DEMO_SESSION_AGE = 60 * 60 * 24 * 30;
const VALID_PERSONAS = new Set(["admin", "tani", "sid"]);

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Read the persona the client already set via document.cookie
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existingVal = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${DEMO_ADMIN_COOKIE}=`))
    ?.split("=")[1] ?? "";

  // Accept "1" (legacy admin), "admin", "tani", "sid"
  const persona = existingVal === "1" ? "admin"
    : VALID_PERSONAS.has(existingVal) ? existingVal
    : "admin";

  const redirectUrl = new URL("/schedule", url.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(DEMO_ADMIN_COOKIE, persona, {
    path: "/",
    maxAge: DEMO_SESSION_AGE,
    sameSite: "lax",
  });

  return response;
}
