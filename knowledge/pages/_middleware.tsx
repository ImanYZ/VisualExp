import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/knowledge")) {
    const newURL = new URL(req.nextUrl.pathname.replace(/(^[/]knowledge)/gi, ""), req.nextUrl);
    return NextResponse.rewrite(newURL);
  }

  return NextResponse.next();
}
