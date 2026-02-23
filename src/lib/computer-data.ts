// =============================================================
//  COMPUTER DATA - Full Hierarchy for Smart Search Engine
//  יצרן → דגם/סדרה → תת-דגם → מפרטים אפשריים
// =============================================================

export type ComputerSubModel = {
    name: string;
    screenSize?: string[];
    cpu?: string[];
    gpu?: string[];
    ram?: string[];
    storage?: string[];
    os?: string[];
    type?: string; // laptop | desktop | gaming | workstation | all-in-one | mini
};

export type ComputerModelFamily = {
    name: string;
    type: string; // laptop | desktop | gaming | workstation | all-in-one | mini
    subModels: ComputerSubModel[];
};

export type ComputerBrand = {
    models: ComputerModelFamily[];
};

// ---- Global spec options ----
export const RAM_OPTIONS = ["4GB", "8GB", "12GB", "16GB", "24GB", "32GB", "48GB", "64GB", "96GB", "128GB"];
export const STORAGE_OPTIONS = ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD", "500GB HDD", "1TB HDD", "2TB HDD", "4TB HDD", "1TB SSD + 1TB HDD", "2TB SSD + 2TB HDD"];
export const SCREEN_SIZE_OPTIONS = ["11\"", "12\"", "13\"", "13.3\"", "13.6\"", "14\"", "14.5\"", "15\"", "15.6\"", "16\"", "17\"", "17.3\"", "24\"", "27\"", "32\""];
export const OS_OPTIONS = ["Windows 11 Home", "Windows 11 Pro", "Windows 10 Home", "Windows 10 Pro", "macOS Sequoia", "macOS Sonoma", "macOS Ventura", "Linux", "ChromeOS", "ללא מערכת הפעלה"];
export const CONDITION_OPTIONS = ["חדש", "כמו חדש", "משומש - מצב מצויין", "משומש - מצב טוב", "משומש - מצב בינוני", "לחלקים / לא עובד"];

export const CPU_OPTIONS: Record<string, string[]> = {
    Intel: [
        "Intel Core Ultra 9 185H", "Intel Core Ultra 7 165H", "Intel Core Ultra 5 125H",
        "Intel Core Ultra 9 285H", "Intel Core Ultra 7 265H", "Intel Core Ultra 5 225H",
        "Intel Core i9-14900HX", "Intel Core i9-13900HX", "Intel Core i9-12900HX",
        "Intel Core i7-14700HX", "Intel Core i7-13700HX", "Intel Core i7-12700H",
        "Intel Core i7-1365U", "Intel Core i7-1355U", "Intel Core i7-1260P",
        "Intel Core i5-14500HX", "Intel Core i5-13500H", "Intel Core i5-12500H",
        "Intel Core i5-1345U", "Intel Core i5-1335U", "Intel Core i5-1240P",
        "Intel Core i3-1315U", "Intel Core i3-1305U",
        "Intel Pentium", "Intel Celeron",
    ],
    AMD: [
        "AMD Ryzen 9 7945HX", "AMD Ryzen 9 7940HS", "AMD Ryzen 9 6900HX",
        "AMD Ryzen 7 7745HX", "AMD Ryzen 7 7735HS", "AMD Ryzen 7 6800H",
        "AMD Ryzen 7 7730U", "AMD Ryzen 7 5825U", "AMD Ryzen 7 5700U",
        "AMD Ryzen 5 7530U", "AMD Ryzen 5 5625U", "AMD Ryzen 5 5500U",
        "AMD Ryzen 5 7600X", "AMD Ryzen 7 7700X", "AMD Ryzen 9 7950X",
        "AMD Ryzen AI 9 HX 370", "AMD Ryzen AI 7 350",
    ],
    Apple: [
        "Apple M4 Pro", "Apple M4 Max", "Apple M4",
        "Apple M3 Pro", "Apple M3 Max", "Apple M3",
        "Apple M2 Pro", "Apple M2 Max", "Apple M2",
        "Apple M1 Pro", "Apple M1 Max", "Apple M1",
    ],
};

