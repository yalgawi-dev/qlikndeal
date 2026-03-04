"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export type ImportResult = {
    total: number;
    added: number;
    skipped: number;
    duplicatesInFile: number;
    errors: string[];
    newTotal?: number;
};

// Helper: log the import to the database
async function logImport(params: {
    category: string;
    totalInFile: number;
    added: number;
    skipped: number;
    duplicatesInFile: number;
    errors: string[];
    newTotal: number;
}) {
    const user = await currentUser();
    const adminName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "מערכת";
    await prismadb.catalogImportLog.create({
        data: {
            category: params.category,
            totalInFile: params.totalInFile,
            added: params.added,
            skipped: params.skipped,
            duplicatesInFile: params.duplicatesInFile,
            errors: params.errors.length,
            errorDetails: params.errors.slice(0, 20), // save up to 20 error messages
            newTotal: params.newTotal,
            adminName
        }
    });
}

// Helper: deduplicate within file
function deduplicateInFile<T extends Record<string, any>>(data: T[], keyFn: (item: T) => string): { unique: T[]; duplicatesInFile: number } {
    const seen = new Set<string>();
    let duplicatesInFile = 0;
    const unique = data.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) { duplicatesInFile++; return false; }
        seen.add(key);
        return true;
    });
    return { unique, duplicatesInFile };
}

/**
 * ייבוא מחשבים ניידים
 */
export async function importLaptopsAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        // 1. כפילויות בתוך הקובץ
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            (item.sku || `${item.brand}-${item.modelName}-${JSON.stringify(item.cpu)}-${JSON.stringify(item.ram)}`).toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.modelName) {
                    result.errors.push(`חסר מותג/דגם`);
                    result.skipped++;
                    continue;
                }
                // 2. בדיקה מול DB
                let existing = null;
                if (item.sku) {
                    existing = await prismadb.laptopCatalog.findUnique({ where: { sku: item.sku } });
                }
                if (!existing) {
                    const matches = await prismadb.laptopCatalog.findMany({
                        where: { brand: item.brand, modelName: item.modelName },
                        select: { cpu: true, ram: true, storage: true }
                    });
                    if (matches.length > 0) {
                        // Check if exact variant exists
                        if (matches.some(m =>
                            JSON.stringify(m.cpu || []) === JSON.stringify(item.cpu || []) &&
                            JSON.stringify(m.ram || []) === JSON.stringify(item.ram || []) &&
                            JSON.stringify(m.storage || []) === JSON.stringify(item.storage || [])
                        )) {
                            existing = true;
                        } else {
                            // Variant differs, but let's check if they meant the same model
                            // Often spreadsheets have slight formatting differences causing array matches to fail.
                            // To be safer against duplicating the same model/cpu combinations, we'll mark existing if model matches closely.
                            // If they already imported 300 laptops, we probably don't want any duplicates if the brand and model exactly match unless it's a completely different SKU.
                            if (!item.sku) {
                                // Fallback: if no SKU, assume existing if brand+modelName match to avoid duplicate records.
                                existing = true;
                            }
                        }
                    }
                }
                if (existing) { result.skipped++; continue; }

                // 3. הוספה ל-DB
                await prismadb.laptopCatalog.create({
                    data: {
                        brand: item.brand,
                        series: item.series || "",
                        modelName: item.modelName,
                        type: item.type || "Laptop",
                        screenSize: Array.isArray(item.screenSize) ? item.screenSize : [item.screenSize].filter(Boolean),
                        cpu: Array.isArray(item.cpu) ? item.cpu : [item.cpu].filter(Boolean),
                        gpu: Array.isArray(item.gpu) ? item.gpu : [item.gpu].filter(Boolean),
                        ram: Array.isArray(item.ram) ? item.ram : [item.ram].filter(Boolean),
                        storage: Array.isArray(item.storage) ? item.storage : [item.storage].filter(Boolean),
                        os: Array.isArray(item.os) ? item.os : [item.os].filter(Boolean),
                        releaseYear: String(item.releaseYear || ""),
                        notes: item.notes,
                        sku: item.sku,
                        weight: item.weight,
                        ports: item.ports,
                        display: item.display
                    }
                });
                result.added++;
            } catch (err: any) {
                result.errors.push(`שגיאה בדגם ${item.modelName || "?"}: ${err.message}`);
            }
        }

        const finalCount = await prismadb.laptopCatalog.count();
        result.newTotal = finalCount;

        // 4. סנכרון מלא
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");
        revalidatePath("/admin/logs");

        await logImport({ category: "laptop", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) {
        throw new Error("נכשל ייבוא Laptops: " + error.message);
    }
}

