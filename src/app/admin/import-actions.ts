"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export type ImportResult = {
    total: number;
    added: number;
    skipped: number;
    errors: string[];
};

/**
 * ייבוא מחשבים ניידים עם מניעת כפילויות ואימות נתונים
 */
export async function importLaptopsAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = {
        total: data.length,
        added: 0,
        skipped: 0,
        errors: []
    };

    try {
        const initialCount = await prismadb.laptopCatalog.count();
        
        // 1. בדיקת כפילויות בתוך הקובץ עצמו (In-file duplicate detection)
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = item.sku || `${item.brand}-${item.modelName}-${JSON.stringify(item.cpu)}-${JSON.stringify(item.ram)}`.toLowerCase();
            if (seenInFile.has(key)) {
                result.skipped++;
                return false;
            }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.modelName) {
                    result.skipped++;
                    result.errors.push(`חסר מותג או דגם עבור רשומה`);
                    continue;
                }

                let existing = null;
                if (item.sku) {
                    existing = await prismadb.laptopCatalog.findUnique({
                        where: { sku: item.sku }
                    });
                }

                if (!existing) {
                    const possibleMatches = await prismadb.laptopCatalog.findMany({
                        where: {
                            brand: item.brand,
                            modelName: item.modelName,
                        },
                        select: { cpu: true, ram: true, storage: true }
                    });

                    if (possibleMatches.length > 0) {
                        const isDuplicate = possibleMatches.some(m => {
                            const sameCpu = JSON.stringify(m.cpu || []) === JSON.stringify(item.cpu || []);
                            const sameRam = JSON.stringify(m.ram || []) === JSON.stringify(item.ram || []);
                            const sameStorage = JSON.stringify(m.storage || []) === JSON.stringify(item.storage || []);
                            return sameCpu && sameRam && sameStorage;
                        });

                        if (isDuplicate) existing = true;
                    }
                }

                if (existing) {
                    result.skipped++;
                    continue;
                }

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
                result.errors.push(`שגיאה בדגם ${item.modelName || 'לא ידוע'}: ${err.message}`);
            }
        }

        const finalCount = await prismadb.laptopCatalog.count();
        result.newTotal = finalCount;

        // סנכרון מלא למערכת (Revalidation)
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");
        
        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "laptop",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });

        return result;
    } catch (error: any) {
        throw new Error("נכשלה פעולת הייבוא הכללית: " + error.message);
    }
}

/**
 * ייבוא מחשבי מותג (נייחים)
 */
export async function importDesktopsAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.brandDesktopCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = item.sku || `${item.brand}-${item.modelName}-${JSON.stringify(item.cpu)}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                let existing = null;
                if (item.sku) {
                    existing = await prismadb.brandDesktopCatalog.findUnique({ where: { sku: item.sku } });
                }
                if (!existing) {
                    const possibleMatches = await prismadb.brandDesktopCatalog.findMany({
                        where: { brand: item.brand, modelName: item.modelName }
                    });
                    if (possibleMatches.length > 0) {
                        const isDuplicate = possibleMatches.some(m => 
                            JSON.stringify(m.cpu || []) === JSON.stringify(item.cpu || []) &&
                            JSON.stringify(m.ram || []) === JSON.stringify(item.ram || [])
                        );
                        if (isDuplicate) existing = true;
                    }
                }
                if (existing) { result.skipped++; continue; }

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
        const finalCount = await prismadb.brandDesktopCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");
        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "desktop",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא הכללית"); }
}

/**
 * ייבוא All-in-One
 */
export async function importAioAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.aioCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = item.sku || `${item.brand}-${item.modelName}-${JSON.stringify(item.screenSize)}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
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
                            JSON.stringify(m.cpu || []) === JSON.stringify(item.cpu || []) &&
                            JSON.stringify(m.ram || []) === JSON.stringify(item.ram || [])
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
        const finalCount = await prismadb.aioCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");
        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "aio",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });
        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא סלולריים
 */
export async function importMobileAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.mobileCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = `${item.brand}-${item.modelName}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
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
                        cpu: item.cpu || "",
                        ramG: item.ramG ? parseInt(item.ramG) : null,
                        os: item.os || "",
                        battery: item.battery || "",
                        rearCamera: item.rearCamera || "",
                        frontCamera: item.frontCamera || "",
                        weight: item.weight || "",
                        nfc: !!item.nfc,
                        wirelessCharging: !!item.wirelessCharging
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בדגם ${item.modelName}: ${err.message}`); }
        }
        const finalCount = await prismadb.mobileCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");

        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "mobile",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });

        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא רכבים
 */
