import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/resend-verification",
];

/*==================== Middleware ====================*/
export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("schedli_sid")?.value;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    let isAuthenticated = false;

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
            await jwtVerify(token, secret);
            isAuthenticated = true;
        } catch {
            isAuthenticated = false;
        }
    }

    if (isProtectedRoute && !isAuthenticated) {
        const signInUrl = new URL("/auth/sign-in", req.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}
/*==================== End of Middleware ====================*/

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)",
    ],
};