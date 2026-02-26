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
    type?: string;
    battery?: string;
    ports?: string;
    weight?: string;
    release_year?: string;
    notes?: string;
    display?: string;
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
    "Intel": [
        "Intel Core Ultra 9 185H",
        "Intel Core Ultra 7 165H",
        "Intel Core Ultra 5 125H",
        "Intel Core Ultra 9 285H",
        "Intel Core Ultra 7 265H",
        "Intel Core Ultra 5 225H",
        "Intel Core i9-14900HX",
        "Intel Core i9-13900HX",
        "Intel Core i9-12900HX",
        "Intel Core i7-14700HX",
        "Intel Core i7-13700HX",
        "Intel Core i7-12700H",
        "Intel Core i7-1365U",
        "Intel Core i7-1355U",
        "Intel Core i7-1260P",
        "Intel Core i5-14500HX",
        "Intel Core i5-13500H",
        "Intel Core i5-12500H",
        "Intel Core i5-1345U",
        "Intel Core i5-1335U",
        "Intel Core i5-1240P",
        "Intel Core i3-1315U",
        "Intel Core i3-1305U",
        "Intel Pentium",
        "Intel Celeron",
        "לא ידוע"
    ],
    "AMD": [
        "AMD Ryzen 9 7945HX",
        "AMD Ryzen 9 7940HS",
        "AMD Ryzen 9 6900HX",
        "AMD Ryzen 7 7745HX",
        "AMD Ryzen 7 7735HS",
        "AMD Ryzen 7 6800H",
        "AMD Ryzen 7 7730U",
        "AMD Ryzen 7 5825U",
        "AMD Ryzen 7 5700U",
        "AMD Ryzen 5 7530U",
        "AMD Ryzen 5 5625U",
        "AMD Ryzen 5 5500U",
        "AMD Ryzen 5 7600X",
        "AMD Ryzen 7 7700X",
        "AMD Ryzen 9 7950X",
        "AMD Ryzen AI 9 HX 370",
        "AMD Ryzen AI 7 350",
        "לא ידוע"
    ],
    "Apple": [
        "Apple M4 Pro",
        "Apple M4 Max",
        "Apple M4",
        "Apple M3 Pro",
        "Apple M3 Max",
        "Apple M3",
        "Apple M2 Pro",
        "Apple M2 Max",
        "Apple M2",
        "Apple M1 Pro",
        "Apple M1 Max",
        "Apple M1",
        "לא ידוע"
    ]
};

export const GPU_OPTIONS = [
    "NVIDIA GeForce RTX 4090",
    "NVIDIA GeForce RTX 4080",
    "NVIDIA GeForce RTX 4070 Ti Super",
    "NVIDIA GeForce RTX 4070 Ti",
    "NVIDIA GeForce RTX 4070 Super",
    "NVIDIA GeForce RTX 4070",
    "NVIDIA GeForce RTX 4060 Ti",
    "NVIDIA GeForce RTX 4060",
    "NVIDIA GeForce RTX 4090 Laptop",
    "NVIDIA GeForce RTX 4080 Laptop",
    "NVIDIA GeForce RTX 4070 Laptop",
    "NVIDIA GeForce RTX 4060 Laptop",
    "NVIDIA GeForce RTX 4050 Laptop",
    "NVIDIA GeForce RTX 3080 Ti",
    "NVIDIA GeForce RTX 3080",
    "NVIDIA GeForce RTX 3070 Ti",
    "NVIDIA GeForce RTX 3070",
    "NVIDIA GeForce RTX 3060 Ti",
    "NVIDIA GeForce RTX 3060",
    "NVIDIA GeForce GTX 1650",
    "NVIDIA GeForce GTX 1660 Ti",
    "AMD Radeon RX 7900 XTX",
    "AMD Radeon RX 7900 XT",
    "AMD Radeon RX 7800 XT",
    "AMD Radeon RX 7700 XT",
    "AMD Radeon RX 7600",
    "AMD Radeon RX 6800 XT",
    "AMD Radeon RX 6700 XT",
    "AMD Radeon RX 6600 XT",
    "AMD Radeon RX 7600M XT",
    "AMD Radeon RX 6700M",
    "Intel Arc A770",
    "Intel Arc A750",
    "Intel Arc A380",
    "Intel Iris Xe Graphics",
    "Intel UHD Graphics",
    "Apple GPU 10-core",
    "Apple GPU 16-core",
    "Apple GPU 30-core",
    "Apple GPU 38-core",
    "Apple GPU 40-core",
    "כרטיס מסך משולב (אינטגרלי)",
    "לא ידוע"
];

// ============================================================
//  CUSTOM BUILD OPTIONS (בנייה עצמית)
// ============================================================

export const DESKTOP_CPU_OPTIONS = [
    "Intel Core i9-14900K",
    "Intel Core i9-14900KF",
    "Intel Core i9-14900",
    "Intel Core i7-14700K",
    "Intel Core i7-14700KF",
    "Intel Core i7-14700",
    "Intel Core i5-14600K",
    "Intel Core i5-14600KF",
    "Intel Core i5-14500",
    "Intel Core i5-14400",
    "Intel Core i3-14100",
    "Intel Core i3-14100F",
    "Intel Core i9-13900K",
    "Intel Core i9-13900KF",
    "Intel Core i7-13700K",
    "Intel Core i7-13700KF",
    "Intel Core i5-13600K",
    "Intel Core i5-13600KF",
    "Intel Core i5-13400",
    "Intel Core i9-12900K",
    "Intel Core i7-12700K",
    "Intel Core i5-12600K",
    "Intel Core i5-12400",
    "AMD Ryzen 9 7950X",
    "AMD Ryzen 9 7950X3D",
    "AMD Ryzen 9 7900X",
    "AMD Ryzen 9 7900",
    "AMD Ryzen 7 7800X3D",
    "AMD Ryzen 7 7700X",
    "AMD Ryzen 7 7700",
    "AMD Ryzen 5 7600X",
    "AMD Ryzen 5 7600",
    "AMD Ryzen 9 9950X",
    "AMD Ryzen 9 9900X",
    "AMD Ryzen 7 9700X",
    "AMD Ryzen 5 9600X",
    "AMD Ryzen 9 5950X",
    "AMD Ryzen 9 5900X",
    "AMD Ryzen 7 5800X",
    "AMD Ryzen 7 5800X3D",
    "AMD Ryzen 7 5700X",
    "AMD Ryzen 5 5600X",
    "AMD Ryzen 5 5600",
    "AMD Ryzen Threadripper PRO 7995WX",
    "AMD Ryzen Threadripper PRO 7975WX",
    "Intel Xeon W5-3435X",
    "Intel Xeon W3-2435",
    "אחר",
    "לא ידוע"
];
export const MOTHERBOARD_OPTIONS = {
    "chipsets": [
        "Z790",
        "Z690",
        "B760",
        "B660",
        "H770",
        "H670",
        "H610",
        "X670E",
        "X670",
        "B650E",
        "B650",
        "A620",
        "X570",
        "B550",
        "A520",
        "W790 (Intel)",
        "WRX90 (AMD)",
        "אחר",
        "לא ידוע"
    ],
    "sockets": [
        "LGA 1700 (Intel 12-14th Gen)",
        "LGA 1851 (Intel Arrow Lake)",
        "AM5 (AMD Ryzen 7000/9000)",
        "AM4 (AMD Ryzen 3000/5000)",
        "sTR5 (Threadripper PRO)",
        "אחר"
    ],
    "formFactors": [
        "ATX",
        "Micro-ATX (mATX)",
        "Mini-ITX",
        "E-ATX"
    ],
    "brands": [
        "ASUS",
        "MSI",
        "Gigabyte",
        "ASRock",
        "NZXT",
        "EVGA",
        "Biostar",
        "אחר"
    ],
    "features": [
        "Wi-Fi 7 + Bluetooth 5.4",
        "Wi-Fi 6E + Bluetooth 5.3",
        "Wi-Fi 6 + Bluetooth 5.2",
        "ללא Wi-Fi (חוטי בלבד)"
    ],
    "ethernet": [
        "10GbE",
        "5GbE",
        "2.5GbE",
        "1GbE",
        "לא ידוע"
    ],
    "m2Slots": [
        "1",
        "2",
        "3",
        "4",
        "5+"
    ],
    "pcieGen": [
        "PCIe 5.0",
        "PCIe 4.0",
        "PCIe 3.0"
    ]
};
export const COOLER_OPTIONS = {
    "types": [
        "קירור מים AIO 360mm",
        "קירור מים AIO 280mm",
        "קירור מים AIO 240mm",
        "קירור מים AIO 120mm",
        "קירור מים Custom Loop",
        "קירור אוויר מסיבי (Tower)",
        "קירור אוויר בינוני",
        "קירור אוויר בסיסי (Stock)",
        "אחר"
    ],
    "brands": [
        "Noctua",
        "be quiet!",
        "Corsair",
        "NZXT",
        "Arctic",
        "Cooler Master",
        "DeepCool",
        "EK",
        "Lian Li",
        "AMD Stock (Wraith)",
        "Intel Stock",
        "אחר"
    ],
    "models": [
        "Noctua NH-D15",
        "Noctua NH-U12S",
        "Noctua NH-D15S",
        "be quiet! Dark Rock Pro 5",
        "be quiet! Dark Rock 4",
        "DeepCool AK620",
        "DeepCool Assassin IV",
        "Cooler Master Hyper 212",
        "Thermalright Peerless Assassin 120",
        "Corsair iCUE H150i Elite",
        "Corsair iCUE H100i Elite",
        "NZXT Kraken X73",
        "NZXT Kraken X63",
        "NZXT Kraken Elite 360",
        "Arctic Liquid Freezer II 360",
        "Arctic Liquid Freezer II 280",
        "Lian Li Galahad II Trinity 360",
        "DeepCool LT720",
        "DeepCool LS720",
        "EK-AIO 360 D-RGB",
        "Cooler Master MasterLiquid ML360R",
        "AMD Wraith Prism",
        "AMD Wraith Stealth",
        "Intel Stock Cooler",
        "אחר"
    ]
};
export const PSU_OPTIONS = {
    "wattages": [
        "450W",
        "500W",
        "550W",
        "600W",
        "650W",
        "700W",
        "750W",
        "850W",
        "1000W",
        "1200W",
        "1300W",
        "1500W",
        "1600W",
        "2000W"
    ],
    "efficiencyRatings": [
        "80 Plus Titanium",
        "80 Plus Platinum",
        "80 Plus Gold",
        "80 Plus Silver",
        "80 Plus Bronze",
        "80 Plus (White)",
        "ללא דירוג",
        "לא ידוע"
    ],
    "modularity": [
        "Full Modular (כל הכבלים נתקעים)",
        "Semi Modular (חלק קבועים)",
        "Non Modular (הכל קבוע)"
    ],
    "standards": [
        "ATX 3.1 (12VHPWR / 12V-2x6)",
        "ATX 3.0 (12VHPWR)",
        "ATX 2.x (רגיל)",
        "SFX (מיני)",
        "SFX-L",
        "לא ידוע"
    ],
    "brands": [
        "Corsair",
        "Seasonic",
        "EVGA",
        "be quiet!",
        "Cooler Master",
        "Thermaltake",
        "NZXT",
        "MSI",
        "Lian Li",
        "FSP",
        "Super Flower",
        "XPG",
        "אחר"
    ]
};
export const CASE_OPTIONS = {
    "formFactors": [
        "Full Tower",
        "Mid Tower",
        "Mini Tower / Micro-ATX",
        "Mini-ITX / SFF",
        "Open Frame / Test Bench",
        "HTPC / Slimline"
    ],
    "airflow": [
        "Mesh קדמי (זרימת אוויר מצוינת)",
        "Mesh + זכוכית צדדית",
        "זכוכית מחוזקת (סגור)",
        "פתוח לגמרי (Open Air)",
        "לא ידוע"
    ],
    "brands": [
        "Lian Li",
        "Corsair",
        "NZXT",
        "Fractal Design",
        "Phanteks",
        "be quiet!",
        "Cooler Master",
        "Thermaltake",
        "HYTE",
        "Meshify (Fractal)",
        "InWin",
        "Montech",
        "DeepCool",
        "אחר"
    ],
    "frontPanelIO": [
        "USB-C + 2× USB-A 3.2 + Audio",
        "USB-C + USB-A 3.0 + Audio",
        "2× USB-A 3.0 + Audio",
        "USB-C + USB-A + Audio",
        "בסיסי (USB-A בלבד)",
        "לא ידוע"
    ]
};
export const RAM_TYPE_OPTIONS = [
    "DDR5-8000 (CL36)",
    "DDR5-7200 (CL34)",
    "DDR5-6400 (CL32)",
    "DDR5-6000 (CL30)",
    "DDR5-5600 (CL36)",
    "DDR5-5200 (CL40)",
    "DDR5-4800 (CL40)",
    "DDR4-3600 (CL16)",
    "DDR4-3200 (CL16)",
    "DDR4-3000 (CL15)",
    "DDR4-2666 (CL19)",
    "DDR4-2400",
    "אחר",
    "לא ידוע"
];
export const RAM_CONFIG_OPTIONS = [
    "2×8GB (16GB Dual Channel)",
    "2×16GB (32GB Dual Channel)",
    "2×32GB (64GB Dual Channel)",
    "4×8GB (32GB Quad Channel)",
    "4×16GB (64GB Quad Channel)",
    "4×32GB (128GB Quad Channel)",
    "1×8GB (8GB Single)",
    "1×16GB (16GB Single)",
    "1×32GB (32GB Single)",
    "אחר"
];
export const STORAGE_TYPE_OPTIONS = [
    "NVMe M.2 Gen5 500GB",
    "NVMe M.2 Gen5 1TB",
    "NVMe M.2 Gen5 2TB",
    "NVMe M.2 Gen5 4TB",
    "NVMe M.2 Gen4 500GB",
    "NVMe M.2 Gen4 1TB",
    "NVMe M.2 Gen4 2TB",
    "NVMe M.2 Gen4 4TB",
    "NVMe M.2 Gen3 256GB",
    "NVMe M.2 Gen3 500GB",
    "NVMe M.2 Gen3 1TB",
    "SATA SSD 2.5\" 256GB",
    "SATA SSD 2.5\" 500GB",
    "SATA SSD 2.5\" 1TB",
    "SATA SSD 2.5\" 2TB",
    "HDD 3.5\" 1TB (7200RPM)",
    "HDD 3.5\" 2TB (7200RPM)",
    "HDD 3.5\" 4TB",
    "HDD 3.5\" 8TB",
    "אין",
    "אחר"
];

// ---- Brand → Series → Sub-Models ----

