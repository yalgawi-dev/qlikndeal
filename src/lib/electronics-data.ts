// =====================================================
// ELECTRONICS & APPLIANCES DATA
// Knowledge base for AI auto-complete & smart parsing
// Covers: Smartwatches, TVs, Refrigerators, Laptops,
//         Tablets, Headphones, Washers, ACs, and more
// =====================================================

export interface ProductSpec {
    brand: string;
    category: string;
    model: string;
    hebrewAliases?: string[];
    validSizes?: number[];       // screen sizes (inches) or capacity (liters/kg)
    validStorages?: number[];    // GB (for devices with storage)
    releaseYear?: number;
    specs?: Record<string, string[]>; // additional known specs
}

// =====================================================
// SMARTWATCHES
// =====================================================
export const SMARTWATCHES: ProductSpec[] = [
    // Apple Watch
    { brand: "Apple", category: "שעון חכם", model: "Apple Watch Ultra 2", hebrewAliases: ["אפל ווטש אולטרה 2", "שעון אפל אולטרה 2"], validStorages: [64], releaseYear: 2023 },
    { brand: "Apple", category: "שעון חכם", model: "Apple Watch Series 9", hebrewAliases: ["אפל ווטש סיריז 9", "שעון אפל 9"], validStorages: [64], releaseYear: 2023 },
    { brand: "Apple", category: "שעון חכם", model: "Apple Watch Series 8", hebrewAliases: ["אפל ווטש סיריז 8"], validStorages: [32], releaseYear: 2022 },
    { brand: "Apple", category: "שעון חכם", model: "Apple Watch Series 7", hebrewAliases: ["אפל ווטש סיריז 7"], validStorages: [32], releaseYear: 2021 },
    { brand: "Apple", category: "שעון חכם", model: "Apple Watch SE (2nd gen)", hebrewAliases: ["אפל ווטש SE", "שעון אפל SE"], validStorages: [32], releaseYear: 2022 },
    // Samsung Galaxy Watch
    { brand: "Samsung", category: "שעון חכם", model: "Galaxy Watch 6 Classic", hebrewAliases: ["גלקסי ווטש 6 קלאסיק", "שעון גלקסי 6"], releaseYear: 2023 },
    { brand: "Samsung", category: "שעון חכם", model: "Galaxy Watch 6", hebrewAliases: ["גלקסי ווטש 6"], releaseYear: 2023 },
    { brand: "Samsung", category: "שעון חכם", model: "Galaxy Watch 5 Pro", hebrewAliases: ["גלקסי ווטש 5 פרו"], releaseYear: 2022 },
    { brand: "Samsung", category: "שעון חכם", model: "Galaxy Watch 5", hebrewAliases: ["גלקסי ווטש 5"], releaseYear: 2022 },
    { brand: "Samsung", category: "שעון חכם", model: "Galaxy Watch 4 Classic", hebrewAliases: ["גלקסי ווטש 4 קלאסיק"], releaseYear: 2021 },
    { brand: "Samsung", category: "שעון חכם", model: "Galaxy Watch 4", hebrewAliases: ["גלקסי ווטש 4"], releaseYear: 2021 },
    // Garmin
    { brand: "Garmin", category: "שעון חכם", model: "Garmin Fenix 7 Pro", hebrewAliases: ["גרמין פניקס 7 פרו"], releaseYear: 2023 },
    { brand: "Garmin", category: "שעון חכם", model: "Garmin Fenix 7", hebrewAliases: ["גרמין פניקס 7"], releaseYear: 2022 },
    { brand: "Garmin", category: "שעון חכם", model: "Garmin Forerunner 965", hebrewAliases: ["גרמין פורראנר 965"], releaseYear: 2023 },
    { brand: "Garmin", category: "שעון חכם", model: "Garmin Venu 3", hebrewAliases: ["גרמין וונו 3"], releaseYear: 2023 },
    // Xiaomi / Huawei
    { brand: "Xiaomi", category: "שעון חכם", model: "Xiaomi Watch S3", releaseYear: 2024 },
    { brand: "Xiaomi", category: "שעון חכם", model: "Redmi Watch 4", releaseYear: 2024 },
    { brand: "Huawei", category: "שעון חכם", model: "Huawei Watch GT 4", hebrewAliases: ["הואווי ווטש GT4"], releaseYear: 2023 },
    { brand: "Huawei", category: "שעון חכם", model: "Huawei Watch GT 3", hebrewAliases: ["הואווי ווטש GT3"], releaseYear: 2021 },
    // Fitbit / Google
    { brand: "Google", category: "שעון חכם", model: "Pixel Watch 2", releaseYear: 2023 },
    { brand: "Fitbit", category: "שעון חכם", model: "Fitbit Sense 2", releaseYear: 2022 },
    { brand: "Fitbit", category: "שעון חכם", model: "Fitbit Versa 4", releaseYear: 2022 },
];

