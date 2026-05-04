import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    if (path.startsWith("/oficinista") && token?.role !== "OFICINISTA") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    if (path.startsWith("/chofer") && token?.role !== "CHOFER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/oficinista/:path*", "/chofer/:path*"],
};