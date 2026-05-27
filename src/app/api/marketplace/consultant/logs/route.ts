import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      selectedCategoryId,
      preferredFormFactor,
      userBudget,
      selectedListingId,
      aiAdjustedRecommendation
    } = body;

    if (!selectedCategoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // Attempt to get Clerk User ID safely. If not authenticated, store as guest (null).
    let userId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const dbUser = await prismadb.user.findUnique({
          where: { clerkId },
          select: { id: true }
        });
        if (dbUser) {
          userId = dbUser.id;
        }
      }
    } catch (e) {
      // Auth might fail if not fully integrated in all dev modes, proceed with null
    }

    const log = await prismadb.userConsultationLog.create({
      data: {
        userId,
        selectedCategoryId: parseInt(selectedCategoryId, 10),
        preferredFormFactor,
        userBudget: userBudget ? parseFloat(userBudget) : null,
        selectedListingId,
        aiAdjustedRecommendation: aiAdjustedRecommendation || {}
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error("[CONSULTANT_LOGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
