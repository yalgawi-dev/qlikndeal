import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/onboarding(.*)",
    "/api/webhooks(.*)",
    "/api/user/set-city(.*)",
    "/link(.*)",
    "/listing(.*)",               // Public listing landing pages
    "/api/og(.*)",                // Dynamic OG image generation
    "/api/shadow-lead(.*)",
    // Marketplace APIs - publicly accessible listing data
    "/api/marketplace/smart-search(.*)",
    "/api/marketplace/search(.*)",
    "/api/marketplace/premium-search(.*)",
    "/api/marketplace/request(.*)",
    "/api/marketplace/my-requests(.*)",
    "/api/marketplace/analyze(.*)",
    "/api/marketplace/form-structure(.*)",
    "/api/marketplace/catalog-search(.*)",  // חיפוש קטלוג פומבי
    "/api/marketplace/software-request(.*)", // בקשת תוכנה של משתמש
    "/api/marketplace/consultant(.*)",       // יועץ מחשבים
    "/api/test-catalog(.*)",                 // הנדסה בדיקה
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
