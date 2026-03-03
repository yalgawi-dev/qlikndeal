// =============================================================
//  COMPUTER DATA - TYPES AND CONSTANTS ONLY (SHELL)
//  Required for build stability until all components migrate to DB
// =============================================================
import { BRAND_DESKTOPS_DATABASE as BDD, AIO_DATABASE as AD } from "./desktops-aio-data";

export type ComputerSubModel = {
    name: string;
    screenSize?: string[];
    cpu?: string[];
    gpu?: string[];
    ram?: string[];
    storage?: string[];
    os?: string[];
    type?: string;
    battery?: string;
    ports?: string;
    weight?: string;
    release_year?: string;
    notes?: string;
    display?: string | string[];
    sku?: string;
    skus?: {
        id: string;
        screenSize?: string[];
        cpu?: string[];
        gpu?: string[];
        ram?: string[];
        storage?: string[];
        os?: string[];
    }[];
};

export type ComputerModelFamily = {
    name: string;
    type: string;
    subModels: ComputerSubModel[];
};

export type ComputerBrand = {
    models: ComputerModelFamily[];
};

// ---- Global spec options ----
export const RAM_OPTIONS = ["4GB", "8GB", "12GB", "16GB", "24GB", "32GB", "48GB", "64GB", "96GB", "128GB", "לא ידוע"];
export const STORAGE_OPTIONS = ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD", "500GB HDD", "1TB HDD", "2TB HDD", "4TB HDD", "1TB SSD + 1TB HDD", "2TB SSD + 2TB HDD", "לא ידוע"];
export const SCREEN_SIZE_OPTIONS = ["11\"", "12\"", "13\"", "13.3\"", "13.6\"", "14\"", "14.5\"", "15\"", "15.6\"", "16\"", "17\"", "17.3\"", "24\"", "27\"", "32\"", "לא ידוע"];
export const OS_OPTIONS = ["Windows 11 Home", "Windows 11 Pro", "Windows 10 Home", "Windows 10 Pro", "macOS Sequoia", "macOS Sonoma", "macOS Ventura", "Linux", "ChromeOS", "ללא מערכת הפעלה", "לא ידוע"];
export const CONDITION_OPTIONS = ["חדש", "כמו חדש", "משומש - מצב מצויין", "משומש - מצב טוב", "משומש - מצב בינוני", "לחלקים / לא עובד"];

export const CPU_OPTIONS: Record<string, string[]> = {
    "Intel": ["Intel Core Ultra 9 185H", "Intel Core Ultra 7 165H", "Intel Core i7-13700H", "Intel Core i5-13500H", "לא ידוע"],
    "AMD": ["AMD Ryzen 9 7945HX", "AMD Ryzen 7 7735HS", "AMD Ryzen 5 7530U", "לא ידוע"],
    "Apple": ["Apple M4 Pro", "Apple M4 Max", "Apple M3", "Apple M2", "Apple M1", "לא ידוע"]
};

export const GPU_OPTIONS = ["NVIDIA RTX 4090", "NVIDIA RTX 4080", "NVIDIA RTX 4070", "NVIDIA RTX 4060", "NVIDIA RTX 4050", "Intel Arc Graphics", "Intel Iris Xe", "AMD Radeon 780M", "Apple M4 GPU", "לא ידוע"];

export const CUSTOM_BUILD_CATEGORIES = {
    "cpu": { label: "מעבד", options: ["Intel Core i9-14900K", "Intel Core i7-14700K", "AMD Ryzen 9 7950X", "AMD Ryzen 7 7800X3D"] },
    "gpu": { label: "כרטיס מסך", options: ["NVIDIA RTX 4090", "NVIDIA RTX 4080", "AMD RX 7900 XTX"] },
};

export const DESKTOP_SUB_CATEGORIES = [
    { value: "brand_desktop", label: "מחשב מותג", description: "Dell OptiPlex, HP ProDesk וכדומה" },
    { value: "all_in_one", label: "All-in-One", description: "iMac, HP Pavilion AIO וכדומה" },
    { value: "custom_build", label: "בנייה עצמית / גיימינג", description: "בחירת רכיבים מפורטת" }
];

// ---- DATABASES (Synced to PG) ----
export const LAPTOP_DATABASE: Record<string, ComputerModelFamily[]> = {};
export const BRAND_DESKTOP_DATABASE: Record<string, ComputerModelFamily[]> = BDD;
export const ALL_IN_ONE_DATABASE: Record<string, ComputerModelFamily[]> = AD;
export const COMPUTER_DATABASE: Record<string, ComputerModelFamily[]> = {};
export const COMPUTER_MODELS: Record<string, string[]> = {};

export function getSpecOptionsForSubModel(brand: string, family: string, sub: string) {
    return { ram: RAM_OPTIONS, storage: STORAGE_OPTIONS, screen: SCREEN_SIZE_OPTIONS, cpu: [], gpu: [] };
}
