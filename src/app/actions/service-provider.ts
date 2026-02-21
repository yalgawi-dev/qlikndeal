"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";
import { ServiceType } from "@prisma/client";

export async function createOrUpdateServiceProvider(data: {
    displayName: string;
    bio: string;
    serviceTypes: ServiceType[];
    isFixedPrice: boolean;
    basePrice?: number;
    coverageArea?: string; // Stored as JSON string potentially
}) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if user exists in DB (sync check)
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            return { success: false, error: "User not found in database" };
        }

        const profile = await prisma.serviceProviderProfile.upsert({
            where: { userId: user.id },
            update: {
                displayName: data.displayName,
                bio: data.bio,
                serviceTypes: data.serviceTypes,
                isFixedPrice: data.isFixedPrice,
                basePrice: data.basePrice,
                user: {
                    update: {
                        roles: {
                            push: "PROVIDER"
                        }
                    }
                }
            },
            create: {
                userId: user.id,
                displayName: data.displayName,
                bio: data.bio,
                serviceTypes: data.serviceTypes,
                isFixedPrice: data.isFixedPrice,
                basePrice: data.basePrice,
            },
        });

        // Ensure user has PROVIDER role
        const currentRoles = user.roles || [];
        if (!currentRoles.includes("PROVIDER")) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: {
                        push: "PROVIDER"
                    }
                }
            });
        }

        return { success: true, profile };
    } catch (error: any) {
        console.error("Error creating provider profile:", error);
        return { success: false, error: error.message };
    }
}

export async function getServiceProviderProfile() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { serviceProfile: true }
        });

        if (!user?.serviceProfile) return { success: false, error: "Profile not found" };

        return { success: true, profile: user.serviceProfile };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getOpenServiceRequests() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const requests = await prisma.serviceRequest.findMany({
            where: {
                status: "OPEN"
            },
            include: {
                shipment: {
                    include: {
                        details: true
                    }
                },
                _count: {
                    select: { bids: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, requests };
    } catch (error: any) {
        console.error("Error fetching requests:", error);
        return { success: false, error: error.message };
    }
}

export async function createServiceRequest(
    shipmentId: string,
    description: string,
    locations: { pickup: string; dropoff: string }
) {
    try {
        const { userId } = await auth();
        // Allow guest creation if needed, or validate userId if strictly required.
        // For now, we allow it to proceed as the calling code implies guest flow.

        await prisma.serviceRequest.create({
            data: {
                shipmentId,
                description,
                pickupLocation: locations.pickup,
                dropoffLocation: locations.dropoff,
                status: "OPEN"
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error creating service request:", error);
        return { success: false, error: error.message };
    }
}
