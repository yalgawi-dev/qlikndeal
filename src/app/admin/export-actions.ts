"use server";

import { LAPTOP_DATABASE } from "@/lib/computer-data";
import { ALL_PHONES } from "@/lib/phone-data";

/**
 * מנקה טקסט כדי שלא ישבור את ה-CSV
 */
function clean(text: any) {
    if (text === undefined || text === null) return "";
    return `"${String(text).replace(/"/g, '""')}"`;
}

export async function exportComputersToCSV(type: "laptop" | "desktop" | "all") {
    let csvContent = ""; 
    csvContent += "יצרן\tסדרה\tדגם\tסוג\tמסך\tמעבד\tזיכרון RAM\tאחסון\tמאיץ גרפי\tשנה\tהערות\n";

    for (const [brand, families] of Object.entries(LAPTOP_DATABASE)) {
        for (const family of families) {
            // סינון לפי סוג אם נדרש
            if (type !== "all" && family.type !== type) continue;

            for (const sub of family.subModels) {
                const row = [
                    clean(brand),
                    clean(family.name),
                    clean(sub.name),
                    clean(family.type === "laptop" ? "נייד" : "נייח"),
                    clean((sub.screenSize || []).join(" / ")),
                    clean((sub.cpu || []).join(" / ")),
                    clean((sub.ram || []).join(" / ")),
                    clean((sub.storage || []).join(" / ")),
                    clean((sub.gpu || []).join(" / ")),
                    clean(sub.release_year),
                    clean(sub.notes)
                ];
                csvContent += row.join("\t") + "\n";
            }
        }
    }

    return csvContent;
}

export async function exportPhonesToCSV() {
    let csvContent = "";
    csvContent += "מותג\tסדרה\tדגם\tמסך\tשנת יציאה\tמעבד\tRAM\tאחסון\tסוללה\tמצלמה אחורית\tמשקל\n";

    for (const phone of ALL_PHONES) {
        const row = [
            clean(phone.brand),
            clean(phone.series),
            clean(phone.model),
            clean(phone.screen),
            clean(phone.releaseYear),
            clean(phone.cpu),
            clean(phone.ram),
            clean((phone.storages || []).join(" / ")),
            clean(phone.battery),
            clean(phone.rear_camera),
            clean(phone.weight)
        ];
        csvContent += row.join("\t") + "\n";
    }

    return csvContent;
}