/**
 * ייבוא מחשבי מותג (נייחים)
 */
export async function importDesktopsAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            (item.sku || `${item.brand}-${item.modelName}-${JSON.stringify(item.cpu)}`).toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                let existing = null;
                if (item.sku) existing = await prismadb.brandDesktopCatalog.findUnique({ where: { sku: item.sku } });
                if (!existing) {
                    const matches = await prismadb.brandDesktopCatalog.findMany({ where: { brand: item.brand, modelName: item.modelName } });
                    if (matches.length > 0 && !item.sku) {
                        existing = true;
                    } else if (matches.some(m =>
                        JSON.stringify(m.cpu || []) === JSON.stringify(item.cpu || []) &&
                        JSON.stringify(m.ram || []) === JSON.stringify(item.ram || [])
                    )) { existing = true; }
                }
                if (existing) { result.skipped++; continue; }

                await prismadb.brandDesktopCatalog.create({
                    data: {
                        brand: item.brand, series: item.series || "", modelName: item.modelName,
                        cpu: Array.isArray(item.cpu) ? item.cpu : [item.cpu].filter(Boolean),
                        gpu: Array.isArray(item.gpu) ? item.gpu : [item.gpu].filter(Boolean),
                        ram: Array.isArray(item.ram) ? item.ram : [item.ram].filter(Boolean),
                        storage: Array.isArray(item.storage) ? item.storage : [item.storage].filter(Boolean),
                        os: Array.isArray(item.os) ? item.os : [item.os].filter(Boolean),
                        releaseYear: String(item.releaseYear || ""),
                        notes: item.notes, sku: item.sku, ports: item.ports, weight: item.weight, isMini: !!item.isMini
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`); }
        }

        const finalCount = await prismadb.brandDesktopCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        await logImport({ category: "desktop", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא Desktops: " + error.message); }
}

/**
 * ייבוא All-in-One
 */
export async function importAioAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            (item.sku || `${item.brand}-${item.modelName}-${JSON.stringify(item.screenSize)}`).toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                let existing = null;
                if (item.sku) existing = await prismadb.aioCatalog.findUnique({ where: { sku: item.sku } });
                if (!existing) {
                    const matches = await prismadb.aioCatalog.findMany({ where: { brand: item.brand, modelName: item.modelName } });
                    if (matches.length > 0 && !item.sku) {
                        existing = true;
                    } else if (matches.some(m =>
                        JSON.stringify(m.cpu || []) === JSON.stringify(item.cpu || []) &&
                        JSON.stringify(m.ram || []) === JSON.stringify(item.ram || [])
                    )) { existing = true; }
                }
                if (existing) { result.skipped++; continue; }

                await prismadb.aioCatalog.create({
                    data: {
                        brand: item.brand, series: item.series || "", modelName: item.modelName,
                        screenSize: Array.isArray(item.screenSize) ? item.screenSize : [item.screenSize].filter(Boolean),
                        cpu: Array.isArray(item.cpu) ? item.cpu : [item.cpu].filter(Boolean),
                        gpu: Array.isArray(item.gpu) ? item.gpu : [item.gpu].filter(Boolean),
                        ram: Array.isArray(item.ram) ? item.ram : [item.ram].filter(Boolean),
                        storage: Array.isArray(item.storage) ? item.storage : [item.storage].filter(Boolean),
                        os: Array.isArray(item.os) ? item.os : [item.os].filter(Boolean),
                        releaseYear: String(item.releaseYear || ""),
                        notes: item.notes, sku: item.sku, display: item.display, ports: item.ports
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`); }
        }

        const finalCount = await prismadb.aioCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        await logImport({ category: "aio", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא AIO: " + error.message); }
}

/**
 * ייבוא סלולריים
 */
export async function importMobileAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            `${item.brand}-${item.modelName}`.toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                const existing = await prismadb.mobileCatalog.findFirst({ where: { brand: item.brand, modelName: item.modelName } });
                if (existing) { result.skipped++; continue; }

                await prismadb.mobileCatalog.create({
                    data: {
                        brand: item.brand, series: item.series || "", modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : (typeof item.hebrewAliases === 'string' ? item.hebrewAliases.split(",").map((s: string) => s.trim()) : []),
                        storages: Array.isArray(item.storages) ? item.storages.map((s: any) => parseInt(String(s).replace(/[^0-9]/g, "")) || 0).filter(Boolean) : (typeof item.storages === 'string' ? item.storages.split(",").map((s: string) => parseInt(s.replace(/[^0-9]/g, "")) || 0).filter(Boolean) : []),
                        screenSize: item.screenSize ? parseFloat(String(item.screenSize).replace(/[^0-9.]/g, "")) || null : null,
                        releaseYear: item.releaseYear ? parseInt(String(item.releaseYear).replace(/[^0-9]/g, "")) || null : null,
                        cpu: item.cpu || "", 
                        ramG: item.ramG || item.ram ? parseInt(String(item.ramG || item.ram).replace(/[^0-9]/g, "")) || null : null,
                        os: item.os || "", battery: item.battery || "",
                        rearCamera: item.rearCamera || "", frontCamera: item.frontCamera || "",
                        weight: item.weight || "", nfc: !!item.nfc, wirelessCharging: !!item.wirelessCharging
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`); }
        }

        const finalCount = await prismadb.mobileCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        // note: stats key is "mobile" but importType="phone" → map correctly in UI
        await logImport({ category: "mobile", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא Mobile: " + error.message); }
}

/**
 * ייבוא רכבים
 */
export async function importVehicleAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            `${item.make}-${item.model}-${item.year}`.toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.make || !item.model) { result.skipped++; continue; }
                const existing = await prismadb.vehicleCatalog.findFirst({
                    where: { make: item.make, model: item.model, year: item.year ? parseInt(item.year) : undefined }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.vehicleCatalog.create({
                    data: {
                        make: item.make, model: item.model,
                        year: item.year ? parseInt(item.year) : null,
                        type: item.type || "", fuelType: item.fuelType || "",
                        transmission: item.transmission || "", engineSize: item.engineSize || "",
                        hp: item.hp ? parseInt(item.hp) : null
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה ברכב ${item.make} ${item.model}: ${err.message}`); }
        }

        const finalCount = await prismadb.vehicleCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        await logImport({ category: "vehicle", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא Vehicles: " + error.message); }
}

/**
 * ייבוא אלקטרוניקה
 */
export async function importElectronicsAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            `${item.brand}-${item.modelName}-${item.category}`.toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                const existing = await prismadb.electronicsCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName, category: item.category }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.electronicsCatalog.create({
                    data: {
                        brand: item.brand, category: item.category || "General", modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : [],
                        releaseYear: item.releaseYear ? parseInt(item.releaseYear) : null,
                        specs: typeof item.specs === 'string' ? item.specs : JSON.stringify(item.specs || {})
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה במוצר ${item.modelName}: ${err.message}`); }
        }

        const finalCount = await prismadb.electronicsCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        await logImport({ category: "electronics", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא Electronics: " + error.message); }
}

/**
 * ייבוא מוצרי חשמל
 */
export async function importApplianceAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            `${item.brand}-${item.modelName}-${item.category}`.toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                const existing = await prismadb.applianceCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName, category: item.category }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.applianceCatalog.create({
                    data: {
                        brand: item.brand, category: item.category || "General", modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : [],
                        capacity: item.capacity || "", energyRating: item.energyRating || ""
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה במוצר ${item.modelName}: ${err.message}`); }
        }

        const finalCount = await prismadb.applianceCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        await logImport({ category: "appliance", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא Appliances: " + error.message); }
}

/**
 * ייבוא לוחות אם
 */
export async function importMotherboardAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, duplicatesInFile: 0, errors: [] };
    try {
        const { unique, duplicatesInFile } = deduplicateInFile(data, item =>
            `${item.brand}-${item.model}`.toLowerCase()
        );
        result.duplicatesInFile = duplicatesInFile;
        result.skipped += duplicatesInFile;

        for (const item of unique) {
            try {
                if (!item.brand || !item.model) { result.skipped++; continue; }
                const existing = await prismadb.motherboardCatalog.findFirst({ where: { brand: item.brand, model: item.model } });
                if (existing) { result.skipped++; continue; }

                await prismadb.motherboardCatalog.create({
                    data: {
                        brand: item.brand, model: item.model, chipset: item.chipset || "",
                        socket: item.socket || "", formFactor: item.formFactor || "",
                        ramType: item.ramType || "", maxRam: item.maxRam || "",
                        pcie: item.pcie || "", m2: item.m2 || "", lan: item.lan || "",
                        wifi: item.wifi || "", releaseYear: item.releaseYear ? String(item.releaseYear) : null
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בלוח ${item.model}: ${err.message}`); }
        }

        const finalCount = await prismadb.motherboardCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout"); revalidatePath("/admin/export"); revalidatePath("/admin/logs");
        await logImport({ category: "motherboard", totalInFile: data.length, ...result, errors: result.errors, newTotal: finalCount });
        return result;
    } catch (error: any) { throw new Error("נכשל ייבוא Motherboards: " + error.message); }
}
