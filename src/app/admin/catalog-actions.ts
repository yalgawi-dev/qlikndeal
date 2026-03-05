"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

export type CatalogType = "laptop" | "desktop" | "aio" | "mobile" | "motherboard" | "electronics" | "appliance" | "vehicle";

// Generic record type
export type CatalogRecord = Record<string, any>;

// ─── FETCH ─────────────────────────────────────────────────────────────────────
export async function getCatalogRecords(
    type: CatalogType,
    opts?: { skip?: number; take?: number; search?: string }
): Promise<{ records: CatalogRecord[]; total: number }> {
    const { skip = 0, take = 50, search = "" } = opts || {};

    const where = search
        ? {
            OR: [
                { brand: { contains: search, mode: "insensitive" as const } },
                { modelName: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

    try {
        let records: CatalogRecord[] = [];
        let total = 0;

        if (type === "laptop") {
            total = await prismadb.laptopCatalog.count({ where: where as any });
            records = await prismadb.laptopCatalog.findMany({ where: where as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "desktop") {
            total = await prismadb.brandDesktopCatalog.count({ where: where as any });
            records = await prismadb.brandDesktopCatalog.findMany({ where: where as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "aio") {
            total = await prismadb.aioCatalog.count({ where: where as any });
            records = await prismadb.aioCatalog.findMany({ where: where as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "mobile") {
            const mobileWhere = search ? {
                OR: [
                    { brand: { contains: search, mode: "insensitive" as const } },
                    { modelName: { contains: search, mode: "insensitive" as const } },
                ],
            } : {};
            total = await prismadb.mobileCatalog.count({ where: mobileWhere as any });
            records = await prismadb.mobileCatalog.findMany({ where: mobileWhere as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "motherboard") {
            const mbWhere = search ? {
                OR: [
                    { brand: { contains: search, mode: "insensitive" as const } },
                    { model: { contains: search, mode: "insensitive" as const } },
                ],
            } : {};
            total = await prismadb.motherboardCatalog.count({ where: mbWhere as any });
            records = await prismadb.motherboardCatalog.findMany({ where: mbWhere as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "electronics") {
            total = await prismadb.electronicsCatalog.count({ where: where as any });
            records = await prismadb.electronicsCatalog.findMany({ where: where as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "appliance") {
            total = await prismadb.applianceCatalog.count({ where: where as any });
            records = await prismadb.applianceCatalog.findMany({ where: where as any, skip, take, orderBy: { brand: "asc" } });
        } else if (type === "vehicle") {
            const vWhere = search ? {
                OR: [
                    { make: { contains: search, mode: "insensitive" as const } },
                    { model: { contains: search, mode: "insensitive" as const } },
                ],
            } : {};
            total = await prismadb.vehicleCatalog.count({ where: vWhere as any });
            records = await prismadb.vehicleCatalog.findMany({ where: vWhere as any, skip, take, orderBy: { make: "asc" } });
        }

        return { records, total };
    } catch (e: any) {
        throw new Error("שגיאה בטעינת רשומות: " + e.message);
    }
}

// ─── DELETE ────────────────────────────────────────────────────────────────────
export async function deleteCatalogRecords(type: CatalogType, ids: string[]): Promise<{ deleted: number }> {
    if (!ids.length) return { deleted: 0 };
    const filter = { where: { id: { in: ids } } };

    let count = 0;
    if (type === "laptop") count = (await prismadb.laptopCatalog.deleteMany(filter)).count;
    else if (type === "desktop") count = (await prismadb.brandDesktopCatalog.deleteMany(filter)).count;
    else if (type === "aio") count = (await prismadb.aioCatalog.deleteMany(filter)).count;
    else if (type === "mobile") count = (await prismadb.mobileCatalog.deleteMany(filter)).count;
    else if (type === "motherboard") count = (await prismadb.motherboardCatalog.deleteMany(filter)).count;
    else if (type === "electronics") count = (await prismadb.electronicsCatalog.deleteMany(filter)).count;
    else if (type === "appliance") count = (await prismadb.applianceCatalog.deleteMany(filter)).count;
    else if (type === "vehicle") count = (await prismadb.vehicleCatalog.deleteMany(filter)).count;

    revalidatePath("/admin/export");
    return { deleted: count };
}

// ─── UPDATE ────────────────────────────────────────────────────────────────────
export async function updateCatalogRecord(type: CatalogType, id: string, data: CatalogRecord): Promise<void> {
    // Remove internal fields that shouldn't be patched
    const { id: _id, createdAt, updatedAt, importBatchId, ...patch } = data;

    if (type === "laptop") await prismadb.laptopCatalog.update({ where: { id }, data: patch });
    else if (type === "desktop") await prismadb.brandDesktopCatalog.update({ where: { id }, data: patch });
    else if (type === "aio") await prismadb.aioCatalog.update({ where: { id }, data: patch });
    else if (type === "mobile") await prismadb.mobileCatalog.update({ where: { id }, data: patch });
    else if (type === "motherboard") await prismadb.motherboardCatalog.update({ where: { id }, data: patch });
    else if (type === "electronics") await prismadb.electronicsCatalog.update({ where: { id }, data: patch });
    else if (type === "appliance") await prismadb.applianceCatalog.update({ where: { id }, data: patch });
    else if (type === "vehicle") await prismadb.vehicleCatalog.update({ where: { id }, data: patch });

    revalidatePath("/admin/export");
}
