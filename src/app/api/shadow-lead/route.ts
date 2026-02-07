import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Handle Preflight (CORS) check
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sellerName, sellerLink, postText, sourceUrl, images } = body;

        // Basic validation
        if (!sellerName || !postText) {
            return NextResponse.json(
                { success: false, error: "Missing fields" },
                {
                    status: 400,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                }
            );
        }

        const newLead = await prismadb.shadowLead.create({
            data: {
                sellerName,
                sellerLink: sellerLink || "",
                postText: postText || "",
                sourceUrl: sourceUrl || "",
                images: images ? JSON.stringify(images) : "[]",
                status: "NEW",
                capturedBy: "ADMIN_EXTENSION"
            }
        });

        return NextResponse.json(
            { success: true, leadId: newLead.id },
            {
                status: 200,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        );

    } catch (error) {
        console.error("Failed to save shadow lead:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        );
    }
}
