"use server";

import { LAPTOP_DATABASE } from "@/lib/computer-data";
import { ALL_PHONES } from "@/lib/phone-data";

/**
 * מנקה טקסט כדי שלא ישבור את ה-CSV
 */
function clean(text: any) {
    if (text === undefined || text === null) return "";
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function exportComputersToCSV(type: "laptop" | "desktop" | "all") {
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; } th { background-color: #f4f4f4; }</style></head>
    <body dir="rtl">
    <table border="1">
    <thead>
        <tr>
            <th>יצרן</th><th>סדרה</th><th>דגם</th><th>סוג</th><th>מסך</th><th>מעבד</th><th>זיכרון RAM</th><th>אחסון</th><th>מאיץ גרפי</th><th>שנה</th><th>הערות</th>
        </tr>
    </thead>
    <tbody>`;

    for (const [brand, families] of Object.entries(LAPTOP_DATABASE)) {
        for (const family of families) {
            if (type !== "all" && family.type !== type) continue;

            for (const sub of family.subModels) {
                html += `
                <tr>
                    <td>${clean(brand)}</td>
                    <td>${clean(family.name)}</td>
                    <td>${clean(sub.name)}</td>
                    <td>${clean(family.type === "laptop" ? "נייד" : "נייח")}</td>
                    <td>${clean((sub.screenSize || []).join(" / "))}</td>
                    <td>${clean((sub.cpu || []).join(" / "))}</td>
                    <td>${clean((sub.ram || []).join(" / "))}</td>
                    <td>${clean((sub.storage || []).join(" / "))}</td>
                    <td>${clean((sub.gpu || []).join(" / "))}</td>
                    <td>${clean(sub.release_year)}</td>
                    <td>${clean(sub.notes)}</td>
                </tr>`;
            }
        }
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

    for (const phone of ALL_PHONES) {
        html += `
        <tr>
            <td>${clean(phone.brand)}</td>
            <td>${clean(phone.series)}</td>
            <td>${clean(phone.model)}</td>
            <td>${clean(phone.screen)}</td>
            <td>${clean(phone.releaseYear)}</td>
            <td>${clean(phone.cpu)}</td>
            <td>${clean(phone.ram)}</td>
            <td>${clean((phone.storages || []).join(" / "))}</td>
            <td>${clean(phone.battery)}</td>
            <td>${clean(phone.rear_camera)}</td>
            <td>${clean(phone.weight)}</td>
        </tr>`;
    }

    html += `</tbody></table></body></html>`;
    return html;
}
