import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

const ADMIN_EMAILS = ["yalgawi@gmail.com", "darohadd@walla.com", "itay@qlikndeal.com", "dpccomp@gmail.com"];

async function checkAdmin() {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    const user = await prismadb.user.findUnique({
      where: { clerkId: userId }
    });
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) return false;
    return true;
  } catch (e) {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const software = await prismadb.softwareApplication.findMany({
      include: {
        category: true
      },
      orderBy: { appNameEn: "asc" }
    });

    const categories = await prismadb.computerUseCategory.findMany({
      orderBy: { id: "asc" }
    });

    let requests = [];
    try {
      requests = await (prismadb as any).softwareRequest.findMany({
        where: { isAdded: false },
        orderBy: { createdAt: "desc" }
      });
    } catch (e: any) {
      console.error("Failed to fetch software requests. Table might not exist. Attempting auto-creation...", e);
      try {
        await prismadb.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "software_requests" (
            "id" SERIAL PRIMARY KEY,
            "app_name" TEXT NOT NULL,
            "is_added" BOOLEAN DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("Successfully auto-created software_requests table.");
        // Attempt fetch again
        requests = await (prismadb as any).softwareRequest.findMany({
          where: { isAdded: false },
          orderBy: { createdAt: "desc" }
        });
      } catch (createErr) {
        console.error("Failed to auto-create software_requests table:", createErr);
      }
    }

    return NextResponse.json({ success: true, software, categories, requests });
  } catch (error) {
    console.error("[ADMIN_SOFTWARE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    // Check for bulk creation of requests
    if (body.bulkCreate && Array.isArray(body.bulkCreate)) {
      const createdApps: any[] = [];
      for (const item of body.bulkCreate) {
        if (!item.nameEn) continue;

        let categoryId: number | null = null;
        if (item.categoryNameHe) {
          const cat = await prismadb.computerUseCategory.findFirst({
            where: {
              categoryNameHe: {
                equals: item.categoryNameHe.trim(),
                mode: "insensitive"
              }
            }
          });
          if (cat) {
            categoryId = cat.id;
          }
        }

        const software = await prismadb.softwareApplication.create({
          data: {
            appNameEn: item.nameEn.trim(),
            appNameHe: item.nameHe ? item.nameHe.trim() : null,
            categoryId: categoryId,
            minRamGbOverride: item.minRamGb ? parseInt(item.minRamGb, 10) : null,
            minVramGbOverride: item.minVramGb ? parseInt(item.minVramGb, 10) : null,
            isPopular: false
          },
          include: {
            category: true
          }
        });

        // Resolve request
        try {
          await (prismadb as any).softwareRequest.deleteMany({
            where: {
              appName: {
                equals: item.nameEn.trim(),
                mode: "insensitive"
              }
            }
          });
          if (item.nameHe) {
            await (prismadb as any).softwareRequest.deleteMany({
              where: {
                appName: {
                  equals: item.nameHe.trim(),
                  mode: "insensitive"
                }
              }
            });
          }
        } catch (e) {
          console.error("Failed to delete request in bulkCreate", e);
        }

        createdApps.push(software);
      }
      return NextResponse.json({ success: true, count: createdApps.length, software: createdApps });
    }

    const { appNameEn, appNameHe, categoryId, minRamGbOverride, minVramGbOverride, isPopular, iconUrl } = body;

    if (!appNameEn) {
      return new NextResponse("English Name is required", { status: 400 });
    }

    const software = await prismadb.softwareApplication.create({
      data: {
        appNameEn,
        appNameHe,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        minRamGbOverride: minRamGbOverride ? parseInt(minRamGbOverride, 10) : null,
        minVramGbOverride: minVramGbOverride ? parseInt(minVramGbOverride, 10) : null,
        isPopular: !!isPopular,
        iconUrl
      },
      include: {
        category: true
      }
    });

    // Auto-resolve any pending request with the same name
    try {
      await (prismadb as any).softwareRequest.deleteMany({
        where: {
          appName: {
            equals: appNameEn,
            mode: "insensitive"
          }
        }
      });
      if (appNameHe) {
        await (prismadb as any).softwareRequest.deleteMany({
          where: {
            appName: {
              equals: appNameHe,
              mode: "insensitive"
            }
          }
        });
      }
    } catch (e) {
      console.error("Failed to auto-resolve request", e);
    }

    return NextResponse.json({ success: true, software });
  } catch (error) {
    console.error("[ADMIN_SOFTWARE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    // Check for bulk updates
    if (body.bulkUpdates && Array.isArray(body.bulkUpdates)) {
      const updatedApps: any[] = [];
      for (const item of body.bulkUpdates) {
        const dataToUpdate: any = {};
        if (item.minRamGbOverride !== undefined) {
          dataToUpdate.minRamGbOverride = item.minRamGbOverride === null ? null : parseInt(item.minRamGbOverride, 10);
        }
        if (item.minVramGbOverride !== undefined) {
          dataToUpdate.minVramGbOverride = item.minVramGbOverride === null ? null : parseInt(item.minVramGbOverride, 10);
        }

        const updated = await prismadb.softwareApplication.update({
          where: { id: parseInt(item.id, 10) },
          data: dataToUpdate,
          include: {
            category: true
          }
        });
        updatedApps.push(updated);
      }
      return NextResponse.json({ success: true, count: updatedApps.length, software: updatedApps });
    }

    const { id, appNameEn, appNameHe, categoryId, minRamGbOverride, minVramGbOverride, isPopular, iconUrl } = body;

    if (!id || !appNameEn) {
      return new NextResponse("ID and English Name are required", { status: 400 });
    }

    const software = await prismadb.softwareApplication.update({
      where: { id: parseInt(id, 10) },
      data: {
        appNameEn,
        appNameHe,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        minRamGbOverride: minRamGbOverride ? parseInt(minRamGbOverride, 10) : null,
        minVramGbOverride: minVramGbOverride ? parseInt(minVramGbOverride, 10) : null,
        isPopular: !!isPopular,
        iconUrl
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({ success: true, software });
  } catch (error) {
    console.error("[ADMIN_SOFTWARE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const requestId = searchParams.get("requestId");

    if (requestId) {
      await (prismadb as any).softwareRequest.delete({
        where: { id: parseInt(requestId, 10) }
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    await prismadb.softwareApplication.delete({
      where: { id: parseInt(id, 10) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_SOFTWARE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