export async function importVehicleAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.vehicleCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = `${item.make}-${item.model}-${item.year}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.make || !item.model) { result.skipped++; continue; }
                const existing = await prismadb.vehicleCatalog.findFirst({
                    where: { make: item.make, model: item.model, year: item.year ? parseInt(item.year) : undefined }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.vehicleCatalog.create({
                    data: {
                        make: item.make,
                        model: item.model,
                        year: item.year ? parseInt(item.year) : null,
                        type: item.type || "",
                        fuelType: item.fuelType || "",
                        transmission: item.transmission || "",
                        engineSize: item.engineSize || "",
                        hp: item.hp ? parseInt(item.hp) : null
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה ברכב ${item.make} ${item.model}: ${err.message}`); }
        }
        const finalCount = await prismadb.vehicleCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");

        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "vehicle",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });

        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא אלקטרוניקה
 */
export async function importElectronicsAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.electronicsCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = `${item.brand}-${item.modelName}-${item.category}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                const existing = await prismadb.electronicsCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName, category: item.category }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.electronicsCatalog.create({
                    data: {
                        brand: item.brand,
                        category: item.category || "General",
                        modelName: item.modelName,
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
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");

        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "electronics",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });

        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא מוצרי חשמל
 */
export async function importApplianceAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.applianceCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = `${item.brand}-${item.modelName}-${item.category}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.modelName) { result.skipped++; continue; }
                const existing = await prismadb.applianceCatalog.findFirst({
                    where: { brand: item.brand, modelName: item.modelName, category: item.category }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.applianceCatalog.create({
                    data: {
                        brand: item.brand,
                        category: item.category || "General",
                        modelName: item.modelName,
                        hebrewAliases: Array.isArray(item.hebrewAliases) ? item.hebrewAliases : [],
                        capacity: item.capacity || "",
                        energyRating: item.energyRating || ""
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה במוצר ${item.modelName}: ${err.message}`); }
        }
        const finalCount = await prismadb.applianceCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");

        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "appliance",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });

        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}

/**
 * ייבוא לוחות אם
 */
export async function importMotherboardAction(data: any[]): Promise<ImportResult & { newTotal?: number }> {
    const result: ImportResult & { newTotal?: number } = { total: data.length, added: 0, skipped: 0, errors: [] };
    try {
        const initialCount = await prismadb.motherboardCatalog.count();
        
        const seenInFile = new Set<string>();
        const uniqueData = data.filter(item => {
            const key = `${item.brand}-${item.model}`.toLowerCase();
            if (seenInFile.has(key)) { result.skipped++; return false; }
            seenInFile.add(key);
            return true;
        });

        for (const item of uniqueData) {
            try {
                if (!item.brand || !item.model) { result.skipped++; continue; }
                const existing = await prismadb.motherboardCatalog.findFirst({
                    where: { brand: item.brand, model: item.model }
                });
                if (existing) { result.skipped++; continue; }

                await prismadb.motherboardCatalog.create({
                    data: {
                        brand: item.brand,
                        model: item.model,
                        chipset: item.chipset || "",
                        socket: item.socket || "",
                        formFactor: item.formFactor || "",
                        ramType: item.ramType || "",
                        maxRam: item.maxRam || "",
                        pcie: item.pcie || "",
                        m2: item.m2 || "",
                        lan: item.lan || "",
                        wifi: item.wifi || "",
                        releaseYear: item.releaseYear ? String(item.releaseYear) : null
                    }
                });
                result.added++;
            } catch (err: any) { result.errors.push(`שגיאה בלוח ${item.model}: ${err.message}`); }
        }
        const finalCount = await prismadb.motherboardCatalog.count();
        result.newTotal = finalCount;
        revalidatePath("/", "layout");
        revalidatePath("/admin/export");

        const user = await currentUser();
        await prismadb.catalogImportLog.create({
            data: {
                category: "motherboard",
                added: result.added,
                skipped: result.skipped,
                errors: result.errors.length,
                adminName: user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "מערכת"
            }
        });

        return result;
    } catch (error: any) { throw new Error("נכשלה פעולת הייבוא"); }
}
