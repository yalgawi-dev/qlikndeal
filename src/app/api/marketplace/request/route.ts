import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;
        const user = await currentUser();

        if (!query) {
            return new NextResponse("Query is required", { status: 400 });
        }

        // Try to find local user ID if logged in
        let userId = null;
        if (user) {
            const dbUser = await prismadb.user.findUnique({
                where: { clerkId: user.id },
            });
            if (dbUser) {
                userId = dbUser.id;
            }
        }

        const buyerRequest = await prismadb.buyerRequest.create({
            data: {
                query,
                userId,
                status: "ACTIVE",
            },
        });

        return NextResponse.json(buyerRequest);
    } catch (error) {
        console.error("[MARKETPLACE_REQUEST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
