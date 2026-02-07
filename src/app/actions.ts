"use server";

import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

export async function createShipment(formData: any) {
    try {
        console.log("createShipment: Starting...");
        const user = await currentUser();
        console.log("createShipment: User:", user?.id);

        if (!user) {
            console.error("createShipment: No user found");
            return { success: false, error: "Unauthorized" };
        }

        if (!prismadb) {
            console.error("createShipment: DB connection failed");
            return { success: false, error: "Database connection failed" };
        }

        // 1. Ensure User Exists & Update Address if provided
        console.log("createShipment: Upserting user...");
        const addressData = formData.sender ? {
            city: formData.sender.city,
            street: formData.sender.street,
            houseNumber: formData.sender.number
        } : {};

        try {
            const dbUser = await prismadb.user.upsert({
                where: { clerkId: user.id },
                update: {
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    ...addressData
                },
                create: {
                    clerkId: user.id,
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    isGuest: false,
                    ...addressData
                },
            });
            console.log("createShipment: User upserted:", dbUser.id);

            // 2. Generate detailed images JSON
            const imagesJson = JSON.stringify(formData.images || []);

            // 3. Create Shipment
            const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
            console.log("createShipment: Creating shipment with shortId:", shortId);

            const shipment = await prismadb.shipment.create({
                data: {
                    shortId: shortId,
                    sellerId: dbUser.id,
                    status: "SHARED",
                    details: {
                        create: {
                            itemName: formData.itemName,
                            value: parseFloat(formData.value) || 0,
                            itemCondition: formData.description || "Not specified",
                            sellerNotes: formData.description,
                            images: imagesJson,
                            flexibleData: JSON.stringify({
                                serviceType: formData.serviceType,
                                senderAddress: formData.sender,
                            }),
                        }
                    }
                }
            });

            console.log("createShipment: Shipment created:", shipment.id);
            revalidatePath("/dashboard");
            return { success: true, shipmentId: shipment.id, shortId: shipment.shortId };

        } catch (dbError) {
            console.error("createShipment: DB Operation Failed:", dbError);
            return { success: false, error: "Database operation failed: " + (dbError as Error).message };
        }

    } catch (error) {
        console.error("Failed to create shipment (General):", error);
        return { success: false, error: "Failed to create shipment" };
    }
}

export async function getShipmentByShortId(shortId: string) {
    try {
        const shipment = await prismadb.shipment.findUnique({
            where: { shortId },
            include: {
                details: true,
                seller: {
                    select: {
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                    }
                }
            }
        });

        if (!shipment) return { success: false, error: "Shipment not found" };

        return { success: true, shipment };
    } catch (error) {
        console.error("Failed to fetch shipment:", error);
        return { success: false, error: "Failed to fetch shipment" };
    }
}

export async function finalizeShipment(shipmentId: string, guestDetails: any) {
    try {
        if (!prismadb) return { success: false, error: "Database error" };

        // 1. Check if user already exists with this phone/email or create Guest User
        // For simple MVP we just update the shipment with buyer info stored in JSON or a new User
        // Let's create a Guest User if needed

        let buyerId = null;

        // Try to find existing user by phone (if we had phone on User model as unique)
        // or just create a new Guest User

        const guestUser = await prismadb.user.create({
            data: {
                firstName: guestDetails.fullName,
                phone: guestDetails.phone,
                isGuest: true,
                // Email is optional for guests in this flow, but good to have
            }
        });
        buyerId = guestUser.id;

        // 2. Update Shipment
        await prismadb.shipment.update({
            where: { id: shipmentId },
            data: {
                buyerId: buyerId,
                status: "AGREED", // Or PAID if we had real payment
                agreement: {
                    create: {
                        buyerIp: "127.0.0.1", // Mock IP
                        agreedVersion: 1
                    }
                },
                // We update the Flexible Data with the address
                // Ideally this should be a merge, but Prisma replace JSON. 
                // We'll read first in a real scenario. For now, we assume we append.
            }
        });

        // 3. Update Shipment Details with Address (using flexibleData)
        // Since sqlite doesn't support JSON deep merge easily, we might overwrite. 
        // In stable Prod we'd read -> merge -> write.
        // For MVP:
        const shipment = await prismadb.shipment.findUnique({ where: { id: shipmentId }, include: { details: true } });
        let currentData = {};
        if (shipment?.details?.flexibleData) {
            try { currentData = JSON.parse(shipment.details.flexibleData as string) } catch (e) { }
        }

        const newData = {
            ...currentData,
            receiverAddress: {
                city: guestDetails.city,
                street: guestDetails.street
            }
        };

        await prismadb.shipmentDetails.update({
            where: { shipmentId: shipmentId },
            data: {
                flexibleData: JSON.stringify(newData)
            }
        });

        return { success: true };

    } catch (error) {
        console.error("Finalize error:", error);
        return { success: false, error: "Failed to finalize" };
    }
}

export async function getUserShipments(mode: "seller" | "buyer" = "seller") {
    try {
        const user = await currentUser();
        if (!user || !prismadb) return { success: false, error: "Unauthorized" };

        // Ensure user exists in DB (Self-healing in case Webhook failed or latency)
        const dbUser = await prismadb.user.upsert({
            where: { clerkId: user.id },
            update: {
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
            },
            create: {
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                isGuest: false,
            },
        });

        const whereClause = mode === "seller"
            ? { sellerId: dbUser.id }
            : { buyerId: dbUser.id };

        const shipments = await prismadb.shipment.findMany({
            where: whereClause,
            include: { details: true },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            shipments,
            userImage: dbUser.imageUrl,
            userPhone: dbUser.phone,
            userData: {
                city: dbUser.city,
                street: dbUser.street,
                houseNumber: dbUser.houseNumber
            }
        };
    } catch (error) {
        console.error("Failed to fetch user shipments:", error);
        return { success: false, error: "Failed to fetch shipments" };
    }
}

export async function cancelShipment(shipmentId: string) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };
        if (!prismadb) return { success: false, error: "Database error" };

        await prismadb.shipment.update({
            where: { id: shipmentId },
            data: { status: "CANCELLED" }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel shipment:", error);
        return { success: false, error: "Failed to cancel" };
    }
}

export async function updateUserProfileImage(base64Image: string) {
    try {
        const user = await currentUser();
        if (!user || !prismadb) return { success: false, error: "Unauthorized" };

        await prismadb.user.update({
            where: { clerkId: user.id },
            data: { imageUrl: base64Image }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile image:", error);
        return { success: false, error: "Update failed" };
    }
}

export async function updateUserPhone(phone: string) {
    try {
        const user = await currentUser();
        if (!user || !prismadb) return { success: false, error: "Unauthorized" };

        await prismadb.user.update({
            where: { clerkId: user.id },
            data: { phone: phone }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update phone:", error);
        return { success: false, error: "Failed to update phone" };
    }
}
export async function updateUserDetails(data: any) {
    try {
        const user = await currentUser();
        if (!user || !prismadb) return { success: false, error: "Unauthorized" };

        await prismadb.user.update({
            where: { clerkId: user.id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                city: data.city,
                street: data.street,
                houseNumber: data.houseNumber
            }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user details:", error);
        return { success: false, error: "Update failed" };
    }
}
