// FIXED VERSION - ALL SYNTAX ERRORS REMOVED
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
    cpu?: string;
    ram?: number;             // RAM in GB
    os?: string;
    battery?: string;
    rear_camera?: string;
    front_camera?: string;
    dimensions?: string;
    weight?: string;
    thickness?: string;
    expandable_storage?: string;
    usb_type?: string;
    nfc?: boolean;
    wireless_charging?: boolean;
    network?: string;
    esim?: boolean;
    wifi?: string;
    headphone_jack?: boolean;
}

// Valid storage sizes across all devices
export const KNOWN_STORAGE_SIZES = [4, 8, 16, 32, 64, 128, 256, 512, 1024];

// --- SAMSUNG ---
const SAMSUNG_MODELS: PhoneModel[] = [
    // Galaxy S24 Series
    { 
        brand: "Samsung", series: "Galaxy S", model: "Galaxy S24 Ultra", 
        hebrewAliases: ["גלקסי אס 24 אולטרה", "גאלקסי S24 Ultra"], 
        storages: [256, 512, 1024], screen: 6.8, releaseYear: 2024, 
        cpu: "Snapdragon 8 Gen 3 for Galaxy", ram: 12, os: "Android 14 (One UI 6.1)", 
        battery: "5000 mAh", rear_camera: "200MP + 50MP + 12MP + 10MP", front_camera: "12MP", 
        dimensions: "162.3 x 79 x 8.6 mm", weight: "232 g", thickness: "8.6 mm", 
        usb_type: "USB Type-C 3.2", nfc: true, wireless_charging: true, 
        network: "5G", esim: true, wifi: "Wi-Fi 7", headphone_jack: false 
    },
    { 
        brand: "Samsung", series: "Galaxy S", model: "Galaxy S24+", 
        hebrewAliases: ["גלקסי אס 24 פלוס"], storages: [256, 512], 
        screen: 6.7, releaseYear: 2024, cpu: "Exynos 2400 / Snapdragon 8 Gen 3", 
        ram: 12, os: "Android 14", battery: "4900 mAh", 
        rear_camera: "50MP + 12MP + 10MP", front_camera: "12MP", 
        dimensions: "158.5 x 75.9 x 7.7 mm", weight: "196 g", thickness: "7.7 mm", 
        usb_type: "USB-C", nfc: true, wireless_charging: true, 
        network: "5G", esim: true, wifi: "Wi-Fi 6E", headphone_jack: false 
    },
    { 
        brand: "Samsung", series: "Galaxy S", model: "Galaxy S24", 
        hebrewAliases: ["גלקסי אס 24"], storages: [128, 256], screen: 6.2, 
        releaseYear: 2024, cpu: "Exynos 2400 / Snapdragon 8 Gen 3", ram: 8, 
        os: "Android 14", battery: "4000 mAh", 
        rear_camera: "50MP + 12MP + 10MP", front_camera: "12MP", 
        dimensions: "147 x 70.6 x 7.6 mm", weight: "167 g", 
        usb_type: "USB-C", nfc: true, wireless_charging: true, 
        network: "5G", esim: true, wifi: "Wi-Fi 6E", headphone_jack: false 
    },

    // Galaxy S23 Series
    { 
        brand: "Samsung", series: "Galaxy S", model: "Galaxy S23 Ultra", 
        hebrewAliases: ["גלקסי אס 23 אולטרה"], storages: [256, 512, 1024], 
        screen: 6.8, releaseYear: 2023, cpu: "Snapdragon 8 Gen 2 for Galaxy", 
        ram: 12, os: "Android 13", battery: "5000 mAh", 
        rear_camera: "200MP + 10MP + 10MP + 12MP", front_camera: "12MP", 
        dimensions: "163.4 x 78.1 x 8.9 mm", weight: "234 g", 
        usb_type: "USB Type-C 3.2", nfc: true, wireless_charging: true, 
        network: "5G", esim: true, wifi: "Wi-Fi 6E", headphone_jack: false 
    },
    { 
        brand: "Samsung", series: "Galaxy S", model: "Galaxy S23+", 
        storages: [256, 512], screen: 6.6, releaseYear: 2023, 
        cpu: "Snapdragon 8 Gen 2", ram: 8, battery: "4700 mAh", 
        rear_camera: "50MP + 10MP + 12MP", front_camera: "12MP", 
        weight: "196 g", nfc: true, wireless_charging: true 
    },
    { 
        brand: "Samsung", series: "Galaxy S", model: "Galaxy S23", 
        storages: [128, 256, 512], screen: 6.1, releaseYear: 2023, 
        cpu: "Snapdragon 8 Gen 2", ram: 8, battery: "3900 mAh", 
        rear_camera: "50MP + 10MP + 12MP", front_camera: "12MP", 
        weight: "168 g", nfc: true, wireless_charging: true 
    },

    // Note Series
    { 
        brand: "Samsung", series: "Galaxy Note", model: "Galaxy Note 20 Ultra", 
        storages: [128, 256, 512], screen: 6.9, releaseYear: 2020, 
        cpu: "Exynos 990 / Snapdragon 865+", ram: 12, battery: "4500 mAh", 
        rear_camera: "108MP + 12MP + 12MP", weight: "208 g", nfc: true, 
        wireless_charging: true, usb_type: "USB Type-C 3.2" 
    },

    // Galaxy A Series
    { 
        brand: "Samsung", series: "Galaxy A", model: "Galaxy A55", 
        storages: [128, 256], screen: 6.6, releaseYear: 2024, 
        cpu: "Exynos 1480", ram: 8, battery: "5000 mAh", 
        rear_camera: "50MP + 12MP + 5MP", front_camera: "32MP", 
        weight: "213 g", nfc: true, wireless_charging: false 
    },
    { 
        brand: "Samsung", series: "Galaxy A", model: "Galaxy A54", 
        storages: [128, 256], screen: 6.4, releaseYear: 2023, 
        cpu: "Exynos 1380", ram: 8, battery: "5000 mAh", 
        rear_camera: "50MP + 12MP + 5MP", front_camera: "32MP", 
        weight: "202 g", nfc: true, wireless_charging: false 
    },

    // Galaxy Z Series
    { 
        brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Fold 5", 
        storages: [256, 512, 1024], screen: 7.6, releaseYear: 2023, 
        ram: 12, battery: "4400 mAh", cpu: "Snapdragon 8 Gen 2", 
        rear_camera: "50MP + 10MP + 12MP", nfc: true, wireless_charging: true 
    },
    { 
        brand: "Samsung", series: "Galaxy Z", model: "Galaxy Z Flip 5", 
        storages: [256, 512], screen: 6.7, releaseYear: 2023, 
        ram: 8, battery: "3700 mAh", cpu: "Snapdragon 8 Gen 2", 
        rear_camera: "12MP + 12MP", nfc: true, wireless_charging: true 
    },
];

