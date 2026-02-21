
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replaceAll(" ", "_");

        // Create directory based on date to avoid folder bloat
        const dateFolder = new Date().toISOString().split('T')[0];
        const uploadDir = path.join(process.cwd(), "public", "uploads", dateFolder);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const finalFilename = uniqueSuffix + '-' + filename;
        const filePath = path.join(uploadDir, finalFilename);

        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${dateFolder}/${finalFilename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            type: file.type
        });

    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
