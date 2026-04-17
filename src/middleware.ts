import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isLandingPage = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get("host") ?? "";
  if (host.includes("vercel.app")) {
    const url = new URL(request.url);
    return NextResponse.redirect(`https://aireply.co.kr${url.pathname}${url.search}`, 301);
  }

  const { userId } = await auth();
  const hasIntroParam = new URL(request.url).searchParams.has("intro");
  if (userId && isLandingPage(request) && !hasIntroParam) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
