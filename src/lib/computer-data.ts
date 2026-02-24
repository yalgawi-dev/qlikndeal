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
    Intel: [
        "Intel Core Ultra 9 185H", "Intel Core Ultra 7 165H", "Intel Core Ultra 5 125H",
        "Intel Core Ultra 9 285H", "Intel Core Ultra 7 265H", "Intel Core Ultra 5 225H",
        "Intel Core i9-14900HX", "Intel Core i9-13900HX", "Intel Core i9-12900HX",
        "Intel Core i7-14700HX", "Intel Core i7-13700HX", "Intel Core i7-12700H",
        "Intel Core i7-1365U", "Intel Core i7-1355U", "Intel Core i7-1260P",
        "Intel Core i5-14500HX", "Intel Core i5-13500H", "Intel Core i5-12500H",
        "Intel Core i5-1345U", "Intel Core i5-1335U", "Intel Core i5-1240P",
        "Intel Core i3-1315U", "Intel Core i3-1305U",
        "Intel Pentium", "Intel Celeron", "לא ידוע"
    ],
    AMD: [
        "AMD Ryzen 9 7945HX", "AMD Ryzen 9 7940HS", "AMD Ryzen 9 6900HX",
        "AMD Ryzen 7 7745HX", "AMD Ryzen 7 7735HS", "AMD Ryzen 7 6800H",
        "AMD Ryzen 7 7730U", "AMD Ryzen 7 5825U", "AMD Ryzen 7 5700U",
        "AMD Ryzen 5 7530U", "AMD Ryzen 5 5625U", "AMD Ryzen 5 5500U",
        "AMD Ryzen 5 7600X", "AMD Ryzen 7 7700X", "AMD Ryzen 9 7950X",
        "AMD Ryzen AI 9 HX 370", "AMD Ryzen AI 7 350", "לא ידוע"
    ],
    Apple: [
        "Apple M4 Pro", "Apple M4 Max", "Apple M4",
        "Apple M3 Pro", "Apple M3 Max", "Apple M3",
        "Apple M2 Pro", "Apple M2 Max", "Apple M2",
        "Apple M1 Pro", "Apple M1 Max", "Apple M1", "לא ידוע"
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
    "לא ידוע"
];

// ---- Brand → Series → Sub-Models ----
export const COMPUTER_DATABASE: Record<string, ComputerModelFamily[]> = {
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
                    "display": "14\" FHD+ IPS, 1920×1200, 400 nits"
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
                    "display": "14\" FHD+ IPS, 1920×1200, 400 nits",
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
                    "display": "15.6\" OLED 3.5K, 3456×2160, 400 nits, touch, 60Hz"
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
                }
            ]
        },
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
                    "display": "14\" FHD IPS, 1920×1080, 400 nits, sure view"
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
                }
            ]
        },
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
                    "display": "14.2\" Liquid Retina XDR, 3024×1964, 1000 nits, ProMotion 120Hz"
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
                }
            ]
        },
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
                }
            ]
        },
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
                    "display": "13.5\" PixelSense, 2256×1504, 201ppi, touch"
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
        },
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
                }
            ]
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
