"use server";

import prismadb from "@/lib/prismadb";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

// Import data sources
import { CAR_MODELS } from "@/lib/car-data";
import { ALL_ELECTRONICS } from "@/lib/electronics-data";
import { MOTHERBOARD_DATABASE } from "@/lib/motherboard-database";

const prisma = prismadb;

/**
 * מנקה טקסט כדי שלא ישבור את ה-CSV
 */
function clean(text: any) {
    if (text === undefined || text === null) return "";
    if (Array.isArray(text)) return text.join(" / ");
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function exportComputersToCSV(type: "laptop" | "desktop" | "aio" | "all") {
    noStore();
    const count = await prisma.laptopCatalog.count();
    const dbHost = process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || "unknown";
    console.log(`DEBUG: Total Laptops in DB for Export: ${count} on host ${dbHost}`);
    
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>קטגוריה</th><th>יצרן</th><th>סדרה</th><th>דגם</th><th>סוג</th><th>מסך</th><th>תצוגה</th><th>מעבד</th><th>זיכרון RAM</th><th>אחסון</th><th>מאיץ גרפי</th><th>OS</th><th>שנה</th><th>SKU</th><th>משקל</th><th>חיבורים</th><th>הערות</th>
        </tr>
    </thead>
    <tbody>`;

    // Precise counting for diagnostics
    const laptops_all = (type === "laptop" || type === "all") ? await prisma.laptopCatalog.findMany({ orderBy: { brand: "asc" } }) : [];
    const laptops_new = laptops_all.filter(l => l.sku?.includes('SKU-')).length;
    const laptops_old = laptops_all.length - laptops_new;

    const desktops = (type === "desktop" || type === "all") ? await prisma.brandDesktopCatalog.findMany({ orderBy: { brand: "asc" } }) : [];
    const aios = (type === "desktop" || type === "aio" || type === "all") ? await prisma.aioCatalog.findMany({ orderBy: { brand: "asc" } }) : [];

    // Laptops
    for (const l of laptops_all) {
        html += `
        <tr>
            <td>נייד</td>
            <td>${clean(l.brand)}</td>
            <td>${clean(l.series)}</td>
            <td>${clean(l.modelName)}</td>
            <td>${clean(l.type)}</td>
            <td>${clean(l.screenSize)}</td>
            <td>${clean(l.display)}</td>
            <td>${clean(l.cpu)}</td>
            <td>${clean(l.ram)}</td>
            <td>${clean(l.storage)}</td>
            <td>${clean(l.gpu)}</td>
            <td>${clean(l.os)}</td>
            <td>${clean(l.releaseYear)}</td>
            <td>${clean(l.sku)}</td>
            <td>${clean(l.weight)}</td>
            <td>${clean(l.ports)}</td>
            <td>${clean(l.notes)}</td>
        </tr>`;
    }

    // Desktops
    for (const d of desktops) {
        html += `
        <tr>
            <td>נייח מותג</td>
            <td>${clean(d.brand)}</td>
            <td>${clean(d.series)}</td>
            <td>${clean(d.modelName)}</td>
            <td>${clean(d.isMini ? "מיני" : "סטנדרטי")}</td>
            <td>-</td>
            <td>-</td>
            <td>${clean(d.cpu)}</td>
            <td>${clean(d.ram)}</td>
            <td>${clean(d.storage)}</td>
            <td>${clean(d.gpu)}</td>
            <td>${clean(d.os)}</td>
            <td>${clean(d.releaseYear)}</td>
            <td>${clean(d.sku)}</td>
            <td>${clean(d.weight)}</td>
            <td>${clean(d.ports)}</td>
            <td>${clean(d.notes)}</td>
        </tr>`;
    }

    // AIOs
    for (const a of aios) {
        html += `
        <tr>
            <td>AIO</td>
            <td>${clean(a.brand)}</td>
            <td>${clean(a.series)}</td>
            <td>${clean(a.modelName)}</td>
            <td>All-in-One</td>
            <td>${clean(a.screenSize)}</td>
            <td>${clean(a.display)}</td>
            <td>${clean(a.cpu)}</td>
            <td>${clean(a.ram)}</td>
            <td>${clean(a.storage)}</td>
            <td>${clean(a.gpu)}</td>
            <td>${clean(a.os)}</td>
            <td>${clean(a.releaseYear)}</td>
            <td>${clean(a.sku)}</td>
            <td>-</td>
            <td>${clean(a.ports)}</td>
            <td>${clean(a.notes)}</td>
        </tr>`;
    }

    // Debug Footer
    html += `
    <tr>
        <td colspan="17" style="background-color: #fff3cd; text-align: center; font-weight: bold; font-size: 14px; padding: 10px;">
            DIAGNOSTICS (V2.7):<br/>
            סה"כ ב-DB: ${count} | חדשים (SKU): ${laptops_new} | ישנים: ${laptops_old}<br/>
            שרת: ${dbHost} | זמן הפקה: ${new Date().toLocaleString('he-IL')}<br/>
        </td>
    </tr>`;

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportPhonesToCSV() {
    noStore();
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>מותג</th><th>סדרה</th><th>דגם</th><th>כינויים (HE)</th><th>מסך</th><th>שנה</th><th>מעבד</th><th>RAM</th><th>אחסון (GB)</th><th>OS</th><th>סוללה</th><th>מצלמה אחורית</th><th>מצלמה קדמית</th><th>משקל</th><th>NFC</th><th>טעינה אלחוטית</th>
        </tr>
    </thead>
    <tbody>`;

    const mobiles = await prisma.mobileCatalog.findMany({ orderBy: { brand: "asc" } });

    for (const phone of mobiles) {
        html += `
        <tr>
            <td>${clean(phone.brand)}</td>
            <td>${clean(phone.series)}</td>
            <td>${clean(phone.modelName)}</td>
            <td>${clean(phone.hebrewAliases)}</td>
            <td>${clean(phone.screenSize)}</td>
            <td>${clean(phone.releaseYear)}</td>
            <td>${clean(phone.cpu)}</td>
            <td>${clean(phone.ramG ? phone.ramG + "GB" : "")}</td>
            <td>${clean(phone.storages)}</td>
            <td>${clean(phone.os)}</td>
            <td>${clean(phone.battery)}</td>
            <td>${clean(phone.rearCamera)}</td>
            <td>${clean(phone.frontCamera)}</td>
            <td>${clean(phone.weight)}</td>
            <td>${phone.nfc ? "V" : ""}</td>
            <td>${phone.wirelessCharging ? "V" : ""}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportVehiclesToCSV() {
    noStore();
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>מותג</th><th>דגם</th><th>שנה</th><th>סוג</th><th>סוג דלק</th><th>תיבת הילוכים</th><th>נפח מנוע</th><th>כ"ס</th>
        </tr>
    </thead>
    <tbody>`;

    const vehicles = await prisma.vehicleCatalog.findMany({ orderBy: { make: "asc" } });

    for (const v of vehicles) {
        html += `
        <tr>
            <td>${clean(v.make)}</td>
            <td>${clean(v.model)}</td>
            <td>${clean(v.year)}</td>
            <td>${clean(v.type)}</td>
            <td>${clean(v.fuelType)}</td>
            <td>${clean(v.transmission)}</td>
            <td>${clean(v.engineSize)}</td>
            <td>${clean(v.hp)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportCustomBuildsToCSV() {
    noStore();
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>קטגוריה</th><th>תת קטגוריה</th><th>מעבד אופייני</th><th>מאיץ גרפי אופייני</th><th>RAM אופייני</th><th>תיאור</th>
        </tr>
    </thead>
    <tbody>`;

    const builds = await prisma.customBuildCatalog.findMany({ orderBy: { category: "asc" } });

    for (const b of builds) {
        html += `
        <tr>
            <td>${clean(b.category)}</td>
            <td>${clean(b.subCategory)}</td>
            <td>${clean(b.typicalCpu)}</td>
            <td>${clean(b.typicalGpu)}</td>
            <td>${clean(b.typicalRam)}</td>
            <td>${clean(b.description)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportElectronicsToCSV() {
    noStore();
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>מותג</th><th>קטגוריה</th><th>דגם</th><th>כילויים נוספים</th><th>שנת יציאה</th><th>מפרט (JSON)</th>
        </tr>
    </thead>
    <tbody>`;

    const electronics = await prisma.electronicsCatalog.findMany({ orderBy: { brand: "asc" } });

    for (const e of electronics) {
        html += `
        <tr>
            <td>${clean(e.brand)}</td>
            <td>${clean(e.category)}</td>
            <td>${clean(e.modelName)}</td>
            <td>${clean(e.hebrewAliases)}</td>
            <td>${clean(e.releaseYear)}</td>
            <td>${clean(e.specs)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportAppliancesToCSV() {
    noStore();
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>מותג</th><th>קטגוריה</th><th>דגם</th><th>קיבולת</th><th>דירוג אנרגטי</th>
        </tr>
    </thead>
    <tbody>`;

    const appliances = await prisma.applianceCatalog.findMany({ orderBy: { brand: "asc" } });

    for (const a of appliances) {
        html += `
        <tr>
            <td>${clean(a.brand)}</td>
            <td>${clean(a.category)}</td>
            <td>${clean(a.modelName)}</td>
            <td>${clean(a.capacity)}</td>
            <td>${clean(a.energyRating)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportMotherboardsToCSV() {
    noStore();
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>מותג</th><th>דגם</th><th>Chipset</th><th>Socket</th><th>Form Factor</th><th>סוג RAM</th><th>RAM מקסימלי</th><th>PCIe</th><th>M.2</th><th>LAN</th><th>WiFi</th><th>שנת יציאה</th>
        </tr>
    </thead>
    <tbody>`;

    const mbs = await prisma.motherboardCatalog.findMany({ orderBy: { brand: "asc" } });

    for (const m of mbs) {
        html += `
        <tr>
            <td>${clean(m.brand)}</td>
            <td>${clean(m.model)}</td>
            <td>${clean(m.chipset)}</td>
            <td>${clean(m.socket)}</td>
            <td>${clean(m.formFactor)}</td>
            <td>${clean(m.ramType)}</td>
            <td>${clean(m.maxRam)}</td>
            <td>${clean(m.pcie)}</td>
            <td>${clean(m.m2)}</td>
            <td>${clean(m.lan)}</td>
            <td>${clean(m.wifi)}</td>
            <td>${clean(m.releaseYear)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

// ─────────────────────────────────────────────────────────────
// SYNC ACTIONS (Build Database from Code)
// ─────────────────────────────────────────────────────────────

export async function syncVehicles() {
    noStore();
    try {
        console.log("Starting Vehicle Sync...");
        await prisma.vehicleCatalog.deleteMany({});
        
        let count = 0;
        for (const [make, models] of Object.entries(CAR_MODELS)) {
            for (const model of models) {
                await prisma.vehicleCatalog.create({
                    data: { make, model }
                });
                count++;
            }
        }
        console.log(`Synced ${count} vehicles.`);
        revalidatePath("/admin/export");
        return { success: true, count };
    } catch (error: any) {
        console.error("Sync Vehicles Error:", error);
        return { success: false, error: error.message };
    }
}

export async function syncElectronicsAndAppliances() {
    noStore();
    try {
        console.log("Starting Electronics/Appliances Sync...");
        await prisma.electronicsCatalog.deleteMany({});
        await prisma.applianceCatalog.deleteMany({});
        
        let eCount = 0;
        let aCount = 0;
        
        for (const item of ALL_ELECTRONICS) {
            const isAppliance = ["מקרר", "מכונת כביסה", "מזגן", "מדיח"].includes(item.category);
            if (isAppliance) {
                await prisma.applianceCatalog.create({
                    data: {
                        brand: item.brand,
                        category: item.category,
                        modelName: item.model,
                        hebrewAliases: item.hebrewAliases || [],
                        capacity: item.validSizes ? item.validSizes.join("/") : null
                    }
                });
                aCount++;
            } else {
                await prisma.electronicsCatalog.create({
                    data: {
                        brand: item.brand,
                        category: item.category,
                        modelName: item.model,
                        hebrewAliases: item.hebrewAliases || [],
                        releaseYear: item.releaseYear,
                        specs: item.specs ? JSON.stringify(item.specs) : null
                    }
                });
                eCount++;
            }
        }
        console.log(`Synced ${eCount} electronics and ${aCount} appliances.`);
        revalidatePath("/admin/export");
        return { success: true, electronics: eCount, appliances: aCount };
    } catch (error: any) {
        console.error("Sync Electronics Error:", error);
        return { success: false, error: error.message };
    }
}

export async function syncMotherboards() {
    noStore();
    try {
        console.log(`Starting Motherboard Sync (${MOTHERBOARD_DATABASE.length} items)...`);
        // Use deleteMany + createMany for performance if available, or just delete + loop
        await prisma.motherboardCatalog.deleteMany({});
        
        let count = 0;
        for (const mb of MOTHERBOARD_DATABASE) {
            await prisma.motherboardCatalog.create({
                data: {
                    brand: mb.brand,
                    model: mb.model,
                    chipset: mb.chipset,
                    socket: mb.socket,
                    formFactor: mb.formFactor,
                    ramType: mb.ramType,
                    maxRam: mb.maxRam,
                    pcie: mb.pcie,
                    m2: mb.m2,
                    lan: mb.lan,
                    wifi: mb.wifi,
                    releaseYear: mb.releaseYear
                }
            });
            count++;
        }
        console.log(`Synced ${count} motherboards.`);
        revalidatePath("/admin/export");
        return { success: true, count };
    } catch (error: any) {
        console.error("Sync Motherboards Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAllVehicles() {
    noStore();
    try {
        console.log("Deleting all vehicles from DB...");
        const count = await prisma.vehicleCatalog.deleteMany({});
        console.log(`Deleted ${count.count} vehicles.`);
        revalidatePath("/admin/export");
        return { success: true, message: `כל הנתונים בטבלת הרכבים (${count.count}) נמחקו בהצלחה.` };
    } catch (error: any) {
        console.error("Delete Vehicles Error:", error);
        return { success: false, error: error.message };
    }
}