// --- APPLE ---
const APPLE_MODELS: PhoneModel[] = [
    // iPhone 15 Series
    { 
        brand: "Apple", series: "iPhone 15", model: "iPhone 15 Pro Max", 
        hebrewAliases: ["אייפון 15 פרו מקס", "אי פון 15 פרו מקס"], 
        storages: [256, 512, 1024], screen: 6.7, releaseYear: 2023,
        cpu: "Apple A17 Pro (3 nm)", ram: 8, os: "iOS 17", battery: "4441 mAh",
        rear_camera: "48MP (wide) + 12MP (periscope telephoto) + 12MP (ultrawide)", 
        front_camera: "12MP", dimensions: "159.9 x 76.7 x 8.3 mm", weight: "221 g",
        usb_type: "USB Type-C 3.0", nfc: true, wireless_charging: true, 
        network: "5G", esim: true, wifi: "Wi-Fi 6E", headphone_jack: false,
        thickness: "8.3 mm"
    },
    { 
        brand: "Apple", series: "iPhone 15", model: "iPhone 15 Pro", 
        hebrewAliases: ["אייפון 15 פרו"], storages: [128, 256, 512, 1024], 
        screen: 6.1, releaseYear: 2023, cpu: "Apple A17 Pro (3 nm)", ram: 8,
        os: "iOS 17", battery: "3274 mAh", rear_camera: "48MP + 12MP + 12MP", 
        front_camera: "12MP", dimensions: "146.6 x 70.6 x 8.3 mm", weight: "187 g",
        usb_type: "USB Type-C 3.0", nfc: true, wireless_charging: true, 
        network: "5G", esim: true, wifi: "Wi-Fi 6E", thickness: "8.3 mm"
    },
    { 
        brand: "Apple", series: "iPhone 15", model: "iPhone 15 Plus", 
        storages: [128, 256, 512], screen: 6.7, releaseYear: 2023,
        cpu: "Apple A16 Bionic (4 nm)", ram: 6, os: "iOS 17", battery: "4383 mAh",
        rear_camera: "48MP + 12MP", front_camera: "12MP", 
        weight: "201 g", usb_type: "USB Type-C 2.0", nfc: true, wireless_charging: true,
        thickness: "7.8 mm"
    },
    { 
        brand: "Apple", series: "iPhone 15", model: "iPhone 15", 
        hebrewAliases: ["אייפון 15"], storages: [128, 256, 512], 
        screen: 6.1, releaseYear: 2023, cpu: "Apple A16 Bionic (4 nm)", ram: 6,
        os: "iOS 17", battery: "3349 mAh", rear_camera: "48MP + 12MP", 
        front_camera: "12MP", weight: "171 g", usb_type: "USB Type-C 2.0",
        thickness: "7.8 mm"
    },

    // iPhone 14 Series
    { 
        brand: "Apple", series: "iPhone 14", model: "iPhone 14 Pro Max", 
        storages: [128, 256, 512, 1024], screen: 6.7, releaseYear: 2022, 
        cpu: "Apple A16 Bionic", ram: 6, battery: "4323 mAh", 
        rear_camera: "48MP + 12MP + 12MP", weight: "240 g", os: "iOS 16"
    },
    { 
        brand: "Apple", series: "iPhone 14", model: "iPhone 14 Pro", 
        storages: [128, 256, 512, 1024], screen: 6.1, releaseYear: 2022, 
        cpu: "Apple A16 Bionic", ram: 6, battery: "3200 mAh", 
        rear_camera: "48MP + 12MP + 12MP", weight: "206 g", os: "iOS 16"
    },

    // iPhone 13 Series
    { 
        brand: "Apple", series: "iPhone 13", model: "iPhone 13 Pro Max", 
        storages: [128, 256, 512, 1024], screen: 6.7, releaseYear: 2021,
        cpu: "Apple A15 Bionic (5 nm)", ram: 6, os: "iOS 15", battery: "4352 mAh",
        rear_camera: "12MP (wide) + 12MP (telephoto) + 12MP (ultrawide) + LiDAR",
        front_camera: "12MP", dimensions: "160.8 x 78.1 x 7.7 mm", weight: "240 g",
        usb_type: "Lightning", nfc: true, wireless_charging: true, thickness: "7.7 mm"
    },
    { 
        brand: "Apple", series: "iPhone 13", model: "iPhone 13 Pro", 
        storages: [128, 256, 512, 1024], screen: 6.1, releaseYear: 2021,
        cpu: "Apple A15 Bionic (5 nm)", ram: 6, os: "iOS 15", battery: "3095 mAh",
        rear_camera: "12MP (wide) + 12MP (telephoto) + 12MP (ultrawide) + LiDAR",
        front_camera: "12MP", dimensions: "146.7 x 71.5 x 7.7 mm", weight: "204 g",
        usb_type: "Lightning", nfc: true, wireless_charging: true, thickness: "7.7 mm"
    },
];