// =====================================================
// TELEVISIONS
// =====================================================
export const TELEVISIONS: ProductSpec[] = [
    // Samsung
    { brand: "Samsung", category: "טלוויזיה", model: "Samsung QN95C Neo QLED", hebrewAliases: ["סמסונג QN95C", "ניאו QLED"], validSizes: [55, 65, 75, 85], releaseYear: 2023 },
    { brand: "Samsung", category: "טלוויזיה", model: "Samsung QE75 QLED", hebrewAliases: ["סמסונג QLED"], validSizes: [43, 50, 55, 65, 75, 85], releaseYear: 2023 },
    { brand: "Samsung", category: "טלוויזיה", model: "Samsung Crystal 4K", hebrewAliases: ["סמסונג קריסטל 4K"], validSizes: [43, 50, 55, 65, 75], releaseYear: 2023 },
    { brand: "Samsung", category: "טלוויזיה", model: "Samsung Frame TV", hebrewAliases: ["סמסונג פריים", "פריים TV"], validSizes: [32, 43, 50, 55, 65, 75], releaseYear: 2023 },
    // LG
    { brand: "LG", category: "טלוויזיה", model: "LG OLED C3", hebrewAliases: ["LG OLED C3", "אולד C3"], validSizes: [42, 48, 55, 65, 77, 83], releaseYear: 2023 },
    { brand: "LG", category: "טלוויזיה", model: "LG OLED C2", hebrewAliases: ["LG OLED C2", "אולד C2"], validSizes: [42, 48, 55, 65, 77, 83], releaseYear: 2022 },
    { brand: "LG", category: "טלוויזיה", model: "LG OLED G3", hebrewAliases: ["LG OLED G3"], validSizes: [55, 65, 77, 83], releaseYear: 2023 },
    { brand: "LG", category: "טלוויזיה", model: "LG NanoCell", hebrewAliases: ["LG נאנוסל"], validSizes: [43, 50, 55, 65, 75, 86], releaseYear: 2023 },
    { brand: "LG", category: "טלוויזיה", model: "LG UHD 4K", hebrewAliases: ["LG 4K"], validSizes: [43, 50, 55, 65, 75], releaseYear: 2023 },
    // Sony
    { brand: "Sony", category: "טלוויזיה", model: "Sony Bravia XR OLED A95K", hebrewAliases: ["סוני ברביה A95K"], validSizes: [55, 65, 77], releaseYear: 2022 },
    { brand: "Sony", category: "טלוויזיה", model: "Sony Bravia XR A80K", hebrewAliases: ["סוני ברביה A80K"], validSizes: [55, 65, 77], releaseYear: 2022 },
    { brand: "Sony", category: "טלוויזיה", model: "Sony Bravia X90K", hebrewAliases: ["סוני X90K"], validSizes: [50, 55, 65, 75, 85], releaseYear: 2022 },
    // Hisense
    { brand: "Hisense", category: "טלוויזיה", model: "Hisense ULED Mini LED", hebrewAliases: ["היסנס ULED"], validSizes: [55, 65, 75, 85], releaseYear: 2023 },
    { brand: "Hisense", category: "טלוויזיה", model: "Hisense A7G 4K", hebrewAliases: ["היסנס 4K"], validSizes: [43, 50, 55, 65, 75], releaseYear: 2022 },
    // TCL
    { brand: "TCL", category: "טלוויזיה", model: "TCL QLED Mini LED", validSizes: [50, 55, 65, 75, 85], releaseYear: 2023 },
    { brand: "TCL", category: "טלוויזיה", model: "TCL 4K Smart", validSizes: [43, 50, 55, 65, 75], releaseYear: 2023 },
];

// Valid TV screen sizes (for correction/suggestion)
export const KNOWN_TV_SIZES = [32, 40, 43, 50, 55, 58, 65, 70, 75, 77, 82, 85, 86, 98];

