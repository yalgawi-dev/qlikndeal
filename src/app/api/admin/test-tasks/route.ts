import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
    try {
        // 1. Check if Clerk user is authenticated
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "No Clerk user found - not authenticated" }, { status: 401 });
        }

        // 2. Find in DB
        const dbUser = await prismadb.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true, email: true, firstName: true, roles: true }
        });

        if (!dbUser) {
            return NextResponse.json({
                error: "DB user not found",
                clerkId: clerkUser.id,
                clerkEmail: clerkUser.emailAddresses[0]?.emailAddress
            }, { status: 404 });
        }

        // 3. Check admin role
        const isAdmin = dbUser.roles.includes("ADMIN");

        // 4. Count existing tasks
        const taskCount = await prismadb.adminTask.count();
        const tasks = await prismadb.adminTask.findMany({
            take: 3,
            orderBy: { createdAt: "desc" },
            include: { comments: true }
        });

        return NextResponse.json({
            status: "ok",
            user: dbUser,
            isAdmin,
            taskCount,
            recentTasks: tasks
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const dbUser = await prismadb.user.findUnique({
            where: { clerkId: clerkUser.id }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "DB user not found" }, { status: 404 });
        }

        const body = await req.json();

        // Try creating a task
        const task = await prismadb.adminTask.create({
            data: {
                title: body.title || "Test task from API",
                description: body.description || "This is a test",
                createdById: dbUser.id
            }
        });

        return NextResponse.json({ success: true, task });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