export const GPU_OPTIONS = [
    // NVIDIA
    "NVIDIA GeForce RTX 4090", "NVIDIA GeForce RTX 4080", "NVIDIA GeForce RTX 4070 Ti Super",
    "NVIDIA GeForce RTX 4070 Ti", "NVIDIA GeForce RTX 4070 Super", "NVIDIA GeForce RTX 4070",
    "NVIDIA GeForce RTX 4060 Ti", "NVIDIA GeForce RTX 4060",
    "NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop", "NVIDIA GeForce RTX 4070 Laptop",
    "NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4050 Laptop",
    "NVIDIA GeForce RTX 3080 Ti", "NVIDIA GeForce RTX 3080", "NVIDIA GeForce RTX 3070 Ti",
    "NVIDIA GeForce RTX 3070", "NVIDIA GeForce RTX 3060 Ti", "NVIDIA GeForce RTX 3060",
    "NVIDIA GeForce GTX 1650", "NVIDIA GeForce GTX 1660 Ti",
    // AMD
    "AMD Radeon RX 7900 XTX", "AMD Radeon RX 7900 XT", "AMD Radeon RX 7800 XT",
    "AMD Radeon RX 7700 XT", "AMD Radeon RX 7600",
    "AMD Radeon RX 6800 XT", "AMD Radeon RX 6700 XT", "AMD Radeon RX 6600 XT",
    "AMD Radeon RX 7600M XT", "AMD Radeon RX 6700M",
    // Intel
    "Intel Arc A770", "Intel Arc A750", "Intel Arc A380",
    "Intel Iris Xe Graphics", "Intel UHD Graphics",
    // Apple
    "Apple GPU 10-core", "Apple GPU 16-core", "Apple GPU 30-core", "Apple GPU 38-core", "Apple GPU 40-core",
    // Integrated
    "כרטיס מסך משולב (אינטגרלי)",
];

