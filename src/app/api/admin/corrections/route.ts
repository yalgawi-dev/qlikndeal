import { NextResponse } from 'next/server'; // תיקון הייבוא כאן
import { PrismaClient } from '@prisma/client';
import { handleCorrectionWar } from '@/lib/learning';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Saving correction to DB:", body); // זה ידפיס לך בטרמינל כשזה עובד

    const correction = await prisma.userCorrection.create({
      data: {
        originalText: body.originalText,
        predictedData: body.predictedData,
        correctedData: body.correctedData,
        category: body.category,
        adminComments: body.adminComments, 
      },
    });

    // ==== Crown War / Pruning Engine Integration ====
    try {
        await handleCorrectionWar(
           body.originalText || "", 
           body.predictedData, 
           body.correctedData, 
           body.category || "GENERAL"
        );
    } catch (learnErr) {
        console.error("Failed to run handleCorrectionWar:", learnErr);
    }
    // ===============================================

    return NextResponse.json(correction);
  } catch (error) {
    console.error('API Error details:', error);
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}