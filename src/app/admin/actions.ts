"use server";

import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

// Middleware should ideally protect this route, but adding manual check
async function checkAdmin() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prismadb.user.findUnique({
        where: { clerkId: user.id }
    });

    if (!dbUser || !dbUser.roles.includes('ADMIN')) {
        // Uncomment the strict check when ready:
        // throw new Error("Forbidden - User is not an ADMIN");
    }

    return true;
}

export async function deleteMarketplaceListing(listingId: string) {
    try {
        await checkAdmin();

        await prismadb.marketplaceListing.delete({
            where: { id: listingId }
        });

        revalidatePath("/admin/listings");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete listing:", error);
        return { success: false, error: error.message };
    }
}

export async function updateListingAsAdmin(listingId: string, data: {
    title?: string;
    price?: number;
    description?: string;
    condition?: string;
    category?: string;
    images?: string;
    extraData?: string;
    contactPhone?: string;
    highlights?: string;
}) {
    try {
        await checkAdmin();

        await prismadb.marketplaceListing.update({
            where: { id: listingId },
            data
        });

        revalidatePath("/admin/listings");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update listing:", error);
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(userId: string, role: "BUYER" | "SELLER" | "PROVIDER" | "ADMIN", action: "add" | "remove") {
    try {
        await checkAdmin();

        const targetUser = await prismadb.user.findUnique({ where: { id: userId } });
        if (!targetUser) throw new Error("User not found");

        let newRoles = [...targetUser.roles];
        if (action === "add" && !newRoles.includes(role)) {
            newRoles.push(role);
        } else if (action === "remove") {
            newRoles = newRoles.filter(r => r !== role);
        }

        await prismadb.user.update({
            where: { id: userId },
            data: { roles: newRoles }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update user role:", error);
        return { success: false, error: error.message };
    }
}