export const LAPTOP_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Lenovo": [
        {
            "name": "ThinkPad X1",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ThinkPad X1 Carbon Gen 12",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ]
                },
                {
                    "name": "ThinkPad X1 Carbon Gen 11",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ]
                },
                {
                    "name": "ThinkPad X1 Yoga Gen 8",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ]
                },
                {
                    "name": "ThinkPad X1 Nano Gen 3",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD"
                    ]
                },
                {
                    "name": "ThinkPad X1 Extreme Gen 5",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Laptop",
                        "NVIDIA GeForce RTX 3070 Ti Laptop"
                    ]
                },
                {
                    "name": "Lenovo ThinkPad X1 Carbon Gen 11",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "21HM0065US",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.12kg",
                    "release_year": "2023",
                    "notes": "Ultra-lightweight business flagship, MIL-SPEC",
                    "display": "14\" WUXGA IPS, 1920×1200, 400 nits"
                },
                {
                    "name": "Lenovo ThinkPad X1 Carbon Gen 12",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 165U"
                    ],
                    "gpu": [
                        "Intel Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5x"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "21KC001KUS",
                            "cpu": [
                                "Intel Core Ultra 7 165U"
                            ],
                            "gpu": [
                                "Intel Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5x"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.12kg",
                    "release_year": "2024",
                    "notes": "Meteor Lake CPU, AI features, lightest in class",
                    "display": "14\" WUXGA IPS, 1920×1200, 400 nits"
                }
            ]
        },
        {
            "name": "ThinkPad T",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ThinkPad T14s Gen 4",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "ThinkPad T14 Gen 4",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "ThinkPad T16 Gen 2",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "ThinkPad T14s Gen 3",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "ThinkPad T14 Gen 3",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Lenovo ThinkPad T14 Gen 4",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7730U"
                    ],
                    "gpu": [
                        "AMD Radeon 610M"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "52.5Wh, up to 14h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, RJ45, 3.5mm jack",
                    "weight": "1.37kg",
                    "release_year": "2023",
                    "notes": "Business workhorse, Ryzen version",
                    "display": "14\" WUXGA IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "21HD0000US",
                            "cpu": [
                                "AMD Ryzen 7 7730U"
                            ],
                            "gpu": [
                                "AMD Radeon 610M"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad T14 Gen 3",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 PRO 6650U"
                    ],
                    "gpu": [
                        "AMD Radeon 660M"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "52.5Wh, up to 14h",
                    "ports": "2× USB-C, 2× USB-A, HDMI, RJ45",
                    "weight": "1.37kg",
                    "release_year": "2022",
                    "notes": "Business workhorse, AMD version",
                    "display": "14\" WUXGA IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "21AH00BSUS",
                            "cpu": [
                                "AMD Ryzen 5 PRO 6650U"
                            ],
                            "gpu": [
                                "AMD Radeon 660M"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad T14s Gen 4",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "57.5Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.27kg",
                    "release_year": "2023",
                    "notes": "Slim T-series, soldered RAM",
                    "display": "14\" WUXGA IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "21F6003WUS",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ThinkPad E",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ThinkPad E14 Gen 5",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "ThinkPad E14 Gen 4",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "ThinkPad E16 Gen 1",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "ThinkPad E15 Gen 4",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "Lenovo ThinkPad E14 Gen 5",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR5"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "57Wh, up to 13h",
                    "ports": "2× USB-C, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.51kg",
                    "release_year": "2023",
                    "notes": "Entry business laptop, good keyboard",
                    "display": "14\" WUXGA IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "21JR001LUS",
                            "cpu": [
                                "Intel Core i5-1335U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR5"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Yoga",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Yoga 9i 14 Gen 9",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Yoga 7i 16 Gen 9",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Yoga Slim 7x Gen 9",
                    "screenSize": [
                        "14.5\""
                    ],
                    "ram": [
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "Yoga Slim 7 Pro X Gen 7",
                    "screenSize": [
                        "14.5\""
                    ]
                },
                {
                    "name": "Yoga Book 9i Gen 8",
                    "screenSize": [
                        "13.3\""
                    ]
                },
                {
                    "name": "Yoga Duet 7",
                    "screenSize": [
                        "13\""
                    ]
                },
                {
                    "name": "Lenovo Yoga 9i Gen 8",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "83B1002WUS",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "75Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, 3.5mm jack",
                    "weight": "1.43kg",
                    "release_year": "2023",
                    "notes": "Premium 2-in-1, OLED touch, JBL speakers",
                    "display": "14\" 2.8K OLED, 2880×1800, touch, 90Hz"
                },
                {
                    "name": "Lenovo Yoga 7i Gen 7",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1255U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "71Wh, up to 13h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, SD card",
                    "weight": "1.48kg",
                    "release_year": "2022",
                    "notes": "2-in-1 OLED, premium feel",
                    "display": "14\" 2.8K OLED, 2880×1800, touch, 90Hz",
                    "skus": [
                        {
                            "id": "82BJ009WUS",
                            "cpu": [
                                "Intel Core i7-1255U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Yoga 9i Gen 7",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "75Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, 2× USB-A",
                    "weight": "1.43kg",
                    "release_year": "2022",
                    "notes": "Premium 2-in-1, Bose speakers",
                    "display": "14\" 2.8K OLED, 2880×1800, touch, 90Hz",
                    "skus": [
                        {
                            "id": "82MK00BLUS",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Yoga Slim 7 Pro X",
                    "screenSize": [
                        "14.5\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 6800HS"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 12h",
                    "ports": "USB-C, 2× USB-A, HDMI, SD card",
                    "weight": "1.49kg",
                    "release_year": "2022",
                    "notes": "Ultra-slim discrete GPU",
                    "display": "14.5\" 3K IPS, 3072×1920, 120Hz",
                    "skus": [
                        {
                            "id": "82TL000LUS",
                            "cpu": [
                                "AMD Ryzen 7 6800HS"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad X1 Yoga Gen 7",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1265U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI",
                    "weight": "1.4kg",
                    "release_year": "2022",
                    "notes": "2-in-1 business, stylus included",
                    "display": "14\" WUXGA IPS, 1920×1200, touch, 400 nits",
                    "skus": [
                        {
                            "id": "21CD0029US",
                            "cpu": [
                                "Intel Core i7-1265U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad X1 Yoga Gen 8",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI",
                    "weight": "1.4kg",
                    "release_year": "2023",
                    "notes": "OLED 2-in-1 business ultrabook",
                    "display": "14\" 2.8K OLED, 2880×1800, touch, 400 nits",
                    "skus": [
                        {
                            "id": "21HQ001AUS",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "IdeaPad",
            "type": "laptop",
            "subModels": [
                {
                    "name": "IdeaPad Slim 5i Gen 9",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "IdeaPad Slim 3i Gen 8",
                    "screenSize": [
                        "14\"",
                        "15.6\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "IdeaPad Flex 5i Gen 8",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "IdeaPad 5 Pro Gen 7",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ],
                    "skus": [
                        {
                            "id": "82LX00BTIV",
                            "screenSize": [
                                "16\""
                            ],
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "ram": [
                                "16GB"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "gpu": [
                                "NVIDIA GeForce GTX 1650"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "IdeaPad 3 Gen 7",
                    "screenSize": [
                        "14\"",
                        "15.6\""
                    ]
                },
                {
                    "name": "Lenovo IdeaPad 5 Pro 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 6800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "82WK00BQUS",
                            "cpu": [
                                "AMD Ryzen 7 6800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "75Wh, up to 12h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card, 3.5mm jack",
                    "weight": "2.0kg",
                    "release_year": "2022",
                    "notes": "Great display-to-price ratio",
                    "display": "16\" 2.5K IPS, 2560×1600, 165Hz"
                },
                {
                    "name": "Lenovo IdeaPad 1 15IJL7",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Celeron N4500, 2-core, up to 2.8GHz"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 600"
                    ],
                    "ram": [
                        "4GB DDR4 (soldered)"
                    ],
                    "storage": [
                        "128GB eMMC"
                    ],
                    "os": [
                        "Windows 11 Home in S mode"
                    ],
                    "skus": [
                        {
                            "id": "82V700DGIX",
                            "cpu": [
                                "Intel Celeron N4500, 2-core, up to 2.8GHz"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 600"
                            ],
                            "ram": [
                                "4GB DDR4 (soldered)"
                            ],
                            "storage": [
                                "128GB eMMC"
                            ],
                            "os": [
                                "Windows 11 Home in S mode"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "38Wh, up to 7h",
                    "ports": "USB-A 3.2, USB-A 2.0, HDMI 1.4, SD card, 3.5mm jack",
                    "weight": "1.7kg, 359×236×19.9mm",
                    "release_year": "2022",
                    "notes": "Entry-level budget laptop, Jasper Lake, basic tasks only",
                    "display": "15.6\" FHD TN, 1920×1080, 220 nits"
                },
                {
                    "name": "Lenovo IdeaPad 3 15ALC6",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5500U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "45Wh, up to 9h",
                    "ports": "USB-A 3.2, 2× USB-A 2.0, USB-C 3.2, HDMI, SD card",
                    "weight": "1.65kg",
                    "release_year": "2021",
                    "notes": "Budget AMD laptop",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "82KU00HJUS",
                            "cpu": [
                                "AMD Ryzen 5 5500U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo IdeaPad 5 14ALC05",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5500U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "56Wh, up to 12h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card",
                    "weight": "1.45kg",
                    "release_year": "2021",
                    "notes": "Mid-range ultrabook",
                    "display": "14\" FHD IPS, 1920×1080, 300 nits",
                    "skus": [
                        {
                            "id": "82LM003AUS",
                            "cpu": [
                                "AMD Ryzen 5 5500U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo IdeaPad Gaming 3 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5600H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "45Wh, up to 7h",
                    "ports": "USB-C, 3× USB-A, HDMI 2.0, RJ45, SD card",
                    "weight": "2.25kg",
                    "release_year": "2021",
                    "notes": "Budget gaming RTX 3060",
                    "display": "15.6\" FHD IPS, 1920×1080, 120Hz",
                    "skus": [
                        {
                            "id": "82K2000WUS",
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo IdeaPad Slim 5 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7730U"
                    ],
                    "gpu": [
                        "AMD Radeon 610M"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "75Wh, up to 12h",
                    "ports": "USB-C, 2× USB-A, HDMI, SD card",
                    "weight": "1.84kg",
                    "release_year": "2023",
                    "notes": "Slim mainstream, big screen",
                    "display": "16\" WUXGA IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "82XG003LUS",
                            "cpu": [
                                "AMD Ryzen 7 7730U"
                            ],
                            "gpu": [
                                "AMD Radeon 610M"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo IdeaPad Duet 5 Chromebook",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Qualcomm Snapdragon 7c Gen 2"
                    ],
                    "gpu": [
                        "Adreno 618"
                    ],
                    "ram": [
                        "8GB LPDDR4X"
                    ],
                    "storage": [
                        "128GB eMMC"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "42Wh, up to 15h",
                    "ports": "2× USB-C",
                    "weight": "0.7kg (tablet only)",
                    "release_year": "2021",
                    "notes": "OLED Chromebook tablet, detachable keyboard",
                    "display": "13.3\" 2K OLED, 1920×1200, touch",
                    "skus": [
                        {
                            "id": "82QS0003US",
                            "cpu": [
                                "Qualcomm Snapdragon 7c Gen 2"
                            ],
                            "gpu": [
                                "Adreno 618"
                            ],
                            "ram": [
                                "8GB LPDDR4X"
                            ],
                            "storage": [
                                "128GB eMMC"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo IdeaPad Gaming 3i Gen 7",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12650H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "8GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "45Wh",
                    "ports": "USB-C, 3× USB-A, HDMI 2.0, RJ45",
                    "weight": "2.25kg",
                    "release_year": "2022",
                    "notes": "Budget gaming, Alder Lake",
                    "display": "15.6\" FHD IPS, 1920×1080, 120Hz",
                    "skus": [
                        {
                            "id": "82S900HPUS",
                            "cpu": [
                                "Intel Core i7-12650H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "8GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Legion",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Legion 9i Gen 9",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "Legion 7i Gen 9",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Legion 5i Gen 9",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Legion Slim 5i Gen 9",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Legion 5 Gen 8 (AMD)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Legion 5 Pro Gen 8 (AMD)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Lenovo Legion 5 Pro 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 6800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "82RF00BBUS",
                            "cpu": [
                                "AMD Ryzen 7 6800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "80Wh, up to 8h",
                    "ports": "3× USB-A, USB-C/Thunderbolt 4, HDMI 2.1, RJ45",
                    "weight": "2.4kg",
                    "release_year": "2022",
                    "notes": "Gaming powerhouse, excellent cooling",
                    "display": "16\" QHD IPS, 2560×1600, 165Hz"
                },
                {
                    "name": "Lenovo Legion 7i Gen 8",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "82WQ005WUS",
                            "cpu": [
                                "Intel Core i9-13900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4080"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 4× USB-A, USB-C, HDMI 2.1, RJ45",
                    "weight": "2.73kg",
                    "release_year": "2023",
                    "notes": "Top-tier gaming, excellent display",
                    "display": "16\" QHD+ IPS, 2560×1600, 240Hz"
                },
                {
                    "name": "Lenovo Legion 5 15ACH6H",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5600H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "60Wh, up to 8h",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45",
                    "weight": "2.4kg",
                    "release_year": "2021",
                    "notes": "Best-value gaming Legion",
                    "display": "15.6\" FHD IPS, 1920×1080, 165Hz",
                    "skus": [
                        {
                            "id": "82JU00JAUS",
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Legion 5 Gen 8",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7745HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 8h",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45",
                    "weight": "2.4kg",
                    "release_year": "2023",
                    "notes": "RTX 4070, Ryzen 7000HX",
                    "display": "15.6\" FHD IPS, 1920×1080, 165Hz",
                    "skus": [
                        {
                            "id": "82WK00GBUS",
                            "cpu": [
                                "AMD Ryzen 7 7745HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Legion Slim 5i Gen 8",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 9h",
                    "ports": "Thunderbolt 4, 2× USB-A, USB-C, HDMI, SD card",
                    "weight": "2.1kg",
                    "release_year": "2023",
                    "notes": "Slim gaming form factor",
                    "display": "16\" WQXGA IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "82Y9000RUS",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Legion Pro 7i Gen 8",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI 2.1, RJ45",
                    "weight": "2.98kg",
                    "release_year": "2023",
                    "notes": "Top gaming Legion, RTX 4090",
                    "display": "16\" WQXGA IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "82WQ008AUS",
                            "cpu": [
                                "Intel Core i9-13900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Legion 5 Gen 6",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5600H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "60Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0, RJ45",
                    "weight": "2.4kg",
                    "release_year": "2021",
                    "notes": "Great value gaming",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "82JH00BSUS",
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Legion 5i Gen 7",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh",
                    "ports": "3× USB-A, Thunderbolt 4, HDMI 2.1, RJ45",
                    "weight": "2.4kg",
                    "release_year": "2022",
                    "notes": "Alder Lake gaming, QHD 165Hz",
                    "display": "15.6\" QHD IPS, 2560×1440, 165Hz",
                    "skus": [
                        {
                            "id": "82RK00CGUS",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo Legion 5 Gen 7 AMD",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 6800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45",
                    "weight": "2.4kg",
                    "release_year": "2022",
                    "notes": "AMD gaming value",
                    "display": "15.6\" FHD IPS, 1920×1080, 165Hz",
                    "skus": [
                        {
                            "id": "82RE00BXUS",
                            "cpu": [
                                "AMD Ryzen 7 6800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "LOQ",
            "type": "gaming",
            "subModels": [
                {
                    "name": "LOQ 15IAX9",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "LOQ 16IAX9",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                }
            ]
        },
        {
            "name": "ThinkPad T14",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Lenovo ThinkPad T14 Gen 4",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7730U"
                    ],
                    "gpu": [
                        "AMD Radeon 610M"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "21HD0000US",
                            "cpu": [
                                "AMD Ryzen 7 7730U"
                            ],
                            "gpu": [
                                "AMD Radeon 610M"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "52.5Wh, up to 14h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, RJ45, 3.5mm jack",
                    "weight": "1.37kg",
                    "release_year": "2023",
                    "notes": "Business workhorse, Ryzen version",
                    "display": "14\" WUXGA IPS, 1920×1200, 300 nits"
                }
            ]
        },
        {
            "name": "ThinkPad E14",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Lenovo ThinkPad E14 Gen 5",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR5"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "21JR001LUS",
                            "cpu": [
                                "Intel Core i5-1335U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR5"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "57Wh, up to 13h",
                    "ports": "2× USB-C, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.51kg",
                    "release_year": "2023",
                    "notes": "Entry business laptop, good keyboard",
                    "display": "14\" WUXGA IPS, 1920×1200, 300 nits"
                }
            ]
        },
        {
            "name": "ThinkPad X1 Carbon",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Lenovo ThinkPad X1 Carbon Gen 11",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.12kg",
                    "release_year": "2023",
                    "notes": "Ultra-lightweight business flagship, MIL-SPEC",
                    "display": "14\" WUXGA IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "21HM0065US",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad X1 Carbon Gen 12",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 165U"
                    ],
                    "gpu": [
                        "Intel Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5x"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.12kg",
                    "release_year": "2024",
                    "notes": "Meteor Lake CPU, AI features, lightest in class",
                    "display": "14\" WUXGA IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "21KC001KUS",
                            "cpu": [
                                "Intel Core Ultra 7 165U"
                            ],
                            "gpu": [
                                "Intel Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5x"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad X1 Carbon Gen 10",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1265U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "57Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.12kg",
                    "release_year": "2022",
                    "notes": "Ultra-light business, MIL-SPEC",
                    "display": "14\" WUXGA IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "21CB00B9US",
                            "cpu": [
                                "Intel Core i7-1265U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Lenovo ThinkPad",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Lenovo ThinkPad X1 Extreme Gen 5",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-12800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "90Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.86kg",
                    "release_year": "2022",
                    "notes": "High-performance business, 4K option",
                    "display": "16\" WQUXGA IPS, 3840×2400, 60Hz",
                    "skus": [
                        {
                            "id": "21DE000MUS",
                            "cpu": [
                                "Intel Core i7-12800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad X13 Gen 4",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "54.7Wh, up to 14h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.18kg",
                    "release_year": "2023",
                    "notes": "Compact business ultrabook",
                    "display": "13.3\" WUXGA IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "21EX003SUS",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad L14 Gen 4",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 7530U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "46Wh, up to 10h",
                    "ports": "2× USB-C, 2× USB-A, HDMI, RJ45",
                    "weight": "1.55kg",
                    "release_year": "2023",
                    "notes": "Budget business, value ThinkPad",
                    "display": "14\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "21H50014US",
                            "cpu": [
                                "AMD Ryzen 5 7530U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad Z13 Gen 1",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 PRO 6650U"
                    ],
                    "gpu": [
                        "AMD Radeon 660M"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "49.5Wh, up to 15h",
                    "ports": "2× USB-C/TB4, USB-A, HDMI",
                    "weight": "1.26kg",
                    "release_year": "2022",
                    "notes": "AMD ThinkPad, OLED option",
                    "display": "13.3\" 2.8K OLED, 2880×1800, 60Hz",
                    "skus": [
                        {
                            "id": "21D2003XUS",
                            "cpu": [
                                "AMD Ryzen 5 PRO 6650U"
                            ],
                            "gpu": [
                                "AMD Radeon 660M"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Lenovo Slim",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Lenovo Slim Pro 9i Gen 8",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13905H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.99kg",
                    "release_year": "2023",
                    "notes": "OLED premium creator",
                    "display": "16\" 3.2K OLED, 3200×2000, 120Hz, touch",
                    "skus": [
                        {
                            "id": "83BQ004KUS",
                            "cpu": [
                                "Intel Core i9-13905H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Lenovo ThinkBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Lenovo ThinkBook 14 G6+",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 5 125H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "60Wh, up to 12h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.45kg",
                    "release_year": "2024",
                    "notes": "SMB mainstream with discrete GPU",
                    "display": "14\" 2.8K IPS, 2880×1800, 90Hz",
                    "skus": [
                        {
                            "id": "21KJ000KUS",
                            "cpu": [
                                "Intel Core Ultra 5 125H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkBook 16p Gen 4",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 7945HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "2× USB-C, 3× USB-A, HDMI, SD card",
                    "weight": "2.1kg",
                    "release_year": "$2023",
                    "notes": "Performance ThinkBook, 165Hz 3.2K",
                    "display": "16\" 3.2K IPS, 3200×2000, 165Hz",
                    "skus": [
                        {
                            "id": "21J8000MUS",
                            "cpu": [
                                "AMD Ryzen 9 7945HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "Dell": [
        {
            "name": "XPS",
            "type": "laptop",
            "subModels": [
                {
                    "name": "XPS 13 9340 (2024)",
                    "screenSize": [
                        "13.4\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ]
                },
                {
                    "name": "XPS 14 9440",
                    "screenSize": [
                        "14.5\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050 Laptop",
                        "Intel Arc"
                    ]
                },
                {
                    "name": "XPS 16 9640",
                    "screenSize": [
                        "16.3\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "XPS 15 9530",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "XPS 15 9520",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "XPS 13 9315",
                    "screenSize": [
                        "13.4\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Dell XPS 13 9310",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR4x"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 10 Home"
                    ],
                    "skus": [
                        {
                            "id": "XPS9310-7415SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR4x"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 10 Home"
                            ],
                            "screenSize": [
                                "13.4\""
                            ]
                        }
                    ],
                    "battery": "52Wh, up to 12h",
                    "ports": "2× Thunderbolt 4, USB-C 3.2, 3.5mm jack",
                    "weight": "1.2kg, 296×199×14.8mm",
                    "release_year": "2021",
                    "notes": "Compact premium ultrabook, InfinityEdge display",
                    "display": "13.4\" FHD+ IPS, 1920×1200, 500 nits, touch"
                },
                {
                    "name": "Dell XPS 13 9315",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-1250U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "XPS9315-7716SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1250U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "13.4\""
                            ]
                        }
                    ],
                    "battery": "55Wh, up to 12h",
                    "ports": "2× Thunderbolt 4, 3.5mm jack",
                    "weight": "1.17kg",
                    "release_year": "2022",
                    "notes": "Redesigned chassis, thinner bezels",
                    "display": "13.4\" FHD+ IPS, 1920×1200, 500 nits"
                },
                {
                    "name": "Dell XPS 15 9520",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "XPS9520-7759SLV-PUS",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "86Wh, up to 13h",
                    "ports": "2× Thunderbolt 4, USB-C 3.2, SD card, 3.5mm jack",
                    "weight": "1.86kg",
                    "release_year": "2022",
                    "notes": "OLED display option, premium build",
                    "display": "15.6\" OLED 3.5K, 3456×2160, 60Hz, touch"
                },
                {
                    "name": "Dell XPS 15 9530",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "XPS9530-7759SLV-PUS",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "86Wh, up to 13h",
                    "ports": "2× Thunderbolt 4, USB-C 3.2, SD card, 3.5mm jack",
                    "weight": "1.86kg",
                    "release_year": "2023",
                    "notes": "RTX 4060, Raptor Lake CPU",
                    "display": "15.6\" OLED 3.5K, 3456×2160, 60Hz"
                },
                {
                    "name": "Dell XPS 16 9640",
                    "screenSize": [
                        "16.3\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "32GB LPDDR5x"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "XPS9640-7979PLT-PUS",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "32GB LPDDR5x"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16.3\""
                            ]
                        }
                    ],
                    "battery": "99.5Wh, up to 12h",
                    "ports": "2× Thunderbolt 4, 2× USB-C 3.2, SD card",
                    "weight": "2.0kg",
                    "release_year": "2024",
                    "notes": "New 16\" flagship, Meteor Lake CPU, AI features",
                    "display": "16.3\" OLED 4K+, 3840×2400, 120Hz, touch"
                },
                {
                    "name": "Dell XPS 13 9320",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "55Wh, up to 12h",
                    "ports": "2× Thunderbolt 4, 3.5mm jack",
                    "weight": "1.17kg",
                    "release_year": "2023",
                    "notes": "OLED option, Raptor Lake refresh",
                    "display": "13.4\" OLED 3.5K, 3456×2160, 400 nits, touch",
                    "skus": [
                        {
                            "id": "XPS9320-7931SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell XPS 13 Plus 9320",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "55Wh",
                    "ports": "2× Thunderbolt 4 (only)",
                    "weight": "1.26kg",
                    "release_year": "2022",
                    "notes": "Zero legacy ports, capacitive function row, futuristic design",
                    "display": "13.4\" FHD+ OLED, 1920×1200, 60Hz",
                    "skus": [
                        {
                            "id": "XPS9320P-7931SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell XPS 14 9440",
                    "screenSize": [
                        "14.5\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050"
                    ],
                    "ram": [
                        "16GB LPDDR5x"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "69.5Wh, up to 12h",
                    "ports": "2× Thunderbolt 4, 2× USB-C 3.2, SD card",
                    "weight": "1.69kg",
                    "release_year": "2024",
                    "notes": "New 14\" XPS with discrete GPU, Meteor Lake",
                    "display": "14.5\" OLED 3K+, 2880×1800, 120Hz, touch",
                    "skus": [
                        {
                            "id": "XPS9440-7979SLV-PUS",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4050"
                            ],
                            "ram": [
                                "16GB LPDDR5x"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell XPS 17 9720",
                    "screenSize": [
                        "17\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "97Wh, up to 13h",
                    "ports": "2× Thunderbolt 4, USB-C 3.2, SD card, 3.5mm jack",
                    "weight": "2.21kg",
                    "release_year": "2022",
                    "notes": "Large premium creator laptop",
                    "display": "17\" FHD+ IPS, 1920×1200, 500 nits",
                    "skus": [
                        {
                            "id": "XPS9720-7936SLV-PUS",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell XPS 13 9305",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-1185G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR4x"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 10 Home"
                    ],
                    "battery": "51Wh, up to 12h",
                    "ports": "2× Thunderbolt 4, USB-C 3.2, 3.5mm jack",
                    "weight": "1.23kg",
                    "release_year": "2021",
                    "notes": "Tiger Lake ultrabook",
                    "display": "13.4\" FHD+ IPS, 1920×1200, 500 nits",
                    "skus": [
                        {
                            "id": "XPS9305-7465SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1185G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR4x"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 10 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Inspiron",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Inspiron 16 7640 2-in-1",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Inspiron 16 Plus 7630",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Inspiron 15 3535",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "Inspiron 14 5440",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "Inspiron 13 5330",
                    "screenSize": [
                        "13.3\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "Dell Inspiron 15 3520",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "3520-7678BLK-PUS",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "54Wh, up to 8h",
                    "ports": "USB-A 3.2, USB-A 2.0, USB-C 3.2, HDMI, SD card, 3.5mm jack",
                    "weight": "1.65kg",
                    "release_year": "2022",
                    "notes": "Budget mainstream laptop, good value",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits"
                },
                {
                    "name": "Dell Inspiron 14 5420",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "54Wh, up to 10h",
                    "ports": "USB-A 3.2, USB-C 3.2, HDMI, SD card, 3.5mm jack",
                    "weight": "1.57kg",
                    "release_year": "2022",
                    "notes": "Budget 14\" mainstream",
                    "display": "14\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "I5420-5816SLV-PUS",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Inspiron 16 5620",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1255U"
                    ],
                    "gpu": [
                        "NVIDIA GeForce MX570"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "54Wh, up to 12h",
                    "ports": "USB-A 3.2, USB-C 3.2, HDMI, SD card, 3.5mm jack",
                    "weight": "1.85kg",
                    "release_year": "2022",
                    "notes": "16\" mid-range with discrete GPU",
                    "display": "16\" FHD+ IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "I5620-7628SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1255U"
                            ],
                            "gpu": [
                                "NVIDIA GeForce MX570"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Inspiron 16 Plus 7630",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "86Wh",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card, 3.5mm jack",
                    "weight": "2.0kg",
                    "release_year": "2023",
                    "notes": "Performance mid-range, 120Hz QHD+",
                    "display": "16\" QHD+ IPS, 2560×1600, 120Hz",
                    "skus": [
                        {
                            "id": "7630-7693SLV-PUS",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Inspiron 14 2-in-1 5410",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "12GB DDR4"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "54Wh, up to 10h",
                    "ports": "USB-C 3.2, USB-A 3.2, HDMI, SD card, 3.5mm jack",
                    "weight": "1.63kg",
                    "release_year": "2021",
                    "notes": "2-in-1 convertible, touchscreen",
                    "display": "14\" FHD IPS, 1920×1080, touch, 250 nits",
                    "skus": [
                        {
                            "id": "I5410-3658SLV-PUS",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "12GB DDR4"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Latitude",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Latitude 7440",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "Latitude 5440",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Latitude 9440 2-in-1",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Latitude 7340 Ultralight",
                    "screenSize": [
                        "13.3\""
                    ]
                },
                {
                    "name": "Latitude 5340",
                    "screenSize": [
                        "13.3\""
                    ]
                },
                {
                    "name": "Dell Latitude 5540",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-1345U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "LAT5540-7637SLV",
                            "cpu": [
                                "Intel Core i5-1345U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "54Wh, up to 14h",
                    "ports": "2× USB-A, USB-C/Thunderbolt 4, HDMI, RJ45, SD card",
                    "weight": "1.79kg",
                    "release_year": "2023",
                    "notes": "Business laptop, vPro option, durable",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits"
                },
                {
                    "name": "Dell Latitude 7440",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "58Wh, up to 16h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, RJ45",
                    "weight": "1.37kg",
                    "release_year": "2023",
                    "notes": "Premium business ultrabook, MIL-SPEC",
                    "display": "14\" FHD+ IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "LAT7440-7697SLV",
                            "cpu": [
                                "Intel Core i7-1365U vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Latitude 9440 2-in-1",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "65Wh, up to 18h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI",
                    "weight": "1.44kg",
                    "release_year": "2023",
                    "notes": "Business 2-in-1 flagship, OLED touch",
                    "display": "14\" QHD+ OLED, 2560×1600, touch, 120Hz",
                    "skus": [
                        {
                            "id": "LAT9440-7697SLV",
                            "cpu": [
                                "Intel Core i7-1365U vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Latitude 3540",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "54Wh, up to 10h",
                    "ports": "2× USB-A, USB-C, HDMI, RJ45, SD card",
                    "weight": "1.87kg",
                    "release_year": "2023",
                    "notes": "Budget business 15\"",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "LAT3540-5766BLK",
                            "cpu": [
                                "Intel Core i5-1335U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Latitude 5350",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 5 135U"
                    ],
                    "gpu": [
                        "Intel Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "54Wh, up to 16h",
                    "ports": "2× USB-C, 2× USB-A, HDMI, RJ45",
                    "weight": "1.27kg",
                    "release_year": "2024",
                    "notes": "Compact business, Meteor Lake",
                    "display": "13.3\" FHD IPS, 1920×1080, 300 nits",
                    "skus": [
                        {
                            "id": "LAT5350-3879SLV",
                            "cpu": [
                                "Intel Core Ultra 5 135U"
                            ],
                            "gpu": [
                                "Intel Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Alienware",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Alienware m18 R2",
                    "screenSize": [
                        "18\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "Alienware m16 R2",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ],
                    "skus": [
                        {
                            "id": "AWM16R2-9769BLK-PUS",
                            "cpu": [
                                "Intel Core i9-14900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "90Wh, up to 6h",
                    "ports": "Thunderbolt 4, 3× USB-A, USB-C, HDMI 2.1, RJ45, SD card",
                    "weight": "3.19kg",
                    "release_year": "2024",
                    "notes": "Cherry Lake-R CPU, top gaming performance",
                    "display": "16\" QHD+ IPS, 2560×1600, 240Hz"
                },
                {
                    "name": "Alienware X16 R2",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "Alienware X14 R2",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Alienware Area-51m",
                    "screenSize": [
                        "17.3\""
                    ]
                },
                {
                    "name": "Alienware x16 R1",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "AWX16R1-9376BLK-PUS",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45",
                    "weight": "2.99kg",
                    "release_year": "2023",
                    "notes": "480Hz display, Cherry Lake CPU",
                    "display": "16\" QHD+ IPS, 2560×1600, 480Hz"
                },
                {
                    "name": "Dell Alienware Aurora R15",
                    "cpu": [
                        "Intel Core i9-13900KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "AWR15-7982BLK-PUS",
                            "cpu": [
                                "Intel Core i9-13900KF"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ],
                    "ports": "5× USB-A, 2× USB-C, HDMI 2.1, DP, RJ45",
                    "weight": "13.2kg",
                    "release_year": "2023",
                    "notes": "Gaming desktop, tool-less design, RGB lighting",
                    "display": "None (external)"
                },
                {
                    "name": "Alienware m15 R7",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "86Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.69kg",
                    "release_year": "2022",
                    "notes": "Alienware gaming, Cherry MX mechanical keys optional",
                    "display": "15.6\" QHD IPS, 2560×1440, 240Hz",
                    "skus": [
                        {
                            "id": "AWm15R7-7636BLK-PUS",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Alienware m16 R1",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, USB-C, HDMI 2.1, RJ45, SD card",
                    "weight": "3.05kg",
                    "release_year": "2023",
                    "notes": "New 16\" Alienware, wide aspect ratio",
                    "display": "16\" QHD+ IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "AWm16R1-7846BLK-PUS",
                            "cpu": [
                                "Intel Core i9-13900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Alienware m16 R2",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-14900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "3.19kg",
                    "release_year": "2024",
                    "notes": "Cherry Lake-R, 240Hz upgrade",
                    "display": "16\" QHD+ IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "AWm16R2-9769BLK-PUS",
                            "cpu": [
                                "Intel Core i9-14900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Alienware m18 R2",
                    "screenSize": [
                        "18\""
                    ],
                    "cpu": [
                        "Intel Core i9-14900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "97Wh",
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI 2.1, mini DP, RJ45, SD card",
                    "weight": "4.05kg",
                    "release_year": "2024",
                    "notes": "Largest Alienware, Cherry Lake-R",
                    "display": "18\" QHD+ IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "AWm18R2-9983BLK-PUS",
                            "cpu": [
                                "Intel Core i9-14900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Alienware x14 R2",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-13620H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI 2.1, RJ45",
                    "weight": "1.84kg",
                    "release_year": "2023",
                    "notes": "Slim 14\" gaming, compact Alienware",
                    "display": "14\" FHD IPS, 1920×1080, 165Hz",
                    "skus": [
                        {
                            "id": "AWx14R2-9343BLK-PUS",
                            "cpu": [
                                "Intel Core i7-13620H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Alienware x16 R1",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45",
                    "weight": "2.99kg",
                    "release_year": "2023",
                    "notes": "480Hz display, slim gaming flagship",
                    "display": "16\" QHD+ IPS, 2560×1600, 480Hz",
                    "skus": [
                        {
                            "id": "AWx16R1-9376BLK-PUS",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Alienware Aurora R16",
                    "cpu": [
                        "Intel Core i9-14900KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "5× USB-A, 2× USB-C, HDMI 2.1, DP 1.4, RJ45",
                    "weight": "14.2kg",
                    "release_year": "2024",
                    "notes": "Tool-less chassis, liquid cooling option, RGB",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "AWR16-A705BLK-PUS",
                            "cpu": [
                                "Intel Core i9-14900KF"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "G Series",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Dell G16 7620",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Dell G15 5530",
                    "screenSize": [
                        "15.6\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Dell G15 5520",
                    "screenSize": [
                        "15.6\""
                    ]
                }
            ]
        },
        {
            "name": "Dell Vostro",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Dell Vostro 14 3420",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "54Wh, up to 9h",
                    "ports": "USB-A 3.2, USB-A 2.0, USB-C 3.2, HDMI, SD card",
                    "weight": "1.56kg",
                    "release_year": "2022",
                    "notes": "SMB entry laptop",
                    "display": "14\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "VOS3420-3672BLK-PUS",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Dell Chromebook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Dell Chromebook 3110 2-in-1",
                    "screenSize": [
                        "11.6\""
                    ],
                    "cpu": [
                        "Intel Celeron N4500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 600"
                    ],
                    "ram": [
                        "4GB LPDDR4X"
                    ],
                    "storage": [
                        "32GB eMMC"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "42Wh, up to 10h",
                    "ports": "2× USB-C, 2× USB-A, microSD",
                    "weight": "1.36kg",
                    "release_year": "2021",
                    "notes": "Education 2-in-1 Chromebook",
                    "display": "11.6\" HD IPS, 1366×768, touch",
                    "skus": [
                        {
                            "id": "GCKWH",
                            "cpu": [
                                "Intel Celeron N4500"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 600"
                            ],
                            "ram": [
                                "4GB LPDDR4X"
                            ],
                            "storage": [
                                "32GB eMMC"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Dell G15",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Dell G15 5515",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5600H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "86Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45",
                    "weight": "2.39kg",
                    "release_year": "2021",
                    "notes": "Budget gaming with solid GPU",
                    "display": "15.6\" FHD IPS, 1920×1080, 120Hz",
                    "skus": [
                        {
                            "id": "G155515-A687GRY-PUS",
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Dell G16",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Dell G16 7620",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "86Wh",
                    "ports": "3× USB-A, Thunderbolt 4, HDMI 2.1, RJ45, SD card",
                    "weight": "2.74kg",
                    "release_year": "2022",
                    "notes": "16\" gaming with QHD+ display",
                    "display": "16\" QHD+ IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "G167620-7548BLK-PUS",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "HP": [
        {
            "name": "Spectre x360",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Spectre x360 2-in-1 14 (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "Spectre x360 2-in-1 16 (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "Spectre x360 14 14-eu0000",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Spectre x360 16 16-f2000",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "HP Spectre x360 14",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i7-1355U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "66Wh, up to 17h",
                    "ports": "2× Thunderbolt 4, USB-A 3.2, 3.5mm jack, microSD",
                    "weight": "1.36kg",
                    "release_year": "2023",
                    "notes": "2-in-1 convertible, OLED touchscreen, premium",
                    "display": "13.5\" OLED 2.8K, 2880×1920, touch, 60Hz",
                    "skus": [
                        {
                            "id": "14-ef2013dx",
                            "cpu": [
                                "Intel Core i7-1355U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Spectre x360 13.5",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i7-1255U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "66Wh, up to 17h",
                    "ports": "2× Thunderbolt 4, USB-A 3.2, 3.5mm jack, microSD",
                    "weight": "1.36kg",
                    "release_year": "2022",
                    "notes": "Convertible 2-in-1, OLED, gemcut design",
                    "display": "13.5\" OLED 3K2K, 3000×2000, touch, 60Hz",
                    "skus": [
                        {
                            "id": "14-ef0013dx",
                            "cpu": [
                                "Intel Core i7-1255U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Spectre x360 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Arc A370M"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "83Wh, up to 17h",
                    "ports": "2× Thunderbolt 4, USB-A 3.2, HDMI 2.0, SD card",
                    "weight": "2.13kg",
                    "release_year": "2022",
                    "notes": "16\" 2-in-1, Intel Arc discrete GPU",
                    "display": "16\" OLED 3K+, 3072×1920, touch, 60Hz",
                    "skus": [
                        {
                            "id": "16-f2013dx",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Arc A370M"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Spectre x360 13",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-8565U"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 620"
                    ],
                    "ram": [
                        "16GB LPDDR3"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "60Wh, up to 16h",
                    "ports": "2× Thunderbolt 3, USB-A, microSD",
                    "weight": "1.32kg",
                    "release_year": "2019",
                    "notes": "Early OLED Spectre, gemcut design",
                    "display": "13.3\" 4K OLED, 3840×2160, touch",
                    "skus": [
                        {
                            "id": "13-ap0013dx",
                            "cpu": [
                                "Intel Core i7-8565U"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 620"
                            ],
                            "ram": [
                                "16GB LPDDR3"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Envy",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Envy x360 14 (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Envy x360 15 (2024)",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Envy 16 (2023)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Envy Move 23.8 All-in-One",
                    "type": "all-in-one",
                    "screenSize": [
                        "24\""
                    ]
                },
                {
                    "name": "HP Envy 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "16-h0013dx",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "83Wh, up to 10h",
                    "ports": "Thunderbolt 4, USB-A 3.0, USB-C, HDMI 2.1, SD card, 3.5mm jack",
                    "weight": "2.24kg",
                    "release_year": "2022",
                    "notes": "Creator laptop, 4K display, RTX 3060",
                    "display": "16\" UHD+ IPS, 3840×2400, 120Hz, touch"
                },
                {
                    "name": "HP Envy 13",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "12GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "51Wh, up to 17h",
                    "ports": "2× USB-C, USB-A, HDMI, microSD",
                    "weight": "1.3kg",
                    "release_year": "2021",
                    "notes": "Slim premium ultrabook",
                    "display": "13.3\" FHD IPS, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "13-ba1047wm",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "12GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Envy x360 13.3",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 7530U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "66Wh, up to 17h",
                    "ports": "USB-C 3.2, USB-A 3.2, HDMI 2.0, microSD",
                    "weight": "1.35kg",
                    "release_year": "2022",
                    "notes": "2-in-1 OLED, Ryzen 5",
                    "display": "13.3\" FHD OLED, 1920×1200, touch, 60Hz",
                    "skus": [
                        {
                            "id": "13-bf0033dx",
                            "cpu": [
                                "AMD Ryzen 5 7530U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Envy x360 15.6",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-1255U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "51Wh, up to 14h",
                    "ports": "2× USB-C 3.2, 2× USB-A, HDMI, SD card",
                    "weight": "1.98kg",
                    "release_year": "2022",
                    "notes": "2-in-1 convertible, mainstream",
                    "display": "15.6\" FHD IPS, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "15-ew0013dx",
                            "cpu": [
                                "Intel Core i7-1255U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Envy 17",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "55Wh",
                    "ports": "Thunderbolt 4, USB-A, USB-C, HDMI, SD card",
                    "weight": "2.8kg",
                    "release_year": "2023",
                    "notes": "Large creator laptop",
                    "display": "17.3\" FHD IPS, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "17-cw0013dx",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "EliteBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "EliteBook 840 G11",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "EliteBook 860 G11",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "EliteBook 1040 G11",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "EliteBook Dragonfly G4",
                    "screenSize": [
                        "13.5\""
                    ]
                },
                {
                    "name": "EliteBook 840 G10",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "EliteBook 830 G10",
                    "screenSize": [
                        "13.3\""
                    ]
                },
                {
                    "name": "HP EliteBook 840 G10",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "819Y4UT#ABA",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "51Wh, up to 14h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, 3.5mm jack, microSD",
                    "weight": "1.36kg",
                    "release_year": "2023",
                    "notes": "Business flagship, MIL-SPEC, Wolf Security",
                    "display": "14\" FHD IPS, 1920×1080, 400 nits, HP Sure View"
                },
                {
                    "name": "HP EliteBook 835 G10",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7730U"
                    ],
                    "gpu": [
                        "AMD Radeon 610M"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "51Wh, up to 14h",
                    "ports": "2× USB-C 3.2, 2× USB-A, HDMI, RJ45, microSD",
                    "weight": "1.25kg",
                    "release_year": "2023",
                    "notes": "AMD business laptop, MIL-SPEC",
                    "display": "13.3\" FHD IPS, 1920×1080, 400 nits",
                    "skus": [
                        {
                            "id": "819Y2UT#ABA",
                            "cpu": [
                                "AMD Ryzen 7 7730U"
                            ],
                            "gpu": [
                                "AMD Radeon 610M"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP EliteBook 860 G10",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "76Wh, up to 18h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, RJ45",
                    "weight": "1.78kg",
                    "release_year": "2023",
                    "notes": "16\" business, large battery",
                    "display": "16\" WUXGA IPS, 1920×1200, 400 nits",
                    "skus": [
                        {
                            "id": "819Y7UT#ABA",
                            "cpu": [
                                "Intel Core i7-1365U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP EliteBook 1040 G10",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1365U vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "68Wh, up to 18h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, RJ45",
                    "weight": "1.24kg",
                    "release_year": "2023",
                    "notes": "Premium business ultrabook, OLED 2.8K",
                    "display": "14\" 2.8K OLED, 2800×1800, touch, 90Hz",
                    "skus": [
                        {
                            "id": "819Y9UT#ABA",
                            "cpu": [
                                "Intel Core i7-1365U vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ProBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ProBook 440 G11",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "ProBook 450 G10",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "ProBook 430 G8",
                    "screenSize": [
                        "13.3\""
                    ]
                }
            ]
        },
        {
            "name": "Omen",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Omen 16 (2024)",
                    "screenSize": [
                        "16.1\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Omen Transcend 14",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Omen 16 (2023)",
                    "screenSize": [
                        "16.1\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Omen 45L Desktop",
                    "type": "desktop"
                },
                {
                    "name": "HP Omen 16",
                    "screenSize": [
                        "16.1\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7745HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "16-xf0013dx",
                            "cpu": [
                                "AMD Ryzen 7 7745HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16.1\""
                            ]
                        }
                    ],
                    "battery": "83Wh, up to 8h",
                    "ports": "USB-C/Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.35kg",
                    "release_year": "2023",
                    "notes": "AMD gaming laptop, OMEN lighting",
                    "display": "16.1\" QHD IPS, 2560×1440, 165Hz"
                },
                {
                    "name": "HP Omen 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-11800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "70Wh, up to 8h",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.24kg",
                    "release_year": "2021",
                    "notes": "Gaming mainstream, QHD 165Hz",
                    "display": "15.6\" QHD IPS, 2560×1440, 165Hz",
                    "skus": [
                        {
                            "id": "15-ek1073dx",
                            "cpu": [
                                "Intel Core i7-11800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Omen 17",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i9-11900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "83Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.93kg",
                    "release_year": "2021",
                    "notes": "17\" gaming powerhouse",
                    "display": "17.3\" QHD IPS, 2560×1440, 165Hz",
                    "skus": [
                        {
                            "id": "17-ck0060nr",
                            "cpu": [
                                "Intel Core i9-11900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Omen Transcend 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "32GB LPDDR5x"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "72Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, SD card",
                    "weight": "1.85kg",
                    "release_year": "2024",
                    "notes": "Slim gaming with OLED, Meteor Lake",
                    "display": "14\" 2.8K OLED, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "14-fb0013dx",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "32GB LPDDR5x"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Omen 45L Desktop",
                    "cpu": [
                        "Intel Core i9-12900K"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3090 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "5× USB-A, USB-C, HDMI, DP, RJ45",
                    "weight": "14.5kg",
                    "release_year": "2022",
                    "notes": "Gaming tower, expandable, RGB",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "GT22-0024",
                            "cpu": [
                                "Intel Core i9-12900K"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3090 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Victus",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Victus 16 (2024)",
                    "screenSize": [
                        "16.1\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "NVIDIA GeForce RTX 4050 Laptop"
                    ]
                },
                {
                    "name": "Victus 15 (2023)",
                    "screenSize": [
                        "15.6\""
                    ]
                }
            ]
        },
        {
            "name": "OmniBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "OmniBook Ultra 14",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "OmniBook X 14",
                    "screenSize": [
                        "14\""
                    ]
                }
            ]
        },
        {
            "name": "Spectre",
            "type": "laptop",
            "subModels": [
                {
                    "name": "HP Spectre x360 14",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i7-1355U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "14-ef2013dx",
                            "cpu": [
                                "Intel Core i7-1355U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "13.5\""
                            ]
                        }
                    ],
                    "battery": "66Wh, up to 17h",
                    "ports": "2× Thunderbolt 4, USB-A 3.2, 3.5mm jack, microSD",
                    "weight": "1.36kg",
                    "release_year": "2023",
                    "notes": "2-in-1 convertible, OLED touchscreen, premium",
                    "display": "13.5\" OLED 2.8K, 2880×1920, touch, 60Hz"
                }
            ]
        },
        {
            "name": "Pavilion",
            "type": "laptop",
            "subModels": [
                {
                    "name": "HP Pavilion 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "15-eg3013dx",
                            "cpu": [
                                "Intel Core i5-1335U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "43Wh, up to 8h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card, 3.5mm jack",
                    "weight": "1.75kg",
                    "release_year": "2023",
                    "notes": "Mid-range mainstream, good value",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits"
                },
                {
                    "name": "HP Pavilion Desktop TP01",
                    "cpu": [
                        "AMD Ryzen 5 5600G"
                    ],
                    "gpu": [
                        "AMD Radeon Vega 7 (integrated)"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, SD card, RJ45",
                    "weight": "4.8kg",
                    "release_year": "2022",
                    "notes": "Budget desktop tower",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "TP01-3060z",
                            "cpu": [
                                "AMD Ryzen 5 5600G"
                            ],
                            "gpu": [
                                "AMD Radeon Vega 7 (integrated)"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Pavilion 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "43Wh, up to 9h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card",
                    "weight": "1.46kg",
                    "release_year": "2022",
                    "notes": "Budget 14\" mainstream",
                    "display": "14\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "14-dv2013dx",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "HP Victus",
            "type": "laptop",
            "subModels": [
                {
                    "name": "HP Victus 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5600H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "70Wh, up to 8h",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45, SD card",
                    "weight": "2.29kg",
                    "release_year": "2021",
                    "notes": "Budget gaming, entry level",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "15-fb0047nr",
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Victus 16",
                    "screenSize": [
                        "16.1\""
                    ],
                    "cpu": [
                        "Intel Core i5-11400H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050 Ti"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "70Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45, SD card",
                    "weight": "2.48kg",
                    "release_year": "2021",
                    "notes": "Budget gaming 16\"",
                    "display": "16.1\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "16-d0097nr",
                            "cpu": [
                                "Intel Core i5-11400H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050 Ti"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "HP ProBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "HP ProBook 450 G10",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "45Wh, up to 10h",
                    "ports": "2× USB-A, USB-C, HDMI, RJ45, SD card",
                    "weight": "1.74kg",
                    "release_year": "2023",
                    "notes": "Budget SMB laptop",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "856J0UT#ABA",
                            "cpu": [
                                "Intel Core i5-1335U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP ProBook 440 G9",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "44Wh, up to 10h",
                    "ports": "USB-A 3.2, USB-C, HDMI, RJ45, SD card",
                    "weight": "1.38kg",
                    "release_year": "$2022",
                    "notes": "Thin business laptop",
                    "display": "14\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "6A1X3UT#ABA",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "HP Chromebook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "HP Chromebook x360 14c",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i3-1115G4"
                    ],
                    "gpu": [
                        "Intel UHD Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4X"
                    ],
                    "storage": [
                        "128GB eMMC"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "51.3Wh, up to 11h",
                    "ports": "2× USB-C, 2× USB-A, microSD",
                    "weight": "1.7kg",
                    "release_year": "2021",
                    "notes": "2-in-1 Chromebook",
                    "display": "14\" FHD IPS, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "14c-cc0013dx",
                            "cpu": [
                                "Intel Core i3-1115G4"
                            ],
                            "gpu": [
                                "Intel UHD Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4X"
                            ],
                            "storage": [
                                "128GB eMMC"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                },
                {
                    "name": "HP Chromebook 14 G7",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Celeron N4500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 600"
                    ],
                    "ram": [
                        "4GB LPDDR4X"
                    ],
                    "storage": [
                        "32GB eMMC"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "47.36Wh, up to 12h",
                    "ports": "2× USB-C, 2× USB-A, microSD",
                    "weight": "1.55kg",
                    "release_year": "2021",
                    "notes": "Budget education Chromebook",
                    "display": "14\" HD IPS, 1366×768",
                    "skus": [
                        {
                            "id": "3V2T0UT#ABA",
                            "cpu": [
                                "Intel Celeron N4500"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 600"
                            ],
                            "ram": [
                                "4GB LPDDR4X"
                            ],
                            "storage": [
                                "32GB eMMC"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "HP Dragonfly",
            "type": "laptop",
            "subModels": [
                {
                    "name": "HP Dragonfly Folio G3",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i7-1265U vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "65.7Wh, up to 18h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, 3.5mm jack",
                    "weight": "1.38kg",
                    "release_year": "2022",
                    "notes": "Premium business 2-in-1, OLED",
                    "display": "13.5\" 3K2K OLED, 3000×2000, touch",
                    "skus": [
                        {
                            "id": "6B1N9UT#ABA",
                            "cpu": [
                                "Intel Core i7-1265U vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "ASUS": [
        {
            "name": "Zenbook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Zenbook S 13 OLED (UX5304)",
                    "screenSize": [
                        "13.3\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Zenbook 14 OLED (UX3405)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Zenbook Duo 14 (UX8406)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "32GB"
                    ]
                },
                {
                    "name": "Zenbook Pro 14 OLED (UX6404)",
                    "screenSize": [
                        "14.5\""
                    ]
                },
                {
                    "name": "Zenbook Pro 16X OLED (UX7602)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Zenbook 13 OLED (UM325)",
                    "screenSize": [
                        "13.3\""
                    ]
                }
            ]
        },
        {
            "name": "Vivobook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Vivobook S 15 OLED (K5504)",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "Vivobook S 14 OLED (M5406)",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Vivobook Pro 16X OLED (N7600)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Vivobook 15 OLED (K513)",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "Vivobook 14 (M413)",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Vivobook Flip 14 (TP470)",
                    "screenSize": [
                        "14\""
                    ]
                }
            ]
        },
        {
            "name": "ROG",
            "type": "gaming",
            "subModels": [
                {
                    "name": "ROG Zephyrus G14 (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "AMD Radeon RX 7600M XT"
                    ]
                },
                {
                    "name": "ROG Zephyrus G16 (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "ROG Zephyrus M16 (GU604)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "ROG Strix SCAR 16 G634",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "ROG Strix SCAR 18 G834",
                    "screenSize": [
                        "18\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "ROG Strix G15 (G513)",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "ROG Flow X13 (GV302)",
                    "screenSize": [
                        "13.4\""
                    ]
                },
                {
                    "name": "ROG Flow Z13 (GZ301)",
                    "screenSize": [
                        "13.4\""
                    ]
                },
                {
                    "name": "ASUS ROG Zephyrus G14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 6900HS"
                    ],
                    "gpu": [
                        "AMD Radeon RX 6700S"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "GA402RK-L4030W",
                            "cpu": [
                                "AMD Ryzen 9 6900HS"
                            ],
                            "gpu": [
                                "AMD Radeon RX 6700S"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "76Wh, up to 10h",
                    "ports": "2× USB-C, 2× USB-A, HDMI 2.0b, 3.5mm jack",
                    "weight": "1.65kg",
                    "release_year": "2022",
                    "notes": "Compact gaming, AMD advantage edition",
                    "display": "14\" QHD IPS, 2560×1600, 120Hz"
                },
                {
                    "name": "ASUS ROG Zephyrus G16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 9 185H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "GU605MZ-QR046W",
                            "cpu": [
                                "Intel Core Ultra 9 185H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "90Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, SD card, HDMI 2.1",
                    "weight": "1.95kg",
                    "release_year": "2024",
                    "notes": "OLED gaming, MeteorLake, slim chassis",
                    "display": "16\" QHD+ OLED, 2560×1600, 240Hz"
                },
                {
                    "name": "ASUS ROG Strix SCAR 18",
                    "screenSize": [
                        "18\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "G834JY-XS97",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "18\""
                            ]
                        }
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, SD card, HDMI 2.1, RJ45",
                    "weight": "3.1kg",
                    "release_year": "2023",
                    "notes": "Desktop-replacement gaming, massive display",
                    "display": "18\" QHD+ IPS, 2560×1600, 240Hz"
                }
            ]
        },
        {
            "name": "TUF Gaming",
            "type": "gaming",
            "subModels": [
                {
                    "name": "TUF Gaming A16 (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "AMD Radeon RX 7700S",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "TUF Gaming F16 (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop",
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "TUF Gaming A17 (FA707)",
                    "screenSize": [
                        "17.3\""
                    ]
                },
                {
                    "name": "TUF Gaming A15 (FA507)",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "TUF Gaming F15 (FX507)",
                    "screenSize": [
                        "15.6\""
                    ]
                }
            ]
        },
        {
            "name": "ExpertBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ExpertBook B9 OLED (B9403)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "ExpertBook B5 (B5604)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "ExpertBook B3 (B3404)",
                    "screenSize": [
                        "14\""
                    ]
                }
            ]
        },
        {
            "name": "ZenBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS ZenBook 14 OLED",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 8945HS"
                    ],
                    "gpu": [
                        "AMD Radeon 780M"
                    ],
                    "ram": [
                        "32GB LPDDR5X"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "UM3406HA-QD039W",
                            "cpu": [
                                "AMD Ryzen 9 8945HS"
                            ],
                            "gpu": [
                                "AMD Radeon 780M"
                            ],
                            "ram": [
                                "32GB LPDDR5X"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "75Wh, up to 15h",
                    "ports": "2× USB-C (USB4), 2× USB-A, HDMI, SD card",
                    "weight": "1.2kg",
                    "release_year": "2024",
                    "notes": "Ryzen AI, OLED display, fanless option",
                    "display": "14\" 3K OLED, 2880×1800, 120Hz, touch"
                },
                {
                    "name": "ASUS ZenBook 13 OLED",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 5700U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "67Wh, up to 13h",
                    "ports": "2× USB-C, USB-A, HDMI, microSD",
                    "weight": "1.14kg",
                    "release_year": "2021",
                    "notes": "OLED panel, ultra-light",
                    "display": "13.3\" OLED, 1920×1080, 60Hz, 550 nits",
                    "skus": [
                        {
                            "id": "UM325UA-DS71",
                            "cpu": [
                                "AMD Ryzen 7 5700U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ZenBook 14 OLED",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "75Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, microSD",
                    "weight": "1.39kg",
                    "release_year": "2022",
                    "notes": "OLED, ASUS Pen support",
                    "display": "14\" 2.8K OLED, 2880×1800, 90Hz",
                    "skus": [
                        {
                            "id": "UX3402ZA-DS71",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ZenBook 14X OLED",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "NVIDIA GeForce MX450"
                    ],
                    "ram": [
                        "16GB LPDDR4X"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "63Wh, up to 14h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, microSD",
                    "weight": "1.4kg",
                    "release_year": "2022",
                    "notes": "OLED touch, discrete GPU",
                    "display": "14\" 2.8K OLED, 2880×1800, 90Hz, touch",
                    "skus": [
                        {
                            "id": "UX5400EG-DB74",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "NVIDIA GeForce MX450"
                            ],
                            "ram": [
                                "16GB LPDDR4X"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ZenBook Pro 14 Duo OLED",
                    "screenSize": [
                        "14.5\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "76Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, USB-A, SD card",
                    "weight": "1.7kg",
                    "release_year": "2022",
                    "notes": "Dual screen, ScreenPad Plus, unique design",
                    "display": "14.5\" 2.8K OLED, 2880×1800, 120Hz + 12.7\" secondary",
                    "skus": [
                        {
                            "id": "UX8402ZE-DB96",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ZenBook Pro 16X OLED",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "96Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, SD card, HDMI 2.0b",
                    "weight": "2.4kg",
                    "release_year": "2022",
                    "notes": "4K OLED, haptic touchpad, ASUS Dial",
                    "display": "16\" 4K OLED, 3840×2400, 60Hz, touch",
                    "skus": [
                        {
                            "id": "UX7602ZM-DB96",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ZenBook Duo 14 UX482",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1135G7"
                    ],
                    "gpu": [
                        "NVIDIA GeForce MX450"
                    ],
                    "ram": [
                        "8GB LPDDR4X"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "70Wh, up to 11h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, microSD",
                    "weight": "1.62kg",
                    "release_year": "2021",
                    "notes": "Dual screen, secondary ScreenPad Plus",
                    "display": "14\" FHD IPS, 1920×1080 + 12.6\" secondary ScreenPad",
                    "skus": [
                        {
                            "id": "UX482EG-KA183T",
                            "cpu": [
                                "Intel Core i5-1135G7"
                            ],
                            "gpu": [
                                "NVIDIA GeForce MX450"
                            ],
                            "ram": [
                                "8GB LPDDR4X"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "VivoBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS VivoBook 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "X1502ZA-EJ1424W",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "42Wh, up to 8h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, 3.5mm jack",
                    "weight": "1.7kg",
                    "release_year": "2022",
                    "notes": "Mainstream budget laptop, good everyday performance",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits"
                },
                {
                    "name": "ASUS VivoBook 15 OLED",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5600H"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "50Wh, up to 10h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card",
                    "weight": "1.8kg",
                    "release_year": "2022",
                    "notes": "OLED budget laptop",
                    "display": "15.6\" OLED, 1920×1080, 60Hz, 600 nits",
                    "skus": [
                        {
                            "id": "M1503QA-L1129W",
                            "cpu": [
                                "AMD Ryzen 5 5600H"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS VivoBook 14 OLED K3405",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "70Wh, up to 14h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card",
                    "weight": "1.5kg",
                    "release_year": "2023",
                    "notes": "OLED mid-range, 120Hz",
                    "display": "14\" 2.8K OLED, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "K3405VC-EB74",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ROG Zephyrus",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS ROG Zephyrus G14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 6900HS"
                    ],
                    "gpu": [
                        "AMD Radeon RX 6700S"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "76Wh, up to 10h",
                    "ports": "2× USB-C, 2× USB-A, HDMI 2.0b, 3.5mm jack",
                    "weight": "1.65kg",
                    "release_year": "2022",
                    "notes": "Compact gaming, AMD advantage edition",
                    "display": "14\" QHD IPS, 2560×1600, 120Hz",
                    "skus": [
                        {
                            "id": "GA402RK-L4030W",
                            "cpu": [
                                "AMD Ryzen 9 6900HS"
                            ],
                            "gpu": [
                                "AMD Radeon RX 6700S"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Zephyrus G16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 9 185H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, SD card, HDMI 2.1",
                    "weight": "1.95kg",
                    "release_year": "2024",
                    "notes": "OLED gaming, MeteorLake, slim chassis",
                    "display": "16\" QHD+ OLED, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "GU605MZ-QR046W",
                            "cpu": [
                                "Intel Core Ultra 9 185H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Zephyrus G14 2023",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 7940HS"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh, up to 10h",
                    "ports": "2× USB-C, 2× USB-A, HDMI 2.0b, SD card",
                    "weight": "1.72kg",
                    "release_year": "2023",
                    "notes": "AniMe Matrix LED panel, MiniLED display",
                    "display": "14\" QHD+ IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "GA402XV-HYI9065W",
                            "cpu": [
                                "AMD Ryzen 9 7940HS"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4080"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Zephyrus M16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-11900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI 2.0b, SD card",
                    "weight": "1.9kg",
                    "release_year": "2021",
                    "notes": "Slim 16\" gaming, narrow bezels",
                    "display": "16\" WQXGA IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "GU603HM-K8016T",
                            "cpu": [
                                "Intel Core i9-11900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ROG Strix",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS ROG Strix SCAR 18",
                    "screenSize": [
                        "18\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, SD card, HDMI 2.1, RJ45",
                    "weight": "3.1kg",
                    "release_year": "2023",
                    "notes": "Desktop-replacement gaming, massive display",
                    "display": "18\" QHD+ IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "G834JY-XS97",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Strix G15 G513",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 5900HX"
                    ],
                    "gpu": [
                        "AMD Radeon RX 6800M"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0b, RJ45",
                    "weight": "2.3kg",
                    "release_year": "2021",
                    "notes": "AMD advantage, strong AMD GPU",
                    "display": "15.6\" QHD IPS, 2560×1440, 165Hz",
                    "skus": [
                        {
                            "id": "G513QY-HF006W",
                            "cpu": [
                                "AMD Ryzen 9 5900HX"
                            ],
                            "gpu": [
                                "AMD Radeon RX 6800M"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Strix G16 2024",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-14900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.5kg",
                    "release_year": "2024",
                    "notes": "240Hz gaming, top-tier performance",
                    "display": "16\" QHD+ IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "G614JZR-DS96",
                            "cpu": [
                                "Intel Core i9-14900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4080"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Strix G15 G513RW",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 6900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0b, RJ45",
                    "weight": "2.3kg",
                    "release_year": "2022",
                    "notes": "240Hz QHD gaming",
                    "display": "15.6\" WQHD IPS, 2560×1440, 240Hz",
                    "skus": [
                        {
                            "id": "G513RW-HF130W",
                            "cpu": [
                                "AMD Ryzen 9 6900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Strix G17 G713",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 5980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080"
                    ],
                    "ram": [
                        "32GB DDR4"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0b, RJ45",
                    "weight": "2.6kg",
                    "release_year": "2021",
                    "notes": "17\" AMD gaming powerhouse",
                    "display": "17.3\" QHD IPS, 2560×1440, 165Hz",
                    "skus": [
                        {
                            "id": "G713QS-HG028",
                            "cpu": [
                                "AMD Ryzen 9 5980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080"
                            ],
                            "ram": [
                                "32GB DDR4"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ASUS ROG",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS ROG Flow X13",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 6900HS"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "75Wh, up to 10h",
                    "ports": "USB-C/TB4, USB-A, HDMI 2.0b, microSD",
                    "weight": "1.35kg",
                    "release_year": "2022",
                    "notes": "2-in-1 gaming, eGPU compatible",
                    "display": "13.4\" QHD+ IPS, 2560×1600, 120Hz, touch",
                    "skus": [
                        {
                            "id": "GV301RC-DS94",
                            "cpu": [
                                "AMD Ryzen 9 6900HS"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Flow X16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 7940HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "USB-C/TB4, 2× USB-A, SD card, HDMI 2.0b",
                    "weight": "2.1kg",
                    "release_year": "2023",
                    "notes": "16\" 2-in-1 gaming, tent/tablet mode",
                    "display": "16\" QHD+ IPS, 2560×1600, 165Hz, touch",
                    "skus": [
                        {
                            "id": "GV601VU-BS94",
                            "cpu": [
                                "AMD Ryzen 9 7940HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Ally",
                    "screenSize": [
                        "7\""
                    ],
                    "cpu": [
                        "AMD Ryzen Z1 Extreme"
                    ],
                    "gpu": [
                        "AMD RDNA 3 graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "40Wh, up to 2h gaming",
                    "ports": "USB-C/Thunderbolt 4, microSD",
                    "weight": "0.608kg",
                    "release_year": "2023",
                    "notes": "Handheld gaming PC, XG Mobile eGPU compatible",
                    "display": "7\" FHD IPS, 1920×1080, 120Hz, touch",
                    "skus": [
                        {
                            "id": "RC71L-NH001W",
                            "cpu": [
                                "AMD Ryzen Z1 Extreme"
                            ],
                            "gpu": [
                                "AMD RDNA 3 graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS ROG Ally X",
                    "screenSize": [
                        "7\""
                    ],
                    "cpu": [
                        "AMD Ryzen Z1 Extreme"
                    ],
                    "gpu": [
                        "AMD RDNA 3 graphics"
                    ],
                    "ram": [
                        "24GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 3h gaming",
                    "ports": "USB-C/Thunderbolt 4, microSD",
                    "weight": "0.678kg",
                    "release_year": "2024",
                    "notes": "24GB RAM, larger battery, ROG Ally upgrade",
                    "display": "7\" FHD IPS, 1920×1080, 120Hz, touch",
                    "skus": [
                        {
                            "id": "RC72LA-NH001W",
                            "cpu": [
                                "AMD Ryzen Z1 Extreme"
                            ],
                            "gpu": [
                                "AMD RDNA 3 graphics"
                            ],
                            "ram": [
                                "24GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ASUS TUF",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS TUF Gaming A15 FA507",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 7940HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh, up to 9h",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2023",
                    "notes": "MIL-SPEC, RTX 4060 gaming",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "FA507XV-LP020W",
                            "cpu": [
                                "AMD Ryzen 9 7940HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS TUF Gaming F15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh, up to 8h",
                    "ports": "3× USB-A, USB-C, HDMI 2.0b, RJ45",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Budget gaming, MIL-SPEC",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "FX507ZC4-HN218W",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS TUF Gaming A16 Advantage",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7735HS"
                    ],
                    "gpu": [
                        "AMD Radeon RX 7600S"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0b, RJ45",
                    "weight": "2.3kg",
                    "release_year": "2023",
                    "notes": "AMD Advantage, good gaming value",
                    "display": "16\" WUXGA IPS, 1920×1200, 165Hz",
                    "skus": [
                        {
                            "id": "FA617NS-DS74",
                            "cpu": [
                                "AMD Ryzen 7 7735HS"
                            ],
                            "gpu": [
                                "AMD Radeon RX 7600S"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "ASUS TUF Gaming F17",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i5-11400H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 2050"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "90Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0b, RJ45",
                    "weight": "2.6kg",
                    "release_year": "2021",
                    "notes": "17\" budget gaming",
                    "display": "17.3\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "FX706HF-ES53",
                            "cpu": [
                                "Intel Core i5-11400H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 2050"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ASUS ExpertBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS ExpertBook B9 B9403",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 165U"
                    ],
                    "gpu": [
                        "Intel Graphics"
                    ],
                    "ram": [
                        "32GB LPDDR5X"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "75Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, SD card",
                    "weight": "0.88kg",
                    "release_year": "2024",
                    "notes": "Ultralight business, 880g only",
                    "display": "14\" 2.8K OLED, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "B9403CVY-KM0088X",
                            "cpu": [
                                "Intel Core Ultra 7 165U"
                            ],
                            "gpu": [
                                "Intel Graphics"
                            ],
                            "ram": [
                                "32GB LPDDR5X"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ASUS Chromebook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ASUS Chromebook Flip CX5",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i3-1110G4"
                    ],
                    "gpu": [
                        "Intel UHD Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4X"
                    ],
                    "storage": [
                        "128GB NVMe SSD"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "57Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, USB-A, microSD",
                    "weight": "1.92kg",
                    "release_year": "2021",
                    "notes": "15\" 2-in-1 Chromebook",
                    "display": "15.6\" FHD IPS, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "CX5500FEA-E60080",
                            "cpu": [
                                "Intel Core i3-1110G4"
                            ],
                            "gpu": [
                                "Intel UHD Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4X"
                            ],
                            "storage": [
                                "128GB NVMe SSD"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "Apple": [
        {
            "name": "MacBook Air",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MacBook Air 13\" M4 (2025)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "16GB",
                        "24GB",
                        "32GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "cpu": [
                        "Apple M4"
                    ]
                },
                {
                    "name": "MacBook Air 15\" M4 (2025)",
                    "screenSize": [
                        "15\""
                    ],
                    "ram": [
                        "16GB",
                        "24GB",
                        "32GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "cpu": [
                        "Apple M4"
                    ]
                },
                {
                    "name": "MacBook Air 13\" M3 (2024)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "24GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "cpu": [
                        "Apple M3"
                    ]
                },
                {
                    "name": "MacBook Air 15\" M3 (2024)",
                    "screenSize": [
                        "15\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "24GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "cpu": [
                        "Apple M3"
                    ]
                },
                {
                    "name": "MacBook Air 13\" M2 (2022)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "24GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "cpu": [
                        "Apple M2"
                    ]
                },
                {
                    "name": "MacBook Air 13\" M1 (2020)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "cpu": [
                        "Apple M1"
                    ]
                },
                {
                    "name": "Apple MacBook Air 13 M1",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Apple M1, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 7-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Monterey"
                    ],
                    "skus": [
                        {
                            "id": "MGN63LL/A",
                            "cpu": [
                                "Apple M1, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 7-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Monterey"
                            ],
                            "screenSize": [
                                "13.3\""
                            ]
                        }
                    ],
                    "battery": "49.9Wh, up to 18h",
                    "ports": "2× USB-C/Thunderbolt 3, 3.5mm jack",
                    "weight": "1.29kg, 304×212×16.1mm",
                    "release_year": "2020",
                    "notes": "Fanless design, first Apple Silicon MacBook",
                    "display": "13.3\" Retina IPS, 2560×1600, 400 nits"
                },
                {
                    "name": "Apple MacBook Air 13 M2",
                    "screenSize": [
                        "13.6\""
                    ],
                    "cpu": [
                        "Apple M2, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 8-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MLXW3LL/A",
                            "cpu": [
                                "Apple M2, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 8-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ],
                            "screenSize": [
                                "13.6\""
                            ]
                        }
                    ],
                    "battery": "52.6Wh, up to 18h",
                    "ports": "2× USB-C/Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.24kg, 304×215×11.3mm",
                    "release_year": "2022",
                    "notes": "Redesigned chassis, MagSafe returns, notch display",
                    "display": "13.6\" Liquid Retina, 2560×1664, 500 nits"
                },
                {
                    "name": "Apple MacBook Air 13 M3",
                    "screenSize": [
                        "13.6\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MRXN3LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "13.6\""
                            ]
                        }
                    ],
                    "battery": "52.6Wh, up to 18h",
                    "ports": "2× USB-C/Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.24kg",
                    "release_year": "2024",
                    "notes": "Supports two external displays, Wi-Fi 6E",
                    "display": "13.6\" Liquid Retina, 2560×1664, 500 nits"
                },
                {
                    "name": "Apple MacBook Air 15 M2",
                    "screenSize": [
                        "15.3\""
                    ],
                    "cpu": [
                        "Apple M2, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MQKQ3LL/A",
                            "cpu": [
                                "Apple M2, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ],
                            "screenSize": [
                                "15.3\""
                            ]
                        }
                    ],
                    "battery": "66.5Wh, up to 18h",
                    "ports": "2× USB-C/Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.51kg",
                    "release_year": "2023",
                    "notes": "Largest fanless laptop, first 15\" MacBook Air",
                    "display": "15.3\" Liquid Retina, 2880×1864, 500 nits"
                },
                {
                    "name": "Apple MacBook Air 15 M3",
                    "screenSize": [
                        "15.3\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MRYU3LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "15.3\""
                            ]
                        }
                    ],
                    "battery": "66.5Wh, up to 18h",
                    "ports": "2× USB-C/Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.51kg",
                    "release_year": "2024",
                    "notes": "Wi-Fi 6E, supports dual external displays",
                    "display": "15.3\" Liquid Retina, 2880×1864, 500 nits"
                },
                {
                    "name": "Apple MacBook Air 13 M1 8GB/512GB",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Apple M1, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 8-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Big Sur"
                    ],
                    "battery": "49.9Wh, up to 18h",
                    "ports": "2× Thunderbolt 3/USB4, 3.5mm jack",
                    "weight": "1.29kg",
                    "release_year": "2020",
                    "notes": "Upgraded storage, 8-core GPU",
                    "display": "13.3\" Retina IPS, 2560×1600, 400 nits",
                    "skus": [
                        {
                            "id": "MGNA3LL/A",
                            "cpu": [
                                "Apple M1, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 8-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Big Sur"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Air 13 M2 16GB",
                    "screenSize": [
                        "13.6\""
                    ],
                    "cpu": [
                        "Apple M2, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "battery": "52.6Wh, up to 18h",
                    "ports": "2× Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.24kg",
                    "release_year": "2022",
                    "notes": "16GB RAM config, 10-core GPU",
                    "display": "13.6\" Liquid Retina, 2560×1664, 500 nits",
                    "skus": [
                        {
                            "id": "MQKP3LL/A",
                            "cpu": [
                                "Apple M2, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Air 13 M3 16GB",
                    "screenSize": [
                        "13.6\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "battery": "52.6Wh, up to 18h",
                    "ports": "2× Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.24kg",
                    "release_year": "2024",
                    "notes": "16GB M3, dual external displays",
                    "display": "13.6\" Liquid Retina, 2560×1664, 500 nits",
                    "skus": [
                        {
                            "id": "MXD33LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Air 15 M2 16GB",
                    "screenSize": [
                        "15.3\""
                    ],
                    "cpu": [
                        "Apple M2, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "battery": "66.5Wh, up to 18h",
                    "ports": "2× Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.51kg",
                    "release_year": "2023",
                    "notes": "16GB config for power users",
                    "display": "15.3\" Liquid Retina, 2880×1864, 500 nits",
                    "skus": [
                        {
                            "id": "MQKR3LL/A",
                            "cpu": [
                                "Apple M2, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Air 15 M3 16GB",
                    "screenSize": [
                        "15.3\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "battery": "66.5Wh, up to 18h",
                    "ports": "2× Thunderbolt 3, MagSafe 3, 3.5mm jack",
                    "weight": "1.51kg",
                    "release_year": "2024",
                    "notes": "16GB M3 15-inch",
                    "display": "15.3\" Liquid Retina, 2880×1864, 500 nits",
                    "skus": [
                        {
                            "id": "MXD23LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MacBook Pro",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MacBook Pro 14\" M4 Pro (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "24GB",
                        "48GB"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD",
                        "4TB SSD"
                    ],
                    "cpu": [
                        "Apple M4 Pro"
                    ]
                },
                {
                    "name": "MacBook Pro 14\" M4 Max (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "36GB",
                        "48GB",
                        "64GB",
                        "96GB",
                        "128GB"
                    ],
                    "cpu": [
                        "Apple M4 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 16\" M4 Pro (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "24GB",
                        "48GB"
                    ],
                    "cpu": [
                        "Apple M4 Pro"
                    ]
                },
                {
                    "name": "MacBook Pro 16\" M4 Max (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "36GB",
                        "48GB",
                        "64GB",
                        "96GB",
                        "128GB"
                    ],
                    "cpu": [
                        "Apple M4 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 14\" M3 (2023)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "18GB",
                        "36GB",
                        "48GB",
                        "96GB",
                        "128GB"
                    ],
                    "cpu": [
                        "Apple M3",
                        "Apple M3 Pro",
                        "Apple M3 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 16\" M3 (2023)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "18GB",
                        "36GB",
                        "48GB",
                        "96GB",
                        "128GB"
                    ],
                    "cpu": [
                        "Apple M3 Pro",
                        "Apple M3 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 13\" M2 (2022)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "24GB"
                    ],
                    "cpu": [
                        "Apple M2"
                    ]
                },
                {
                    "name": "MacBook Pro 14\" M2 (2023)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "96GB"
                    ],
                    "cpu": [
                        "Apple M2 Pro",
                        "Apple M2 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 16\" M2 (2023)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "96GB"
                    ],
                    "cpu": [
                        "Apple M2 Pro",
                        "Apple M2 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 13\" M1 (2020)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ],
                    "cpu": [
                        "Apple M1"
                    ]
                },
                {
                    "name": "MacBook Pro 14\" M1 (2021)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "cpu": [
                        "Apple M1 Pro",
                        "Apple M1 Max"
                    ]
                },
                {
                    "name": "MacBook Pro 16\" M1 (2021)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "cpu": [
                        "Apple M1 Pro",
                        "Apple M1 Max"
                    ]
                },
                {
                    "name": "MacBook Pro Intel (2019)",
                    "screenSize": [
                        "13\"",
                        "15\"",
                        "16\""
                    ]
                },
                {
                    "name": "Apple MacBook Pro 14 M3",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MTL73LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "14.2\""
                            ]
                        }
                    ],
                    "battery": "70Wh, up to 22h",
                    "ports": "3× Thunderbolt 4, HDMI, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "1.55kg",
                    "release_year": "2023",
                    "notes": "Mini-LED XDR display, first M3 MacBook Pro",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, ProMotion 120Hz, 1000 nits"
                },
                {
                    "name": "Apple MacBook Pro 14 M3 Pro",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M3 Pro, 11-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 Pro 14-core GPU"
                    ],
                    "ram": [
                        "18GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MRX33LL/A",
                            "cpu": [
                                "Apple M3 Pro, 11-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 Pro 14-core GPU"
                            ],
                            "ram": [
                                "18GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "14.2\""
                            ]
                        }
                    ],
                    "battery": "72Wh, up to 18h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "1.61kg",
                    "release_year": "2023",
                    "notes": "ProRes hardware acceleration, up to 64GB RAM",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, ProMotion 120Hz"
                },
                {
                    "name": "Apple MacBook Pro 14 M3 Max",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M3 Max, 14-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 Max 30-core GPU"
                    ],
                    "ram": [
                        "36GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MRX43LL/A",
                            "cpu": [
                                "Apple M3 Max, 14-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 Max 30-core GPU"
                            ],
                            "ram": [
                                "36GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "14.2\""
                            ]
                        }
                    ],
                    "battery": "72Wh, up to 18h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "1.62kg",
                    "release_year": "2023",
                    "notes": "Up to 128GB RAM, 3 external displays",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, ProMotion 120Hz"
                },
                {
                    "name": "Apple MacBook Pro 16 M3 Pro",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M3 Pro, 12-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 Pro 18-core GPU"
                    ],
                    "ram": [
                        "18GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MRW33LL/A",
                            "cpu": [
                                "Apple M3 Pro, 12-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 Pro 18-core GPU"
                            ],
                            "ram": [
                                "18GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "16.2\""
                            ]
                        }
                    ],
                    "battery": "88Wh, up to 22h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "2.14kg",
                    "release_year": "2023",
                    "notes": "Best battery life in lineup",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, ProMotion 120Hz"
                },
                {
                    "name": "Apple MacBook Pro 16 M3 Max",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M3 Max, 16-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 Max 40-core GPU"
                    ],
                    "ram": [
                        "48GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MRW43LL/A",
                            "cpu": [
                                "Apple M3 Max, 16-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 Max 40-core GPU"
                            ],
                            "ram": [
                                "48GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "16.2\""
                            ]
                        }
                    ],
                    "battery": "88Wh, up to 22h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "2.15kg",
                    "release_year": "2023",
                    "notes": "Up to 128GB RAM, ultimate pro performance",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, ProMotion 120Hz"
                },
                {
                    "name": "Apple MacBook Pro 13 M2",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Apple M2, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "battery": "58.2Wh, up to 20h",
                    "ports": "2× Thunderbolt 4, 3.5mm jack",
                    "weight": "1.4kg",
                    "release_year": "2022",
                    "notes": "Last Touch Bar model, M2 chip",
                    "display": "13.3\" Retina IPS, 2560×1600, 500 nits, Touch Bar",
                    "skus": [
                        {
                            "id": "MNEP3LL/A",
                            "cpu": [
                                "Apple M2, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 14 M4",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M4, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "battery": "72Wh, up to 24h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "1.55kg",
                    "release_year": "2024",
                    "notes": "M4 debut, starts at 16GB, Neural Engine upgrade",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, ProMotion 120Hz, 1000 nits",
                    "skus": [
                        {
                            "id": "MX2D3LL/A",
                            "cpu": [
                                "Apple M4, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 14 M4 Pro",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M4 Pro, 14-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 Pro 20-core GPU"
                    ],
                    "ram": [
                        "24GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "battery": "72Wh, up to 24h",
                    "ports": "3× Thunderbolt 5, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "1.62kg",
                    "release_year": "2024",
                    "notes": "Thunderbolt 5, up to 96GB RAM",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, ProMotion 120Hz",
                    "skus": [
                        {
                            "id": "MX2Y3LL/A",
                            "cpu": [
                                "Apple M4 Pro, 14-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 Pro 20-core GPU"
                            ],
                            "ram": [
                                "24GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 14 M4 Max",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M4 Max, 16-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 Max 40-core GPU"
                    ],
                    "ram": [
                        "48GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "battery": "72Wh, up to 24h",
                    "ports": "3× Thunderbolt 5, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "1.62kg",
                    "release_year": "2024",
                    "notes": "Up to 128GB RAM, Thunderbolt 5",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, ProMotion 120Hz",
                    "skus": [
                        {
                            "id": "MX323LL/A",
                            "cpu": [
                                "Apple M4 Max, 16-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 Max 40-core GPU"
                            ],
                            "ram": [
                                "48GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 16 M4 Pro",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M4 Pro, 14-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 Pro 20-core GPU"
                    ],
                    "ram": [
                        "24GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "battery": "88Wh, up to 24h",
                    "ports": "3× Thunderbolt 5, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "2.14kg",
                    "release_year": "2024",
                    "notes": "Thunderbolt 5, M4 Pro upgrade",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, ProMotion 120Hz",
                    "skus": [
                        {
                            "id": "MX2U3LL/A",
                            "cpu": [
                                "Apple M4 Pro, 14-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 Pro 20-core GPU"
                            ],
                            "ram": [
                                "24GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 16 M4 Max",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M4 Max, 16-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 Max 40-core GPU"
                    ],
                    "ram": [
                        "48GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "battery": "88Wh, up to 24h",
                    "ports": "3× Thunderbolt 5, HDMI 2.1, SD card, MagSafe 3, 3.5mm jack",
                    "weight": "2.15kg",
                    "release_year": "2024",
                    "notes": "Up to 128GB RAM, TB5",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, ProMotion 120Hz",
                    "skus": [
                        {
                            "id": "MX353LL/A",
                            "cpu": [
                                "Apple M4 Max, 16-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 Max 40-core GPU"
                            ],
                            "ram": [
                                "48GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 13 M1",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Apple M1, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 8-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Big Sur"
                    ],
                    "battery": "58.2Wh, up to 20h",
                    "ports": "2× Thunderbolt 4, 3.5mm jack",
                    "weight": "1.4kg",
                    "release_year": "2020",
                    "notes": "M1 Pro with Touch Bar",
                    "display": "13.3\" Retina IPS, 2560×1600, 500 nits, Touch Bar",
                    "skus": [
                        {
                            "id": "MYD82LL/A",
                            "cpu": [
                                "Apple M1, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 8-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Big Sur"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 14 M1 Pro",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M1 Pro, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 Pro 14-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Monterey"
                    ],
                    "battery": "69.6Wh, up to 17h",
                    "ports": "3× Thunderbolt 4, HDMI, SD card, MagSafe 3",
                    "weight": "1.6kg",
                    "release_year": "2021",
                    "notes": "First 14\" Pro, new design, MagSafe return",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, 120Hz, ProMotion",
                    "skus": [
                        {
                            "id": "MKGP3LL/A",
                            "cpu": [
                                "Apple M1 Pro, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 Pro 14-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Monterey"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 16 M1 Pro",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M1 Pro, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 Pro 16-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Monterey"
                    ],
                    "battery": "99.6Wh, up to 21h",
                    "ports": "3× Thunderbolt 4, HDMI, SD card, MagSafe 3",
                    "weight": "2.15kg",
                    "release_year": "2021",
                    "notes": "Notch design, ports return",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, 120Hz ProMotion",
                    "skus": [
                        {
                            "id": "MK183LL/A",
                            "cpu": [
                                "Apple M1 Pro, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 Pro 16-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Monterey"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 16 M1 Max",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M1 Max, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 Max 32-core GPU"
                    ],
                    "ram": [
                        "32GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Monterey"
                    ],
                    "battery": "99.6Wh, up to 21h",
                    "ports": "3× Thunderbolt 4, HDMI, SD card, MagSafe 3",
                    "weight": "2.15kg",
                    "release_year": "2021",
                    "notes": "M1 Max debut, incredible GPU",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, 120Hz ProMotion",
                    "skus": [
                        {
                            "id": "MK1H3LL/A",
                            "cpu": [
                                "Apple M1 Max, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 Max 32-core GPU"
                            ],
                            "ram": [
                                "32GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Monterey"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 14 M2 Pro",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Apple M2 Pro, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Pro 16-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "battery": "69.6Wh, up to 18h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3",
                    "weight": "1.63kg",
                    "release_year": "2023",
                    "notes": "M2 Pro upgrade to 14\"",
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, 120Hz ProMotion",
                    "skus": [
                        {
                            "id": "MPHJ3LL/A",
                            "cpu": [
                                "Apple M2 Pro, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Pro 16-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple MacBook Pro 16 M2 Pro",
                    "screenSize": [
                        "16.2\""
                    ],
                    "cpu": [
                        "Apple M2 Pro, 12-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Pro 19-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "battery": "100Wh, up to 22h",
                    "ports": "3× Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3",
                    "weight": "2.15kg",
                    "release_year": "2023",
                    "notes": "M2 Pro 16-inch",
                    "display": "16.2\" Liquid Retina XDR, 3456×2234, 120Hz ProMotion",
                    "skus": [
                        {
                            "id": "MNWC3LL/A",
                            "cpu": [
                                "Apple M2 Pro, 12-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Pro 19-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "MSI": [
        {
            "name": "Stealth",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Stealth 16 AI Studio (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Stealth 14 AI Studio",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Stealth 15M A12UE",
                    "screenSize": [
                        "15.6\""
                    ]
                }
            ]
        },
        {
            "name": "Raider",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Raider GE78 HX (2024)",
                    "screenSize": [
                        "17\""
                    ],
                    "ram": [
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop"
                    ]
                },
                {
                    "name": "Raider GE68 HX (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "Raider GE76 12UGS",
                    "screenSize": [
                        "17.3\""
                    ]
                },
                {
                    "name": "MSI Raider GE78 HX",
                    "screenSize": [
                        "17\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "GE78HX-13VI014",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "17\""
                            ]
                        }
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, SD card, RJ45",
                    "weight": "2.9kg",
                    "release_year": "2023",
                    "notes": "Top gaming performance, RGB keyboard",
                    "display": "17\" QHD+ IPS, 2560×1600, 240Hz"
                },
                {
                    "name": "MSI Raider GE76",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, mini DP, RJ45, SD card",
                    "weight": "2.9kg",
                    "release_year": "2022",
                    "notes": "17\" gaming, 4K display",
                    "display": "17.3\" UHD IPS, 3840×2160, 120Hz",
                    "skus": [
                        {
                            "id": "12UHS-256",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "MSI GE75 Raider",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-10750H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 2070 Super"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "65Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0, RJ45, SD card",
                    "weight": "2.95kg",
                    "release_year": "2020",
                    "notes": "240Hz gaming display",
                    "display": "17.3\" FHD IPS, 1920×1080, 240Hz",
                    "skus": [
                        {
                            "id": "10SF-029",
                            "cpu": [
                                "Intel Core i7-10750H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 2070 Super"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Katana",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Katana 17 B13VEK",
                    "screenSize": [
                        "17.3\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Katana 15 B13VEK",
                    "screenSize": [
                        "15.6\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                }
            ]
        },
        {
            "name": "Cyborg",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Cyborg 15 A13SUX",
                    "screenSize": [
                        "15.6\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Cyborg 15 A12VF",
                    "screenSize": [
                        "15.6\""
                    ]
                }
            ]
        },
        {
            "name": "Titan",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Titan GT77 HX",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "64GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "GT77HX-13VI009",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "64GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "17.3\""
                            ]
                        }
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 5× USB-A, HDMI 2.1, mini DP 1.4, SD card, RJ45",
                    "weight": "3.5kg",
                    "release_year": "2023",
                    "notes": "Ultimate desktop replacement, mechanical keyboard",
                    "display": "17.3\" UHD IPS, 3840×2160, 144Hz"
                }
            ]
        },
        {
            "name": "Creator",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Creator Z16P B12U",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "Z16P-B12UHST-064",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "99.9Wh",
                    "ports": "2× Thunderbolt 4, USB-A, USB-C, SD card, HDMI 2.1",
                    "weight": "2.35kg",
                    "release_year": "2022",
                    "notes": "Creator laptop, touch display, stylus support",
                    "display": "16\" QHD+ IPS, 2560×1600, 165Hz, touch"
                },
                {
                    "name": "MSI Creator M16 B12V",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-12650H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "99.9Wh",
                    "ports": "2× USB-C, 3× USB-A, HDMI 2.0, SD card",
                    "weight": "2.15kg",
                    "release_year": "2023",
                    "notes": "Creator mid-range, QHD gaming-grade screen",
                    "display": "16\" QHD IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "B12VE-046",
                            "cpu": [
                                "Intel Core i7-12650H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Stealth",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Stealth 15M",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-11375H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "52.4Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.0, RJ45",
                    "weight": "1.8kg",
                    "release_year": "2021",
                    "notes": "Ultra-slim gaming, 16.5mm thin",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "A11UEK-052",
                            "cpu": [
                                "Intel Core i7-11375H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "MSI Stealth 16 Studio",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1",
                    "weight": "2.15kg",
                    "release_year": "2023",
                    "notes": "Creator/gaming hybrid, slim design",
                    "display": "16\" QHD+ IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "A13VF-225",
                            "cpu": [
                                "Intel Core i9-13900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI GS66",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI GS66 Stealth",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i9-11900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080"
                    ],
                    "ram": [
                        "32GB DDR4"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.0, RJ45, SD card",
                    "weight": "2.1kg",
                    "release_year": "2021",
                    "notes": "Slim premium gaming",
                    "display": "15.6\" QHD IPS, 2560×1440, 165Hz",
                    "skus": [
                        {
                            "id": "11UH-021",
                            "cpu": [
                                "Intel Core i9-11900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080"
                            ],
                            "ram": [
                                "32GB DDR4"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Prestige",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Prestige 14 Evo",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1280P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "72Wh, up to 18h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI 2.0",
                    "weight": "1.29kg",
                    "release_year": "$2022",
                    "notes": "Premium business ultrabook",
                    "display": "14\" FHD+ IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "A12M-021",
                            "cpu": [
                                "Intel Core i7-1280P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "MSI Prestige 16 AI Evo",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "Intel Arc Graphics"
                    ],
                    "ram": [
                        "32GB LPDDR5X"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "99.9Wh",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI 2.0",
                    "weight": "1.69kg",
                    "release_year": "2024",
                    "notes": "Copilot+ business ultrabook",
                    "display": "16\" 3.2K IPS, 3200×2000, 120Hz",
                    "skus": [
                        {
                            "id": "B1MG-013",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "Intel Arc Graphics"
                            ],
                            "ram": [
                                "32GB LPDDR5X"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Crosshair",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Crosshair 16 HX",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13950HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.6kg",
                    "release_year": "2023",
                    "notes": "240Hz gaming, Raptor Lake HX",
                    "display": "16\" QHD+ IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "B13VGK-1001",
                            "cpu": [
                                "Intel Core i9-13950HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Katana",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Katana 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-13620H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "53.5Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0, RJ45, SD card",
                    "weight": "2.25kg",
                    "release_year": "2023",
                    "notes": "Budget gaming, good performance",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "B13VEK-1093",
                            "cpu": [
                                "Intel Core i7-13620H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Sword",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Sword 16 HX",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-14700HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0, RJ45, SD card",
                    "weight": "2.5kg",
                    "release_year": "2024",
                    "notes": "Mid-range gaming, Raptor Lake Refresh",
                    "display": "16\" QHD+ IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "B14VGKG-1007",
                            "cpu": [
                                "Intel Core i7-14700HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Summit",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Summit E16 Flip",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1280P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "32GB DDR4"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "99.9Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI 2.0",
                    "weight": "1.94kg",
                    "release_year": "2022",
                    "notes": "4K business 2-in-1, premium build",
                    "display": "16\" 4K IPS, 3840×2400, touch, 60Hz",
                    "skus": [
                        {
                            "id": "A12MT-272",
                            "cpu": [
                                "Intel Core i7-1280P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "32GB DDR4"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Modern",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Modern 14 B11M",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "52Wh, up to 10h",
                    "ports": "USB-C, 2× USB-A, HDMI, microSD",
                    "weight": "1.4kg",
                    "release_year": "2021",
                    "notes": "Budget business ultrabook",
                    "display": "14\" FHD IPS, 1920×1080, 60Hz",
                    "skus": [
                        {
                            "id": "B11MOU-1022",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Vector",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Vector GP66",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.3kg",
                    "release_year": "2022",
                    "notes": "240Hz QHD gaming",
                    "display": "15.6\" QHD IPS, 2560×1440, 240Hz",
                    "skus": [
                        {
                            "id": "12UGSO-803",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "MSI Cyborg",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MSI Cyborg 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12650H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "53.5Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.0, RJ45",
                    "weight": "1.98kg",
                    "release_year": "2023",
                    "notes": "Budget gaming, see-through design",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "A12VE-030",
                            "cpu": [
                                "Intel Core i7-12650H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4050"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "Acer": [
        {
            "name": "Swift",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Swift X 14 (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Swift Go 14 (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Swift Go 16 (2024)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Swift Edge 16",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Swift 5 (SF514)",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Swift 3 (SF314)",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Acer Swift 3 SF314",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5500U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "NX.K0SAA.001",
                            "cpu": [
                                "AMD Ryzen 5 5500U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "56Wh, up to 11.5h",
                    "ports": "USB-C 3.2, 2× USB-A, HDMI, SD card",
                    "weight": "1.45kg",
                    "release_year": "2021",
                    "notes": "Lightweight budget ultrabook",
                    "display": "14\" FHD IPS, 1920×1080, 300 nits"
                },
                {
                    "name": "Acer Swift 3 SF314-59",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4X"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "56Wh, up to 11.5h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.19kg",
                    "release_year": "2021",
                    "notes": "Lightweight ultrabook, Thunderbolt 4",
                    "display": "14\" FHD IPS, 1920×1080, 300 nits",
                    "skus": [
                        {
                            "id": "NX.A0EAA.006",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4X"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Swift 3 SF316-51",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-11370H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "56Wh, up to 10h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.7kg",
                    "release_year": "2021",
                    "notes": "16\" budget ultrabook",
                    "display": "16\" FHD IPS, 1920×1080, 300 nits",
                    "skus": [
                        {
                            "id": "NX.ABKAA.002",
                            "cpu": [
                                "Intel Core i7-11370H"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Swift 5 SF514-56T",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR4X"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "72Wh, up to 15h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, microSD",
                    "weight": "1.35kg",
                    "release_year": "2022",
                    "notes": "Touch 2K display, slim",
                    "display": "14\" 2K IPS, 2560×1600, touch",
                    "skus": [
                        {
                            "id": "NX.K0HAA.002",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR4X"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Swift Edge 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 6800U"
                    ],
                    "gpu": [
                        "AMD Radeon 680M"
                    ],
                    "ram": [
                        "32GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "54Wh, up to 9h",
                    "ports": "2× USB-C, 2× USB-A, HDMI, microSD",
                    "weight": "1.17kg",
                    "release_year": "2022",
                    "notes": "16\" 4K OLED, ultra-light 1.17kg",
                    "display": "16\" 4K OLED, 3840×2400, 60Hz, touch",
                    "skus": [
                        {
                            "id": "SFE16-43-R25B",
                            "cpu": [
                                "AMD Ryzen 7 6800U"
                            ],
                            "gpu": [
                                "AMD Radeon 680M"
                            ],
                            "ram": [
                                "32GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Swift X SFX16-52G",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "72Wh, up to 10h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.8kg",
                    "release_year": "2022",
                    "notes": "Creator ultrabook with discrete GPU",
                    "display": "16\" QHD+ IPS, 2560×1600, 120Hz",
                    "skus": [
                        {
                            "id": "NX.K0GAA.002",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Predator",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Predator Helios Neo 14 (2024)",
                    "screenSize": [
                        "14\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Predator Helios 16 (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080 Laptop",
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Predator Helios 18 (2024)",
                    "screenSize": [
                        "18\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090 Laptop",
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "Predator Triton Neo 16",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Predator Helios 300 (2022)",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "Acer Predator Helios 300",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "PH315-55-78ER",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "55Wh, up to 7h",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Great price-performance gaming",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz"
                }
            ]
        },
        {
            "name": "Nitro",
            "type": "gaming",
            "subModels": [
                {
                    "name": "Nitro 16 AN16-51 (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "AMD Radeon RX 7700S"
                    ]
                },
                {
                    "name": "Nitro 5 AN515 (2023)",
                    "screenSize": [
                        "15.6\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop",
                        "NVIDIA GeForce RTX 4050 Laptop"
                    ]
                },
                {
                    "name": "Acer Nitro 5",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "AN515-58-525P",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "57.5Wh, up to 8h",
                    "ports": "USB-C 3.2, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Budget gaming, excellent value",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz"
                },
                {
                    "name": "Acer Nitro 5 AN515-58",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "57.5Wh, up to 8h",
                    "ports": "USB-C 3.2, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Budget entry gaming",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "NH.QFHAA.001",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Nitro 16 AN16-51",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i5-13500H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "8GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "76Wh",
                    "ports": "USB-C, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.4kg",
                    "release_year": "$2023",
                    "notes": "16\" Nitro, budget gaming",
                    "display": "16\" WUXGA IPS, 1920×1200, 144Hz",
                    "skus": [
                        {
                            "id": "NH.QKBAA.002",
                            "cpu": [
                                "Intel Core i5-13500H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "8GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Nitro 5 AN515-57",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-11400H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "57.5Wh",
                    "ports": "USB-C 3.2, 3× USB-A, HDMI 2.1, RJ45",
                    "weight": "2.2kg",
                    "release_year": "2021",
                    "notes": "Budget gaming RTX 3060",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "NH.QESAA.002",
                            "cpu": [
                                "Intel Core i5-11400H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Aspire",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Aspire 7 A717 (2024)",
                    "screenSize": [
                        "17.3\""
                    ]
                },
                {
                    "name": "Aspire 5 A515 (2023)",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ]
                },
                {
                    "name": "Aspire 3 A315 (2023)",
                    "screenSize": [
                        "15.6\""
                    ],
                    "ram": [
                        "8GB"
                    ]
                },
                {
                    "name": "Aspire Vero 16 (2024)",
                    "screenSize": [
                        "16\""
                    ]
                }
            ]
        },
        {
            "name": "Spin",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Spin 14 (SP14-51MTN)",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Spin 714 (SP714-51M)",
                    "screenSize": [
                        "14\""
                    ]
                }
            ]
        },
        {
            "name": "Predator Helios",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Acer Predator Helios 300",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "55Wh, up to 7h",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Great price-performance gaming",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "PH315-55-78ER",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Predator Helios 300 SH315-21",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 5800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3070"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "58.75Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.1kg",
                    "release_year": "2021",
                    "notes": "AMD Helios variant",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "NH.QBPAA.001",
                            "cpu": [
                                "AMD Ryzen 7 5800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3070"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Predator Helios 300 PH315-55",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "55Wh, up to 7h",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Great value RTX 3060 gaming",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "NH.QBPAA.006",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Predator Helios Neo 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "76Wh, up to 8h",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, RJ45, SD card",
                    "weight": "2.6kg",
                    "release_year": "$2023",
                    "notes": "New Neo series, value gaming",
                    "display": "16\" WQXGA IPS, 2560×1600, 165Hz",
                    "skus": [
                        {
                            "id": "PHN16-71-74YK",
                            "cpu": [
                                "Intel Core i7-13700HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Predator Helios 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, SD card",
                    "weight": "2.6kg",
                    "release_year": "2023",
                    "notes": "High-end gaming, 3.2K screen",
                    "display": "16\" 3.2K IPS, 3200×2000, 165Hz",
                    "skus": [
                        {
                            "id": "PH16-71-99YM",
                            "cpu": [
                                "Intel Core i9-13900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4080"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Acer Predator",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Acer Predator Triton 500 SE",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, SD card",
                    "weight": "2.2kg",
                    "release_year": "2022",
                    "notes": "Slim premium gaming",
                    "display": "16\" WQXGA IPS, 2560×1600, 240Hz",
                    "skus": [
                        {
                            "id": "PT516-52s-79W3",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Acer Chromebook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Acer Chromebook Spin 714",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4X"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "65.6Wh, up to 10h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, microSD",
                    "weight": "1.45kg",
                    "release_year": "2022",
                    "notes": "Business Chromebook 2-in-1, military-grade",
                    "display": "14\" 2K IPS, 2256×1504, touch",
                    "skus": [
                        {
                            "id": "CP714-1WN-55YE",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4X"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Acer Aspire",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Acer Aspire 5 A515-56",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-1135G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "48Wh, up to 9h",
                    "ports": "USB-A 3.2, 2× USB-A 2.0, USB-C 3.2, HDMI, SD card",
                    "weight": "1.9kg",
                    "release_year": "2021",
                    "notes": "Best value mainstream Acer",
                    "display": "15.6\" FHD IPS, 1920×1080, 300 nits",
                    "skus": [
                        {
                            "id": "NX.A1GAA.007",
                            "cpu": [
                                "Intel Core i5-1135G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Aspire 3 A315-58",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i3-1115G3"
                    ],
                    "gpu": [
                        "Intel UHD Graphics"
                    ],
                    "ram": [
                        "4GB DDR4"
                    ],
                    "storage": [
                        "128GB eMMC"
                    ],
                    "os": [
                        "Windows 11 Home in S mode"
                    ],
                    "battery": "41.4Wh, up to 7h",
                    "ports": "USB-A 3.2, USB-A 2.0, USB-C, HDMI, SD card",
                    "weight": "1.9kg",
                    "release_year": "2021",
                    "notes": "Entry budget laptop",
                    "display": "15.6\" HD TN, 1366×768, 220 nits",
                    "skus": [
                        {
                            "id": "NX.ADDEF.01G",
                            "cpu": [
                                "Intel Core i3-1115G3"
                            ],
                            "gpu": [
                                "Intel UHD Graphics"
                            ],
                            "ram": [
                                "4GB DDR4"
                            ],
                            "storage": [
                                "128GB eMMC"
                            ],
                            "os": [
                                "Windows 11 Home in S mode"
                            ]
                        }
                    ]
                },
                {
                    "name": "Acer Aspire Vero 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "65Wh, up to 10h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.4kg",
                    "release_year": "2023",
                    "notes": "Eco-friendly materials, recycled content",
                    "display": "14\" WUXGA IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "AV14-52P-5985",
                            "cpu": [
                                "Intel Core i5-1335U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Acer TravelMate",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Acer TravelMate P6",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7 vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "72Wh, up to 20h",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, RJ45",
                    "weight": "0.99kg",
                    "release_year": "2021",
                    "notes": "Ultra-light business, under 1kg",
                    "display": "14\" FHD IPS, 1920×1080, 300 nits",
                    "skus": [
                        {
                            "id": "TMP614-52-75VH",
                            "cpu": [
                                "Intel Core i7-1165G7 vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "Microsoft": [
        {
            "name": "Surface Pro",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Surface Pro 11 (Copilot+ PC)",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ]
                },
                {
                    "name": "Surface Pro 10 for Business",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "Surface Pro 9",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Surface Pro 8",
                    "screenSize": [
                        "13\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Surface Pro 7+",
                    "screenSize": [
                        "12.3\""
                    ]
                },
                {
                    "name": "Surface Pro 7",
                    "screenSize": [
                        "12.3\""
                    ]
                },
                {
                    "name": "Microsoft Surface Pro 9",
                    "screenSize": [
                        "13\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR5"
                    ],
                    "storage": [
                        "128GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "QIL-00001",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR5"
                            ],
                            "storage": [
                                "128GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "13\""
                            ]
                        }
                    ],
                    "battery": "47.36Wh, up to 15.5h",
                    "ports": "2× Thunderbolt 4, Surface Connect",
                    "weight": "879g",
                    "release_year": "2022",
                    "notes": "Detachable 2-in-1, LTE option, ARM version available",
                    "display": "13\" PixelSense, 2880×1920, 120Hz, touch"
                },
                {
                    "name": "Microsoft Surface Pro 10 Business",
                    "screenSize": [
                        "13\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 5 135U"
                    ],
                    "gpu": [
                        "Intel Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "50Wh, up to 19h",
                    "ports": "2× USB-C 3.2, Surface Connect",
                    "weight": "895g",
                    "release_year": "2024",
                    "notes": "Copilot+ AI, business edition",
                    "display": "13\" PixelSense, 2880×1920, 120Hz, touch",
                    "skus": [
                        {
                            "id": "ZDT-00001",
                            "cpu": [
                                "Intel Core Ultra 5 135U"
                            ],
                            "gpu": [
                                "Intel Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Pro 8",
                    "screenSize": [
                        "13\""
                    ],
                    "cpu": [
                        "Intel Core i5-1135G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4x"
                    ],
                    "storage": [
                        "128GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "51.5Wh, up to 16h",
                    "ports": "2× Thunderbolt 4, Surface Connect",
                    "weight": "891g",
                    "release_year": "2021",
                    "notes": "120Hz, Thunderbolt 4, new design",
                    "display": "13\" PixelSense, 2880×1920, 120Hz, touch",
                    "skus": [
                        {
                            "id": "EEA-00001",
                            "cpu": [
                                "Intel Core i5-1135G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4x"
                            ],
                            "storage": [
                                "128GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Surface Laptop",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Surface Laptop 7 (Copilot+ PC)",
                    "screenSize": [
                        "13.8\"",
                        "15\""
                    ],
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ]
                },
                {
                    "name": "Surface Laptop 6 for Business",
                    "screenSize": [
                        "13.5\"",
                        "15\""
                    ]
                },
                {
                    "name": "Surface Laptop 5",
                    "screenSize": [
                        "13.5\"",
                        "15\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "32GB"
                    ]
                },
                {
                    "name": "Surface Laptop 4",
                    "screenSize": [
                        "13.5\"",
                        "15\""
                    ]
                },
                {
                    "name": "Surface Laptop Go 3",
                    "screenSize": [
                        "12.4\""
                    ]
                },
                {
                    "name": "Surface Laptop Studio 2",
                    "screenSize": [
                        "14.4\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Laptop"
                    ]
                },
                {
                    "name": "Microsoft Surface Laptop 5 13.5",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR5"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "RBH-00001",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR5"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "13.5\""
                            ]
                        }
                    ],
                    "battery": "47.4Wh, up to 17h",
                    "ports": "Thunderbolt 4, USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.29kg",
                    "release_year": "2022",
                    "notes": "Touch display, premium build, Dolby Vision",
                    "display": "13.5\" PixelSense, 2256×1504, touch, Dolby Vision"
                },
                {
                    "name": "Microsoft Surface Laptop 5 15",
                    "screenSize": [
                        "15\""
                    ],
                    "cpu": [
                        "Intel Core i7-1265U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "RBY-00001",
                            "cpu": [
                                "Intel Core i7-1265U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15\""
                            ]
                        }
                    ],
                    "battery": "58Wh, up to 17h",
                    "ports": "Thunderbolt 4, 2× USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.56kg",
                    "release_year": "2022",
                    "notes": "Larger screen, alcantara or metal keyboard",
                    "display": "15\" PixelSense, 2496×1664, touch"
                },
                {
                    "name": "Microsoft Surface Laptop 4 13.5 AMD",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 4680U Surface Edition"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4x"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "41.2Wh, up to 19h",
                    "ports": "Thunderbolt 4, USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.27kg",
                    "release_year": "2021",
                    "notes": "AMD Surface Edition, fanless",
                    "display": "13.5\" PixelSense, 2256×1504, touch",
                    "skus": [
                        {
                            "id": "5PB-00024",
                            "cpu": [
                                "AMD Ryzen 5 4680U Surface Edition"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4x"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Laptop 4 15",
                    "screenSize": [
                        "15\""
                    ],
                    "cpu": [
                        "Intel Core i7-1185G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR4x"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "58Wh, up to 17h",
                    "ports": "Thunderbolt 4, 2× USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.54kg",
                    "release_year": "2021",
                    "notes": "15\" premium touch",
                    "display": "15\" PixelSense, 2496×1664, touch",
                    "skus": [
                        {
                            "id": "5IP-00036",
                            "cpu": [
                                "Intel Core i7-1185G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR4x"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Laptop 6 13.5",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 5 135H"
                    ],
                    "gpu": [
                        "Intel Arc Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "54Wh, up to 23h",
                    "ports": "2× USB-C, USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.35kg",
                    "release_year": "2024",
                    "notes": "Meteor Lake, Intel Arc, 23h battery",
                    "display": "13.5\" PixelSense, 2256×1504, touch",
                    "skus": [
                        {
                            "id": "ZLN-00001",
                            "cpu": [
                                "Intel Core Ultra 5 135H"
                            ],
                            "gpu": [
                                "Intel Arc Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Laptop Go 3",
                    "screenSize": [
                        "12.4\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR5"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "42.2Wh, up to 15h",
                    "ports": "USB-C, USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.13kg",
                    "release_year": "2023",
                    "notes": "Compact budget Surface, 12.4\"",
                    "display": "12.4\" PixelSense, 1536×1024, touch",
                    "skus": [
                        {
                            "id": "XLG-00001",
                            "cpu": [
                                "Intel Core i5-1235U"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR5"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Laptop 4 13.5 Intel",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i5-1145G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB LPDDR4x"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "47.4Wh, up to 19h",
                    "ports": "Thunderbolt 4, USB-A, 3.5mm jack, Surface Connect",
                    "weight": "1.29kg",
                    "release_year": "2021",
                    "notes": "Intel version SL4",
                    "display": "13.5\" PixelSense, 2256×1504, touch",
                    "skus": [
                        {
                            "id": "5BT-00001",
                            "cpu": [
                                "Intel Core i5-1145G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB LPDDR4x"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Surface Laptop Studio",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Microsoft Surface Laptop Studio 2",
                    "screenSize": [
                        "14.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4050"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "Z4H-00001",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4050"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14.4\""
                            ]
                        }
                    ],
                    "battery": "58Wh, up to 19h",
                    "ports": "2× Thunderbolt 4, USB-A, 3.5mm jack, SD card",
                    "weight": "1.89kg",
                    "release_year": "2023",
                    "notes": "Unique pull-forward hinge, Studio mode",
                    "display": "14.4\" PixelSense Flow, 2400×1600, 120Hz, touch"
                }
            ]
        }
    ],
    "Samsung": [
        {
            "name": "Galaxy Book",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Galaxy Book5 Ultra (2025)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Galaxy Book5 Pro 360 (2025)",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book5 Pro (2025)",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book5 (2025)",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book4 Ultra (2024)",
                    "screenSize": [
                        "16\""
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ]
                },
                {
                    "name": "Galaxy Book4 Pro 360 (2024)",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book4 Pro (2024)",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book4 (2024)",
                    "screenSize": [
                        "14\"",
                        "15.6\""
                    ]
                },
                {
                    "name": "Galaxy Book3 Ultra (2023)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book3 Pro 360 (2023)",
                    "screenSize": [
                        "13.3\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book3 Pro (2023)",
                    "screenSize": [
                        "14\"",
                        "16\""
                    ]
                },
                {
                    "name": "Galaxy Book3 360 (2023)",
                    "screenSize": [
                        "13.3\"",
                        "15.6\""
                    ]
                },
                {
                    "name": "Samsung Galaxy Book4 Pro 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "76Wh, up to 21h",
                    "ports": "Thunderbolt 4, 2× USB-C, USB-A, SD card, 3.5mm jack",
                    "weight": "1.56kg",
                    "release_year": "2024",
                    "notes": "AMOLED display, Galaxy AI, ultra-light",
                    "display": "16\" Dynamic AMOLED 2X, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "NP960XGK-KG1US",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book3 Ultra",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "76Wh",
                    "ports": "Thunderbolt 4, USB-C, USB-A, SD card, HDMI",
                    "weight": "1.79kg",
                    "release_year": "2023",
                    "notes": "AMOLED creator laptop, excellent display",
                    "display": "16\" Dynamic AMOLED 2X, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "NP960XFH-XA1US",
                            "cpu": [
                                "Intel Core i9-13900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book2 Pro 13",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "63Wh, up to 21h",
                    "ports": "Thunderbolt 4, 2× USB-C, USB-A, 3.5mm jack, microSD",
                    "weight": "0.87kg",
                    "release_year": "2022",
                    "notes": "Ultra-light 870g, AMOLED display",
                    "display": "13.3\" FHD AMOLED, 1920×1080, 60Hz",
                    "skus": [
                        {
                            "id": "NP930XED-KA1US",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book2 Pro 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "68Wh, up to 21h",
                    "ports": "Thunderbolt 4, 2× USB-C, USB-A, HDMI, 3.5mm jack, microSD",
                    "weight": "1.11kg",
                    "release_year": "2022",
                    "notes": "Thin & light 15\", AMOLED",
                    "display": "15.6\" FHD AMOLED, 1920×1080, 60Hz",
                    "skus": [
                        {
                            "id": "NP950XED-KA1US",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book3 Pro 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "63Wh, up to 22h",
                    "ports": "2× Thunderbolt 4, USB-C, USB-A, HDMI, microSD",
                    "weight": "1.17kg",
                    "release_year": "2023",
                    "notes": "3K AMOLED 120Hz, thin & light",
                    "display": "14\" 3K Dynamic AMOLED, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "NP940XFG-KA1US",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book3 Pro 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "76Wh, up to 22h",
                    "ports": "2× Thunderbolt 4, USB-C, USB-A, HDMI, microSD",
                    "weight": "1.56kg",
                    "release_year": "2023",
                    "notes": "16\" AMOLED, excellent battery",
                    "display": "16\" 3K Dynamic AMOLED, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "NP960XFG-KA1US",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book4 Edge",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Snapdragon X Elite X1E-80-100"
                    ],
                    "gpu": [
                        "Qualcomm Adreno"
                    ],
                    "ram": [
                        "16GB LPDDR5x"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home (ARM)"
                    ],
                    "battery": "61.8Wh, up to 22h",
                    "ports": "2× USB-C 3.2, USB-A, HDMI microSD",
                    "weight": "1.17kg",
                    "release_year": "2024",
                    "notes": "Copilot+ ARM laptop, Snapdragon X Elite",
                    "display": "14\" Dynamic AMOLED 2X, 2880×1800, 120Hz",
                    "skus": [
                        {
                            "id": "NP990XGK-KG1US",
                            "cpu": [
                                "Snapdragon X Elite X1E-80-100"
                            ],
                            "gpu": [
                                "Qualcomm Adreno"
                            ],
                            "ram": [
                                "16GB LPDDR5x"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home (ARM)"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book2 Business",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1235U vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "51Wh, up to 21h",
                    "ports": "Thunderbolt 4, 2× USB-C, USB-A, HDMI, RJ45",
                    "weight": "1.55kg",
                    "release_year": "2022",
                    "notes": "Business laptop, vPro, LTE option",
                    "display": "14\" FHD IPS, 1920×1080, 400 nits",
                    "skus": [
                        {
                            "id": "NP730QED-KA1US",
                            "cpu": [
                                "Intel Core i5-1235U vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book3 360",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "63Wh, up to 21h",
                    "ports": "2× Thunderbolt 4, USB-C, USB-A, microSD",
                    "weight": "1.16kg",
                    "release_year": "2023",
                    "notes": "2-in-1 AMOLED, S Pen included",
                    "display": "13.3\" FHD AMOLED, 1920×1080, touch, 60Hz",
                    "skus": [
                        {
                            "id": "NP730QFG-KA1US",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Samsung Galaxy Book3 360 15.6",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "68Wh, up to 21h",
                    "ports": "2× Thunderbolt 4, USB-C, USB-A, HDMI, microSD",
                    "weight": "1.53kg",
                    "release_year": "2023",
                    "notes": "Large 2-in-1 AMOLED",
                    "display": "15.6\" FHD AMOLED, 1920×1080, touch, 60Hz",
                    "skus": [
                        {
                            "id": "NP960QFG-KA1US",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Galaxy",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Samsung Galaxy Book4 Pro 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "NP960XGK-KG1US",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "76Wh, up to 21h",
                    "ports": "Thunderbolt 4, 2× USB-C, USB-A, SD card, 3.5mm jack",
                    "weight": "1.56kg",
                    "release_year": "2024",
                    "notes": "AMOLED display, Galaxy AI, ultra-light",
                    "display": "16\" Dynamic AMOLED 2X, 2880×1800, 120Hz"
                },
                {
                    "name": "Samsung Galaxy Book3 Ultra",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "NP960XFH-XA1US",
                            "cpu": [
                                "Intel Core i9-13900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "76Wh",
                    "ports": "Thunderbolt 4, USB-C, USB-A, SD card, HDMI",
                    "weight": "1.79kg",
                    "release_year": "2023",
                    "notes": "AMOLED creator laptop, excellent display",
                    "display": "16\" Dynamic AMOLED 2X, 2880×1800, 120Hz"
                }
            ]
        },
        {
            "name": "Samsung Galaxy",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Samsung Galaxy Chromebook 2 360",
                    "screenSize": [
                        "12.4\""
                    ],
                    "cpu": [
                        "Intel Celeron N4500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 600"
                    ],
                    "ram": [
                        "4GB LPDDR4X"
                    ],
                    "storage": [
                        "64GB eMMC"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "45.5Wh, up to 14h",
                    "ports": "2× USB-C",
                    "weight": "1.14kg",
                    "release_year": "2022",
                    "notes": "QLED Chromebook 2-in-1",
                    "display": "12.4\" FHD QLED, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "XE520QEA-KB1US",
                            "cpu": [
                                "Intel Celeron N4500"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 600"
                            ],
                            "ram": [
                                "4GB LPDDR4X"
                            ],
                            "storage": [
                                "64GB eMMC"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "אחר (Other)": [
        {
            "name": "אחר",
            "type": "laptop",
            "subModels": [
                {
                    "name": "דגם אחר / לא ברשימה"
                }
            ]
        }
    ],
    "Razer": [
        {
            "name": "Blade",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Razer Blade 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-13800H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "RZ09-0485x",
                            "cpu": [
                                "Intel Core i7-13800H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "80Wh, up to 7h",
                    "ports": "Thunderbolt 4, 3× USB-A, SD card, HDMI 2.1",
                    "weight": "2.01kg",
                    "release_year": "2023",
                    "notes": "Premium slim gaming, CNC aluminum chassis",
                    "display": "15.6\" QHD IPS, 2560×1440, 240Hz"
                },
                {
                    "name": "Razer Blade 18",
                    "screenSize": [
                        "18\""
                    ],
                    "cpu": [
                        "Intel Core i9-13950HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "RZ09-0484x",
                            "cpu": [
                                "Intel Core i9-13950HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "18\""
                            ]
                        }
                    ],
                    "battery": "93.5Wh",
                    "ports": "Thunderbolt 4, 4× USB-A, SD card, HDMI 2.1",
                    "weight": "3.2kg",
                    "release_year": "2023",
                    "notes": "Largest Razer laptop, desktop-class GPU",
                    "display": "18\" QHD+ IPS, 2560×1600, 300Hz"
                },
                {
                    "name": "Razer Blade 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 7945HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "skus": [
                        {
                            "id": "RZ09-0483x",
                            "cpu": [
                                "AMD Ryzen 9 7945HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4070"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ],
                            "screenSize": [
                                "14\""
                            ]
                        }
                    ],
                    "battery": "61.6Wh",
                    "ports": "Thunderbolt 4, USB-A, USB-C, SD card, HDMI 2.1",
                    "weight": "1.72kg",
                    "release_year": "2023",
                    "notes": "Compact gaming powerhouse, Ryzen 9",
                    "display": "14\" QHD+ IPS, 2560×1600, 165Hz"
                },
                {
                    "name": "Razer Blade 14 2022",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "AMD Ryzen 9 6900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "61.6Wh, up to 8h",
                    "ports": "Thunderbolt 4, USB-A, USB-C, SD card, HDMI 2.1",
                    "weight": "1.78kg",
                    "release_year": "2022",
                    "notes": "Compact AMD gaming, CNC aluminum",
                    "display": "14\" QHD IPS, 2560×1440, 144Hz",
                    "skus": [
                        {
                            "id": "RZ09-0427x-2022",
                            "cpu": [
                                "AMD Ryzen 9 6900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Razer Blade 15 2022",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 7h",
                    "ports": "Thunderbolt 4, 3× USB-A, SD card, HDMI 2.1",
                    "weight": "2.01kg",
                    "release_year": "2022",
                    "notes": "4K gaming display option",
                    "display": "15.6\" UHD IPS, 3840×2160, 144Hz",
                    "skus": [
                        {
                            "id": "RZ09-0421x",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Razer Blade 16 2023",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13950HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "95.2Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, SD card, HDMI 2.1",
                    "weight": "2.47kg",
                    "release_year": "2023",
                    "notes": "Dual mode display (4K 60Hz or FHD 240Hz)",
                    "display": "16\" Dual-Mode Mini-LED, 3840×2400/1920×1200 (240Hz)",
                    "skus": [
                        {
                            "id": "RZ09-0483x-2023",
                            "cpu": [
                                "Intel Core i9-13950HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Razer Blade 18 2024",
                    "screenSize": [
                        "18\""
                    ],
                    "cpu": [
                        "Intel Core i9-14900HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 4× USB-A, SD card, HDMI 2.1",
                    "weight": "3.2kg",
                    "release_year": "2024",
                    "notes": "Raptor Lake-R, 99.9Wh battery",
                    "display": "18\" QHD+ IPS, 2560×1600, 300Hz",
                    "skus": [
                        {
                            "id": "RZ09-0508x",
                            "cpu": [
                                "Intel Core i9-14900HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Razer Blade Stealth 13",
                    "screenSize": [
                        "13.4\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "NVIDIA GeForce MX450"
                    ],
                    "ram": [
                        "16GB LPDDR4X"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "53.1Wh, up to 11h",
                    "ports": "Thunderbolt 4, USB-C, USB-A, 3.5mm jack",
                    "weight": "1.42kg",
                    "release_year": "2021",
                    "notes": "Slim gaming ultrabook, touch display",
                    "display": "13.4\" QHD+ IPS, 2560×1504, touch, 60Hz",
                    "skus": [
                        {
                            "id": "RZ09-0310x",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "NVIDIA GeForce MX450"
                            ],
                            "ram": [
                                "16GB LPDDR4X"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Razer Blade 15 Advanced 2022",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, SD card, HDMI 2.1",
                    "weight": "2.14kg",
                    "release_year": "2022",
                    "notes": "4K gaming option, RTX 3080 Ti",
                    "display": "15.6\" UHD+ IPS, 3840×2160, 144Hz",
                    "skus": [
                        {
                            "id": "RZ09-0409x",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "Other": [
        {
            "name": "LG Gram",
            "type": "laptop",
            "subModels": [
                {
                    "name": "LG Gram 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "72Wh, up to 24h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, microSD",
                    "weight": "0.99kg",
                    "release_year": "2022",
                    "notes": "Under 1kg, MIL-SPEC, 24h battery",
                    "display": "14\" WUXGA IPS, 1920×1200, 350 nits",
                    "skus": [
                        {
                            "id": "14Z90Q-K.AAB7U1",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "LG Gram 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 22h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, microSD",
                    "weight": "1.19kg",
                    "release_year": "2022",
                    "notes": "Lightest 16\" ultrabook, MIL-SPEC",
                    "display": "16\" WQXGA IPS, 2560×1600, 350 nits",
                    "skus": [
                        {
                            "id": "16Z90Q-K.AAB7U1",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "LG Gram 17",
                    "screenSize": [
                        "17\""
                    ],
                    "cpu": [
                        "Intel Core i7-1260P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 20h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, microSD",
                    "weight": "1.35kg",
                    "release_year": "2022",
                    "notes": "17\" under 1.4kg, impressive",
                    "display": "17\" WQXGA IPS, 2560×1600, 350 nits",
                    "skus": [
                        {
                            "id": "17Z90Q-K.AAB8U1",
                            "cpu": [
                                "Intel Core i7-1260P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "LG Gram Pro 14",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "16GB LPDDR5X"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "72Wh, up to 22h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI, microSD",
                    "weight": "1.24kg",
                    "release_year": "2024",
                    "notes": "OLED ultralight with discrete GPU",
                    "display": "14\" 2K OLED, 2560×1600, 120Hz",
                    "skus": [
                        {
                            "id": "14Z90SP-K.AA78A1",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3050"
                            ],
                            "ram": [
                                "16GB LPDDR5X"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "LG Gram 2-in-1 14T90P",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i7-1165G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR4X"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "72Wh, up to 24h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, microSD",
                    "weight": "1.35kg",
                    "release_year": "2021",
                    "notes": "Ultra-light 2-in-1",
                    "display": "14\" WUXGA IPS, 1920×1200, touch",
                    "skus": [
                        {
                            "id": "14T90P-K.AAB8U1",
                            "cpu": [
                                "Intel Core i7-1165G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR4X"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "LG Gram Style 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "80Wh, up to 15h",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, microSD",
                    "weight": "1.35kg",
                    "release_year": "2023",
                    "notes": "Stylish OLED design, holographic finish",
                    "display": "16\" 3K OLED, 3200×2000, 60Hz, glossy",
                    "skus": [
                        {
                            "id": "16Z90RS-K.AAB5U1",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Google Pixelbook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Google Pixelbook Go",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core m3-8100Y"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 615"
                    ],
                    "ram": [
                        "8GB LPDDR3"
                    ],
                    "storage": [
                        "64GB eMMC"
                    ],
                    "os": [
                        "ChromeOS"
                    ],
                    "battery": "47Wh, up to 12h",
                    "ports": "2× USB-C, 3.5mm jack",
                    "weight": "1.06kg",
                    "release_year": "2019",
                    "notes": "Premium Chromebook, backlit keyboard",
                    "display": "13.3\" FHD IPS, 1920×1080, touch",
                    "skus": [
                        {
                            "id": "GA00521-US",
                            "cpu": [
                                "Intel Core m3-8100Y"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 615"
                            ],
                            "ram": [
                                "8GB LPDDR3"
                            ],
                            "storage": [
                                "64GB eMMC"
                            ],
                            "os": [
                                "ChromeOS"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Framework Laptop",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Framework Laptop 13 Intel",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "61Wh, up to 12h",
                    "ports": "Configurable via expansion cards (4 slots)",
                    "weight": "1.3kg",
                    "release_year": "2023",
                    "notes": "Repairable/upgradeable, modular ports",
                    "display": "13.5\" 2256×1504 IPS",
                    "skus": [
                        {
                            "id": "FRANBG0001",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Framework Laptop 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 7840HS"
                    ],
                    "gpu": [
                        "AMD Radeon RX 7700S (modular)"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "85Wh, up to 9h",
                    "ports": "Configurable via expansion cards (6 slots)",
                    "weight": "2.1kg",
                    "release_year": "2024",
                    "notes": "Modular GPU, fully user-repairable",
                    "display": "16\" 2560×1600 IPS, 165Hz",
                    "skus": [
                        {
                            "id": "FRANLAP0002",
                            "cpu": [
                                "AMD Ryzen 7 7840HS"
                            ],
                            "gpu": [
                                "AMD Radeon RX 7700S (modular)"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Huawei MateBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Huawei MateBook X Pro 2023",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Intel Core i7-1360P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB LPDDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "70Wh, up to 16h",
                    "ports": "2× Thunderbolt 4, USB-A, 3.5mm jack",
                    "weight": "1.26kg",
                    "release_year": "2023",
                    "notes": "3.1K OLED, super-narrow bezels",
                    "display": "14.2\" 3.1K OLED, 3120×2080, 90Hz, touch",
                    "skus": [
                        {
                            "id": "MRGF-X",
                            "cpu": [
                                "Intel Core i7-1360P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB LPDDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Huawei MateBook 14s 2023",
                    "screenSize": [
                        "14.2\""
                    ],
                    "cpu": [
                        "Intel Core i7-13700H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "75Wh, up to 14h",
                    "ports": "2× Thunderbolt 4, USB-A, HDMI",
                    "weight": "1.43kg",
                    "release_year": "2023",
                    "notes": "Touch display, Raptor Lake",
                    "display": "14.2\" 2.5K IPS, 2520×1680, 90Hz, touch",
                    "skus": [
                        {
                            "id": "HKF-X",
                            "cpu": [
                                "Intel Core i7-13700H"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Huawei MateBook D 15",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "AMD Ryzen 5 5500U"
                    ],
                    "gpu": [
                        "AMD Radeon Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "56Wh, up to 10h",
                    "ports": "USB-C, 2× USB-A, HDMI",
                    "weight": "1.56kg",
                    "release_year": "$2021",
                    "notes": "Value ultrabook, AMD Ryzen",
                    "display": "15.6\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "BohrD-WFH9A",
                            "cpu": [
                                "AMD Ryzen 5 5500U"
                            ],
                            "gpu": [
                                "AMD Radeon Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Panasonic Toughbook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Panasonic Toughbook 55",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1145G7 vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "2× 44Wh, up to 40h",
                    "ports": "2× USB-A 3.1, 2× USB-A 2.0, HDMI, RJ45, SD card, serial",
                    "weight": "2.27kg",
                    "release_year": "2021",
                    "notes": "MIL-SPEC 810H, IP65, drop resistant, modular",
                    "display": "14\" FHD IPS, 1920×1080, 1000 nits, glove touch",
                    "skus": [
                        {
                            "id": "CF-55F2505VM",
                            "cpu": [
                                "Intel Core i5-1145G7 vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Getac B360",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Getac B360",
                    "screenSize": [
                        "13.3\""
                    ],
                    "cpu": [
                        "Intel Core i5-10210U"
                    ],
                    "gpu": [
                        "Intel UHD Graphics"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 10 Pro"
                    ],
                    "battery": "96Wh, hot-swappable",
                    "ports": "3× USB-A, USB-C, HDMI, RJ45, RS232",
                    "weight": "2.23kg",
                    "release_year": "2020",
                    "notes": "Fully rugged, IP66, MIL-STD-461G",
                    "display": "13.3\" FHD, 1920×1080, 1000 nits, glove touch",
                    "skus": [
                        {
                            "id": "BB23UDDA5HXE",
                            "cpu": [
                                "Intel Core i5-10210U"
                            ],
                            "gpu": [
                                "Intel UHD Graphics"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 10 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Gigabyte AORUS",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Gigabyte AORUS 17X AXF",
                    "screenSize": [
                        "17.3\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "99.9Wh",
                    "ports": "Thunderbolt 4, 3× USB-A, HDMI 2.1, mini DP, SD card, RJ45",
                    "weight": "3.1kg",
                    "release_year": "2023",
                    "notes": "360Hz gaming display, premium Gigabyte gaming",
                    "display": "17.3\" FHD IPS, 1920×1080, 360Hz",
                    "skus": [
                        {
                            "id": "AORUS17X-AXF-A5DE654SH",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4090"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Gigabyte G5",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Gigabyte G5 KF5-53US353SH",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "54Wh",
                    "ports": "3× USB-A, USB-C, HDMI 2.1, RJ45, SD card",
                    "weight": "2.2kg",
                    "release_year": "2023",
                    "notes": "Budget gaming with RTX 4060",
                    "display": "15.6\" FHD IPS, 1920×1080, 144Hz",
                    "skus": [
                        {
                            "id": "G5KF5-53US353SH",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 4060"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

export const BRAND_DESKTOP_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Lenovo": [
        {
            "name": "ThinkCentre",
            "type": "desktop",
            "subModels": [
                {
                    "name": "ThinkCentre M90s",
                    "type": "desktop"
                },
                {
                    "name": "ThinkCentre M70s",
                    "type": "desktop"
                },
                {
                    "name": "ThinkCentre M Series",
                    "type": "desktop"
                }
            ]
        },
        {
            "name": "ThinkPad P16",
            "type": "workstation",
            "subModels": [
                {
                    "name": "Lenovo ThinkPad P16 Gen 1",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12950HX"
                    ],
                    "gpu": [
                        "NVIDIA RTX A5500"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "21D6001KUS",
                            "cpu": [
                                "Intel Core i9-12950HX"
                            ],
                            "gpu": [
                                "NVIDIA RTX A5500"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "94Wh",
                    "ports": "2× Thunderbolt 4, 3× USB-A, HDMI, SD card, RJ45",
                    "weight": "2.95kg",
                    "release_year": "2022",
                    "notes": "ISV certified, up to 128GB RAM",
                    "display": "16\" 4K IPS, 3840×2400, 600 nits"
                }
            ]
        },
        {
            "name": "ThinkStation",
            "type": "workstation",
            "subModels": [
                {
                    "name": "Lenovo ThinkStation P3 Tower",
                    "cpu": [
                        "Intel Core i9-13900K"
                    ],
                    "gpu": [
                        "NVIDIA RTX 4000 SFF Ada"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "30GS0033US",
                            "cpu": [
                                "Intel Core i9-13900K"
                            ],
                            "gpu": [
                                "NVIDIA RTX 4000 SFF Ada"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, RJ45",
                    "weight": "10.8kg",
                    "release_year": "2023",
                    "notes": "ISV certified, tool-less, up to 128GB RAM",
                    "display": "None (external)"
                },
                {
                    "name": "Lenovo ThinkStation P5",
                    "cpu": [
                        "Intel Xeon W5-2445"
                    ],
                    "gpu": [
                        "NVIDIA RTX A4000"
                    ],
                    "ram": [
                        "32GB DDR5 ECC"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 2× USB-C, 2× DP, RJ45",
                    "weight": "19.9kg",
                    "release_year": "2022",
                    "notes": "Professional Xeon workstation",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "30GA000HUS",
                            "cpu": [
                                "Intel Xeon W5-2445"
                            ],
                            "gpu": [
                                "NVIDIA RTX A4000"
                            ],
                            "ram": [
                                "32GB DDR5 ECC"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkStation P360 Ultra",
                    "cpu": [
                        "Intel Core i9-12900K"
                    ],
                    "gpu": [
                        "NVIDIA RTX A4000 16GB"
                    ],
                    "ram": [
                        "32GB DDR5 ECC"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A, 2× USB-C/TB4, HDMI, DP, RJ45",
                    "weight": "2.7kg",
                    "release_year": "2022",
                    "notes": "Compact workstation, ISV, 2.7kg",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "30G1003BUS",
                            "cpu": [
                                "Intel Core i9-12900K"
                            ],
                            "gpu": [
                                "NVIDIA RTX A4000 16GB"
                            ],
                            "ram": [
                                "32GB DDR5 ECC"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ThinkPad P",
            "type": "workstation",
            "subModels": [
                {
                    "name": "Lenovo ThinkPad P16 Gen 1",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12950HX"
                    ],
                    "gpu": [
                        "NVIDIA RTX A5500"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "94Wh",
                    "ports": "2× Thunderbolt 4, 3× USB-A, HDMI, SD card, RJ45",
                    "weight": "2.95kg",
                    "release_year": "2022",
                    "notes": "ISV certified, up to 128GB RAM",
                    "display": "16\" 4K IPS, 3840×2400, 600 nits",
                    "skus": [
                        {
                            "id": "21D6001KUS",
                            "cpu": [
                                "Intel Core i9-12950HX"
                            ],
                            "gpu": [
                                "NVIDIA RTX A5500"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad P16s Gen 2",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "AMD Ryzen 7 PRO 7840U"
                    ],
                    "gpu": [
                        "AMD Radeon 780M + NVIDIA T550"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "86Wh",
                    "ports": "2× USB-C/TB4, 2× USB-A, HDMI, RJ45, SD card",
                    "weight": "1.95kg",
                    "release_year": "2023",
                    "notes": "Thin mobile workstation, ISV certified",
                    "display": "16\" WUXGA IPS, 1920×1200, 300 nits",
                    "skus": [
                        {
                            "id": "21HK000LUS",
                            "cpu": [
                                "AMD Ryzen 7 PRO 7840U"
                            ],
                            "gpu": [
                                "AMD Radeon 780M + NVIDIA T550"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Lenovo ThinkPad P16 Gen 2",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13980HX"
                    ],
                    "gpu": [
                        "NVIDIA RTX 3500 Ada"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "94Wh",
                    "ports": "2× Thunderbolt 4, 3× USB-A, HDMI, SD card, RJ45",
                    "weight": "2.95kg",
                    "release_year": "2023",
                    "notes": "Up to 128GB RAM, ISV certified",
                    "display": "16\" UHD+ IPS, 3840×2400, 120Hz",
                    "skus": [
                        {
                            "id": "21FA000RUS",
                            "cpu": [
                                "Intel Core i9-13980HX"
                            ],
                            "gpu": [
                                "NVIDIA RTX 3500 Ada"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Lenovo ThinkCentre",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Lenovo ThinkCentre M90q Gen 3",
                    "cpu": [
                        "Intel Core i7-12700T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, RJ45",
                    "weight": "1.37kg",
                    "release_year": "2022",
                    "notes": "Tiny PC, vPro option",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "11U50003US",
                            "cpu": [
                                "Intel Core i7-12700T"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 770"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Lenovo IdeaCentre",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Lenovo IdeaCentre 3 07ADA05",
                    "cpu": [
                        "AMD Ryzen 5 3400G"
                    ],
                    "gpu": [
                        "AMD Radeon RX Vega 11"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, SD card, RJ45",
                    "weight": "3.9kg",
                    "release_year": "2021",
                    "notes": "Budget desktop with integrated GPU",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "90MV0061US",
                            "cpu": [
                                "AMD Ryzen 5 3400G"
                            ],
                            "gpu": [
                                "AMD Radeon RX Vega 11"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ThinkCentre M Series",
            "type": "desktop",
            "subModels": [
                {
                    "name": "ThinkCentre M90q Gen 5 Tiny",
                    "cpu": [
                        "Intel Core i9-14900T",
                        "Intel Core i7-14700T",
                        "Intel Core i5-14500T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A 3.2, 2× USB-C (Thunderbolt 4), DisplayPort, HDMI, RJ-45, 3.5mm",
                    "weight": "1.25kg",
                    "release_year": "2024",
                    "notes": "Ultra-compact 1L form factor business desktop",
                    "skus": [
                        {
                            "id": "12E2001DUS",
                            "cpu": [
                                "Intel Core i7-14700T"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 770"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "ThinkCentre M70q Gen 5 Tiny",
                    "cpu": [
                        "Intel Core i7-14700T",
                        "Intel Core i5-14500T",
                        "Intel Core i3-14100T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A 3.2, 1× USB-C, DisplayPort, HDMI, RJ-45",
                    "weight": "1.25kg",
                    "release_year": "2024",
                    "notes": "Mainstream business Tiny desktop"
                },
                {
                    "name": "ThinkCentre M90s Gen 5 SFF",
                    "cpu": [
                        "Intel Core i9-14900",
                        "Intel Core i7-14700",
                        "Intel Core i5-14500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce GTX 1650 LP"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A 3.2, 2× USB-C, DisplayPort, HDMI, VGA, RJ-45, Serial",
                    "weight": "6.3kg",
                    "release_year": "2024",
                    "notes": "Small Form Factor business workstation"
                },
                {
                    "name": "ThinkCentre M720q Tiny",
                    "cpu": [
                        "Intel Core i7-9700T",
                        "Intel Core i5-9600T",
                        "Intel Core i3-9100T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 630"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4",
                        "32GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB HDD"
                    ],
                    "os": [
                        "Windows 10 Pro",
                        "Windows 11 Pro"
                    ],
                    "ports": "5× USB-A, 1× USB-C, 2× DisplayPort, RJ-45",
                    "weight": "1.32kg",
                    "release_year": "2019",
                    "notes": "Popular refurbished Tiny PC"
                },
                {
                    "name": "ThinkCentre M920q Tiny",
                    "cpu": [
                        "Intel Core i7-8700T",
                        "Intel Core i5-8500T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 630"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4",
                        "32GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 10 Pro"
                    ],
                    "ports": "6× USB-A, 2× DisplayPort, RJ-45",
                    "weight": "1.3kg",
                    "release_year": "2018",
                    "notes": "Widely available refurbished"
                }
            ]
        },
        {
            "name": "IdeaCentre",
            "type": "desktop",
            "subModels": [
                {
                    "name": "IdeaCentre 5i Gen 8 Tower",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14400"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "512GB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DisplayPort, RJ-45, SD Card, 3.5mm",
                    "weight": "7.9kg",
                    "release_year": "2024",
                    "notes": "Consumer tower, good all-rounder"
                },
                {
                    "name": "IdeaCentre Mini (1L)",
                    "cpu": [
                        "Intel Core i7-13700H",
                        "Intel Core i5-13500H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "3× USB-A, 1× USB-C, HDMI 2.1, DisplayPort, RJ-45",
                    "weight": "0.74kg",
                    "release_year": "2023",
                    "notes": "Ultra compact consumer mini PC"
                },
                {
                    "name": "IdeaCentre AIO 27 Gen 9",
                    "cpu": [
                        "Intel Core Ultra 7 155H",
                        "Intel Core Ultra 5 125H"
                    ],
                    "gpu": [
                        "Intel Arc Graphics"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "screenSize": [
                        "27\""
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, RJ-45",
                    "weight": "8.5kg",
                    "release_year": "2024",
                    "notes": "All-in-One 27\", 2.5K touch display"
                }
            ]
        },
        {
            "name": "Legion Tower",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Legion Tower 7i Gen 9",
                    "cpu": [
                        "Intel Core i9-14900KF",
                        "Intel Core i7-14700KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080 Super",
                        "NVIDIA GeForce RTX 4070 Ti Super"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD",
                        "1TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 4× USB-C, HDMI (GPU), 3× DP (GPU), RJ-45 2.5GbE, Wi-Fi 7",
                    "weight": "23kg",
                    "release_year": "2024",
                    "notes": "Flagship gaming tower, liquid cooling optional"
                },
                {
                    "name": "Legion Tower 5i Gen 9",
                    "cpu": [
                        "Intel Core i7-14700KF",
                        "Intel Core i5-14600KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Ti Super",
                        "NVIDIA GeForce RTX 4070 Super",
                        "NVIDIA GeForce RTX 4060 Ti"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "1TB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 2× USB-C, HDMI (GPU), 3× DP (GPU), RJ-45",
                    "weight": "18kg",
                    "release_year": "2024",
                    "notes": "Mid-range gaming tower"
                },
                {
                    "name": "Legion Tower 5 Gen 8 (AMD)",
                    "cpu": [
                        "AMD Ryzen 7 7700X",
                        "AMD Ryzen 5 7600X"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070",
                        "NVIDIA GeForce RTX 4060 Ti",
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI (GPU), 3× DP (GPU), RJ-45",
                    "weight": "16kg",
                    "release_year": "2023",
                    "notes": "AMD gaming tower"
                }
            ]
        }
    ],
    "Dell": [
        {
            "name": "Precision",
            "type": "workstation",
            "subModels": [
                {
                    "name": "Precision 5690",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Precision 5480",
                    "screenSize": [
                        "14\""
                    ]
                },
                {
                    "name": "Precision 7680",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "Precision 7780",
                    "screenSize": [
                        "17.3\""
                    ]
                },
                {
                    "name": "Dell Precision 5570",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA RTX A2000"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "PRS-5570-7619SLV",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA RTX A2000"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "15.6\""
                            ]
                        }
                    ],
                    "battery": "86Wh",
                    "ports": "2× Thunderbolt 4, USB-A, USB-C, SD card, 3.5mm jack",
                    "weight": "1.84kg",
                    "release_year": "2022",
                    "notes": "Mobile workstation, ISV certified",
                    "display": "15.6\" FHD+ OLED, 1920×1200"
                },
                {
                    "name": "Dell Precision 3571",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA RTX A2000"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "56Wh",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.85kg",
                    "release_year": "2022",
                    "notes": "Entry mobile workstation",
                    "display": "15.6\" FHD IPS, 1920×1080",
                    "skus": [
                        {
                            "id": "PRS3571-7619SLV",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA RTX A2000"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Precision 5570",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i7-12700H"
                    ],
                    "gpu": [
                        "NVIDIA RTX A2000"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "86Wh",
                    "ports": "2× Thunderbolt 4, USB-A, USB-C, SD card, 3.5mm jack",
                    "weight": "1.84kg",
                    "release_year": "2022",
                    "notes": "Slim workstation, ISV certified",
                    "display": "15.6\" FHD+ OLED, 1920×1200",
                    "skus": [
                        {
                            "id": "PRS5570-7619SLV",
                            "cpu": [
                                "Intel Core i7-12700H"
                            ],
                            "gpu": [
                                "NVIDIA RTX A2000"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Precision 5680",
                    "screenSize": [
                        "15.6\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900H"
                    ],
                    "gpu": [
                        "NVIDIA RTX 3500 Ada"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "86Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "1.85kg",
                    "release_year": "2023",
                    "notes": "Premium thin workstation, OLED option",
                    "display": "15.6\" OLED 3.5K, 3456×2160",
                    "skus": [
                        {
                            "id": "PRS5680-7979SLV",
                            "cpu": [
                                "Intel Core i9-13900H"
                            ],
                            "gpu": [
                                "NVIDIA RTX 3500 Ada"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Precision 7680",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13950HX"
                    ],
                    "gpu": [
                        "NVIDIA RTX A5500"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "93Wh",
                    "ports": "2× Thunderbolt 4, 3× USB-A, HDMI, SD card, RJ45",
                    "weight": "2.77kg",
                    "release_year": "2023",
                    "notes": "Up to 128GB RAM, ISV certified",
                    "display": "16\" FHD+ IPS, 1920×1200",
                    "skus": [
                        {
                            "id": "PRS7680-7979SLV",
                            "cpu": [
                                "Intel Core i9-13950HX"
                            ],
                            "gpu": [
                                "NVIDIA RTX A5500"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Precision 3480",
                    "screenSize": [
                        "14\""
                    ],
                    "cpu": [
                        "Intel Core i5-1345U vPro"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "51Wh",
                    "ports": "Thunderbolt 4, 2× USB-A, HDMI, RJ45, SD card",
                    "weight": "1.45kg",
                    "release_year": "2023",
                    "notes": "Entry mobile workstation",
                    "display": "14\" FHD IPS, 1920×1080, 250 nits",
                    "skus": [
                        {
                            "id": "PRS3480-5616SLV",
                            "cpu": [
                                "Intel Core i5-1345U vPro"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dell Precision 5820 Tower",
                    "cpu": [
                        "Intel Xeon W-2245"
                    ],
                    "gpu": [
                        "NVIDIA RTX A5000"
                    ],
                    "ram": [
                        "64GB DDR4 ECC"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 2× USB-C, 2× DP, RJ45",
                    "weight": "18kg",
                    "release_year": "2022",
                    "notes": "Tower workstation, ECC Xeon",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "PRS5820-7979SLV",
                            "cpu": [
                                "Intel Xeon W-2245"
                            ],
                            "gpu": [
                                "NVIDIA RTX A5000"
                            ],
                            "ram": [
                                "64GB DDR4 ECC"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "OptiPlex",
            "type": "desktop",
            "subModels": [
                {
                    "name": "OptiPlex 7000 Tower",
                    "type": "desktop"
                },
                {
                    "name": "OptiPlex 5000 Tower",
                    "type": "desktop"
                },
                {
                    "name": "OptiPlex 7000 Micro",
                    "type": "mini"
                },
                {
                    "name": "OptiPlex 3090 Ultra",
                    "type": "mini"
                },
                {
                    "name": "Dell OptiPlex 7000",
                    "cpu": [
                        "Intel Core i7-12700"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "DTOP073-803",
                            "cpu": [
                                "Intel Core i7-12700"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 770"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, RJ45",
                    "weight": "5.4kg",
                    "release_year": "2022",
                    "notes": "Business desktop, vPro option",
                    "display": "None (external)"
                },
                {
                    "name": "Dell OptiPlex 3000 Tower",
                    "cpu": [
                        "Intel Core i5-12500T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR4"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, RJ45",
                    "weight": "4.6kg",
                    "release_year": "2022",
                    "notes": "Entry business tower",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "XDT3000-5466BLK-PUS",
                            "cpu": [
                                "Intel Core i5-12500T"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 770"
                            ],
                            "ram": [
                                "8GB DDR4"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "OptiPlex",
            "type": "desktop",
            "subModels": [
                {
                    "name": "OptiPlex 7020 Tower",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14500",
                        "Intel Core i3-14100"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce RTX 4060 LP"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "512GB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 2× USB-C, DisplayPort 1.4, HDMI, VGA, RJ-45, Serial, 3.5mm",
                    "weight": "7.5kg",
                    "release_year": "2024",
                    "notes": "Business tower, tool-free chassis"
                },
                {
                    "name": "OptiPlex 7020 SFF",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 1× USB-C, DisplayPort, HDMI, RJ-45, Serial",
                    "weight": "5.1kg",
                    "release_year": "2024",
                    "notes": "Compact business SFF"
                },
                {
                    "name": "OptiPlex 7020 Micro",
                    "cpu": [
                        "Intel Core i7-14700T",
                        "Intel Core i5-14500T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A, 1× USB-C, DisplayPort, HDMI, RJ-45",
                    "weight": "1.2kg",
                    "release_year": "2024",
                    "notes": "Ultra-compact 1L business PC"
                },
                {
                    "name": "OptiPlex 5000 Tower",
                    "cpu": [
                        "Intel Core i7-12700",
                        "Intel Core i5-12500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro",
                        "Windows 10 Pro"
                    ],
                    "ports": "6× USB-A, 1× USB-C, DisplayPort, HDMI, VGA, RJ-45",
                    "weight": "7.3kg",
                    "release_year": "2022",
                    "notes": "Popular mid-range business desktop"
                },
                {
                    "name": "OptiPlex 3090 SFF",
                    "cpu": [
                        "Intel Core i5-10505",
                        "Intel Core i3-10105"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 630"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB HDD"
                    ],
                    "os": [
                        "Windows 10 Pro",
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, DisplayPort, HDMI, VGA, RJ-45, Serial",
                    "weight": "5.0kg",
                    "release_year": "2021",
                    "notes": "Entry-level business, widely refurbished"
                }
            ]
        },
        {
            "name": "XPS Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "XPS Desktop 8960",
                    "cpu": [
                        "Intel Core i9-14900K",
                        "Intel Core i7-14700K",
                        "Intel Core i5-14600K"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4070 Ti",
                        "NVIDIA GeForce RTX 4060 Ti",
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD",
                        "1TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home",
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A 3.2, 2× USB-C (Thunderbolt 4), SD Card, HDMI, 3.5mm, RJ-45",
                    "weight": "12.7kg",
                    "release_year": "2024",
                    "notes": "Premium consumer tower, sleek design"
                },
                {
                    "name": "XPS Desktop 8950",
                    "cpu": [
                        "Intel Core i9-12900K",
                        "Intel Core i7-12700K",
                        "Intel Core i5-12600K"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3090",
                        "NVIDIA GeForce RTX 3070",
                        "NVIDIA GeForce RTX 3060 Ti"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "1TB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 2× USB-C, HDMI, SD Card, RJ-45",
                    "weight": "12.3kg",
                    "release_year": "2022",
                    "notes": "Previous gen premium tower"
                }
            ]
        },
        {
            "name": "Inspiron Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Inspiron 3030 Tower",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14400",
                        "Intel Core i3-14100"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce RTX 3050"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "512GB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DisplayPort, RJ-45, SD Card, 3.5mm",
                    "weight": "7.6kg",
                    "release_year": "2024",
                    "notes": "Budget-friendly consumer tower"
                },
                {
                    "name": "Inspiron 24 AIO 5420",
                    "cpu": [
                        "Intel Core i7-13700H",
                        "Intel Core i5-13500H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce MX550",
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "screenSize": [
                        "24\""
                    ],
                    "ports": "2× USB-A, 2× USB-C, HDMI-out, RJ-45, SD Card",
                    "weight": "7.0kg",
                    "release_year": "2023",
                    "notes": "All-in-One 24\", FHD touch"
                }
            ]
        },
        {
            "name": "Alienware Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Alienware Aurora R16",
                    "cpu": [
                        "Intel Core i9-14900KF",
                        "Intel Core i7-14700KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080 Super",
                        "NVIDIA GeForce RTX 4070 Ti Super",
                        "NVIDIA GeForce RTX 4070 Super"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD",
                        "4TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 3× USB-C (Thunderbolt 4), 2.5GbE RJ-45, 3.5mm, front USB-C",
                    "weight": "16.8kg",
                    "release_year": "2024",
                    "notes": "Flagship gaming desktop, liquid-cooled, Legend 3.0 design"
                },
                {
                    "name": "Alienware Aurora R15 (AMD)",
                    "cpu": [
                        "AMD Ryzen 9 7950X",
                        "AMD Ryzen 7 7700X"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080",
                        "NVIDIA GeForce RTX 4070 Ti"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 3× USB-C, 2.5GbE RJ-45",
                    "weight": "16kg",
                    "release_year": "2023",
                    "notes": "AMD gaming beast, liquid-cooled CPU"
                }
            ]
        },
        {
            "name": "Precision Tower",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Precision 3680 Tower",
                    "cpu": [
                        "Intel Core i9-14900K",
                        "Intel Core i7-14700K",
                        "Intel Core i5-14600K"
                    ],
                    "gpu": [
                        "NVIDIA RTX A2000",
                        "NVIDIA RTX 4000 Ada",
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5",
                        "128GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD",
                        "1TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "8× USB-A, 2× USB-C (Thunderbolt 4), 2× DisplayPort, HDMI, RJ-45, Serial",
                    "weight": "10.6kg",
                    "release_year": "2024",
                    "notes": "Entry workstation, ISV certified"
                }
            ]
        }
    ],
    "HP": [
        {
            "name": "ZBook",
            "type": "workstation",
            "subModels": [
                {
                    "name": "HP ZBook Fury 16 G10",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13950HX"
                    ],
                    "gpu": [
                        "NVIDIA RTX 4000 Ada"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "7B623UT#ABA",
                            "cpu": [
                                "Intel Core i9-13950HX"
                            ],
                            "gpu": [
                                "NVIDIA RTX 4000 Ada"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "96Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, SD card, RJ45",
                    "weight": "2.77kg",
                    "release_year": "2023",
                    "notes": "ISV certified mobile workstation",
                    "display": "16\" 4K DreamColor IPS, 3840×2400, 120Hz"
                },
                {
                    "name": "HP ZBook Studio G10",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-13900H"
                    ],
                    "gpu": [
                        "NVIDIA RTX 3000 Ada"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "96Wh",
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI, SD card",
                    "weight": "2.1kg",
                    "release_year": "2023",
                    "notes": "Thin workstation, OLED 4K",
                    "display": "16\" 4K OLED, 3840×2400, 60Hz, touch",
                    "skus": [
                        {
                            "id": "7C6K3UT#ABA",
                            "cpu": [
                                "Intel Core i9-13900H"
                            ],
                            "gpu": [
                                "NVIDIA RTX 3000 Ada"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Z4",
            "type": "workstation",
            "subModels": [
                {
                    "name": "HP Z4 G5 Tower Workstation",
                    "cpu": [
                        "Intel Xeon W3-2425"
                    ],
                    "gpu": [
                        "NVIDIA RTX A4000"
                    ],
                    "ram": [
                        "32GB DDR5 ECC"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "86D60UT#ABA",
                            "cpu": [
                                "Intel Xeon W3-2425"
                            ],
                            "gpu": [
                                "NVIDIA RTX A4000"
                            ],
                            "ram": [
                                "32GB DDR5 ECC"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ],
                    "ports": "6× USB-A, 2× USB-C, 2× DP, RJ45",
                    "weight": "14.5kg",
                    "release_year": "2023",
                    "notes": "ECC memory, Xeon CPU, ISV certified",
                    "display": "None (external)"
                }
            ]
        },
        {
            "name": "HP ENVY",
            "type": "desktop",
            "subModels": [
                {
                    "name": "HP ENVY Desktop TE02",
                    "cpu": [
                        "Intel Core i7-12700"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, SD card, RJ45",
                    "weight": "8.6kg",
                    "release_year": "2022",
                    "notes": "Creator tower, RTX 3060",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "TE02-0030",
                            "cpu": [
                                "Intel Core i7-12700"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "HP Z8",
            "type": "workstation",
            "subModels": [
                {
                    "name": "HP Z8 Fury G5 Workstation",
                    "cpu": [
                        "Intel Xeon W9-3475X"
                    ],
                    "gpu": [
                        "NVIDIA RTX 6000 Ada"
                    ],
                    "ram": [
                        "64GB DDR5 ECC"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "8× USB-A, 4× USB-C, Thunderbolt 4, 2× DP, RJ45",
                    "weight": "24.7kg",
                    "release_year": "2023",
                    "notes": "Dual CPU capable, max 2TB RAM, ultimate workstation",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "5F0R3UT#ABA",
                            "cpu": [
                                "Intel Xeon W9-3475X"
                            ],
                            "gpu": [
                                "NVIDIA RTX 6000 Ada"
                            ],
                            "ram": [
                                "64GB DDR5 ECC"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "HP Z2",
            "type": "workstation",
            "subModels": [
                {
                    "name": "HP Z2 Mini G9 Workstation",
                    "cpu": [
                        "Intel Core i9-13900K"
                    ],
                    "gpu": [
                        "NVIDIA RTX A2000 12GB"
                    ],
                    "ram": [
                        "32GB DDR5 ECC"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A, 2× USB-C/TB4, DP, HDMI, RJ45",
                    "weight": "2.2kg",
                    "release_year": "2023",
                    "notes": "Mini workstation, ISV certified",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "8D7S3UT#ABA",
                            "cpu": [
                                "Intel Core i9-13900K"
                            ],
                            "gpu": [
                                "NVIDIA RTX A2000 12GB"
                            ],
                            "ram": [
                                "32GB DDR5 ECC"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ProDesk / Pro Tower",
            "type": "desktop",
            "subModels": [
                {
                    "name": "HP Pro Tower 400 G9",
                    "cpu": [
                        "Intel Core i7-13700",
                        "Intel Core i5-13500",
                        "Intel Core i3-13100"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce RTX 3060 LP"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4",
                        "32GB DDR4",
                        "64GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 2× USB-C, DisplayPort 1.4, HDMI, VGA, RJ-45, Serial, 3.5mm",
                    "weight": "7.2kg",
                    "release_year": "2023",
                    "notes": "Mainstream business tower"
                },
                {
                    "name": "HP EliteDesk 800 G9 Tower",
                    "cpu": [
                        "Intel Core i9-13900",
                        "Intel Core i7-13700",
                        "Intel Core i5-13500"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA RTX A2000"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "8× USB-A, 2× USB-C (Thunderbolt 4), 2× DisplayPort, HDMI, RJ-45",
                    "weight": "8.5kg",
                    "release_year": "2023",
                    "notes": "Premium business desktop, enterprise"
                },
                {
                    "name": "HP EliteDesk 800 G6 Mini",
                    "cpu": [
                        "Intel Core i7-10700T",
                        "Intel Core i5-10500T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 630"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4",
                        "32GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 10 Pro"
                    ],
                    "ports": "6× USB-A, 1× USB-C, 2× DisplayPort, RJ-45",
                    "weight": "1.25kg",
                    "release_year": "2020",
                    "notes": "Popular refurbished mini desktop"
                }
            ]
        },
        {
            "name": "OMEN Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "OMEN 45L GT22-2000",
                    "cpu": [
                        "Intel Core i9-14900KF",
                        "Intel Core i7-14700KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080 Super",
                        "NVIDIA GeForce RTX 4070 Ti Super"
                    ],
                    "ram": [
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD",
                        "2TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 2× USB-C (Thunderbolt 4), 2.5GbE RJ-45, Wi-Fi 7, 3.5mm",
                    "weight": "22kg",
                    "release_year": "2024",
                    "notes": "Flagship gaming tower, 45L CryoChamber cooling, RGB"
                },
                {
                    "name": "OMEN 25L GT15-1000",
                    "cpu": [
                        "Intel Core i7-14700F",
                        "Intel Core i5-14400F"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Ti",
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 1× USB-C, RJ-45, 3.5mm",
                    "weight": "12kg",
                    "release_year": "2024",
                    "notes": "Entry gaming tower, 25L compact"
                }
            ]
        },
        {
            "name": "Pavilion Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "HP Pavilion Desktop TP01",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14400",
                        "AMD Ryzen 7 7700",
                        "AMD Ryzen 5 7600"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "AMD Radeon RX 6400",
                        "NVIDIA GeForce GTX 1650"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "512GB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 1× USB-C, HDMI, VGA, RJ-45, SD Card, 3.5mm",
                    "weight": "6.0kg",
                    "release_year": "2024",
                    "notes": "Budget consumer desktop"
                }
            ]
        }
    ],
    "ASUS": [
        {
            "name": "ProArt",
            "type": "workstation",
            "subModels": [
                {
                    "name": "ProArt Studiobook 16 (H7604)",
                    "screenSize": [
                        "16\""
                    ],
                    "ram": [
                        "32GB",
                        "64GB"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4080 Laptop"
                    ]
                },
                {
                    "name": "ProArt P16 (H7606)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "ProArt Studiobook Pro 16 OLED (W7600)",
                    "screenSize": [
                        "16\""
                    ]
                },
                {
                    "name": "ASUS ProArt Studiobook 16",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3080 Ti"
                    ],
                    "ram": [
                        "64GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "H7600ZX-DB96",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3080 Ti"
                            ],
                            "ram": [
                                "64GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ],
                            "screenSize": [
                                "16\""
                            ]
                        }
                    ],
                    "battery": "96Wh",
                    "ports": "2× Thunderbolt 4, USB-A, USB-C, SD card, HDMI, 3.5mm jack",
                    "weight": "2.4kg",
                    "release_year": "2022",
                    "notes": "OLED creator workstation, Dial knob",
                    "display": "16\" 4K OLED, 3840×2400, 60Hz, touch"
                },
                {
                    "name": "ASUS ProArt Studiobook 16 OLED",
                    "screenSize": [
                        "16\""
                    ],
                    "cpu": [
                        "Intel Core i9-12900H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "64GB DDR5"
                    ],
                    "storage": [
                        "2TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "battery": "96Wh",
                    "ports": "2× Thunderbolt 4, USB-A, USB-C, SD card, HDMI, 3.5mm jack",
                    "weight": "2.4kg",
                    "release_year": "2022",
                    "notes": "OLED creator, ASUS Dial, haptic touchpad",
                    "display": "16\" 4K OLED, 3840×2400, 60Hz, touch",
                    "skus": [
                        {
                            "id": "W7601ZW-XB96",
                            "cpu": [
                                "Intel Core i9-12900H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "64GB DDR5"
                            ],
                            "storage": [
                                "2TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Mini",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "ASUS Mini PC PN64",
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "PN64-BB5013MD",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ],
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI, DP, RJ45, SD card",
                    "weight": "0.74kg",
                    "release_year": "2022",
                    "notes": "Compact NUC-style, powerful H-series CPU",
                    "display": "None (external)"
                }
            ]
        },
        {
            "name": "Mini PC PN",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "ASUS Mini PC PN64",
                    "cpu": [
                        "Intel Core i5-12500H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "16GB DDR4"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI, DP, RJ45, SD card",
                    "weight": "0.74kg",
                    "release_year": "2022",
                    "notes": "Compact NUC-style, powerful H-series CPU",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "PN64-BB5013MD",
                            "cpu": [
                                "Intel Core i5-12500H"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "16GB DDR4"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ASUS NUC",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "ASUS NUC 14 Pro",
                    "cpu": [
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "Intel Arc Graphics"
                    ],
                    "ram": [
                        "None (user-installed, up to 96GB DDR5)"
                    ],
                    "storage": [
                        "None (user-installed)"
                    ],
                    "os": [
                        "None (barebones)"
                    ],
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI, DP, RJ45, SD card",
                    "weight": "0.73kg",
                    "release_year": "2024",
                    "notes": "ASUS takes over NUC brand, Meteor Lake",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "RNUC14RVSU700000I",
                            "cpu": [
                                "Intel Core Ultra 7 155H"
                            ],
                            "gpu": [
                                "Intel Arc Graphics"
                            ],
                            "ram": [
                                "None (user-installed, up to 96GB DDR5)"
                            ],
                            "storage": [
                                "None (user-installed)"
                            ],
                            "os": [
                                "None (barebones)"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ROG Strix Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "ROG Strix G35CZ",
                    "cpu": [
                        "Intel Core i9-14900KF",
                        "Intel Core i7-14700KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080",
                        "NVIDIA GeForce RTX 4070 Ti"
                    ],
                    "ram": [
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD",
                        "1TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 2× USB-C, HDMI (GPU), 3× DP (GPU), 2.5GbE, Wi-Fi 7, 3.5mm",
                    "weight": "19kg",
                    "release_year": "2024",
                    "notes": "Flagship gaming tower, overclock-ready"
                },
                {
                    "name": "ROG Strix G16CH",
                    "cpu": [
                        "Intel Core i7-14700F",
                        "Intel Core i5-14400F"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Super",
                        "NVIDIA GeForce RTX 4060 Ti",
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI (GPU), 3× DP (GPU), RJ-45, Wi-Fi 6E",
                    "weight": "12kg",
                    "release_year": "2024",
                    "notes": "Mid-range gaming tower"
                }
            ]
        },
        {
            "name": "ExpertCenter Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "ExpertCenter D900MD Tower",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14500",
                        "Intel Core i3-14100"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce GT 1030"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 2× USB-C, HDMI, DisplayPort, VGA, RJ-45, Serial, 3.5mm",
                    "weight": "8.0kg",
                    "release_year": "2024",
                    "notes": "Business tower, military-grade reliability"
                }
            ]
        },
        {
            "name": "ASUS NUC",
            "type": "desktop",
            "subModels": [
                {
                    "name": "ASUS NUC 14 Pro+",
                    "cpu": [
                        "Intel Core Ultra 9 185H",
                        "Intel Core Ultra 7 155H"
                    ],
                    "gpu": [
                        "Intel Arc Graphics"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "3× USB-A, 2× Thunderbolt 4, HDMI 2.1, DisplayPort, 2.5GbE RJ-45",
                    "weight": "0.83kg",
                    "release_year": "2024",
                    "notes": "Ultra-compact NUC, ex-Intel NUC line"
                },
                {
                    "name": "ASUS ROG NUC",
                    "cpu": [
                        "Intel Core Ultra 9 185H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Laptop"
                    ],
                    "ram": [
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 2× Thunderbolt 4, HDMI 2.1, 2× DisplayPort, 2.5GbE RJ-45",
                    "weight": "2.6kg",
                    "release_year": "2024",
                    "notes": "Gaming NUC, RTX 4070 in mini form factor"
                }
            ]
        }
    ],
    "Apple": [
        {
            "name": "Mac Mini",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Mac Mini M4 Pro (2024)",
                    "ram": [
                        "24GB",
                        "48GB",
                        "64GB"
                    ],
                    "cpu": [
                        "Apple M4 Pro"
                    ]
                },
                {
                    "name": "Mac Mini M4 (2024)",
                    "ram": [
                        "16GB",
                        "32GB",
                        "64GB"
                    ],
                    "cpu": [
                        "Apple M4"
                    ]
                },
                {
                    "name": "Mac Mini M2 Pro (2023)",
                    "ram": [
                        "16GB",
                        "32GB"
                    ],
                    "cpu": [
                        "Apple M2 Pro"
                    ]
                },
                {
                    "name": "Mac Mini M2 (2023)",
                    "ram": [
                        "8GB",
                        "16GB",
                        "24GB"
                    ],
                    "cpu": [
                        "Apple M2"
                    ]
                },
                {
                    "name": "Mac Mini M1 (2020)",
                    "ram": [
                        "8GB",
                        "16GB"
                    ],
                    "cpu": [
                        "Apple M1"
                    ]
                },
                {
                    "name": "Apple Mac Mini M2",
                    "cpu": [
                        "Apple M2, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MMFJ3LL/A",
                            "cpu": [
                                "Apple M2, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ],
                    "ports": "2× Thunderbolt 4, 2× USB-A, HDMI 2.0, Ethernet, 3.5mm jack",
                    "weight": "1.18kg, 197×197×35.8mm",
                    "release_year": "2023",
                    "notes": "Compact desktop, supports up to 2 displays",
                    "display": "None (external)"
                },
                {
                    "name": "Apple Mac Mini M2 Pro",
                    "cpu": [
                        "Apple M2 Pro, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Pro 16-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MNH73LL/A",
                            "cpu": [
                                "Apple M2 Pro, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Pro 16-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ],
                    "ports": "3× Thunderbolt 4, 2× USB-A, HDMI 2.0, Ethernet, 3.5mm jack",
                    "weight": "1.18kg",
                    "release_year": "2023",
                    "notes": "Supports up to 3 external displays",
                    "display": "None (external)"
                },
                {
                    "name": "Apple Mac Mini M4",
                    "cpu": [
                        "Apple M4, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "ports": "3× Thunderbolt 4, 2× USB-A, HDMI 2.1, Ethernet, 3.5mm jack",
                    "weight": "0.67kg",
                    "release_year": "2024",
                    "notes": "Smallest Mac Mini ever, redesigned, M4",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "MQXN3LL/A",
                            "cpu": [
                                "Apple M4, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple Mac Mini M4 Pro",
                    "cpu": [
                        "Apple M4 Pro, 14-core CPU"
                    ],
                    "gpu": [
                        "Apple M4 Pro 20-core GPU"
                    ],
                    "ram": [
                        "24GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sequoia"
                    ],
                    "ports": "3× Thunderbolt 5, 2× USB-A, HDMI 2.1, Ethernet, 3.5mm jack",
                    "weight": "0.67kg",
                    "release_year": "2024",
                    "notes": "M4 Pro, Thunderbolt 5, tiny form factor",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "MQXP3LL/A",
                            "cpu": [
                                "Apple M4 Pro, 14-core CPU"
                            ],
                            "gpu": [
                                "Apple M4 Pro 20-core GPU"
                            ],
                            "ram": [
                                "24GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sequoia"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple Mac Mini M1",
                    "cpu": [
                        "Apple M1, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 8-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Big Sur"
                    ],
                    "ports": "2× Thunderbolt 3, 2× USB-A, HDMI 2.0, Ethernet, 3.5mm jack",
                    "weight": "1.19kg",
                    "release_year": "2020",
                    "notes": "First Apple Silicon Mac Mini",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "MGNR3LL/A",
                            "cpu": [
                                "Apple M1, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 8-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Big Sur"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Mac Studio",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Mac Studio M4 Max (2025)",
                    "ram": [
                        "36GB",
                        "64GB",
                        "96GB",
                        "128GB"
                    ],
                    "cpu": [
                        "Apple M4 Max"
                    ]
                },
                {
                    "name": "Mac Studio M4 Ultra (2025)",
                    "ram": [
                        "96GB",
                        "128GB",
                        "192GB"
                    ],
                    "cpu": [
                        "Apple M4 Ultra"
                    ]
                },
                {
                    "name": "Mac Studio M2 Max (2023)",
                    "ram": [
                        "32GB",
                        "64GB",
                        "96GB"
                    ],
                    "cpu": [
                        "Apple M2 Max"
                    ]
                },
                {
                    "name": "Mac Studio M2 Ultra (2023)",
                    "ram": [
                        "64GB",
                        "128192GB"
                    ],
                    "cpu": [
                        "Apple M2 Ultra"
                    ]
                },
                {
                    "name": "Mac Studio M1 Max (2022)",
                    "ram": [
                        "32GB",
                        "64GB"
                    ],
                    "cpu": [
                        "Apple M1 Max"
                    ]
                },
                {
                    "name": "Mac Studio M1 Ultra (2022)",
                    "ram": [
                        "64GB",
                        "128GB"
                    ],
                    "cpu": [
                        "Apple M1 Ultra"
                    ]
                },
                {
                    "name": "Apple Mac Studio M2 Max",
                    "cpu": [
                        "Apple M2 Max, 12-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Max 30-core GPU"
                    ],
                    "ram": [
                        "32GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MQGW3LL/A",
                            "cpu": [
                                "Apple M2 Max, 12-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Max 30-core GPU"
                            ],
                            "ram": [
                                "32GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ],
                    "ports": "2× Thunderbolt 4 (front), 4× Thunderbolt 4 (rear), 2× USB-A, HDMI, SD card, Ethernet",
                    "weight": "2.69kg",
                    "release_year": "2023",
                    "notes": "Compact pro desktop, supports 5 external displays",
                    "display": "None (external)"
                },
                {
                    "name": "Apple Mac Studio M2 Ultra",
                    "cpu": [
                        "Apple M2 Ultra, 24-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Ultra 60-core GPU"
                    ],
                    "ram": [
                        "64GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "ports": "2× Thunderbolt 4 (front), 4× Thunderbolt 4 (rear), 2× USB-A, HDMI, SD card, Ethernet",
                    "weight": "2.69kg",
                    "release_year": "2023",
                    "notes": "Up to 192GB RAM, ultimate compact pro",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "MQHX3LL/A",
                            "cpu": [
                                "Apple M2 Ultra, 24-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Ultra 60-core GPU"
                            ],
                            "ram": [
                                "64GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple Mac Studio M1 Max",
                    "cpu": [
                        "Apple M1 Max, 10-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 Max 24-core GPU"
                    ],
                    "ram": [
                        "32GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Monterey"
                    ],
                    "ports": "2× Thunderbolt 4 (front), 4× Thunderbolt 4 (rear), 2× USB-A, HDMI, SD card",
                    "weight": "2.69kg",
                    "release_year": "2022",
                    "notes": "First Mac Studio, new compact pro",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "MJMV3LL/A",
                            "cpu": [
                                "Apple M1 Max, 10-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 Max 24-core GPU"
                            ],
                            "ram": [
                                "32GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Monterey"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Mac Pro",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Apple Mac Pro M2 Ultra",
                    "cpu": [
                        "Apple M2 Ultra, 24-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Ultra 60-core GPU"
                    ],
                    "ram": [
                        "192GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MQH63LL/A",
                            "cpu": [
                                "Apple M2 Ultra, 24-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Ultra 60-core GPU"
                            ],
                            "ram": [
                                "192GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ],
                    "ports": "6× Thunderbolt 4, 2× USB-A, 2× HDMI 2.1, 6× PCIe slots",
                    "weight": "6.8kg",
                    "release_year": "2023",
                    "notes": "Mac Pro with new design, PCIe expansion, up to 192GB RAM",
                    "display": "None (external)"
                },
                {
                    "name": "Apple Mac Pro Tower M2 Ultra",
                    "cpu": [
                        "Apple M2 Ultra, 24-core CPU"
                    ],
                    "gpu": [
                        "Apple M2 Ultra 76-core GPU"
                    ],
                    "ram": [
                        "192GB Unified Memory"
                    ],
                    "storage": [
                        "1TB SSD"
                    ],
                    "os": [
                        "macOS Ventura"
                    ],
                    "skus": [
                        {
                            "id": "MQH73LL/A",
                            "cpu": [
                                "Apple M2 Ultra, 24-core CPU"
                            ],
                            "gpu": [
                                "Apple M2 Ultra 76-core GPU"
                            ],
                            "ram": [
                                "192GB Unified Memory"
                            ],
                            "storage": [
                                "1TB SSD"
                            ],
                            "os": [
                                "macOS Ventura"
                            ]
                        }
                    ],
                    "ports": "6× Thunderbolt 4, 2× USB-A, 2× HDMI 2.1, 7× PCIe slots",
                    "weight": "7.0kg",
                    "release_year": "2023",
                    "notes": "Full tower expansion, up to 192GB RAM",
                    "display": "None (external)"
                }
            ]
        }
    ],
    "MSI": [
        {
            "name": "Creator / Summit",
            "type": "workstation",
            "subModels": [
                {
                    "name": "Creator Z17 HX Studio (2023)",
                    "screenSize": [
                        "17\""
                    ]
                },
                {
                    "name": "Creator 15 A12UET",
                    "screenSize": [
                        "15.6\""
                    ]
                },
                {
                    "name": "Summit E16 Flip Evo A13MT",
                    "screenSize": [
                        "16\""
                    ]
                }
            ]
        },
        {
            "name": "Aegis Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Aegis RS 13NUF5",
                    "type": "desktop"
                },
                {
                    "name": "Aegis Ti5 13NUG5",
                    "type": "desktop"
                },
                {
                    "name": "Aegis 3 10SA",
                    "type": "desktop"
                }
            ]
        },
        {
            "name": "MAG / MEG Gaming Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "MSI MEG Trident X2 14th",
                    "cpu": [
                        "Intel Core i9-14900KF",
                        "Intel Core i7-14700KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080 Super"
                    ],
                    "ram": [
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "2TB SSD",
                        "2TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "6× USB-A, 3× USB-C (Thunderbolt 4), HDMI, 3× DP (GPU), 2.5GbE, Wi-Fi 7",
                    "weight": "14kg",
                    "release_year": "2024",
                    "notes": "Flagship gaming, compact console-like design"
                },
                {
                    "name": "MSI MAG Infinite S3 14th",
                    "cpu": [
                        "Intel Core i7-14700F",
                        "Intel Core i5-14400F"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4070 Super",
                        "NVIDIA GeForce RTX 4060 Ti",
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "1TB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI (GPU), 3× DP (GPU), RJ-45",
                    "weight": "10.5kg",
                    "release_year": "2024",
                    "notes": "Mid-range gaming tower, popular"
                }
            ]
        },
        {
            "name": "PRO Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "MSI PRO DP180 14th",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14500",
                        "Intel Core i3-14100"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "6× USB-A, 1× USB-C, HDMI, DisplayPort, VGA, RJ-45, COM port",
                    "weight": "7.5kg",
                    "release_year": "2024",
                    "notes": "Business tower, value"
                }
            ]
        }
    ],
    "Acer": [
        {
            "name": "Predator Orion",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Predator Orion 7000 (2024)",
                    "cpu": [
                        "Intel Core i9-14900KF",
                        "Intel Core i7-14700KF"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4090",
                        "NVIDIA GeForce RTX 4080 Super",
                        "NVIDIA GeForce RTX 4070 Ti Super"
                    ],
                    "ram": [
                        "32GB DDR5",
                        "64GB DDR5"
                    ],
                    "storage": [
                        "1TB SSD",
                        "2TB SSD",
                        "2TB SSD + 2TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "8× USB-A, 2× USB-C (Thunderbolt 4), 2.5GbE, Wi-Fi 7, Front USB-C",
                    "weight": "20kg",
                    "release_year": "2024",
                    "notes": "Flagship gaming tower, FrostBlade 2.0 cooling"
                },
                {
                    "name": "Predator Orion 3000 (2024)",
                    "cpu": [
                        "Intel Core i7-14700F",
                        "Intel Core i5-14400F"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 4060 Ti",
                        "NVIDIA GeForce RTX 4060"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 1× USB-C, RJ-45",
                    "weight": "10kg",
                    "release_year": "2024",
                    "notes": "Entry gaming tower"
                }
            ]
        },
        {
            "name": "Aspire Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Aspire TC-1780",
                    "cpu": [
                        "Intel Core i7-14700",
                        "Intel Core i5-14400",
                        "Intel Core i3-14100"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770",
                        "NVIDIA GeForce GTX 1650"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD",
                        "512GB SSD + 1TB HDD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "ports": "4× USB-A, 1× USB-C, HDMI, VGA, RJ-45, SD Card",
                    "weight": "6.2kg",
                    "release_year": "2024",
                    "notes": "Home/Office budget tower"
                },
                {
                    "name": "Aspire C27 AIO",
                    "cpu": [
                        "Intel Core i7-1355U",
                        "Intel Core i5-1335U"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "8GB DDR4",
                        "16GB DDR4"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD",
                        "1TB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "screenSize": [
                        "27\""
                    ],
                    "ports": "2× USB-A, 1× USB-C, HDMI-out, RJ-45",
                    "weight": "5.6kg",
                    "release_year": "2023",
                    "notes": "All-in-One 27\" FHD, slim bezel"
                }
            ]
        },
        {
            "name": "Veriton Business Desktop",
            "type": "desktop",
            "subModels": [
                {
                    "name": "Veriton N4710GT Mini",
                    "cpu": [
                        "Intel Core i7-13700T",
                        "Intel Core i5-13500T"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 770"
                    ],
                    "ram": [
                        "8GB DDR5",
                        "16GB DDR5",
                        "32GB DDR5"
                    ],
                    "storage": [
                        "256GB SSD",
                        "512GB SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "4× USB-A, 1× USB-C, HDMI, DisplayPort, RJ-45",
                    "weight": "1.2kg",
                    "release_year": "2023",
                    "notes": "Ultra-compact business mini PC"
                }
            ]
        }
    ],
    "אחר (Other)": [
        {
            "name": "Intel",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Intel NUC 13 Pro",
                    "cpu": [
                        "Intel Core i5-1340P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "None (user-installed)"
                    ],
                    "storage": [
                        "None (user-installed)"
                    ],
                    "os": [
                        "None (bare bones)"
                    ],
                    "skus": [
                        {
                            "id": "RNUC13ANHI50002",
                            "cpu": [
                                "Intel Core i5-1340P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "None (user-installed)"
                            ],
                            "storage": [
                                "None (user-installed)"
                            ],
                            "os": [
                                "None (bare bones)"
                            ]
                        }
                    ],
                    "ports": "2× Thunderbolt 4, 4× USB-A, HDMI, DP, RJ45",
                    "weight": "0.7kg, 117×112×37mm",
                    "release_year": "2023",
                    "notes": "Barebones mini PC, user-configurable RAM/storage",
                    "display": "None (external)"
                }
            ]
        },
        {
            "name": "Beelink",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Beelink Mini S12 Pro",
                    "cpu": [
                        "Intel N100, 4-core, 3.4GHz"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 24EU"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "500GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "skus": [
                        {
                            "id": "BEE-S12PRO",
                            "cpu": [
                                "Intel N100, 4-core, 3.4GHz"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 24EU"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "500GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ],
                    "ports": "2× USB-A 3.0, 2× USB-A 2.0, 2× HDMI, RJ45",
                    "weight": "0.47kg",
                    "release_year": "2023",
                    "notes": "Ultra-budget mini PC, fanless option, great for HTPC",
                    "display": "None (external)"
                }
            ]
        }
    ],
    "Other": [
        {
            "name": "Intel NUC",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Intel NUC 13 Pro",
                    "cpu": [
                        "Intel Core i5-1340P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "None (user-installed)"
                    ],
                    "storage": [
                        "None (user-installed)"
                    ],
                    "os": [
                        "None (bare bones)"
                    ],
                    "ports": "2× Thunderbolt 4, 4× USB-A, HDMI, DP, RJ45",
                    "weight": "0.7kg, 117×112×37mm",
                    "release_year": "2023",
                    "notes": "Barebones mini PC, user-configurable RAM/storage",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "RNUC13ANHI50002",
                            "cpu": [
                                "Intel Core i5-1340P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "None (user-installed)"
                            ],
                            "storage": [
                                "None (user-installed)"
                            ],
                            "os": [
                                "None (bare bones)"
                            ]
                        }
                    ]
                },
                {
                    "name": "Intel NUC 12 Pro",
                    "cpu": [
                        "Intel Core i5-1240P"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "None (user-installed, up to 64GB DDR4)"
                    ],
                    "storage": [
                        "None (user-installed)"
                    ],
                    "os": [
                        "None (barebones)"
                    ],
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI, DP, RJ45",
                    "weight": "0.69kg",
                    "release_year": "2022",
                    "notes": "Compact NUC, Alder Lake",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "RNUC12WSKi50002",
                            "cpu": [
                                "Intel Core i5-1240P"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "None (user-installed, up to 64GB DDR4)"
                            ],
                            "storage": [
                                "None (user-installed)"
                            ],
                            "os": [
                                "None (barebones)"
                            ]
                        }
                    ]
                },
                {
                    "name": "Intel NUC 11 Pro",
                    "cpu": [
                        "Intel Core i5-1135G7"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "None (user-installed)"
                    ],
                    "storage": [
                        "None (user-installed)"
                    ],
                    "os": [
                        "None (barebones)"
                    ],
                    "ports": "Thunderbolt 4, 4× USB-A, HDMI 2.0, DP, RJ45",
                    "weight": "0.67kg",
                    "release_year": "2021",
                    "notes": "Tiger Lake NUC barebones",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "BNUC11TNHI50002",
                            "cpu": [
                                "Intel Core i5-1135G7"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "None (user-installed)"
                            ],
                            "storage": [
                                "None (user-installed)"
                            ],
                            "os": [
                                "None (barebones)"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Beelink",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Beelink Mini S12 Pro",
                    "cpu": [
                        "Intel N100, 4-core, 3.4GHz"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 24EU"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "500GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× USB-A 3.0, 2× USB-A 2.0, 2× HDMI, RJ45",
                    "weight": "0.47kg",
                    "release_year": "2023",
                    "notes": "Ultra-budget mini PC, fanless option, great for HTPC",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "BEE-S12PRO",
                            "cpu": [
                                "Intel N100, 4-core, 3.4GHz"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 24EU"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "500GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Beelink SER6 Pro",
                    "cpu": [
                        "AMD Ryzen 9 6900HX"
                    ],
                    "gpu": [
                        "AMD Radeon 680M"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "500GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× USB-A 3.0, 2× USB-A 2.0, 2× HDMI 2.0, USB4, RJ45",
                    "weight": "0.55kg",
                    "release_year": "2022",
                    "notes": "Powerful mini PC, AMD iGPU gaming capable",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "SER6-PRO-R9",
                            "cpu": [
                                "AMD Ryzen 9 6900HX"
                            ],
                            "gpu": [
                                "AMD Radeon 680M"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "500GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Beelink GTR7 Pro",
                    "cpu": [
                        "AMD Ryzen 9 7940HX"
                    ],
                    "gpu": [
                        "AMD Radeon 780M"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "3× USB-A, USB-C/Thunderbolt 4, 2× HDMI 2.0, RJ45",
                    "weight": "0.65kg",
                    "release_year": "2023",
                    "notes": "Performance mini PC, Ryzen 9 7940HX",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "GTR7-PRO",
                            "cpu": [
                                "AMD Ryzen 9 7940HX"
                            ],
                            "gpu": [
                                "AMD Radeon 780M"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Beelink EQ12",
                    "cpu": [
                        "Intel N100, 4-core, up to 3.4GHz"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 24EU"
                    ],
                    "ram": [
                        "16GB DDR5"
                    ],
                    "storage": [
                        "500GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× USB-A 3.0, 2× USB-A 2.0, 2× HDMI 2.0, RJ45",
                    "weight": "0.35kg",
                    "release_year": "2023",
                    "notes": "Budget mini PC, good for office",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "EQ12",
                            "cpu": [
                                "Intel N100, 4-core, up to 3.4GHz"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 24EU"
                            ],
                            "ram": [
                                "16GB DDR5"
                            ],
                            "storage": [
                                "500GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Minisforum UM790",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Minisforum UM790 Pro",
                    "cpu": [
                        "AMD Ryzen 9 7940HX"
                    ],
                    "gpu": [
                        "AMD Radeon 780M"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× USB-A 3.2, 2× USB-A 2.0, 2× HDMI 2.0, USB4, RJ45",
                    "weight": "0.6kg",
                    "release_year": "2023",
                    "notes": "Compact powerhouse, eGPU compatible via OCuLink",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "UM790PRO",
                            "cpu": [
                                "AMD Ryzen 9 7940HX"
                            ],
                            "gpu": [
                                "AMD Radeon 780M"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Minisforum MS-01",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Minisforum MS-01",
                    "cpu": [
                        "Intel Core i9-13900H"
                    ],
                    "gpu": [
                        "Intel Iris Xe Graphics"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× Thunderbolt 4, 2× USB-C, 4× USB-A, 2× HDMI, 2.5G + 10G RJ45",
                    "weight": "0.65kg",
                    "release_year": "2024",
                    "notes": "Server-grade networking, OCuLink eGPU",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "MS01",
                            "cpu": [
                                "Intel Core i9-13900H"
                            ],
                            "gpu": [
                                "Intel Iris Xe Graphics"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Minisforum UN100P",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "Minisforum UN100P",
                    "cpu": [
                        "Intel N100, 4-core, up to 3.4GHz"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 24EU"
                    ],
                    "ram": [
                        "8GB DDR5"
                    ],
                    "storage": [
                        "256GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× USB-A 3.0, 2× USB-A 2.0, 2× HDMI, RJ45",
                    "weight": "0.3kg",
                    "release_year": "2023",
                    "notes": "Ultra-compact budget mini PC",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "UN100P",
                            "cpu": [
                                "Intel N100, 4-core, up to 3.4GHz"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 24EU"
                            ],
                            "ram": [
                                "8GB DDR5"
                            ],
                            "storage": [
                                "256GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "GMKtec NucBox",
            "type": "mini pc",
            "subModels": [
                {
                    "name": "GMKtec NucBox K6",
                    "cpu": [
                        "AMD Ryzen 9 6900HX"
                    ],
                    "gpu": [
                        "AMD Radeon 680M"
                    ],
                    "ram": [
                        "32GB DDR5"
                    ],
                    "storage": [
                        "512GB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× USB-A 3.2, 2× USB-C, 2× HDMI 2.0, RJ45",
                    "weight": "0.52kg",
                    "release_year": "2023",
                    "notes": "Compact AMD Ryzen mini PC",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "K6",
                            "cpu": [
                                "AMD Ryzen 9 6900HX"
                            ],
                            "gpu": [
                                "AMD Radeon 680M"
                            ],
                            "ram": [
                                "32GB DDR5"
                            ],
                            "storage": [
                                "512GB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ASRock DeskMeet",
            "type": "desktop",
            "subModels": [
                {
                    "name": "ASRock DeskMeet X600",
                    "cpu": [
                        "Supports AMD Ryzen 7000 (user-installed)"
                    ],
                    "gpu": [
                        "Full-size GPU (user-installed)"
                    ],
                    "ram": [
                        "None (user-installed, up to 64GB DDR5)"
                    ],
                    "storage": [
                        "None (user-installed)"
                    ],
                    "os": [
                        "None (barebones)"
                    ],
                    "ports": "4× USB-A, 2× USB-C, HDMI, DP, RJ45",
                    "weight": "3.2kg",
                    "release_year": "2023",
                    "notes": "Mini ITX barebones, full GPU support",
                    "display": "None (external)",
                    "skus": [
                        {
                            "id": "DeskMeet X600",
                            "cpu": [
                                "Supports AMD Ryzen 7000 (user-installed)"
                            ],
                            "gpu": [
                                "Full-size GPU (user-installed)"
                            ],
                            "ram": [
                                "None (user-installed, up to 64GB DDR5)"
                            ],
                            "storage": [
                                "None (user-installed)"
                            ],
                            "os": [
                                "None (barebones)"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

export const ALL_IN_ONE_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Apple": [
        {
            "name": "iMac",
            "type": "all-in-one",
            "subModels": [
                {
                    "name": "iMac 24\" M4 (2024)",
                    "screenSize": [
                        "24\""
                    ],
                    "ram": [
                        "16GB",
                        "24GB",
                        "32GB"
                    ],
                    "cpu": [
                        "Apple M4"
                    ]
                },
                {
                    "name": "iMac 24\" M3 (2023)",
                    "screenSize": [
                        "24\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB",
                        "24GB"
                    ],
                    "cpu": [
                        "Apple M3"
                    ]
                },
                {
                    "name": "iMac 24\" M1 (2021)",
                    "screenSize": [
                        "24\""
                    ],
                    "ram": [
                        "8GB",
                        "16GB"
                    ],
                    "cpu": [
                        "Apple M1"
                    ]
                },
                {
                    "name": "Apple iMac 24 M3",
                    "screenSize": [
                        "24\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "skus": [
                        {
                            "id": "MQRQ3LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ],
                            "screenSize": [
                                "24\""
                            ]
                        }
                    ],
                    "ports": "2× Thunderbolt 4, 2× USB-C, MagSafe, Ethernet (in power brick)",
                    "weight": "4.48kg",
                    "release_year": "2023",
                    "notes": "7mm thin, available in 7 colors",
                    "display": "24\" 4.5K Retina, 4480×2520, 500 nits, True Tone"
                },
                {
                    "name": "Apple iMac 24 M3 16GB",
                    "screenSize": [
                        "24\""
                    ],
                    "cpu": [
                        "Apple M3, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M3 10-core GPU"
                    ],
                    "ram": [
                        "16GB Unified Memory"
                    ],
                    "storage": [
                        "512GB SSD"
                    ],
                    "os": [
                        "macOS Sonoma"
                    ],
                    "ports": "2× Thunderbolt 4, 2× USB-C, 2× USB-A, MagSafe",
                    "weight": "4.48kg",
                    "release_year": "2023",
                    "notes": "16GB config, Magic accessories included",
                    "display": "24\" 4.5K Retina, 4480×2520, 500 nits",
                    "skus": [
                        {
                            "id": "MQRV3LL/A",
                            "cpu": [
                                "Apple M3, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M3 10-core GPU"
                            ],
                            "ram": [
                                "16GB Unified Memory"
                            ],
                            "storage": [
                                "512GB SSD"
                            ],
                            "os": [
                                "macOS Sonoma"
                            ]
                        }
                    ]
                },
                {
                    "name": "Apple iMac 24 M1",
                    "screenSize": [
                        "24\""
                    ],
                    "cpu": [
                        "Apple M1, 8-core CPU"
                    ],
                    "gpu": [
                        "Apple M1 8-core GPU"
                    ],
                    "ram": [
                        "8GB Unified Memory"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "macOS Big Sur"
                    ],
                    "ports": "2× Thunderbolt 4, 2× USB-C, MagSafe",
                    "weight": "4.48kg",
                    "release_year": "2021",
                    "notes": "7mm thin, 7 colors, first Apple Silicon iMac",
                    "display": "24\" 4.5K Retina, 4480×2520, 500 nits, True Tone",
                    "skus": [
                        {
                            "id": "MGPK3LL/A",
                            "cpu": [
                                "Apple M1, 8-core CPU"
                            ],
                            "gpu": [
                                "Apple M1 8-core GPU"
                            ],
                            "ram": [
                                "8GB Unified Memory"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "macOS Big Sur"
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "Microsoft": [
        {
            "name": "Microsoft Surface",
            "type": "all-in-one",
            "subModels": [
                {
                    "name": "Microsoft Surface Studio 2+",
                    "screenSize": [
                        "28\""
                    ],
                    "cpu": [
                        "Intel Core i7-11370H"
                    ],
                    "gpu": [
                        "NVIDIA GeForce RTX 3060"
                    ],
                    "ram": [
                        "32GB DDR4"
                    ],
                    "storage": [
                        "1TB NVMe SSD"
                    ],
                    "os": [
                        "Windows 11 Pro"
                    ],
                    "ports": "2× Thunderbolt 4, 3× USB-A, SD card, 3.5mm jack",
                    "weight": "9.56kg",
                    "release_year": "2022",
                    "notes": "28\" studio AiO, Zero Gravity hinge",
                    "display": "28\" PixelSense, 4500×3000, touch, 120Hz",
                    "skus": [
                        {
                            "id": "SBG-00001",
                            "cpu": [
                                "Intel Core i7-11370H"
                            ],
                            "gpu": [
                                "NVIDIA GeForce RTX 3060"
                            ],
                            "ram": [
                                "32GB DDR4"
                            ],
                            "storage": [
                                "1TB NVMe SSD"
                            ],
                            "os": [
                                "Windows 11 Pro"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Book 3 13.5",
                    "screenSize": [
                        "13.5\""
                    ],
                    "cpu": [
                        "Intel Core i5-1035G7"
                    ],
                    "gpu": [
                        "NVIDIA GeForce GTX 1650"
                    ],
                    "ram": [
                        "16GB LPDDR4X"
                    ],
                    "storage": [
                        "256GB SSD"
                    ],
                    "os": [
                        "Windows 11 Home"
                    ],
                    "battery": "65Wh, up to 17.5h",
                    "ports": "2× USB-A, USB-C, SD card, Surface Connect",
                    "weight": "1.64kg",
                    "release_year": "2020",
                    "notes": "Detachable design, GPU in base",
                    "display": "13.5\" PixelSense, 3000×2000, touch",
                    "skus": [
                        {
                            "id": "SLM-00001",
                            "cpu": [
                                "Intel Core i5-1035G7"
                            ],
                            "gpu": [
                                "NVIDIA GeForce GTX 1650"
                            ],
                            "ram": [
                                "16GB LPDDR4X"
                            ],
                            "storage": [
                                "256GB SSD"
                            ],
                            "os": [
                                "Windows 11 Home"
                            ]
                        }
                    ]
                },
                {
                    "name": "Microsoft Surface Go 3",
                    "screenSize": [
                        "10.5\""
                    ],
                    "cpu": [
                        "Intel Pentium Gold 6500Y"
                    ],
                    "gpu": [
                        "Intel UHD Graphics 615"
                    ],
                    "ram": [
                        "4GB LPDDR3"
                    ],
                    "storage": [
                        "64GB eMMC"
                    ],
                    "os": [
                        "Windows 11 Home in S mode"
                    ],
                    "battery": "27.3Wh, up to 11h",
                    "ports": "USB-C, Surface Connect, microSD",
                    "weight": "544g",
                    "release_year": "2021",
                    "notes": "Entry budget Surface tablet",
                    "display": "10.5\" PixelSense, 1920×1280, touch",
                    "skus": [
                        {
                            "id": "8V6-00001",
                            "cpu": [
                                "Intel Pentium Gold 6500Y"
                            ],
                            "gpu": [
                                "Intel UHD Graphics 615"
                            ],
                            "ram": [
                                "4GB LPDDR3"
                            ],
                            "storage": [
                                "64GB eMMC"
                            ],
                            "os": [
                                "Windows 11 Home in S mode"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

// Keep backwards compat export for older modules?
// export const COMPUTER_DATABASE: Record<string, ComputerModelFamily[]> = LAPTOP_DATABASE;


// ============================================================
// AGGREGATED DATABASE FOR GENERIC SEARCH
// ============================================================
export const COMPUTER_DATABASE: Record<string, ComputerModelFamily[]> = {};
const mergeIntoGlobal = (db: Record<string, ComputerModelFamily[]>) => {
    for (const [brand, families] of Object.entries(db)) {
        if (!COMPUTER_DATABASE[brand]) COMPUTER_DATABASE[brand] = [];
        COMPUTER_DATABASE[brand].push(...families);
    }
};
mergeIntoGlobal(LAPTOP_DATABASE);
mergeIntoGlobal(BRAND_DESKTOP_DATABASE);
mergeIntoGlobal(ALL_IN_ONE_DATABASE);

// ============================================================

export const MONITOR_OPTIONS = {
    sizes: [
        "15.6\"", "17\"", "21.5\"", "23.8\"", "24\"", "24.5\"", "27\"", "28\"", "31.5\"", "32\"", "34\" (Ultrawide)", "38\" (Ultrawide)", "42\"", "45\"", "48\"", "49\" (Super Ultrawide)"
    ],
    panelTypes: [
        "IPS (צבעים מדוייקים)", "VA (ניגודיות גבוהה)", "TN (זמן תגובה מהיר)", "OLED (שחור מוחלט)", "QD-OLED", "Mini-LED", "לא ידוע"
    ],
    resolutions: [
        "1920×1080 (Full HD)",
        "2560×1080 (Ultrawide FHD)",
        "2560×1440 (2K QHD)",
        "3440×1440 (Ultrawide QHD)",
        "3840×1600 (Ultrawide WQHD+)",
        "3840×2160 (4K UHD)",
        "5120×1440 (Dual QHD)",
        "5120×2160 (5K)",
        "7680×4320 (8K)",
        "אחר", "לא ידוע"
    ],
    refreshRates: [
        "60Hz", "75Hz", "100Hz", "120Hz", "144Hz", "165Hz",
        "180Hz", "200Hz", "240Hz", "280Hz", "360Hz", "500Hz", "אחר"
    ],
    responseTime: [
        "0.03ms (OLED)", "0.5ms", "1ms", "2ms", "4ms", "5ms", "8ms", "לא ידוע"
    ],
    features: [
        "G-Sync Ultimate", "G-Sync Compatible", "FreeSync Premium Pro",
        "FreeSync Premium", "FreeSync", "HDR10", "HDR400", "HDR600",
        "HDR1000", "HDR1400", "Dolby Vision", "USB-C / Power Delivery",
        "KVM Switch", "Built-in Speakers", "Pivot / Height Adjustable",
        "Curved (1000R)", "Curved (1500R)", "Curved (1800R)", "Flat",
        "VESA Mount", "Blue Light Filter", "Flicker Free"
    ],
    brands: [
        "Samsung", "LG", "Dell", "ASUS", "Acer", "BenQ", "MSI",
        "Gigabyte", "ViewSonic", "AOC", "Philips", "HP", "Lenovo",
        "Alienware", "CORSAIR", "Eve (Spectrum)", "Nixeus", "Sceptre", "אחר"
    ],
    connections: [
        "HDMI 2.1", "HDMI 2.0", "DisplayPort 1.4", "DisplayPort 2.1",
        "USB-C (DisplayPort Alt)", "USB-C (90W PD)", "USB-C (65W PD)",
        "DVI-D", "VGA", "USB Hub (USB-A)", "Thunderbolt 4", "3.5mm Audio Out"
    ]
};

// ============================================================
//  CUSTOM BUILD FIELD STRUCTURE (שדות בנייה עצמית)
// ============================================================

export const CUSTOM_BUILD_CATEGORIES = {
    cpu: { label: "מעבד (CPU)", options: DESKTOP_CPU_OPTIONS },
    gpu: { label: "כרטיס מסך (GPU)", options: GPU_OPTIONS },
    motherboard_chipset: { label: "ערכת שבבים (Chipset)", options: MOTHERBOARD_OPTIONS.chipsets },
    motherboard_socket: { label: "שקע מעבד (Socket)", options: MOTHERBOARD_OPTIONS.sockets },
    motherboard_form: { label: "פורמט לוח אם", options: MOTHERBOARD_OPTIONS.formFactors },
    motherboard_brand: { label: "יצרן לוח אם", options: MOTHERBOARD_OPTIONS.brands },
    motherboard_model: { label: "דגם לוח אם (למשל: ROG STRIX Z790-E)", options: [] },
    motherboard_features: { label: "חיבור אלחוטי (Wi-Fi/BT)", options: MOTHERBOARD_OPTIONS.features },
    motherboard_ethernet: { label: "חיבור רשת (Ethernet)", options: MOTHERBOARD_OPTIONS.ethernet },
    motherboard_m2: { label: "חריצי M.2", options: MOTHERBOARD_OPTIONS.m2Slots },
    motherboard_pcie: { label: "דור PCIe ראשי", options: MOTHERBOARD_OPTIONS.pcieGen },
    ram_type: { label: "סוג זיכרון (RAM)", options: RAM_TYPE_OPTIONS },
    ram_config: { label: "תצורת זיכרון", options: RAM_CONFIG_OPTIONS },
    storage_primary: { label: "כונן ראשי", options: STORAGE_TYPE_OPTIONS },
    storage_secondary: { label: "כונן משני", options: [...STORAGE_TYPE_OPTIONS, "אין"] },
    psu_wattage: { label: "הספק ספק כח (W)", options: PSU_OPTIONS.wattages },
    psu_efficiency: { label: "דירוג יעילות", options: PSU_OPTIONS.efficiencyRatings },
    psu_modularity: { label: "סוג מודולריות", options: PSU_OPTIONS.modularity },
    psu_standard: { label: "תקן ספק כח", options: PSU_OPTIONS.standards },
    psu_brand: { label: "יצרן ספק כח", options: PSU_OPTIONS.brands },
    cooler_type: { label: "סוג קירור", options: COOLER_OPTIONS.types },
    cooler_model: { label: "דגם מקרר", options: COOLER_OPTIONS.models },
    case_form: { label: "פורמט מארז", options: CASE_OPTIONS.formFactors },
    case_airflow: { label: "זרימת אוויר (פאנל קדמי)", options: CASE_OPTIONS.airflow },
    case_io: { label: "חיבורים קדמיים", options: CASE_OPTIONS.frontPanelIO },
    case_brand: { label: "יצרן מארז", options: CASE_OPTIONS.brands },
    os: { label: "מערכת הפעלה", options: OS_OPTIONS },
    monitor_size: { label: "גודל מסך", options: MONITOR_OPTIONS.sizes },
    monitor_panel: { label: "סוג פאנל", options: MONITOR_OPTIONS.panelTypes },
    monitor_resolution: { label: "רזולוציית מסך", options: MONITOR_OPTIONS.resolutions },
    monitor_refresh: { label: "קצב רענון", options: MONITOR_OPTIONS.refreshRates },
    monitor_brand: { label: "יצרן מסך", options: MONITOR_OPTIONS.brands },
};

// Sub-categories for desktop computers
export const DESKTOP_SUB_CATEGORIES = [
    { value: "brand_desktop", label: "🖥️ מחשב נייח מותג", description: "מחשב מוכן מיצרן (Dell, HP, Lenovo...)" },
    { value: "all_in_one", label: "🖥️ All-in-One", description: "מחשב משולב עם מסך" },
    { value: "custom_build", label: "🔧 בנייה עצמית", description: "מחשב שהורכב מרכיבים בודדים" },
];

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
