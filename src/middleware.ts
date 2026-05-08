import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Debug: Log the token to see what's happening
    console.log('Middleware - Path:', path, 'Token:', token ? 'exists' : 'missing', 'Role:', token?.role);
    
    if (path.startsWith("/admin") && (!token || token.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if (path.startsWith("/oficinista") && (!token || token.role !== "OFICINISTA")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if (path.startsWith("/chofer") && (!token || token.role !== "CHOFER")) {
      return NextResponse.redirect(new URL("/login", req.url));
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