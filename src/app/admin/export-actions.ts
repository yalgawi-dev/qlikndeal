"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * מנקה טקסט כדי שלא ישבור את ה-CSV
 */
function clean(text: any) {
    if (text === undefined || text === null) return "";
    if (Array.isArray(text)) return text.join(" / ");
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function exportComputersToCSV(type: "laptop" | "desktop" | "aio" | "all") {
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>קטגוריה</th><th>יצרן</th><th>סדרה</th><th>דגם</th><th>סוג</th><th>מסך</th><th>מעבד</th><th>זיכרון RAM</th><th>אחסון</th><th>מאיץ גרפי</th><th>שנה</th><th>SKU</th><th>הערות</th>
        </tr>
    </thead>
    <tbody>`;

    const laptops = (type === "laptop" || type === "all") ? await prisma.laptopCatalog.findMany({ orderBy: { brand: "asc" } }) : [];
    const desktops = (type === "desktop" || type === "all") ? await prisma.brandDesktopCatalog.findMany({ orderBy: { brand: "asc" } }) : [];
    const aios = (type === "desktop" || type === "aio" || type === "all") ? await prisma.aioCatalog.findMany({ orderBy: { brand: "asc" } }) : [];

    // Laptops
    for (const l of laptops) {
        html += `
        <tr>
            <td>נייד</td>
            <td>${clean(l.brand)}</td>
            <td>${clean(l.series)}</td>
            <td>${clean(l.modelName)}</td>
            <td>${clean(l.type)}</td>
            <td>${clean(l.screenSize)}</td>
            <td>${clean(l.cpu)}</td>
            <td>${clean(l.ram)}</td>
            <td>${clean(l.storage)}</td>
            <td>${clean(l.gpu)}</td>
            <td>${clean(l.releaseYear)}</td>
            <td>${clean(l.sku)}</td>
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
            <td>${clean(d.cpu)}</td>
            <td>${clean(d.ram)}</td>
            <td>${clean(d.storage)}</td>
            <td>${clean(d.gpu)}</td>
            <td>${clean(d.releaseYear)}</td>
            <td>${clean(d.sku)}</td>
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
            <td>${clean(a.cpu)}</td>
            <td>${clean(a.ram)}</td>
            <td>${clean(a.storage)}</td>
            <td>${clean(a.gpu)}</td>
            <td>${clean(a.releaseYear)}</td>
            <td>${clean(a.sku)}</td>
            <td>${clean(a.notes)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}

export async function exportPhonesToCSV() {
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>מותג</th><th>סדרה</th><th>דגם</th><th>מסך</th><th>שנת יציאה</th><th>מעבד</th><th>RAM</th><th>אחסון</th><th>סוללה</th><th>מצלמה אחורית</th><th>משקל</th>
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
            <td>${clean(phone.screenSize)}</td>
            <td>${clean(phone.releaseYear)}</td>
            <td>${clean(phone.cpu)}</td>
            <td>${clean(phone.ramG ? phone.ramG + "GB" : "")}</td>
            <td>${clean(phone.storages)}</td>
            <td>${clean(phone.battery)}</td>
            <td>${clean(phone.rearCamera)}</td>
            <td>${clean(phone.weight)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}
