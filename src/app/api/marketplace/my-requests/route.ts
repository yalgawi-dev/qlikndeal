import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
    try {
        const user = await currentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const requests = await prismadb.buyerRequest.findMany({
            where: {
                userId: {
                    equals: (await prismadb.user.findUnique({ where: { clerkId: user.id } }))?.id
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error("[MY_REQUESTS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
