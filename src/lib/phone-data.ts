// =====================================================
// PHONE DATA — Knowledge base for AI auto-complete
// Used by normalizeSpokenText & extractAttributes
// =====================================================

export interface PhoneModel {
    brand: string;
    series: string;
    model: string;
    hebrewAliases?: string[]; // How it's spoken in Hebrew
    storages: number[];       // Valid storage sizes in GB
    screen?: number;          // Screen size in inches
    releaseYear?: number;
}

// Valid storage sizes across all devices
export const KNOWN_STORAGE_SIZES = [4, 8, 16, 32, 64, 128, 256, 512, 1024];

// --- SAMSUNG ---
const SAMSUNG_MODELS: PhoneModel[] = [
    // Galaxy S series
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S24 Ultra", hebrewAliases: ["גלקסי אס 24 אולטרה", "גאלקסי S24 Ultra"], storages: [256, 512, 1024], screen: 6.8, releaseYear: 2024 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S24+", hebrewAliases: ["גלקסי אס 24 פלוס"], storages: [256, 512], screen: 6.7, releaseYear: 2024 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S24", hebrewAliases: ["גלקסי אס 24"], storages: [128, 256], screen: 6.2, releaseYear: 2024 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S23 Ultra", hebrewAliases: ["גלקסי אס 23 אולטרה"], storages: [256, 512, 1024], screen: 6.8, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S23+", storages: [256, 512], screen: 6.6, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S23", storages: [128, 256], screen: 6.1, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S22 Ultra", storages: [128, 256, 512, 1024], screen: 6.8, releaseYear: 2022 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S22+", storages: [128, 256], screen: 6.6, releaseYear: 2022 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S22", storages: [128, 256], screen: 6.1, releaseYear: 2022 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S21 Ultra", storages: [128, 256, 512], screen: 6.8, releaseYear: 2021 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S21+", storages: [128, 256], screen: 6.7, releaseYear: 2021 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S21", storages: [128, 256], screen: 6.2, releaseYear: 2021 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S20 Ultra", storages: [128, 256, 512], screen: 6.9, releaseYear: 2020 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S20+", storages: [128, 256], screen: 6.7, releaseYear: 2020 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S20", storages: [128, 256], screen: 6.2, releaseYear: 2020 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S10+", storages: [128, 256, 512, 1024], screen: 6.4, releaseYear: 2019 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S10", storages: [128, 256, 512], screen: 6.1, releaseYear: 2019 },
    { brand: "Samsung", series: "Galaxy S", model: "Galaxy S10e", storages: [128, 256], screen: 5.8, releaseYear: 2019 },
    // Galaxy A series
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A55", storages: [128, 256], screen: 6.6, releaseYear: 2024 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A54", storages: [128, 256], screen: 6.4, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A53", storages: [128, 256], screen: 6.5, releaseYear: 2022 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A52", storages: [128, 256], screen: 6.5, releaseYear: 2021 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A35", storages: [128, 256], screen: 6.6, releaseYear: 2024 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A34", storages: [128, 256], screen: 6.6, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A25", storages: [128, 256], screen: 6.5, releaseYear: 2024 },
    { brand: "Samsung", series: "Galaxy A", model: "Galaxy A15", storages: [128, 256], screen: 6.5, releaseYear: 2024 },
    // Galaxy Z Fold/Flip
    { brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Fold 5", storages: [256, 512, 1024], screen: 7.6, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Fold 4", storages: [256, 512, 1024], screen: 7.6, releaseYear: 2022 },
    { brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Fold 3", storages: [256, 512], screen: 7.6, releaseYear: 2021 },
    { brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Flip 5", storages: [256, 512], screen: 6.7, releaseYear: 2023 },
    { brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Flip 4", storages: [128, 256, 512], screen: 6.7, releaseYear: 2022 },
    { brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Flip 3", storages: [128, 256], screen: 6.7, releaseYear: 2021 },
];

// --- APPLE ---
const APPLE_MODELS: PhoneModel[] = [
    { brand: "Apple", series: "iPhone 15", model: "iPhone 15 Pro Max", hebrewAliases: ["אייפון 15 פרו מקס", "אי פון 15 פרו מקס"], storages: [256, 512, 1024], screen: 6.7, releaseYear: 2023 },
    { brand: "Apple", series: "iPhone 15", model: "iPhone 15 Pro", hebrewAliases: ["אייפון 15 פרו"], storages: [128, 256, 512, 1024], screen: 6.1, releaseYear: 2023 },
    { brand: "Apple", series: "iPhone 15", model: "iPhone 15 Plus", storages: [128, 256, 512], screen: 6.7, releaseYear: 2023 },
    { brand: "Apple", series: "iPhone 15", model: "iPhone 15", hebrewAliases: ["אייפון 15"], storages: [128, 256, 512], screen: 6.1, releaseYear: 2023 },
    { brand: "Apple", series: "iPhone 14", model: "iPhone 14 Pro Max", hebrewAliases: ["אייפון 14 פרו מקס"], storages: [128, 256, 512, 1024], screen: 6.7, releaseYear: 2022 },
    { brand: "Apple", series: "iPhone 14", model: "iPhone 14 Pro", hebrewAliases: ["אייפון 14 פרו"], storages: [128, 256, 512, 1024], screen: 6.1, releaseYear: 2022 },
    { brand: "Apple", series: "iPhone 14", model: "iPhone 14 Plus", storages: [128, 256, 512], screen: 6.7, releaseYear: 2022 },
    { brand: "Apple", series: "iPhone 14", model: "iPhone 14", hebrewAliases: ["אייפון 14"], storages: [128, 256, 512], screen: 6.1, releaseYear: 2022 },
    { brand: "Apple", series: "iPhone 13", model: "iPhone 13 Pro Max", hebrewAliases: ["אייפון 13 פרו מקס"], storages: [128, 256, 512, 1024], screen: 6.7, releaseYear: 2021 },
    { brand: "Apple", series: "iPhone 13", model: "iPhone 13 Pro", storages: [128, 256, 512, 1024], screen: 6.1, releaseYear: 2021 },
    { brand: "Apple", series: "iPhone 13", model: "iPhone 13", hebrewAliases: ["אייפון 13"], storages: [128, 256, 512], screen: 6.1, releaseYear: 2021 },
    { brand: "Apple", series: "iPhone 13", model: "iPhone 13 Mini", storages: [128, 256, 512], screen: 5.4, releaseYear: 2021 },
    { brand: "Apple", series: "iPhone 12", model: "iPhone 12 Pro Max", storages: [128, 256, 512], screen: 6.7, releaseYear: 2020 },
    { brand: "Apple", series: "iPhone 12", model: "iPhone 12 Pro", storages: [128, 256, 512], screen: 6.1, releaseYear: 2020 },
    { brand: "Apple", series: "iPhone 12", model: "iPhone 12", storages: [64, 128, 256], screen: 6.1, releaseYear: 2020 },
    { brand: "Apple", series: "iPhone 12", model: "iPhone 12 Mini", storages: [64, 128, 256], screen: 5.4, releaseYear: 2020 },
    { brand: "Apple", series: "iPhone 11", model: "iPhone 11 Pro Max", storages: [64, 256, 512], screen: 6.5, releaseYear: 2019 },
    { brand: "Apple", series: "iPhone 11", model: "iPhone 11 Pro", storages: [64, 256, 512], screen: 5.8, releaseYear: 2019 },
    { brand: "Apple", series: "iPhone 11", model: "iPhone 11", storages: [64, 128, 256], screen: 6.1, releaseYear: 2019 },
    { brand: "Apple", series: "iPhone SE", model: "iPhone SE (3rd gen)", storages: [64, 128, 256], screen: 4.7, releaseYear: 2022 },
    { brand: "Apple", series: "iPhone SE", model: "iPhone SE (2nd gen)", storages: [64, 128, 256], screen: 4.7, releaseYear: 2020 },
];

// --- GOOGLE PIXEL ---
const GOOGLE_MODELS: PhoneModel[] = [
    { brand: "Google", series: "Pixel 8", model: "Pixel 8 Pro", storages: [128, 256, 512, 1024], screen: 6.7, releaseYear: 2023 },
    { brand: "Google", series: "Pixel 8", model: "Pixel 8", storages: [128, 256], screen: 6.2, releaseYear: 2023 },
    { brand: "Google", series: "Pixel 7", model: "Pixel 7 Pro", storages: [128, 256, 512], screen: 6.7, releaseYear: 2022 },
    { brand: "Google", series: "Pixel 7", model: "Pixel 7", storages: [128, 256], screen: 6.3, releaseYear: 2022 },
    { brand: "Google", series: "Pixel 6", model: "Pixel 6 Pro", storages: [128, 256, 512], screen: 6.7, releaseYear: 2021 },
    { brand: "Google", series: "Pixel 6", model: "Pixel 6", storages: [128, 256], screen: 6.4, releaseYear: 2021 },
];

// --- XIAOMI / REDMI ---
const XIAOMI_MODELS: PhoneModel[] = [
    { brand: "Xiaomi", series: "Xiaomi 14", model: "Xiaomi 14 Ultra", storages: [256, 512], screen: 6.73, releaseYear: 2024 },
    { brand: "Xiaomi", series: "Xiaomi 14", model: "Xiaomi 14", storages: [256, 512], screen: 6.36, releaseYear: 2024 },
    { brand: "Xiaomi", series: "Xiaomi 13", model: "Xiaomi 13 Ultra", storages: [256, 512], screen: 6.73, releaseYear: 2023 },
    { brand: "Xiaomi", series: "Xiaomi 13", model: "Xiaomi 13", storages: [128, 256], screen: 6.36, releaseYear: 2023 },
    { brand: "Xiaomi", series: "Redmi", model: "Redmi Note 13 Pro", storages: [128, 256, 512], screen: 6.67, releaseYear: 2024 },
    { brand: "Xiaomi", series: "Redmi", model: "Redmi Note 12 Pro", storages: [128, 256], screen: 6.67, releaseYear: 2023 },
    { brand: "Xiaomi", series: "Redmi", model: "Redmi Note 12", storages: [64, 128, 256], screen: 6.67, releaseYear: 2023 },
    { brand: "Xiaomi", series: "POCO", model: "POCO X6 Pro", storages: [256, 512], screen: 6.67, releaseYear: 2024 },
    { brand: "Xiaomi", series: "POCO", model: "POCO F5 Pro", storages: [256, 512], screen: 6.67, releaseYear: 2023 },
];

// --- OPPO / OnePlus ---
const OPPO_MODELS: PhoneModel[] = [
    { brand: "OnePlus", series: "OnePlus 12", model: "OnePlus 12", storages: [256, 512], screen: 6.82, releaseYear: 2024 },
    { brand: "OnePlus", series: "OnePlus 11", model: "OnePlus 11", storages: [128, 256], screen: 6.7, releaseYear: 2023 },
    { brand: "OnePlus", series: "OnePlus 10", model: "OnePlus 10 Pro", storages: [128, 256], screen: 6.7, releaseYear: 2022 },
    { brand: "OPPO", series: "OPPO Find", model: "OPPO Find X7 Ultra", storages: [256, 512], screen: 6.82, releaseYear: 2024 },
    { brand: "OPPO", series: "OPPO Reno", model: "OPPO Reno 11", storages: [128, 256], screen: 6.7, releaseYear: 2024 },
];

// --- MOTOROLA ---
const MOTOROLA_MODELS: PhoneModel[] = [
    { brand: "Motorola", series: "Edge", model: "Motorola Edge 50 Ultra", storages: [256, 512], screen: 6.7, releaseYear: 2024 },
    { brand: "Motorola", series: "Edge", model: "Motorola Edge 40 Pro", storages: [256, 512], screen: 6.7, releaseYear: 2023 },
    { brand: "Motorola", series: "Moto G", model: "Moto G84", storages: [256], screen: 6.55, releaseYear: 2023 },
    { brand: "Motorola", series: "Razr", model: "Motorola Razr 40 Ultra", storages: [256, 512], screen: 6.9, releaseYear: 2023 },
];

// --- HUAWEI ---
const HUAWEI_MODELS: PhoneModel[] = [
    { brand: "Huawei", series: "P", model: "Huawei P60 Pro", storages: [256, 512], screen: 6.67, releaseYear: 2023 },
    { brand: "Huawei", series: "P", model: "Huawei P50 Pro", storages: [256, 512], screen: 6.6, releaseYear: 2021 },
    { brand: "Huawei", series: "Mate", model: "Huawei Mate 60 Pro", storages: [256, 512], screen: 6.82, releaseYear: 2023 },
    { brand: "Huawei", series: "Nova", model: "Huawei Nova 12", storages: [128, 256], screen: 6.7, releaseYear: 2024 },
];

// --- ALL PHONES COMBINED ---
export const ALL_PHONES: PhoneModel[] = [
    ...SAMSUNG_MODELS,
    ...APPLE_MODELS,
    ...GOOGLE_MODELS,
    ...XIAOMI_MODELS,
    ...OPPO_MODELS,
    ...MOTOROLA_MODELS,
    ...HUAWEI_MODELS,
];

// --- LOOKUP HELPERS ---

/**
 * Find a phone model by matching text against model name or Hebrew aliases.
 * Returns the best match or null.
 */
export function findPhoneModel(text: string): PhoneModel | null {
    const normalizedText = text.toLowerCase();
    let bestMatch: PhoneModel | null = null;
    let bestScore = 0;

    for (const phone of ALL_PHONES) {
        let score = 0;
        const modelLower = phone.model.toLowerCase();

        // Exact model name match
        if (normalizedText.includes(modelLower)) {
            score = modelLower.length * 2;
        }

        // Hebrew alias match
        if (phone.hebrewAliases) {
            for (const alias of phone.hebrewAliases) {
                if (normalizedText.includes(alias.toLowerCase())) {
                    score = Math.max(score, alias.length * 2);
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = phone;
        }
    }

    return bestMatch;
}

/**
 * Given a storage number (possibly misheard), find the closest valid storage
 * for a given phone model. Uses suffix matching first (56 → 256), then proximity.
 */
export function correctStorageSize(n: number, phone: PhoneModel | null): number {
    const validSizes = phone?.storages || KNOWN_STORAGE_SIZES;

    // Already valid
    if (validSizes.includes(n)) return n;

    // Suffix match: "56" → "256", "28" → "128"
    for (const size of [...validSizes].sort((a, b) => b - a)) {
        if (String(size).endsWith(String(n))) return size;
    }

    // Nearest valid size
    return validSizes.reduce((prev, curr) =>
        Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
    );
}

/**
 * Get all Hebrew alias patterns for a brand — useful for category detection.
 */
export function getPhoneBrandKeywords(): string[] {
    const brands = new Set<string>();
    for (const phone of ALL_PHONES) {
        brands.add(phone.brand.toLowerCase());
        if (phone.hebrewAliases) {
            phone.hebrewAliases.forEach(a => brands.add(a));
        }
    }
    return Array.from(brands);
}