// =====================================================
// REFRIGERATORS
// =====================================================
export const REFRIGERATORS: ProductSpec[] = [
    // Common fridge types in Israel
    { brand: "Samsung", category: "מקרר", model: "Samsung French Door", hebrewAliases: ["סמסונג פרנץ דור", "מקרר אמריקאי סמסונג"], validSizes: [550, 620, 680], specs: { סוג: ["French Door", "side-by-side", "אמריקאי"] } },
    { brand: "Samsung", category: "מקרר", model: "Samsung Side by Side", hebrewAliases: ["סמסונג סייד בי סייד"], validSizes: [650, 700] },
    { brand: "LG", category: "מקרר", model: "LG InstaView Door-in-Door", hebrewAliases: ["LG אינסטה וויו"], validSizes: [635, 655] },
    { brand: "LG", category: "מקרר", model: "LG Side by Side", hebrewAliases: ["LG סייד בי סייד"], validSizes: [600, 650] },
    { brand: "Bosch", category: "מקרר", model: "Bosch Side by Side", hebrewAliases: ["בוש סייד בי סייד"], validSizes: [562, 592] },
    { brand: "Bosch", category: "מקרר", model: "Bosch French Door", hebrewAliases: ["בוש פרנץ דור"], validSizes: [592, 632] },
    { brand: "Whirlpool", category: "מקרר", model: "Whirlpool Side by Side", hebrewAliases: ["וורלפול"], validSizes: [588, 600] },
    { brand: "Liebherr", category: "מקרר", model: "Liebherr Comfort", hebrewAliases: ["ליברהר"], validSizes: [342, 396, 466] },
    { brand: "Haier", category: "מקרר", model: "Haier Multi Door", hebrewAliases: ["האייר"], validSizes: [436, 468] },
    { brand: "Beko", category: "מקרר", model: "Beko Side by Side", hebrewAliases: ["בקו"], validSizes: [522, 576] },
    { brand: "Hisense", category: "מקרר", model: "Hisense Side by Side", hebrewAliases: ["היסנס מקרר"], validSizes: [560, 600] },
];

export const KNOWN_FRIDGE_SIZES_LITERS = [200, 230, 260, 300, 340, 380, 420, 460, 500, 550, 600, 650, 700];

