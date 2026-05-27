import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prismadb.computerUseCategory.findMany({
      orderBy: { id: "asc" }
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("[CONSULTANT_CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
