import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { city } = await req.json();
    if (!city || typeof city !== "string" || city.trim().length < 2) {
        return NextResponse.json({ error: "יש להזין עיר תקינה" }, { status: 400 });
    }

    await prismadb.user.update({
        where: { clerkId: userId },
        data: { city: city.trim() },
    });

    return NextResponse.json({ success: true });
}