// =====================================================
// LAPTOPS
// =====================================================
export const LAPTOPS: ProductSpec[] = [
    // Apple MacBook
    { brand: "Apple", category: "מחשב נייד", model: "MacBook Pro 16\" M3 Max", hebrewAliases: ["מקבוק פרו 16 M3"], validStorages: [512, 1024, 2048], validSizes: [16], releaseYear: 2023 },
    { brand: "Apple", category: "מחשב נייד", model: "MacBook Pro 14\" M3", hebrewAliases: ["מקבוק פרו 14"], validStorages: [512, 1024, 2048], validSizes: [14], releaseYear: 2023 },
    { brand: "Apple", category: "מחשב נייד", model: "MacBook Air M2", hebrewAliases: ["מקבוק אייר M2"], validStorages: [256, 512, 1024, 2048], validSizes: [13.6], releaseYear: 2022 },
    { brand: "Apple", category: "מחשב נייד", model: "MacBook Air M1", hebrewAliases: ["מקבוק אייר M1"], validStorages: [256, 512, 1024], validSizes: [13.3], releaseYear: 2020 },
    // Dell
    { brand: "Dell", category: "מחשב נייד", model: "Dell XPS 15", hebrewAliases: ["דל XPS 15"], validStorages: [512, 1024, 2048], validSizes: [15.6], releaseYear: 2023 },
    { brand: "Dell", category: "מחשב נייד", model: "Dell XPS 13", hebrewAliases: ["דל XPS 13"], validStorages: [256, 512, 1024], validSizes: [13.4], releaseYear: 2023 },
    { brand: "Dell", category: "מחשב נייד", model: "Dell Inspiron 15", hebrewAliases: ["דל אינספירון"], validStorages: [256, 512, 1024], validSizes: [15.6], releaseYear: 2023 },
    // Lenovo
    { brand: "Lenovo", category: "מחשב נייד", model: "Lenovo ThinkPad X1 Carbon", hebrewAliases: ["לנובו תינקפד"], validStorages: [256, 512, 1024, 2048], validSizes: [14], releaseYear: 2023 },
    { brand: "Lenovo", category: "מחשב נייד", model: "Lenovo IdeaPad 5", hebrewAliases: ["לנובו איידיאפד"], validStorages: [256, 512, 1024], validSizes: [15.6], releaseYear: 2023 },
    { brand: "Lenovo", category: "מחשב נייד", model: "Lenovo Legion 5", hebrewAliases: ["לנובו ליג'ן"], validStorages: [512, 1024], validSizes: [15.6], releaseYear: 2023 },
    // HP
    { brand: "HP", category: "מחשב נייד", model: "HP Spectre x360", hebrewAliases: ["HP ספקטר"], validStorages: [512, 1024, 2048], validSizes: [14, 16], releaseYear: 2023 },
    { brand: "HP", category: "מחשב נייד", model: "HP Envy 15", hebrewAliases: ["HP אנווי"], validStorages: [512, 1024], validSizes: [15.6], releaseYear: 2023 },
    { brand: "HP", category: "מחשב נייד", model: "HP EliteBook 840", hebrewAliases: ["HP אליטבוק"], validStorages: [256, 512, 1024], validSizes: [14], releaseYear: 2023 },
    // ASUS
    { brand: "ASUS", category: "מחשב נייד", model: "ASUS ZenBook Pro", hebrewAliases: ["אסוס זנבוק"], validStorages: [512, 1024], validSizes: [15.6], releaseYear: 2023 },
    { brand: "ASUS", category: "מחשב נייד", model: "ASUS ROG Strix", hebrewAliases: ["אסוס ROG"], validStorages: [512, 1024], validSizes: [15.6, 17.3], releaseYear: 2023 },
    { brand: "ASUS", category: "מחשב נייד", model: "ASUS VivoBook 15", hebrewAliases: ["אסוס ויווובוק"], validStorages: [256, 512], validSizes: [15.6], releaseYear: 2023 },
    // Microsoft
    { brand: "Microsoft", category: "מחשב נייד", model: "Surface Pro 9", hebrewAliases: ["סרפייס פרו 9"], validStorages: [128, 256, 512, 1024], validSizes: [13], releaseYear: 2022 },
    { brand: "Microsoft", category: "מחשב נייד", model: "Surface Laptop 5", hebrewAliases: ["סרפייס לפטופ 5"], validStorages: [256, 512, 1024], validSizes: [13.5, 15], releaseYear: 2022 },
];

// =====================================================
// TABLETS
// =====================================================
export const TABLETS: ProductSpec[] = [
    // Apple iPad
    { brand: "Apple", category: "טאבלט", model: "iPad Pro 12.9\" M2", hebrewAliases: ["אייפד פרו 12"], validStorages: [128, 256, 512, 1024, 2048], validSizes: [12.9], releaseYear: 2022 },
    { brand: "Apple", category: "טאבלט", model: "iPad Pro 11\" M2", hebrewAliases: ["אייפד פרו 11"], validStorages: [128, 256, 512, 1024, 2048], validSizes: [11], releaseYear: 2022 },
    { brand: "Apple", category: "טאבלט", model: "iPad Air 5", hebrewAliases: ["אייפד אייר 5"], validStorages: [64, 256], validSizes: [10.9], releaseYear: 2022 },
    { brand: "Apple", category: "טאבלט", model: "iPad Mini 6", hebrewAliases: ["אייפד מיני 6"], validStorages: [64, 256], validSizes: [8.3], releaseYear: 2021 },
    { brand: "Apple", category: "טאבלט", model: "iPad 10th Gen", hebrewAliases: ["אייפד דור 10"], validStorages: [64, 256], validSizes: [10.9], releaseYear: 2022 },
    // Samsung Galaxy Tab
    { brand: "Samsung", category: "טאבלט", model: "Galaxy Tab S9 Ultra", hebrewAliases: ["גלקסי טאב S9 אולטרה"], validStorages: [256, 512], validSizes: [14.6], releaseYear: 2023 },
    { brand: "Samsung", category: "טאבלט", model: "Galaxy Tab S9+", hebrewAliases: ["גלקסי טאב S9 פלוס"], validStorages: [256, 512], validSizes: [12.4], releaseYear: 2023 },
    { brand: "Samsung", category: "טאבלט", model: "Galaxy Tab S9", hebrewAliases: ["גלקסי טאב S9"], validStorages: [128, 256], validSizes: [11], releaseYear: 2023 },
    { brand: "Samsung", category: "טאבלט", model: "Galaxy Tab S8 Ultra", hebrewAliases: ["גלקסי טאב S8 אולטרה"], validStorages: [128, 256], validSizes: [14.6], releaseYear: 2022 },
    { brand: "Lenovo", category: "טאבלט", model: "Lenovo Tab P12 Pro", hebrewAliases: ["לנובו טאב"], validStorages: [128, 256], validSizes: [12.6], releaseYear: 2022 },
];

