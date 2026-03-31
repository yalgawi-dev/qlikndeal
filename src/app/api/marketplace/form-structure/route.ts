import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { dbCache } from "@/lib/db-cache";

export const revalidate = 60; // ⚡ CACHING TTL 60s (Senior Architect Rule enforced)

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        // 1. שליפת מבנה הטופס מה-Cache אוטומטית (O(1) Memory Array) במקום להעיר את המסד דינמית
        const structure = await dbCache.getOrFetch(`form_struct_ui_${category}`, () => {
             return prismadb.categoryFormStructure.findMany({
                 where: { category },
                 orderBy: { order: "asc" }
             });
        });

        // 2. שליפת רשימות ההזנה מ-Cache
        const optionsRaw = await dbCache.getOrFetch(`form_options_ui_${category}`, () => {
             return prismadb.formFieldOption.findMany({
                 where: { category }
             });
        });

        // סידור האופציות בתוך אובייקט לפי fieldId לנוחות ה-Frontend
        const options: Record<string, string[]> = {};
        optionsRaw.forEach((opt: any) => {
            if (!options[opt.fieldId]) {
                options[opt.fieldId] = [];
            }
            options[opt.fieldId].push(opt.value);
        });

        return NextResponse.json({
            success: true,
            structure,
            options
        });

    } catch (error: any) {
        console.error("[FORM_STRUCTURE_GET] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    // אזהרה: לעולם לא להשתמש ב- prisma.$disconnect() בתוך Next.js Serverless Routes! הוא הורג את הפול ומייצר השהיות של 10 שניות לבא בתור.
}
