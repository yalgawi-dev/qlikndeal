import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) return new NextResponse("Forbidden", { status: 403 });

        await prismadb.buyerRequest.delete({
            where: {
                id: params.id,
                userId: dbUser.id
            }
        });

        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        console.error("[MARKETPLACE_REQUEST_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { query, extraData } = body;
        const user = await currentUser();

        if (!user) return new NextResponse("Unauthorized", { status: 401 });
        if (!query) return new NextResponse("Query is required", { status: 400 });

        const dbUser = await prismadb.user.findUnique({ where: { clerkId: user.id } });
        if (!dbUser) return new NextResponse("Forbidden", { status: 403 });

        const updatedRequest = await prismadb.buyerRequest.update({
            where: {
                id: params.id,
                userId: dbUser.id
            },
            data: {
                query,
                extraData: extraData || null,
                status: "ACTIVE" // Reset status back to ACTIVE on edit
            }
        });

        // Run smart matchmaker to check if it matches existing listings
        const { matchRequestWithListings } = await import("@/lib/matchmaker");
        await matchRequestWithListings(params.id);

        // Fetch updated request to get correct status
        const finalRequest = await prismadb.buyerRequest.findUnique({
            where: { id: params.id }
        }) || updatedRequest;

        return NextResponse.json(finalRequest);
    } catch (error) {
        console.error("[MARKETPLACE_REQUEST_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