// =====================================================
// HEADPHONES & EARBUDS
// =====================================================
export const HEADPHONES: ProductSpec[] = [
    // Apple
    { brand: "Apple", category: "אוזניות", model: "AirPods Pro 2nd Gen", hebrewAliases: ["אייר פודס פרו 2", "אירפודס פרו 2"], releaseYear: 2022 },
    { brand: "Apple", category: "אוזניות", model: "AirPods 3rd Gen", hebrewAliases: ["אייר פודס דור 3"], releaseYear: 2021 },
    { brand: "Apple", category: "אוזניות", model: "AirPods Max", hebrewAliases: ["אייר פודס מקס"], releaseYear: 2020 },
    // Sony
    { brand: "Sony", category: "אוזניות", model: "Sony WH-1000XM5", hebrewAliases: ["סוני XM5", "XM5"], releaseYear: 2022 },
    { brand: "Sony", category: "אוזניות", model: "Sony WH-1000XM4", hebrewAliases: ["סוני XM4", "XM4"], releaseYear: 2020 },
    { brand: "Sony", category: "אוזניות", model: "Sony WF-1000XM5", hebrewAliases: ["סוני WF XM5"], releaseYear: 2023 },
    // Samsung
    { brand: "Samsung", category: "אוזניות", model: "Galaxy Buds 2 Pro", hebrewAliases: ["גלקסי בדס 2 פרו"], releaseYear: 2022 },
    { brand: "Samsung", category: "אוזניות", model: "Galaxy Buds 2", hebrewAliases: ["גלקסי בדס 2"], releaseYear: 2021 },
    // Bose
    { brand: "Bose", category: "אוזניות", model: "Bose QuietComfort 45", hebrewAliases: ["בוס QC45", "קווייט קומפורט"], releaseYear: 2021 },
    { brand: "Bose", category: "אוזניות", model: "Bose QuietComfort Ultra", hebrewAliases: ["בוס QC אולטרה"], releaseYear: 2023 },
    // JBL
    { brand: "JBL", category: "אוזניות", model: "JBL Tune 770NC", releaseYear: 2023 },
    { brand: "JBL", category: "אוזניות", model: "JBL Live Pro 2", releaseYear: 2022 },
    { brand: "JBL", category: "אוזניות", model: "JBL Flip 6", hebrewAliases: ["JBL פליפ 6"], releaseYear: 2021 },
    { brand: "JBL", category: "אוזניות", model: "JBL Charge 5", hebrewAliases: ["JBL צ'ארג' 5"], releaseYear: 2021 },
];

// =====================================================
// WASHING MACHINES
// =====================================================
export const WASHING_MACHINES: ProductSpec[] = [
    { brand: "Samsung", category: "מכונת כביסה", model: "Samsung EcoBubble 9kg", hebrewAliases: ["סמסונג אקובאבל"], validSizes: [7, 8, 9, 10, 11] },
    { brand: "LG", category: "מכונת כביסה", model: "LG TurboWash 360", hebrewAliases: ["LG טורבו"], validSizes: [8, 9, 10, 11, 12, 14] },
    { brand: "Bosch", category: "מכונת כביסה", model: "Bosch Series 6", hebrewAliases: ["בוש סיריז 6"], validSizes: [8, 9, 10] },
    { brand: "Bosch", category: "מכונת כביסה", model: "Bosch Series 4", hebrewAliases: ["בוש סיריז 4"], validSizes: [8, 9] },
    { brand: "Whirlpool", category: "מכונת כביסה", model: "Whirlpool FreshCare+", hebrewAliases: ["וורלפול"], validSizes: [7, 8, 9, 10] },
    { brand: "Miele", category: "מכונת כביסה", model: "Miele W1 TwinDos", hebrewAliases: ["מיאלה"], validSizes: [8, 9] },
    { brand: "Beko", category: "מכונת כביסה", model: "Beko ProSmart", hebrewAliases: ["בקו כביסה"], validSizes: [7, 8, 9, 10] },
    { brand: "AEG", category: "מכונת כביסה", model: "AEG ProSteam", hebrewAliases: ["AEG"], validSizes: [8, 9, 10] },
];

