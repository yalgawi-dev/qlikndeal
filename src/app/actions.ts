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
        const isBuyerMode = formData.userMode === 'buyer';

        // Address data for the LOGGED IN USER
        // If Buyer Mode: Address comes from 'receiver' field (My Details)
        // If Seller Mode: Address comes from 'sender' field (My Details)
        const currentUserAddressData = isBuyerMode ? (formData.receiver ? {
            city: formData.receiver.city,
            street: formData.receiver.street,
            houseNumber: formData.receiver.number
        } : {}) : (formData.sender ? {
            city: formData.sender.city,
            street: formData.sender.street,
            houseNumber: formData.sender.number
        } : {});

        // Counterparty Data (The "Other Side")
        // If Buyer Mode: Counterparty is Seller (formData.sender)
        // If Seller Mode: Counterparty is Buyer (formData.receiver - usually empty in create link)
        const counterpartyData = isBuyerMode ? formData.sender : formData.receiver;

        try {
            const dbUser = await prismadb.user.upsert({
                where: { clerkId: user.id },
                update: {
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    ...currentUserAddressData
                },
                create: {
                    clerkId: user.id,
                    email: user.emailAddresses[0]?.emailAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    isGuest: false,
                    ...currentUserAddressData
                },
            });
            console.log("createShipment: User upserted:", dbUser.id);

            // Determine Seller and Buyer IDs
            let sellerId = dbUser.id;
            let buyerId = undefined;

            if (isBuyerMode) {
                // The logged in user is the BUYER
                buyerId = dbUser.id;

                // Create a Guest User for Seller (Counterparty)
                // We use phone to try to find existing, or create new
                let guestSeller;
                if (counterpartyData?.phone) {
                    // Try to find by phone (assuming unique constraint or just first found)
                    // Since phone isn't unique in schema, we might just create new for simplicity or findFirst
                    const existing = await prismadb.user.findFirst({ where: { phone: counterpartyData.phone } });
                    if (existing) {
                        guestSeller = existing;
                    }
                }

                if (!guestSeller) {
                    guestSeller = await prismadb.user.create({
                        data: {
                            firstName: counterpartyData?.name || "Unknown Seller",
                            phone: counterpartyData?.phone,
                            isGuest: true
                        }
                    });
                }
                sellerId = guestSeller.id;
            }

            // 2. Generate detailed images JSON
            const imagesJson = JSON.stringify(formData.images || []);

            // 3. Create Shipment
            const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
            console.log("createShipment: Creating shipment with shortId:", shortId);

            const shipment = await prismadb.shipment.create({
                data: {
                    shortId: shortId,
                    sellerId: sellerId,
                    buyerId: buyerId,
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
                                senderAddress: isBuyerMode ? formData.sender : formData.sender, // Always sender field for sender address
                                receiverAddress: isBuyerMode ? formData.receiver : undefined, // My address if buyer
                                requestVideoCall: formData.requestVideoCall,
                                createdByMode: isBuyerMode ? 'buyer' : 'seller',
                                // Negotiation Data Initialization
                                offers: [{
                                    amount: parseFloat(formData.value) || 0,
                                    by: isBuyerMode ? 'buyer' : 'seller',
                                    createdAt: new Date().toISOString()
                                }],
                                lastOfferBy: isBuyerMode ? 'buyer' : 'seller',
                                negotiationStatus: 'active'
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
                        clerkId: true, // Needed for permission check
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                    }
                },
                buyer: { // Added buyer inclusion
                    select: {
                        clerkId: true, // Needed for permission check
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

export async function updateShipmentBySeller(shipmentId: string, data: any) {
    try {
        // In a real app, we should verify the user is effectively the seller (or guest seller link with token)
        // For MVP/Demo, we assume if they have the link and are on this page, they can update (Open Access to link bearer)

        if (!prismadb) return { success: false, error: "Database error" };

        // Get current flexible data to merge
        const shipment = await prismadb.shipment.findUnique({ where: { id: shipmentId }, include: { details: true } });
        let currentFlexible = {};
        try {
            if (shipment?.details?.flexibleData) {
                currentFlexible = JSON.parse(shipment.details.flexibleData);
            }
        } catch (e) { }

        const newFlexible = {
            ...currentFlexible,
            packageSize: data.packageSize, // Store package size in flexible data for now
            sellerApprovedAt: new Date().toISOString()
        };

        await prismadb.shipmentDetails.update({
            where: { shipmentId: shipmentId },
            data: {
                itemCondition: data.itemCondition,
                sellerNotes: data.sellerNotes,
                flexibleData: JSON.stringify(newFlexible),
                aiStatus: "PASSED" // Simulating AI/Verification pass
            }
        });

        // Update main status if needed
        if (data.status) {
            await prismadb.shipment.update({
                where: { id: shipmentId },
                data: { status: data.status } // e.g. "SELLER_APPROVED"
            });
        }

        revalidatePath("/link/[shortId]");
        return { success: true };

    } catch (error) {
        console.error("Failed to update shipment by seller:", error);
        return { success: false, error: "Failed to update" };
    }
}

// Negotiation Actions

// Negotiation Actions

export async function submitOffer(shipmentId: string, amount: number, role: 'buyer' | 'seller', buyerId?: string, guestDetails?: { name: string, phone: string }) {
    try {
        if (!prismadb) return { success: false, error: "Database error" };

        const shipment = await prismadb.shipment.findUnique({ where: { id: shipmentId }, include: { details: true } });
        if (!shipment || !shipment.details) return { success: false, error: "Not found" };

        // Handle Guest User Creation if needed
        if (role === 'buyer' && !buyerId && guestDetails?.name && guestDetails?.phone) {
            // Check if user exists by phone (rudimentary check for MVP)
            const existingUser = await prismadb.user.findFirst({ where: { phone: guestDetails.phone } });

            if (existingUser) {
                buyerId = existingUser.id;
            } else {
                const newUser = await prismadb.user.create({
                    data: {
                        firstName: guestDetails.name,
                        phone: guestDetails.phone,
                        isGuest: true
                    }
                });
                buyerId = newUser.id;
            }
        }

        let flexibleData: any = {};
        try { flexibleData = JSON.parse(shipment.details.flexibleData || '{}'); } catch (e) { }

        const newOffer = {
            amount,
            by: role,
            createdAt: new Date().toISOString()
        };

        // Determine which negotiation thread to update
        // If role is buyer, we need their ID (or session). If seller, we need to know WHICH buyer they are responding to.
        // For simple 1-on-1 (legacy), we use the root 'offers'.
        // For Public Listing, we use 'negotiations' map.

        let newData = { ...flexibleData };

        // Check if we are in "Public Mode" or if a specific buyerId was provided indicating a thread
        if (buyerId && buyerId !== shipment.buyerId) {
            // Multi-buyer mode
            const negotiations = flexibleData.negotiations || {};
            const thread = negotiations[buyerId] || { offers: [], status: 'active' };

            thread.offers.push(newOffer);
            thread.lastOfferBy = role;
            thread.updatedAt = new Date().toISOString();

            negotiations[buyerId] = thread;
            newData.negotiations = negotiations;
            newData.isPublicListing = true; // Mark as public implicitly if multiple threads start
        } else {
            // Legacy / Single Buyer Agreement Mode (or Seller responding to the main/only buyer)
            const offers = [...(flexibleData.offers || []), newOffer];
            newData = {
                ...flexibleData,
                offers,
                lastOfferBy: role,
                negotiationStatus: 'active'
            };
            // Also update the display value
            await prismadb.shipmentDetails.update({
                where: { shipmentId },
                data: { value: amount } // Only update main display value for single-thread for now
            });
        }

        // Update flexible data
        await prismadb.shipmentDetails.update({
            where: { shipmentId },
            data: {
                flexibleData: JSON.stringify(newData)
            }
        });

        revalidatePath("/link/[shortId]");
        return { success: true };

    } catch (error) {
        console.error("submitOffer error:", error);
        return { success: false, error: "Failed to submit offer" };
    }
}

export async function acceptOffer(shipmentId: string, role: 'buyer' | 'seller', guestDetails?: { name: string, phone: string }) {
    try {
        if (!prismadb) return { success: false, error: "Database error" };

        const shipment = await prismadb.shipment.findUnique({ where: { id: shipmentId }, include: { details: true } });
        if (!shipment || !shipment.details) return { success: false, error: "Not found" };

        let buyerId = shipment.buyerId;

        // Handle Guest Buyer on "Buy Now"
        if (role === 'buyer' && !buyerId && guestDetails?.name && guestDetails?.phone) {
            const existingUser = await prismadb.user.findFirst({ where: { phone: guestDetails.phone } });

            if (existingUser) {
                buyerId = existingUser.id;
            } else {
                const newUser = await prismadb.user.create({
                    data: {
                        firstName: guestDetails.name,
                        phone: guestDetails.phone,
                        isGuest: true
                    }
                });
                buyerId = newUser.id;
            }

            // Update shipment with new buyerId immediately
            await prismadb.shipment.update({
                where: { id: shipmentId },
                data: { buyerId }
            });
        }

        let flexibleData: any = {};
        try { flexibleData = JSON.parse(shipment.details.flexibleData || '{}'); } catch (e) { }

        const newData = {
            ...flexibleData,
            negotiationStatus: 'agreed',
            priceAgreedAt: new Date().toISOString(),
            priceAgreedBy: role
        };

        await prismadb.shipmentDetails.update({
            where: { shipmentId },
            data: {
                flexibleData: JSON.stringify(newData)
            }
        });

        revalidatePath("/link/[shortId]");
        return { success: true };

    } catch (error) {
        console.error("acceptOffer error:", error);
        return { success: false, error: "Failed to accept offer" };
    }
}
