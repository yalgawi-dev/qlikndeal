import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appName } = body;

    if (!appName || !appName.trim()) {
      return new NextResponse("App name is required", { status: 400 });
    }

    let request;
    try {
      request = await (prismadb as any).softwareRequest.create({
        data: {
          appName: appName.trim(),
          isAdded: false
        }
      });
    } catch (dbErr) {
      console.warn("Table might not exist, attempting auto-creation...", dbErr);
      try {
        await prismadb.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "software_requests" (
            "id" SERIAL PRIMARY KEY,
            "app_name" TEXT NOT NULL,
            "is_added" BOOLEAN DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("Successfully created software_requests table.");
        // Try creating again
        request = await (prismadb as any).softwareRequest.create({
          data: {
            appName: appName.trim(),
            isAdded: false
          }
        });
      } catch (createErr) {
        console.error("Failed to auto-create and save software request", createErr);
        return new NextResponse("Internal Error", { status: 500 });
      }
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("[SOFTWARE_REQUEST_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