// Known valid washing machine capacities (kg)
export const KNOWN_WASHER_SIZES_KG = [5, 6, 7, 8, 9, 10, 11, 12, 14, 16];

// =====================================================
// AIR CONDITIONERS
// =====================================================
export const AIR_CONDITIONERS: ProductSpec[] = [
    { brand: "LG", category: "מזגן", model: "LG DUAL Inverter", hebrewAliases: ["LG מזגן דואל אינוורטר"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
    { brand: "Samsung", category: "מזגן", model: "Samsung WindFree", hebrewAliases: ["סמסונג ווינדפרי"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
    { brand: "Mitsubishi", category: "מזגן", model: "Mitsubishi Electric MSZ", hebrewAliases: ["מיצובישי מזגן"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
    { brand: "Electra", category: "מזגן", model: "Electra Inverter", hebrewAliases: ["אלקטרה מזגן", "אלקטרה אינוורטר"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
    { brand: "Tadiran", category: "מזגן", model: "Tadiran Alpha", hebrewAliases: ["תדיראן", "תדיראן אלפא"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
    { brand: "Daikin", category: "מזגן", model: "Daikin Ururu Sarara", hebrewAliases: ["דאיקין"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
    { brand: "Panasonic", category: "מזגן", model: "Panasonic Etherea", hebrewAliases: ["פנסוניק מזגן"], specs: { BTU: ["9000", "12000", "18000", "24000"] } },
];

// Known AC capacities in BTU and Horsepowers (common in Israel)
export const KNOWN_AC_BTU = [9000, 12000, 15000, 18000, 21000, 24000, 30000, 36000];
export const KNOWN_AC_HP = [1, 1.5, 2, 2.5, 3]; // "כוח סוס" or "HP" for ACs

// =====================================================
// ALL PRODUCTS COMBINED
// =====================================================
export const ALL_ELECTRONICS: ProductSpec[] = [
    ...SMARTWATCHES,
    ...TELEVISIONS,
    ...REFRIGERATORS,
    ...LAPTOPS,
    ...TABLETS,
    ...HEADPHONES,
    ...WASHING_MACHINES,
    ...AIR_CONDITIONERS,
];

// =====================================================
// LOOKUP HELPERS
// =====================================================

/**
 * Find product by matching text against model name or Hebrew aliases.
 */
export function findElectronicsProduct(text: string): ProductSpec | null {
    const t = text.toLowerCase();
    let best: ProductSpec | null = null;
    let bestScore = 0;

    for (const item of ALL_ELECTRONICS) {
        let score = 0;
        if (t.includes(item.model.toLowerCase())) score = item.model.length * 2;
        if (item.hebrewAliases) {
            for (const alias of item.hebrewAliases) {
                if (t.includes(alias.toLowerCase())) score = Math.max(score, alias.length * 2);
            }
        }
        if (score > bestScore) { bestScore = score; best = item; }
    }
    return best;
}

/**
 * Correct TV screen size: e.g., "5" → "55", "6" → "65"
 * Voice often drops a digit at the end.
 */
export function correctTVSize(n: number): number {
    if (KNOWN_TV_SIZES.includes(n)) return n;
    // Suffix match: "5" → "55", "6" → "65", "7" → "75"
    for (const size of [...KNOWN_TV_SIZES].sort((a, b) => b - a)) {
        if (String(size).endsWith(String(n)) || String(size).startsWith(String(n))) return size;
    }
    // Nearest
    return KNOWN_TV_SIZES.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p);
}

/**
 * Correct fridge capacity in liters.
 */
export function correctFridgeSize(n: number): number {
    if (KNOWN_FRIDGE_SIZES_LITERS.includes(n)) return n;
    return KNOWN_FRIDGE_SIZES_LITERS.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p);
}

/**
 * Get all category-specific brand keywords (for category detection)
 */
export function getElectronicsBrandKeywords(category?: string): string[] {
    const items = category
        ? ALL_ELECTRONICS.filter(e => e.category === category)
        : ALL_ELECTRONICS;
    const brands = new Set<string>(items.map(e => e.brand.toLowerCase()));
    items.forEach(e => e.hebrewAliases?.forEach(a => brands.add(a.toLowerCase())));
    return Array.from(brands);
}
