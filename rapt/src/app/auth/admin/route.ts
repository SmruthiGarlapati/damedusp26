import { NextResponse } from "next/server";
import { DEMO_ADMIN_COOKIE } from "@/lib/demoAdmin";

const DEMO_ADMIN_SESSION_AGE = 60 * 60 * 24 * 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/schedule", url.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(DEMO_ADMIN_COOKIE, "1", {
    path: "/",
    maxAge: DEMO_ADMIN_SESSION_AGE,
    sameSite: "lax",
  });

  return response;
}