// ---- Brand → Series → Sub-Models ----
export const COMPUTER_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Lenovo": [
        {
            name: "ThinkPad X1",
            type: "laptop",
            subModels: [
                { name: "ThinkPad X1 Carbon Gen 12", screenSize: ["14\""], ram: ["16GB", "32GB", "64GB"], storage: ["512GB SSD", "1TB SSD", "2TB SSD"] },
                { name: "ThinkPad X1 Carbon Gen 11", screenSize: ["14\""], ram: ["16GB", "32GB"], storage: ["512GB SSD", "1TB SSD"] },
                { name: "ThinkPad X1 Yoga Gen 8", screenSize: ["14\""], ram: ["16GB", "32GB"], storage: ["512GB SSD", "1TB SSD"] },
                { name: "ThinkPad X1 Nano Gen 3", screenSize: ["13\""], ram: ["16GB", "32GB"], storage: ["256GB SSD", "512GB SSD"] },
                { name: "ThinkPad X1 Extreme Gen 5", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"], storage: ["512GB SSD", "1TB SSD", "2TB SSD"], gpu: ["NVIDIA GeForce RTX 3080 Laptop", "NVIDIA GeForce RTX 3070 Ti Laptop"] },
            ]
        },
        {
            name: "ThinkPad T",
            type: "laptop",
            subModels: [
                { name: "ThinkPad T14s Gen 4", screenSize: ["14\""] },
                { name: "ThinkPad T14 Gen 4", screenSize: ["14\""] },
                { name: "ThinkPad T16 Gen 2", screenSize: ["16\""] },
                { name: "ThinkPad T14s Gen 3", screenSize: ["14\""] },
                { name: "ThinkPad T14 Gen 3", screenSize: ["14\""] },
            ]
        },
        {
            name: "ThinkPad E",
            type: "laptop",
            subModels: [
                { name: "ThinkPad E14 Gen 5", screenSize: ["14\""] },
                { name: "ThinkPad E14 Gen 4", screenSize: ["14\""] },
                { name: "ThinkPad E16 Gen 1", screenSize: ["16\""] },
                { name: "ThinkPad E15 Gen 4", screenSize: ["15.6\""] },
            ]
        },
        {
            name: "Yoga",
            type: "laptop",
            subModels: [
                { name: "Yoga 9i 14 Gen 9", screenSize: ["14\""], ram: ["16GB", "32GB"] },
                { name: "Yoga 7i 16 Gen 9", screenSize: ["16\""], ram: ["16GB", "32GB"] },
                { name: "Yoga Slim 7x Gen 9", screenSize: ["14.5\""], ram: ["32GB", "64GB"] },
                { name: "Yoga Slim 7 Pro X Gen 7", screenSize: ["14.5\""] },
                { name: "Yoga Book 9i Gen 8", screenSize: ["13.3\""] },
                { name: "Yoga Duet 7", screenSize: ["13\""] },
            ]
        },
        {
            name: "IdeaPad",
            type: "laptop",
            subModels: [
                { name: "IdeaPad Slim 5i Gen 9", screenSize: ["14\"", "16\""], ram: ["8GB", "16GB"] },
                { name: "IdeaPad Slim 3i Gen 8", screenSize: ["14\"", "15.6\""], ram: ["8GB", "16GB"] },
                { name: "IdeaPad Flex 5i Gen 8", screenSize: ["14\"", "16\""] },
                { name: "IdeaPad 5 Pro Gen 7", screenSize: ["14\"", "16\""] },
                { name: "IdeaPad 3 Gen 7", screenSize: ["14\"", "15.6\""] },
            ]
        },
        {
            name: "Legion",
            type: "gaming",
            subModels: [
                { name: "Legion 9i Gen 9", screenSize: ["16\""], ram: ["32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "Legion 7i Gen 9", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4080 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Legion 5i Gen 9", screenSize: ["16\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4070 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "Legion Slim 5i Gen 9", screenSize: ["16\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Legion 5 Gen 8 (AMD)", screenSize: ["16\""], ram: ["16GB", "32GB"] },
                { name: "Legion 5 Pro Gen 8 (AMD)", screenSize: ["16\""], ram: ["16GB", "32GB"] },
            ]
        },
        {
            name: "LOQ",
            type: "gaming",
            subModels: [
                { name: "LOQ 15IAX9", screenSize: ["15.6\""], ram: ["8GB", "16GB"], gpu: ["NVIDIA GeForce RTX 4050 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "LOQ 16IAX9", screenSize: ["16\""], ram: ["16GB", "32GB"] },
            ]
        },
        {
            name: "ThinkCentre",
            type: "desktop",
            subModels: [
                { name: "ThinkCentre M90s", type: "desktop" },
                { name: "ThinkCentre M70s", type: "desktop" },
                { name: "ThinkCentre M Series", type: "desktop" },
            ]
        },
    ],
    "Dell": [
        {
            name: "XPS",
            type: "laptop",
            subModels: [
                { name: "XPS 13 9340 (2024)", screenSize: ["13.4\""], ram: ["16GB", "32GB", "64GB"], storage: ["512GB SSD", "1TB SSD", "2TB SSD"] },
                { name: "XPS 14 9440", screenSize: ["14.5\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4050 Laptop", "Intel Arc"] },
                { name: "XPS 16 9640", screenSize: ["16.3\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4070 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "XPS 15 9530", screenSize: ["15.6\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "XPS 15 9520", screenSize: ["15.6\""], ram: ["16GB", "32GB"] },
                { name: "XPS 13 9315", screenSize: ["13.4\""], ram: ["8GB", "16GB", "32GB"] },
            ]
        },
        {
            name: "Inspiron",
            type: "laptop",
            subModels: [
                { name: "Inspiron 16 7640 2-in-1", screenSize: ["16\""] },
                { name: "Inspiron 16 Plus 7630", screenSize: ["16\""] },
                { name: "Inspiron 15 3535", screenSize: ["15.6\""], ram: ["8GB", "16GB"] },
                { name: "Inspiron 14 5440", screenSize: ["14\""], ram: ["8GB", "16GB"] },
                { name: "Inspiron 13 5330", screenSize: ["13.3\""], ram: ["8GB", "16GB"] },
            ]
        },
        {
            name: "Latitude",
            type: "laptop",
            subModels: [
                { name: "Latitude 7440", screenSize: ["14\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "Latitude 5440", screenSize: ["14\""], ram: ["8GB", "16GB", "32GB"] },
                { name: "Latitude 9440 2-in-1", screenSize: ["14\""] },
                { name: "Latitude 7340 Ultralight", screenSize: ["13.3\""] },
                { name: "Latitude 5340", screenSize: ["13.3\""] },
            ]
        },
        {
            name: "Alienware",
            type: "gaming",
            subModels: [
                { name: "Alienware m18 R2", screenSize: ["18\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "Alienware m16 R2", screenSize: ["16\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4070 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "Alienware X16 R2", screenSize: ["16\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "Alienware X14 R2", screenSize: ["14\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4070 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "Alienware Area-51m", screenSize: ["17.3\""] },
            ]
        },
        {
            name: "Precision",
            type: "workstation",
            subModels: [
                { name: "Precision 5690", screenSize: ["16\""] },
                { name: "Precision 5480", screenSize: ["14\""] },
                { name: "Precision 7680", screenSize: ["16\""] },
                { name: "Precision 7780", screenSize: ["17.3\""] },
            ]
        },
        {
            name: "OptiPlex",
            type: "desktop",
            subModels: [
                { name: "OptiPlex 7000 Tower", type: "desktop" },
                { name: "OptiPlex 5000 Tower", type: "desktop" },
                { name: "OptiPlex 7000 Micro", type: "mini" },
                { name: "OptiPlex 3090 Ultra", type: "mini" },
            ]
        },
        {
            name: "G Series",
            type: "gaming",
            subModels: [
                { name: "Dell G16 7620", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Dell G15 5530", screenSize: ["15.6\""], gpu: ["NVIDIA GeForce RTX 4050 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "Dell G15 5520", screenSize: ["15.6\""] },
            ]
        },
    ],
    "HP": [
        {
            name: "Spectre x360",
            type: "laptop",
            subModels: [
                { name: "Spectre x360 2-in-1 14 (2024)", screenSize: ["14\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "Spectre x360 2-in-1 16 (2024)", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "Spectre x360 14 14-eu0000", screenSize: ["14\""] },
                { name: "Spectre x360 16 16-f2000", screenSize: ["16\""] },
            ]
        },
        {
            name: "Envy",
            type: "laptop",
            subModels: [
                { name: "Envy x360 14 (2024)", screenSize: ["14\""], ram: ["16GB", "32GB"] },
                { name: "Envy x360 15 (2024)", screenSize: ["15.6\""], ram: ["16GB", "32GB"] },
                { name: "Envy 16 (2023)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "Envy Move 23.8 All-in-One", type: "all-in-one", screenSize: ["24\""] },
            ]
        },
        {
            name: "EliteBook",
            type: "laptop",
            subModels: [
                { name: "EliteBook 840 G11", screenSize: ["14\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "EliteBook 860 G11", screenSize: ["16\""] },
                { name: "EliteBook 1040 G11", screenSize: ["14\""] },
                { name: "EliteBook Dragonfly G4", screenSize: ["13.5\""] },
                { name: "EliteBook 840 G10", screenSize: ["14\""] },
                { name: "EliteBook 830 G10", screenSize: ["13.3\""] },
            ]
        },
        {
            name: "ProBook",
            type: "laptop",
            subModels: [
                { name: "ProBook 440 G11", screenSize: ["14\""], ram: ["8GB", "16GB", "32GB"] },
                { name: "ProBook 450 G10", screenSize: ["15.6\""], ram: ["8GB", "16GB"] },
                { name: "ProBook 430 G8", screenSize: ["13.3\""] },
            ]
        },
        {
            name: "Omen",
            type: "gaming",
            subModels: [
                { name: "Omen 16 (2024)", screenSize: ["16.1\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4070 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "Omen Transcend 14", screenSize: ["14\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Omen 16 (2023)", screenSize: ["16.1\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Omen 45L Desktop", type: "desktop" },
            ]
        },
        {
            name: "Victus",
            type: "gaming",
            subModels: [
                { name: "Victus 16 (2024)", screenSize: ["16.1\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4050 Laptop"] },
                { name: "Victus 15 (2023)", screenSize: ["15.6\""] },
            ]
        },
        {
            name: "OmniBook",
            type: "laptop",
            subModels: [
                { name: "OmniBook Ultra 14", screenSize: ["14\""] },
                { name: "OmniBook X 14", screenSize: ["14\""] },
            ]
        },
    ],
    "ASUS": [
        {
            name: "Zenbook",
            type: "laptop",
            subModels: [
                { name: "Zenbook S 13 OLED (UX5304)", screenSize: ["13.3\""], ram: ["16GB", "32GB"] },
                { name: "Zenbook 14 OLED (UX3405)", screenSize: ["14\""], ram: ["16GB", "32GB"] },
                { name: "Zenbook Duo 14 (UX8406)", screenSize: ["14\""], ram: ["32GB"] },
                { name: "Zenbook Pro 14 OLED (UX6404)", screenSize: ["14.5\""] },
                { name: "Zenbook Pro 16X OLED (UX7602)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Zenbook 13 OLED (UM325)", screenSize: ["13.3\""] },
            ]
        },
        {
            name: "Vivobook",
            type: "laptop",
            subModels: [
                { name: "Vivobook S 15 OLED (K5504)", screenSize: ["15.6\""] },
                { name: "Vivobook S 14 OLED (M5406)", screenSize: ["14\""] },
                { name: "Vivobook Pro 16X OLED (N7600)", screenSize: ["16\""] },
                { name: "Vivobook 15 OLED (K513)", screenSize: ["15.6\""] },
                { name: "Vivobook 14 (M413)", screenSize: ["14\""] },
                { name: "Vivobook Flip 14 (TP470)", screenSize: ["14\""] },
            ]
        },
        {
            name: "ROG",
            type: "gaming",
            subModels: [
                { name: "ROG Zephyrus G14 (2024)", screenSize: ["14\""], ram: ["16GB", "32GB", "64GB"], gpu: ["AMD Radeon RX 7600M XT"] },
                { name: "ROG Zephyrus G16 (2024)", screenSize: ["16\""], ram: ["16GB", "32GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "ROG Zephyrus M16 (GU604)", screenSize: ["16\""] },
                { name: "ROG Strix SCAR 16 G634", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "ROG Strix SCAR 18 G834", screenSize: ["18\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "ROG Strix G15 (G513)", screenSize: ["15.6\""] },
                { name: "ROG Flow X13 (GV302)", screenSize: ["13.4\""] },
                { name: "ROG Flow Z13 (GZ301)", screenSize: ["13.4\""] },
            ]
        },
        {
            name: "TUF Gaming",
            type: "gaming",
            subModels: [
                { name: "TUF Gaming A16 (2024)", screenSize: ["16\""], gpu: ["AMD Radeon RX 7700S", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "TUF Gaming F16 (2024)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4070 Laptop", "NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "TUF Gaming A17 (FA707)", screenSize: ["17.3\""] },
                { name: "TUF Gaming A15 (FA507)", screenSize: ["15.6\""] },
                { name: "TUF Gaming F15 (FX507)", screenSize: ["15.6\""] },
            ]
        },
        {
            name: "ProArt",
            type: "workstation",
            subModels: [
                { name: "ProArt Studiobook 16 (H7604)", screenSize: ["16\""], ram: ["32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "ProArt P16 (H7606)", screenSize: ["16\""] },
                { name: "ProArt Studiobook Pro 16 OLED (W7600)", screenSize: ["16\""] },
            ]
        },
        {
            name: "ExpertBook",
            type: "laptop",
            subModels: [
                { name: "ExpertBook B9 OLED (B9403)", screenSize: ["14\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "ExpertBook B5 (B5604)", screenSize: ["16\""] },
                { name: "ExpertBook B3 (B3404)", screenSize: ["14\""] },
            ]
        },
    ],
    "Apple": [
        {
            name: "MacBook Air",
            type: "laptop",
            subModels: [
                { name: "MacBook Air 13\" M4 (2025)", screenSize: ["13\""], ram: ["16GB", "24GB", "32GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"], cpu: ["Apple M4"] },
                { name: "MacBook Air 15\" M4 (2025)", screenSize: ["15\""], ram: ["16GB", "24GB", "32GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"], cpu: ["Apple M4"] },
                { name: "MacBook Air 13\" M3 (2024)", screenSize: ["13\""], ram: ["8GB", "16GB", "24GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"], cpu: ["Apple M3"] },
                { name: "MacBook Air 15\" M3 (2024)", screenSize: ["15\""], ram: ["8GB", "16GB", "24GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD"], cpu: ["Apple M3"] },
                { name: "MacBook Air 13\" M2 (2022)", screenSize: ["13\""], ram: ["8GB", "16GB", "24GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"], cpu: ["Apple M2"] },
                { name: "MacBook Air 13\" M1 (2020)", screenSize: ["13\""], ram: ["8GB", "16GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"], cpu: ["Apple M1"] },
            ]
        },
        {
            name: "MacBook Pro",
            type: "laptop",
            subModels: [
                { name: "MacBook Pro 14\" M4 Pro (2024)", screenSize: ["14\""], ram: ["24GB", "48GB"], storage: ["512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD"], cpu: ["Apple M4 Pro"] },
                { name: "MacBook Pro 14\" M4 Max (2024)", screenSize: ["14\""], ram: ["36GB", "48GB", "64GB", "96GB", "128GB"], cpu: ["Apple M4 Max"] },
                { name: "MacBook Pro 16\" M4 Pro (2024)", screenSize: ["16\""], ram: ["24GB", "48GB"], cpu: ["Apple M4 Pro"] },
                { name: "MacBook Pro 16\" M4 Max (2024)", screenSize: ["16\""], ram: ["36GB", "48GB", "64GB", "96GB", "128GB"], cpu: ["Apple M4 Max"] },
                { name: "MacBook Pro 14\" M3 (2023)", screenSize: ["14\""], ram: ["8GB", "16GB", "18GB", "36GB", "48GB", "96GB", "128GB"], cpu: ["Apple M3", "Apple M3 Pro", "Apple M3 Max"] },
                { name: "MacBook Pro 16\" M3 (2023)", screenSize: ["16\""], ram: ["18GB", "36GB", "48GB", "96GB", "128GB"], cpu: ["Apple M3 Pro", "Apple M3 Max"] },
                { name: "MacBook Pro 13\" M2 (2022)", screenSize: ["13\""], ram: ["8GB", "16GB", "24GB"], cpu: ["Apple M2"] },
                { name: "MacBook Pro 14\" M2 (2023)", screenSize: ["14\""], ram: ["16GB", "32GB", "96GB"], cpu: ["Apple M2 Pro", "Apple M2 Max"] },
                { name: "MacBook Pro 16\" M2 (2023)", screenSize: ["16\""], ram: ["16GB", "32GB", "96GB"], cpu: ["Apple M2 Pro", "Apple M2 Max"] },
                { name: "MacBook Pro 13\" M1 (2020)", screenSize: ["13\""], ram: ["8GB", "16GB"], cpu: ["Apple M1"] },
                { name: "MacBook Pro 14\" M1 (2021)", screenSize: ["14\""], ram: ["16GB", "32GB"], cpu: ["Apple M1 Pro", "Apple M1 Max"] },
                { name: "MacBook Pro 16\" M1 (2021)", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"], cpu: ["Apple M1 Pro", "Apple M1 Max"] },
                { name: "MacBook Pro Intel (2019)", screenSize: ["13\"", "15\"", "16\""] },
            ]
        },
        {
            name: "Mac Mini",
            type: "desktop",
            subModels: [
                { name: "Mac Mini M4 Pro (2024)", ram: ["24GB", "48GB", "64GB"], cpu: ["Apple M4 Pro"] },
                { name: "Mac Mini M4 (2024)", ram: ["16GB", "32GB", "64GB"], cpu: ["Apple M4"] },
                { name: "Mac Mini M2 Pro (2023)", ram: ["16GB", "32GB"], cpu: ["Apple M2 Pro"] },
                { name: "Mac Mini M2 (2023)", ram: ["8GB", "16GB", "24GB"], cpu: ["Apple M2"] },
                { name: "Mac Mini M1 (2020)", ram: ["8GB", "16GB"], cpu: ["Apple M1"] },
            ]
        },
        {
            name: "Mac Studio",
            type: "desktop",
            subModels: [
                { name: "Mac Studio M4 Max (2025)", ram: ["36GB", "64GB", "96GB", "128GB"], cpu: ["Apple M4 Max"] },
                { name: "Mac Studio M4 Ultra (2025)", ram: ["96GB", "128GB", "192GB"], cpu: ["Apple M4 Ultra"] },
                { name: "Mac Studio M2 Max (2023)", ram: ["32GB", "64GB", "96GB"], cpu: ["Apple M2 Max"] },
                { name: "Mac Studio M2 Ultra (2023)", ram: ["64GB", "128192GB"], cpu: ["Apple M2 Ultra"] },
                { name: "Mac Studio M1 Max (2022)", ram: ["32GB", "64GB"], cpu: ["Apple M1 Max"] },
                { name: "Mac Studio M1 Ultra (2022)", ram: ["64GB", "128GB"], cpu: ["Apple M1 Ultra"] },
            ]
        },
        {
            name: "iMac",
            type: "all-in-one",
            subModels: [
                { name: "iMac 24\" M4 (2024)", screenSize: ["24\""], ram: ["16GB", "24GB", "32GB"], cpu: ["Apple M4"] },
                { name: "iMac 24\" M3 (2023)", screenSize: ["24\""], ram: ["8GB", "16GB", "24GB"], cpu: ["Apple M3"] },
                { name: "iMac 24\" M1 (2021)", screenSize: ["24\""], ram: ["8GB", "16GB"], cpu: ["Apple M1"] },
            ]
        },
    ],
    "MSI": [
        {
            name: "Stealth",
            type: "laptop",
            subModels: [
                { name: "Stealth 16 AI Studio (2024)", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4080 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Stealth 14 AI Studio", screenSize: ["14\""] },
                { name: "Stealth 15M A12UE", screenSize: ["15.6\""] },
            ]
        },
        {
            name: "Raider",
            type: "gaming",
            subModels: [
                { name: "Raider GE78 HX (2024)", screenSize: ["17\""], ram: ["32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop"] },
                { name: "Raider GE68 HX (2024)", screenSize: ["16\""], ram: ["16GB", "32GB", "64GB"], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "Raider GE76 12UGS", screenSize: ["17.3\""] },
            ]
        },
        {
            name: "Katana",
            type: "gaming",
            subModels: [
                { name: "Katana 17 B13VEK", screenSize: ["17.3\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop"] },
                { name: "Katana 15 B13VEK", screenSize: ["15.6\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop"] },
            ]
        },
        {
            name: "Cyborg",
            type: "gaming",
            subModels: [
                { name: "Cyborg 15 A13SUX", screenSize: ["15.6\""], gpu: ["NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Cyborg 15 A12VF", screenSize: ["15.6\""] },
            ]
        },
        {
            name: "Creator / Summit",
            type: "workstation",
            subModels: [
                { name: "Creator Z17 HX Studio (2023)", screenSize: ["17\""] },
                { name: "Creator 15 A12UET", screenSize: ["15.6\""] },
                { name: "Summit E16 Flip Evo A13MT", screenSize: ["16\""] },
            ]
        },
        {
            name: "Aegis Desktop",
            type: "desktop",
            subModels: [
                { name: "Aegis RS 13NUF5", type: "desktop" },
                { name: "Aegis Ti5 13NUG5", type: "desktop" },
                { name: "Aegis 3 10SA", type: "desktop" },
            ]
        },
    ],
    "Acer": [
        {
            name: "Swift",
            type: "laptop",
            subModels: [
                { name: "Swift X 14 (2024)", screenSize: ["14\""], gpu: ["NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Swift Go 14 (2024)", screenSize: ["14\""], ram: ["16GB", "32GB"] },
                { name: "Swift Go 16 (2024)", screenSize: ["16\""] },
                { name: "Swift Edge 16", screenSize: ["16\""] },
                { name: "Swift 5 (SF514)", screenSize: ["14\""] },
                { name: "Swift 3 (SF314)", screenSize: ["14\""] },
            ]
        },
        {
            name: "Predator",
            type: "gaming",
            subModels: [
                { name: "Predator Helios Neo 14 (2024)", screenSize: ["14\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Predator Helios 16 (2024)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4080 Laptop", "NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Predator Helios 18 (2024)", screenSize: ["18\""], gpu: ["NVIDIA GeForce RTX 4090 Laptop", "NVIDIA GeForce RTX 4080 Laptop"] },
                { name: "Predator Triton Neo 16", screenSize: ["16\""] },
                { name: "Predator Helios 300 (2022)", screenSize: ["15.6\""] },
            ]
        },
        {
            name: "Nitro",
            type: "gaming",
            subModels: [
                { name: "Nitro 16 AN16-51 (2024)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "AMD Radeon RX 7700S"] },
                { name: "Nitro 5 AN515 (2023)", screenSize: ["15.6\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop", "NVIDIA GeForce RTX 4050 Laptop"] },
            ]
        },
        {
            name: "Aspire",
            type: "laptop",
            subModels: [
                { name: "Aspire 7 A717 (2024)", screenSize: ["17.3\""] },
                { name: "Aspire 5 A515 (2023)", screenSize: ["15.6\""], ram: ["8GB", "16GB"] },
                { name: "Aspire 3 A315 (2023)", screenSize: ["15.6\""], ram: ["8GB"] },
                { name: "Aspire Vero 16 (2024)", screenSize: ["16\""] },
            ]
        },
        {
            name: "Spin",
            type: "laptop",
            subModels: [
                { name: "Spin 14 (SP14-51MTN)", screenSize: ["14\""] },
                { name: "Spin 714 (SP714-51M)", screenSize: ["14\""] },
            ]
        },
    ],
    "Microsoft": [
        {
            name: "Surface Pro",
            type: "laptop",
            subModels: [
                { name: "Surface Pro 11 (Copilot+ PC)", screenSize: ["13\""], ram: ["16GB", "32GB", "64GB"], storage: ["256GB SSD", "512GB SSD", "1TB SSD"] },
                { name: "Surface Pro 10 for Business", screenSize: ["13\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "Surface Pro 9", screenSize: ["13\""], ram: ["8GB", "16GB", "32GB"] },
                { name: "Surface Pro 8", screenSize: ["13\""], ram: ["8GB", "16GB", "32GB"] },
                { name: "Surface Pro 7+", screenSize: ["12.3\""] },
                { name: "Surface Pro 7", screenSize: ["12.3\""] },
            ]
        },
        {
            name: "Surface Laptop",
            type: "laptop",
            subModels: [
                { name: "Surface Laptop 7 (Copilot+ PC)", screenSize: ["13.8\"", "15\""], ram: ["16GB", "32GB", "64GB"] },
                { name: "Surface Laptop 6 for Business", screenSize: ["13.5\"", "15\""] },
                { name: "Surface Laptop 5", screenSize: ["13.5\"", "15\""], ram: ["8GB", "16GB", "32GB"] },
                { name: "Surface Laptop 4", screenSize: ["13.5\"", "15\""] },
                { name: "Surface Laptop Go 3", screenSize: ["12.4\""] },
                { name: "Surface Laptop Studio 2", screenSize: ["14.4\""], gpu: ["NVIDIA GeForce RTX 4060 Laptop"] },
            ]
        },
    ],
    "Samsung": [
        {
            name: "Galaxy Book",
            type: "laptop",
            subModels: [
                { name: "Galaxy Book5 Ultra (2025)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Galaxy Book5 Pro 360 (2025)", screenSize: ["14\"", "16\""] },
                { name: "Galaxy Book5 Pro (2025)", screenSize: ["14\"", "16\""] },
                { name: "Galaxy Book5 (2025)", screenSize: ["14\"", "16\""] },
                { name: "Galaxy Book4 Ultra (2024)", screenSize: ["16\""], gpu: ["NVIDIA GeForce RTX 4070 Laptop"] },
                { name: "Galaxy Book4 Pro 360 (2024)", screenSize: ["14\"", "16\""] },
                { name: "Galaxy Book4 Pro (2024)", screenSize: ["14\"", "16\""] },
                { name: "Galaxy Book4 (2024)", screenSize: ["14\"", "15.6\""] },
                { name: "Galaxy Book3 Ultra (2023)", screenSize: ["16\""] },
                { name: "Galaxy Book3 Pro 360 (2023)", screenSize: ["13.3\"", "16\""] },
                { name: "Galaxy Book3 Pro (2023)", screenSize: ["14\"", "16\""] },
                { name: "Galaxy Book3 360 (2023)", screenSize: ["13.3\"", "15.6\""] },
            ]
        },
    ],
    "אחר (Other)": [
        {
            name: "אחר",
            type: "laptop",
            subModels: [{ name: "דגם אחר / לא ברשימה" }]
        }
    ]
};

// Legacy export for backward compatibility
export const COMPUTER_MODELS: Record<string, string[]> = Object.fromEntries(
    Object.entries(COMPUTER_DATABASE).map(([brand, families]) => [
        brand,
        families.flatMap(f => f.subModels.map(s => s.name))
    ])
);

export function getBrandsForSearch(query: string): string[] {
    const q = query.toLowerCase().trim();
    if (!q) return Object.keys(COMPUTER_DATABASE);
    return Object.keys(COMPUTER_DATABASE).filter(brand =>
        brand.toLowerCase().includes(q)
    );
}

export function getModelFamiliesForBrand(brand: string): ComputerModelFamily[] {
    return COMPUTER_DATABASE[brand] || [];
}

export function getSubModelsForFamily(brand: string, family: string): ComputerSubModel[] {
    const fam = (COMPUTER_DATABASE[brand] || []).find(f => f.name === family);
    return fam?.subModels || [];
}

export function getSpecOptionsForSubModel(brand: string, family: string, subModel: string) {
    const fam = (COMPUTER_DATABASE[brand] || []).find(f => f.name === family);
    const sub = fam?.subModels.find(s => s.name === subModel);
    return {
        ram: sub?.ram || RAM_OPTIONS,
        storage: sub?.storage || STORAGE_OPTIONS,
        screen: sub?.screenSize || SCREEN_SIZE_OPTIONS,
        cpu: sub?.cpu || (brand === "Apple" ? CPU_OPTIONS.Apple : [...CPU_OPTIONS.Intel, ...CPU_OPTIONS.AMD]),
        gpu: sub?.gpu || GPU_OPTIONS,
    };
}
