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

export const SAMSUNG_MODELS: PhoneModel[] = [];
export const IPHONE_MODELS: PhoneModel[] = [];
export const XIAOMI_MODELS: PhoneModel[] = [];
export const GOOGLE_PIXEL_MODELS: PhoneModel[] = [];

export const ALL_PHONE_MODELS: PhoneModel[] = [];

export function findPhoneModel(text: string): PhoneModel | null { return null; }
export function correctStorageSize(size: number, model: PhoneModel): number { return size; }
