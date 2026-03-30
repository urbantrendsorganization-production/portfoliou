import { NextResponse } from "next/server";

// OAuth callback - redirect to login since we use Django JWT auth
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
