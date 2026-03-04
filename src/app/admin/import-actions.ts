"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

export type ImportResult = {
    total: number;
    added: number;
    skipped: number;
    errors: string[];
};

/**
 * ייבוא מחשבים ניידים עם מניעת כפילויות
 */
export async function importLaptopsAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
        total: data.length,
        added: 0,
        skipped: 0,
        errors: []
    };

    try {
        for (const item of data) {
            try {
                // לוגיקת זיהוי כפילות:
                // 1. אם יש SKU - זה הכי בטוח
                // 2. אם אין SKU - בודקים שילוב של מותג, דגם, ומעבד (המעבד הראשון במערך)
                
                let existing = null;
                
                if (item.sku) {
                    existing = await prismadb.laptopCatalog.findUnique({
                        where: { sku: item.sku }
                    });
                }

                if (!existing) {
                    // חיפוש לפי מותג ודגם כגיבוי
                    const possibleMatches = await prismadb.laptopCatalog.findMany({
                        where: {
                            brand: item.brand,
                            modelName: item.modelName,
                        }
                    });

                    // בדיקה מעמיקה יותר על המפרט (מעבד/זיכרון) אם מצאנו דגמים דומים
                    if (possibleMatches.length > 0) {
                        const isDuplicate = possibleMatches.some(m => {
                            const sameCpu = JSON.stringify(m.cpu) === JSON.stringify(item.cpu || []);
                            const sameRam = JSON.stringify(m.ram) === JSON.stringify(item.ram || []);
                            const sameStorage = JSON.stringify(m.storage) === JSON.stringify(item.storage || []);
                            return sameCpu && sameRam && sameStorage;
                        });

                        if (isDuplicate) {
                            existing = true; // סימון שמצאנו כפילות
                        }
                    }
                }

                if (existing) {
                    result.skipped++;
                    continue; // דלג על הרשומה הזו
                }

                // הכנסה ל-DB
                await prismadb.laptopCatalog.create({
                    data: {
                        brand: item.brand,
                        series: item.series || "",
                        modelName: item.modelName,
                        type: item.type,
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
                console.error("Error importing item:", item.modelName, err);
                result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`);
            }
        }

        revalidatePath("/admin/export");
        return result;
    } catch (error: any) {
        console.error("Critical Import Error:", error);
        throw new Error("נכשלה פעולת הייבוא הכללית");
    }
}

/**
 * ייבוא מחשבי מותג (נייחים)
 */
export async function importDesktopsAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
        total: data.length,
        added: 0,
        skipped: 0,
        errors: []
    };

    try {
        for (const item of data) {
            try {
                let existing = null;
                if (item.sku) {
                    existing = await prismadb.brandDesktopCatalog.findUnique({
                        where: { sku: item.sku }
                    });
                }

                if (!existing) {
                    const possibleMatches = await prismadb.brandDesktopCatalog.findMany({
                        where: { brand: item.brand, modelName: item.modelName }
                    });

                    if (possibleMatches.length > 0) {
                        const isDuplicate = possibleMatches.some(m => {
                            const sameCpu = JSON.stringify(m.cpu) === JSON.stringify(item.cpu || []);
                            const sameRam = JSON.stringify(m.ram) === JSON.stringify(item.ram || []);
                            return sameCpu && sameRam;
                        });
                        if (isDuplicate) existing = true;
                    }
                }

                if (existing) {
                    result.skipped++;
                    continue;
                }

                await prismadb.brandDesktopCatalog.create({
                    data: {
                        brand: item.brand,
                        series: item.series || "",
                        modelName: item.modelName,
                        cpu: Array.isArray(item.cpu) ? item.cpu : [item.cpu].filter(Boolean),
                        gpu: Array.isArray(item.gpu) ? item.gpu : [item.gpu].filter(Boolean),
                        ram: Array.isArray(item.ram) ? item.ram : [item.ram].filter(Boolean),
                        storage: Array.isArray(item.storage) ? item.storage : [item.storage].filter(Boolean),
                        os: Array.isArray(item.os) ? item.os : [item.os].filter(Boolean),
                        releaseYear: String(item.releaseYear || ""),
                        notes: item.notes,
                        sku: item.sku,
                        ports: item.ports,
                        weight: item.weight,
                        isMini: !!item.isMini
                    }
                });
                result.added++;
            } catch (err: any) {
                result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`);
            }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) {
        throw new Error("נכשלה פעולת הייבוא הכללית");
    }
}

/**
 * ייבוא All-in-One
 */
export async function importAioAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        for (const item of data) {
            try {
                let existing = null;
                if (item.sku) {
                    existing = await prismadb.aioCatalog.findUnique({ where: { sku: item.sku } });
                }
                if (!existing) {
                    const possibleMatches = await prismadb.aioCatalog.findMany({
                        where: { brand: item.brand, modelName: item.modelName }
                    });
                    if (possibleMatches.length > 0) {
                        const isDuplicate = possibleMatches.some(m => 
                            JSON.stringify(m.cpu) === JSON.stringify(item.cpu || []) &&
                            JSON.stringify(m.ram) === JSON.stringify(item.ram || [])
                        );
                        if (isDuplicate) existing = true;
                    }
                }
                if (existing) { result.skipped++; continue; }

                await prismadb.aioCatalog.create({
                    data: {
                        brand: item.brand,
                        series: item.series || "",
                        modelName: item.modelName,
                        screenSize: Array.isArray(item.screenSize) ? item.screenSize : [item.screenSize].filter(Boolean),
                        cpu: Array.isArray(item.cpu) ? item.cpu : [item.cpu].filter(Boolean),
                        gpu: Array.isArray(item.gpu) ? item.gpu : [item.gpu].filter(Boolean),
                        ram: Array.isArray(item.ram) ? item.ram : [item.ram].filter(Boolean),
                        storage: Array.isArray(item.storage) ? item.storage : [item.storage].filter(Boolean),
                        os: Array.isArray(item.os) ? item.os : [item.os].filter(Boolean),
                        releaseYear: String(item.releaseYear || ""),
                        notes: item.notes,
                        sku: item.sku,
                        display: item.display,
                        ports: item.ports
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`); }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא סלולריים
 */
export async function importMobileAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        for (const item of data) {
            try {
                const existing = await prismadb.mobileCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.mobileCatalog.create({
                    data: {
                        brand: item.brand,
                        series: item.series || "",
                        modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : [],
                        storages: Array.isArray(item.storages) ? item.storages.map(Number) : [],
                        screenSize: item.screenSize ? parseFloat(item.screenSize) : null,
                        releaseYear: item.releaseYear ? parseInt(item.releaseYear) : null,
                        cpu: item.cpu,
                        ramG: item.ramG ? parseInt(item.ramG) : null,
                        os: item.os,
                        battery: item.battery,
                        rearCamera: item.rearCamera,
                        frontCamera: item.frontCamera,
                        weight: item.weight,
                        nfc: !!item.nfc,
                        wirelessCharging: !!item.wirelessCharging
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`); }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא רכבים
 */
export async function importVehicleAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        for (const item of data) {
            try {
                const existing = await prismadb.vehicleCatalog.findFirst({
                    where: { make: item.make, model: item.model, year: item.year ? parseInt(item.year) : undefined }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.vehicleCatalog.create({
                    data: {
                        make: item.make,
                        model: item.model,
                        year: item.year ? parseInt(item.year) : null,
                        type: item.type,
                        fuelType: item.fuelType,
                        transmission: item.transmission,
                        engineSize: item.engineSize,
                        hp: item.hp ? parseInt(item.hp) : null
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה ברכב ${item.make} ${item.model}: ${err.message}`); }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא אלקטרוניקה
 */
export async function importElectronicsAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        for (const item of data) {
            try {
                const existing = await prismadb.electronicsCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName, category: item.category }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.electronicsCatalog.create({
                    data: {
                        brand: item.brand,
                        category: item.category,
                        modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : [],
                        releaseYear: item.releaseYear ? parseInt(item.releaseYear) : null,
                        specs: typeof item.specs === 'string' ? item.specs : JSON.stringify(item.specs || {})
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה במוצר ${item.modelName}: ${err.message}`); }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא מוצרי חשמל
 */
export async function importApplianceAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        for (const item of data) {
            try {
                const existing = await prismadb.applianceCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName, category: item.category }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.applianceCatalog.create({
                    data: {
                        brand: item.brand,
                        category: item.category,
                        modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : [],
                        capacity: item.capacity,
                        energyRating: item.energyRating
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה במוצר ${item.modelName}: ${err.message}`); }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא לוחות אם
 */
export async function importMotherboardAction(data: any[]): Promise<ImportResult> {
    const result: ImportResult = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        for (const item of data) {
            try {
                // בדיקה לפי מותג ודגם
                const existing = await prismadb.motherboardCatalog.findFirst({
                    where: { brand: item.brand, model: item.model }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.motherboardCatalog.create({
                    data: {
                        brand: item.brand,
                        model: item.model,
                        chipset: item.chipset,
                        socket: item.socket,
                        formFactor: item.formFactor,
                        ramType: item.ramType,
                        maxRam: item.maxRam,
                        pcie: item.pcie,
                        m2: item.m2,
                        lan: item.lan,
                        wifi: item.wifi,
                        releaseYear: item.releaseYear ? String(item.releaseYear) : null
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בלוח ${item.model}: ${err.message}`); }
        }
        revalidatePath("/admin/export");
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}
