"use server";

import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prismadb.user.findUnique({
        where: { clerkId: user.id }
    });

    if (!dbUser || !dbUser.roles.includes('ADMIN')) {
        throw new Error("Forbidden - User is not an ADMIN");
    }

    return dbUser;
}

// --- Admin Tasks ---

export async function getAdminTasks() {
    try {
        await checkAdmin();
        return await prismadb.adminTask.findMany({
            orderBy: { createdAt: 'desc' },
            include: { createdBy: true }
        });
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return [];
    }
}

export async function createAdminTask(title: string, description?: string) {
    try {
        const user = await checkAdmin();
        await prismadb.adminTask.create({
            data: {
                title,
                description,
                createdById: user.id
            }
        });
        revalidatePath("/admin/tasks");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleAdminTask(taskId: string, completed: boolean) {
    try {
        await checkAdmin();
        await prismadb.adminTask.update({
            where: { id: taskId },
            data: { completed }
        });
        revalidatePath("/admin/tasks");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAdminTaskNotes(taskId: string, notes: string) {
    try {
        await checkAdmin();
        await prismadb.adminTask.update({
            where: { id: taskId },
            data: { notes }
        });
        revalidatePath("/admin/tasks");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAdminTask(taskId: string) {
    try {
        await checkAdmin();
        await prismadb.adminTask.delete({
            where: { id: taskId }
        });
        revalidatePath("/admin/tasks");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Admin Notes ---

export async function getAdminNotes() {
    try {
        await checkAdmin();
        return await prismadb.adminNote.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: true }
        });
    } catch (error) {
        console.error("Failed to fetch notes:", error);
        return [];
    }
}

export async function saveAdminNote(content: string, id?: string, title?: string) {
    try {
        const user = await checkAdmin();
        if (id) {
            await prismadb.adminNote.update({
                where: { id },
                data: { content, title, authorId: user.id }
            });
        } else {
            await prismadb.adminNote.create({
                data: { content, title, authorId: user.id }
            });
        }
        revalidatePath("/admin/notes");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAdminNote(id: string) {
    try {
        await checkAdmin();
        await prismadb.adminNote.delete({
            where: { id }
        });
        revalidatePath("/admin/notes");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
