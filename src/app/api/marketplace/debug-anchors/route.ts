import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const phrase = searchParams.get("phrase") || "דגם";
    const category = searchParams.get("category") || "LAPTOPS";

    const anchors = await prismadb.fieldAnchor.findMany({
        where: { phrase: { contains: phrase } }
    });
    return NextResponse.json({ anchors });
}