// --- GOOGLE PIXEL ---
const GOOGLE_MODELS: PhoneModel[] = [
    { 
        brand: "Google", series: "Pixel 8", model: "Pixel 8 Pro", 
        storages: [128, 256, 512, 1024], screen: 6.7, releaseYear: 2023, 
        ram: 12, cpu: "Google Tensor G3", battery: "5050 mAh", 
        rear_camera: "50MP + 48MP + 48MP", weight: "213 g", nfc: true, 
        os: "Android 14", wireless_charging: true, usb_type: "USB Type-C 3.2" 
    },
    { 
        brand: "Google", series: "Pixel 8", model: "Pixel 8", 
        storages: [128, 256], screen: 6.2, releaseYear: 2023, 
        ram: 8, cpu: "Google Tensor G3", battery: "4575 mAh", 
        rear_camera: "50MP + 12MP", weight: "187 g", nfc: true, 
        os: "Android 14", wireless_charging: true 
    },
    { 
        brand: "Google", series: "Pixel 7", model: "Pixel 7 Pro", 
        storages: [128, 256, 512], screen: 6.7, releaseYear: 2022, 
        ram: 12, cpu: "Google Tensor G2", battery: "5000 mAh", 
        rear_camera: "50MP + 48MP + 12MP", weight: "212 g", nfc: true 
    },
];

// --- XIAOMI ---
const XIAOMI_MODELS: PhoneModel[] = [
    { 
        brand: "Xiaomi", series: "Xiaomi 14", model: "Xiaomi 14 Ultra", 
        storages: [256, 512], screen: 6.73, releaseYear: 2024, 
        ram: 16, cpu: "Snapdragon 8 Gen 3", battery: "5000 mAh", 
        rear_camera: "50MP + 50MP + 50MP + 50MP", weight: "220 g", nfc: true 
    },
    { 
        brand: "Xiaomi", series: "Redmi", model: "Redmi Note 13 Pro", 
        storages: [128, 256, 512], screen: 6.67, releaseYear: 2024, 
        ram: 8, battery: "5000 mAh", rear_camera: "200MP + 8MP + 2MP" 
    },
];

// --- ALL PHONES COMBINED ---
export const ALL_PHONES: PhoneModel[] = [
    ...SAMSUNG_MODELS,
    ...APPLE_MODELS,
    ...GOOGLE_MODELS,
    ...XIAOMI_MODELS,
];

// --- LOOKUP HELPERS ---

export function findPhoneModel(text: string): PhoneModel | null {
    const normalizedText = text.toLowerCase();
    let bestMatch: PhoneModel | null = null;
    let bestScore = 0;

    for (const phone of ALL_PHONES) {
        let score = 0;
        const modelLower = phone.model.toLowerCase();

        if (normalizedText.includes(modelLower)) {
            score = modelLower.length * 2;
        }

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

export function correctStorageSize(n: number, phone: PhoneModel | null): number {
    const validSizes = phone?.storages || KNOWN_STORAGE_SIZES;
    if (validSizes.includes(n)) return n;
    for (const size of [...validSizes].sort((a, b) => b - a)) {
        if (String(size).endsWith(String(n))) return size;
    }
    return validSizes.reduce((prev, curr) =>
        Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
    );
}

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
