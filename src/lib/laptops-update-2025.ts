import { ComputerModelFamily } from "./computer-data";

export const NEW_LAPTOPS_2025_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Lenovo": [
        {
            "name": "ThinkPad",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ThinkPad X1 Carbon Gen 13 SKU-1",
                    "screenSize": ["14\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2025",
                    "notes": "דגם דגל עסקי AI"
                },
                {
                    "name": "ThinkPad P16 Gen 3 SKU-18",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core Ultra 9 285H"],
                    "ram": ["64GB ECC"],
                    "storage": ["2TB NVMe"],
                    "gpu": ["NVIDIA RTX 3500 Ada"],
                    "release_year": "2025",
                    "notes": "מיועד ל-CAD ותלת מימד"
                },
                {
                    "name": "ThinkPad T14s Gen 6 SKU-24",
                    "screenSize": ["14\""],
                    "cpu": ["Snapdragon X Elite"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Adreno GPU"],
                    "release_year": "2025",
                    "notes": "ה-T14 הראשון עם ARM"
                },
                {
                    "name": "ThinkPad Z13 Gen 3 SKU-41",
                    "screenSize": ["13.3\""],
                    "cpu": ["AMD Ryzen AI 9 HX 370"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["AMD Radeon 890M"],
                    "release_year": "2025",
                    "notes": "עיצוב מודרני מחומרים ממוחזרים"
                }
            ]
        },
        {
            "name": "Legion",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Legion 7i Gen 10 SKU-11",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core i9-14900HX"],
                    "ram": ["32GB DDR5"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["NVIDIA RTX 5070 8GB"],
                    "release_year": "2025",
                    "notes": "קירור מתקדם"
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
                    "name": "XPS 14 9450 SKU-2",
                    "screenSize": ["14.5\""],
                    "cpu": ["Intel Core Ultra 9 285H"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["2TB NVMe"],
                    "gpu": ["NVIDIA RTX 5050 6GB"],
                    "release_year": "2025",
                    "notes": "עיצוב פרימיום חדש"
                },
                {
                    "name": "XPS 13 9360 SKU-25",
                    "screenSize": ["13.4\""],
                    "cpu": ["Intel Core Ultra 5 226V"],
                    "ram": ["16GB LPDDR5x"],
                    "storage": ["512GB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2026",
                    "notes": "קומפקטי ללא פשרות"
                }
            ]
        },
        {
            "name": "Latitude",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Latitude 7460 SKU-12",
                    "screenSize": ["14\""],
                    "cpu": ["Intel Core Ultra 5 226V"],
                    "ram": ["16GB LPDDR5x"],
                    "storage": ["512GB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2026",
                    "notes": "עסקי עמיד"
                }
            ]
        },
        {
            "name": "Precision",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Precision 5490 SKU-19",
                    "screenSize": ["14\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["NVIDIA RTX 1000 Ada"],
                    "release_year": "2025",
                    "notes": "תחנת עבודה קומפקטית"
                }
            ]
        }
    ],
    "Apple": [
        {
            "name": "MacBook Pro",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MacBook Pro 14 M4 SKU-3",
                    "screenSize": ["14.2\""],
                    "cpu": ["Apple M4"],
                    "ram": ["16GB Unified"],
                    "storage": ["512GB SSD"],
                    "gpu": ["Apple GPU 10-core"],
                    "release_year": "2025",
                    "notes": "דגם בסיס מקצועי"
                },
                {
                    "name": "MacBook Pro 16 M4 Max SKU-14",
                    "screenSize": ["16.2\""],
                    "cpu": ["Apple M4 Max"],
                    "ram": ["64GB Unified"],
                    "storage": ["2TB SSD"],
                    "gpu": ["Apple GPU 40-core"],
                    "release_year": "2025",
                    "notes": "עריכת וידאו 8K"
                },
                {
                    "name": "MacBook Pro 14 M4 Pro SKU-23",
                    "screenSize": ["14.2\""],
                    "cpu": ["Apple M4 Pro"],
                    "ram": ["32GB Unified"],
                    "storage": ["1TB SSD"],
                    "gpu": ["Apple GPU 16-core"],
                    "release_year": "2025",
                    "notes": "ביצועי ביניים מקצועיים"
                },
                {
                    "name": "MacBook Pro 16 M4 Max SKU-51",
                    "screenSize": ["16.2\""],
                    "cpu": ["Apple M4 Max"],
                    "ram": ["64GB Unified"],
                    "storage": ["2TB SSD"],
                    "gpu": ["Apple GPU 40-core"],
                    "release_year": "2025",
                    "notes": "ביצועי קצה עתידיים"
                }
            ]
        },
        {
            "name": "MacBook Air",
            "type": "laptop",
            "subModels": [
                {
                    "name": "MacBook Air 13 M4 SKU-10",
                    "screenSize": ["13.6\""],
                    "cpu": ["Apple M4"],
                    "ram": ["16GB Unified"],
                    "storage": ["256GB SSD"],
                    "gpu": ["Apple GPU 10-core"],
                    "release_year": "2025",
                    "notes": "הכי נמכר בעולם"
                },
                {
                    "name": "MacBook Air 15 M4 SKU-32",
                    "screenSize": ["15.3\""],
                    "cpu": ["Apple M4"],
                    "ram": ["16GB Unified"],
                    "storage": ["512GB SSD"],
                    "gpu": ["Apple GPU 10-core"],
                    "release_year": "2025",
                    "notes": "מסך גדול משקל קטן"
                },
                {
                    "name": "MacBook Air 13 M5 SKU-40",
                    "screenSize": ["13.6\""],
                    "cpu": ["Apple M5 Series"],
                    "ram": ["16GB Unified"],
                    "storage": ["256GB SSD"],
                    "gpu": ["Apple GPU (Internal)"],
                    "release_year": "2026",
                    "notes": "דור עתידי מתוכנן"
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
                    "name": "Zenbook S 16 SKU-4",
                    "screenSize": ["16\""],
                    "cpu": ["AMD Ryzen AI 9 HX 370"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["AMD Radeon 890M"],
                    "release_year": "2025",
                    "notes": "דק במיוחד עם ביצועי AI"
                }
            ]
        },
        {
            "name": "ROG",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ROG Zephyrus G16 SKU-15",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core Ultra 9 285H"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["2TB NVMe"],
                    "gpu": ["NVIDIA RTX 5090 16GB"],
                    "release_year": "2025",
                    "notes": "מסך OLED מדהים"
                }
            ]
        },
        {
            "name": "Vivobook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Vivobook S 15 S5507 SKU-22",
                    "screenSize": ["15.6\""],
                    "cpu": ["Snapdragon X Elite"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["512GB NVMe"],
                    "gpu": ["Adreno GPU"],
                    "release_year": "2025",
                    "notes": "דגם ה-AI של אסוס"
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
                    "name": "Galaxy Book 5 Ultra SKU-5",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core Ultra 9 285H"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["NVIDIA RTX 5060 8GB"],
                    "release_year": "2025",
                    "notes": "מסך AMOLED 120Hz"
                },
                {
                    "name": "Galaxy Book 6 Edge SKU-17",
                    "screenSize": ["14\""],
                    "cpu": ["Snapdragon X Elite"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Adreno GPU"],
                    "release_year": "2026",
                    "notes": "דור חדש של מחשבי AI"
                },
                {
                    "name": "Galaxy Book 5 Pro 14 SKU-30",
                    "screenSize": ["14\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["16GB LPDDR5x"],
                    "storage": ["512GB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2025",
                    "notes": "דק וקל במיוחד"
                }
            ]
        }
    ],
    "HP": [
        {
            "name": "Spectre",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Spectre x360 14 (2025) SKU-6",
                    "screenSize": ["14\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["16GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2025",
                    "notes": "מסך מגע מתהפך"
                }
            ]
        },
        {
            "name": "EliteBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "EliteBook 840 G12 SKU-13",
                    "screenSize": ["14\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2026",
                    "notes": "סטנדרט ארגוני גבוה"
                }
            ]
        },
        {
            "name": "ZBook",
            "type": "laptop",
            "subModels": [
                {
                    "name": "ZBook Studio G12 SKU-20",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core Ultra 9 285H"],
                    "ram": ["64GB DDR5"],
                    "storage": ["2TB NVMe"],
                    "gpu": ["NVIDIA RTX 5070 8GB"],
                    "release_year": "2026",
                    "notes": "עיצוב גרפי מקצועי"
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
                    "name": "Stealth 16 AI Studio SKU-7",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core Ultra 9 285H"],
                    "ram": ["64GB DDR5"],
                    "storage": ["2TB NVMe"],
                    "gpu": ["NVIDIA RTX 5080 12GB"],
                    "release_year": "2025",
                    "notes": "גיימינג ועיצוב דק"
                }
            ]
        },
        {
            "name": "Prestige",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Prestige 16 AI Evo SKU-21",
                    "screenSize": ["16\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2025",
                    "notes": "אידיאל לעבודה מרחוק"
                }
            ]
        }
    ],
    "Microsoft": [
        {
            "name": "Surface",
            "type": "laptop",
            "subModels": [
                {
                    "name": "Surface Laptop 7 SKU-8",
                    "screenSize": ["13.8\""],
                    "cpu": ["Snapdragon X Elite"],
                    "ram": ["16GB LPDDR5x"],
                    "storage": ["512GB NVMe"],
                    "gpu": ["Adreno GPU"],
                    "release_year": "2025",
                    "notes": "מעבד ARM סוללה ל-20 שעות"
                },
                {
                    "name": "Surface Pro 12 SKU-42",
                    "screenSize": ["13\""],
                    "cpu": ["Intel Core Ultra 7 258V"],
                    "ram": ["32GB LPDDR5x"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["Intel Arc Graphics"],
                    "release_year": "2026",
                    "notes": "הטאבלט החזק בעולם"
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
                    "name": "Blade 14 (2025) SKU-9",
                    "screenSize": ["14\""],
                    "cpu": ["AMD Ryzen 9 8945HS"],
                    "ram": ["32GB DDR5"],
                    "storage": ["1TB NVMe"],
                    "gpu": ["NVIDIA RTX 5070 8GB"],
                    "release_year": "2025",
                    "notes": "מפלצת גיימינג קטנה"
                }
            ]
        }
    ]
};
