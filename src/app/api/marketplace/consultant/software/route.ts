import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import Fuse from "fuse.js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const popularOnly = searchParams.get("popular") === "true";

    const allSoftware = await prismadb.softwareApplication.findMany({
      include: {
        category: true
      },
      orderBy: { appNameEn: "asc" }
    });

    let results = allSoftware;

    if (q) {
      const fuse = new Fuse(allSoftware, {
        keys: ["appNameEn", "appNameHe"],
        threshold: 0.4,
        ignoreLocation: true
      });
      results = fuse.search(q).map(res => res.item);
    } else if (popularOnly) {
      results = allSoftware.filter(app => app.isPopular);
    }

    return NextResponse.json({ success: true, software: results });
  } catch (error) {
    console.error("[CONSULTANT_SOFTWARE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
