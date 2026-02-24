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
    skus?: {
        id: string; // SKU or MTM (e.g. '82LX00BTIV')
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
    type: string; // laptop | desktop | gaming | workstation | all-in-one | mini
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
                    ]
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
