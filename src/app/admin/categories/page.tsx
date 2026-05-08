import { getCategoryRegistry } from "@/lib/config/categoryRegistry";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
    const registry = await getCategoryRegistry(true); // force fresh read
    
    // Convert to array for UI (and serialize Regex)
    const categoriesArray = Object.keys(registry).map(key => ({
        ...registry[key],
        regex: registry[key].regex.source // Convert RegExp to string for React Props
    }));

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">מנוע קטגוריות דינמי (Zero Code)</h1>
            <p className="text-gray-500 mb-6 font-mono text-sm max-w-5xl">
                ברוך הבא למרכז השליטה של AI. הוספת קטגוריה כאן תלמד באופן עצמאי את המנוע לזהות טקסטים דומים,
                תפתח ערוצי ייבוא בקבלת קבצים ותנתב מוכרים/קונים חדשים ללא עבודת מתכנת.
            </p>
            <CategoriesClient initialData={categoriesArray} />
        </div>
    );
}
