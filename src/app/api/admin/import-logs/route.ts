import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { unstable_noStore as noStore } from "next/cache";

export async function GET() {
    noStore();
    try {
        const logs = await prismadb.catalogImportLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 200 // last 200 imports
        });
        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
