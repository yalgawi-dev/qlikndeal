import { ComputerModelFamily } from "./computer-data";

export const NEW_LAPTOPS_2025_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Lenovo": [
        {
            "name": "ThinkPad", "type": "laptop", "subModels": [
                { "name": "ThinkPad X1 Carbon Gen 13 SKU-1", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "דגם דגל עסקי AI" },
                { "name": "ThinkPad P16 Gen 3 SKU-18", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["64GB ECC"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 3500 Ada"], "release_year": "2025", "notes": "מיועד ל-CAD ותלת מימד" },
                { "name": "ThinkPad T14s Gen 6 SKU-24", "screenSize": ["14\""], "cpu": ["Snapdragon X Elite"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Adreno GPU"], "release_year": "2025", "notes": "ה-T14 הראשון עם ARM" },
                { "name": "ThinkPad Z13 Gen 3 SKU-41", "screenSize": ["13.3\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["AMD Radeon 890M"], "release_year": "2025", "notes": "עיצוב מודרני מחומרים ממוחזרים" },
                { "name": "ThinkPad X1 Carbon Gen 14 SKU-52", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["64GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "מחשב המנהלים של 2026" },
                { "name": "ThinkPad T16 Gen 4 SKU-81", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "סוס עבודה למשרד" },
                { "name": "ThinkPad X13 Gen 6 SKU-109", "screenSize": ["13.3\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "ניידות מקסימלית למנהלים" },
                { "name": "ThinkPad X1 Carbon Gen 13 SKU-175", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 5 226V"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "גרסת כניסה למנהלים" },
                { "name": "ThinkPad Z13 Gen 3 SKU-236", "screenSize": ["13.3\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["AMD Radeon 890M"], "release_year": "2025", "notes": "עיצוב פרימיום AMD" },
                { "name": "ThinkPad X1 Carbon Gen 14 SKU-249", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "דגם העלית של 2026" },
                { "name": "ThinkPad P1 Gen 8 SKU-92", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["64GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 3000 Ada"], "release_year": "2025", "notes": "אלגנטי ועוצמתי" }
            ]
        },
        {
            "name": "ThinkBook", "type": "laptop", "subModels": [
                { "name": "ThinkBook 16p Gen 6 SKU-50", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5060 8GB"], "release_year": "2026", "notes": "מחשב יצירתי לעסקים" }
            ]
        },
        {
            "name": "IdeaPad", "type": "laptop", "subModels": [
                { "name": "IdeaPad Pro 5i Gen 10 SKU-64", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2025", "notes": "ביצועים גבוהים במחיר נוח" },
                { "name": "IdeaPad Slim 5 Gen 10 SKU-101", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 5 226V"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "עיצוב דק במחיר כניסה" }
            ]
        },
        {
            "name": "LOQ", "type": "laptop", "subModels": [
                { "name": "LOQ 15 Gen 10 SKU-37", "screenSize": ["15.6\""], "cpu": ["Intel Core i5-14500HX"], "ram": ["16GB DDR5"], "storage": ["512GB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2025", "notes": "גיימינג כניסה משתלם" }
            ]
        },
        {
            "name": "Legion", "type": "laptop", "subModels": [
                { "name": "Legion 7i Gen 10 SKU-11", "screenSize": ["16\""], "cpu": ["Intel Core i9-14900HX"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2025", "notes": "קירור מתקדם" },
                { "name": "Legion 5i Gen 10 SKU-117", "screenSize": ["15.6\""], "cpu": ["Intel Core i7-14700HX"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5060 8GB"], "release_year": "2025", "notes": "הגיימינג הפופולרי ביותר" },
                { "name": "Legion Slim 7 Gen 10 SKU-141", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2025", "notes": "גיימינג חזק במארז דק" }
            ]
        },
        {
            "name": "Yoga", "type": "laptop", "subModels": [
                { "name": "Yoga Pro 9i Gen 10 SKU-31", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["64GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2025", "notes": "מסך Mini-LED ליוצרי תוכן" },
                { "name": "Yoga Slim 7x SKU-71", "screenSize": ["14.5\""], "cpu": ["Snapdragon X Elite"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Adreno GPU"], "release_year": "2025", "notes": "דק, שקט וחזק" },
                { "name": "Yoga Slim 7i Gen 10 SKU-129", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "הכי דק בסדרת Yoga" }
            ]
        }
    ],
    "Dell": [
        {
            "name": "XPS", "type": "laptop", "subModels": [
                { "name": "XPS 14 9450 SKU-2", "screenSize": ["14.5\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2025", "notes": "עיצוב פרימיום חדש" },
                { "name": "XPS 13 9360 SKU-25", "screenSize": ["13.4\""], "cpu": ["Intel Core Ultra 5 226V"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "קומפקטי ללא פשרות" },
                { "name": "XPS 16 9650 SKU-53", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["64GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2025", "notes": "תצוגת InfinityEdge מדהימה" },
                { "name": "XPS 13 9350 SKU-93", "screenSize": ["13.4\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "ה-XPS הקלאסי המשודרג" },
                { "name": "XPS 14 9460 SKU-138", "screenSize": ["14.5\""], "cpu": ["Intel Core Ultra 7 268V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2026", "notes": "עיצוב העתיד של דל" }
            ]
        },
        {
            "name": "Latitude", "type": "laptop", "subModels": [
                { "name": "Latitude 7460 SKU-12", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 5 226V"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "עסקי עמיד" },
                { "name": "Latitude 9460 SKU-65", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "דגם פרימיום עסקי" }
            ]
        }
    ],
    "Apple": [
        {
            "name": "MacBook Pro", "type": "laptop", "subModels": [
                { "name": "MacBook Pro 14 M4 SKU-3", "screenSize": ["14.2\""], "cpu": ["Apple M4"], "ram": ["16GB Unified"], "storage": ["512GB SSD"], "gpu": ["Apple GPU 10-core"], "release_year": "2025", "notes": "דגם בסיס מקצועי" },
                { "name": "MacBook Pro 16 M4 Max SKU-14", "screenSize": ["16.2\""], "cpu": ["Apple M4 Max"], "ram": ["64GB Unified"], "storage": ["2TB SSD"], "gpu": ["Apple GPU 40-core"], "release_year": "2025", "notes": "עריכת וידאו 8K" },
                { "name": "MacBook Pro 14 M4 Pro SKU-23", "screenSize": ["14.2\""], "cpu": ["Apple M4 Pro"], "ram": ["32GB Unified"], "storage": ["1TB SSD"], "gpu": ["Apple GPU 16-core"], "release_year": "2025", "notes": "ביצועי ביניים מקצועיים" },
                { "name": "MacBook Pro 16 M4 Max SKU-51", "screenSize": ["16.2\""], "cpu": ["Apple M4 Max"], "ram": ["64GB Unified"], "storage": ["2TB SSD"], "gpu": ["Apple GPU 40-core"], "release_year": "2025", "notes": "ביצועי קצה עתידיים" },
                { "name": "MacBook Pro 14 M5 Max SKU-56", "screenSize": ["14.2\""], "cpu": ["Apple M5 Series"], "ram": ["64GB Unified"], "storage": ["2TB SSD"], "gpu": ["Apple GPU (Internal)"], "release_year": "2026", "notes": "מפלצת ביצועים קטנה" }
            ]
        },
        {
            "name": "MacBook Air", "type": "laptop", "subModels": [
                { "name": "MacBook Air 13 M4 SKU-10", "screenSize": ["13.6\""], "cpu": ["Apple M4"], "ram": ["16GB Unified"], "storage": ["256GB SSD"], "gpu": ["Apple GPU 10-core"], "release_year": "2025", "notes": "הכי נמכר בעולם" },
                { "name": "MacBook Air 15 M4 SKU-32", "screenSize": ["15.3\""], "cpu": ["Apple M4"], "ram": ["16GB Unified"], "storage": ["512GB SSD"], "gpu": ["Apple GPU 10-core"], "release_year": "2025", "notes": "מסך גדול משקל קטן" }
            ]
        }
    ],
    "ASUS": [
        {
            "name": "Zenbook", "type": "laptop", "subModels": [
                { "name": "Zenbook S 16 SKU-4", "screenSize": ["16\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["AMD Radeon 890M"], "release_year": "2025", "notes": "דק במיוחד עם ביצועי AI" },
                { "name": "Zenbook 14 OLED SKU-84", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["16GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "אידיאל לנסיעות" },
                { "name": "Zenbook S 16 SKU-124", "screenSize": ["16\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["32GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["AMD Radeon 890M"], "release_year": "2025", "notes": "עיצוב עוצר נשימה" }
            ]
        },
        {
            "name": "ROG", "type": "laptop", "subModels": [
                { "name": "ROG Zephyrus G16 SKU-15", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5090 16GB"], "release_year": "2025", "notes": "מסך OLED מדהים" },
                { "name": "ROG Strix SCAR 18 SKU-74", "screenSize": ["18\""], "cpu": ["Intel Core i9-14900HX"], "ram": ["64GB DDR5"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5090 16GB"], "release_year": "2025", "notes": "תצוגת Nebula HDR" },
                { "name": "ROG Zephyrus G14 SKU-112", "screenSize": ["14\""], "cpu": ["AMD Ryzen 9 8945HS"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2025", "notes": "מלך ה-14 אינץ'" }
            ]
        },
        {
            "name": "ProArt", "type": "laptop", "subModels": [
                { "name": "ProArt P16 SKU-35", "screenSize": ["16\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["64GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5080 12GB"], "release_year": "2025", "notes": "עריכת וידאו מקצועית" },
                { "name": "ProArt PX13 SKU-91", "screenSize": ["13.3\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2025", "notes": "סטודיו נייד מתהפך" }
            ]
        }
    ],
    "Samsung": [
        {
            "name": "Galaxy Book", "type": "laptop", "subModels": [
                { "name": "Galaxy Book 5 Ultra SKU-5", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5060 8GB"], "release_year": "2025", "notes": "מסך AMOLED 120Hz" },
                { "name": "Galaxy Book 6 Edge SKU-17", "screenSize": ["14\""], "cpu": ["Snapdragon X Elite"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Adreno GPU"], "release_year": "2026", "notes": "דור חדש של מחשבי AI" },
                { "name": "Galaxy Book 5 Pro 14 SKU-30", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "דק וקל במיוחד" },
                { "name": "Galaxy Book 6 Pro 16 SKU-44", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["16GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "שילוב מושלם עם סמארטפון" }
            ]
        }
    ],
    "HP": [
        {
            "name": "Spectre", "type": "laptop", "subModels": [
                { "name": "Spectre x360 14 (2025) SKU-6", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["16GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "מסך מגע מתהפך" },
                { "name": "Spectre x360 16 SKU-103", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2025", "notes": "המרכז הבידורי המושלם" }
            ]
        },
        {
            "name": "EliteBook", "type": "laptop", "subModels": [
                { "name": "EliteBook 840 G12 SKU-13", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "סטנדרט ארגוני גבוה" },
                { "name": "EliteBook 1040 G12 SKU-54", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "מיועד לאבטחה מוגברת" }
            ]
        },
        {
            "name": "ZBook", "type": "laptop", "subModels": [
                { "name": "ZBook Studio G12 SKU-20", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["64GB DDR5"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2026", "notes": "עיצוב גרפי מקצועי" }
            ]
        }
    ],
    "MSI": [
        {
            "name": "Stealth", "type": "laptop", "subModels": [
                { "name": "Stealth 16 AI Studio SKU-7", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["64GB DDR5"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5080 12GB"], "release_year": "2025", "notes": "גיימינג ועיצוב דק" },
                { "name": "Stealth 14 AI SKU-76", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5060 8GB"], "release_year": "2025", "notes": "גיימינג נייד אמיתי" }
            ]
        },
        {
            "name": "Prestige", "type": "laptop", "subModels": [
                { "name": "Prestige 16 AI Evo SKU-21", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "אידיאל לעבודה מרחוק" }
            ]
        }
    ],
    "Acer": [
        {
            "name": "Swift", "type": "laptop", "subModels": [
                { "name": "Swift Go 14 SKU-16", "screenSize": ["14\""], "cpu": ["Intel Core Ultra 5 226V"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "תמורה מעולה למחיר" },
                { "name": "Swift X 14 SKU-46", "screenSize": ["14.5\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5050 6GB"], "release_year": "2025", "notes": "ליוצרי תוכן בדרכים" }
            ]
        },
        {
            "name": "Predator", "type": "laptop", "subModels": [
                { "name": "Predator Helios Neo 16 SKU-27", "screenSize": ["16\""], "cpu": ["Intel Core i7-14700HX"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5060 8GB"], "release_year": "2025", "notes": "גיימינג עוצמתי" }
            ]
        }
    ],
    "Microsoft": [
        {
            "name": "Surface", "type": "laptop", "subModels": [
                { "name": "Surface Laptop 7 SKU-8", "screenSize": ["13.8\""], "cpu": ["Snapdragon X Elite"], "ram": ["16GB LPDDR5x"], "storage": ["512GB NVMe"], "gpu": ["Adreno GPU"], "release_year": "2025", "notes": "מעבד ARM סוללה ל-20 שעות" },
                { "name": "Surface Pro 12 SKU-42", "screenSize": ["13\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2026", "notes": "הטאבלט החזק בעולם" }
            ]
        }
    ],
    "LG": [
        {
            "name": "gram", "type": "laptop", "subModels": [
                { "name": "gram Pro 16 (2025) SKU-28", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["16GB LPDDR5x"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "משקל נוצה מתחת ל-1.2 ק\"ג" },
                { "name": "gram Pro 17 (2025) SKU-79", "screenSize": ["17.3\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB LPDDR5x"], "storage": ["2TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "הכי גדול והכי קל" }
            ]
        }
    ],
    "Gigabyte": [
        {
            "name": "AORUS", "type": "laptop", "subModels": [
                { "name": "AORUS 17X (2025) SKU-33", "screenSize": ["17.3\""], "cpu": ["Intel Core i9-14900HX"], "ram": ["64GB DDR5"], "storage": ["4TB NVMe"], "gpu": ["NVIDIA RTX 5090 16GB"], "release_year": "2025", "notes": "תחליף למחשב נייח" }
            ]
        }
    ],
    "Framework": [
        {
            "name": "Framework", "type": "laptop", "subModels": [
                { "name": "Framework Laptop 13 SKU-34", "screenSize": ["13.5\""], "cpu": ["Intel Core Ultra 7 258V"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["Intel Arc Graphics"], "release_year": "2025", "notes": "ניתן לתיקון ושדרוג עצמי" },
                { "name": "Framework Laptop 16 SKU-62", "screenSize": ["16\""], "cpu": ["AMD Ryzen AI 9 HX 370"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["AMD Radeon 890M"], "release_year": "2025", "notes": "מודול גרפי נשלף" }
            ]
        }
    ],
    "Razer": [
        {
            "name": "Blade", "type": "laptop", "subModels": [
                { "name": "Blade 14 (2025) SKU-9", "screenSize": ["14\""], "cpu": ["AMD Ryzen 9 8945HS"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2025", "notes": "מפלצת גיימינג קטנה" },
                { "name": "Blade 16 (2025) SKU-29", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 285H"], "ram": ["32GB DDR5"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5080 12GB"], "release_year": "2025", "notes": "מסך Mini-LED 240Hz" },
                { "name": "Blade 18 (2025) SKU-47", "screenSize": ["18\""], "cpu": ["Intel Core i9-14900HX"], "ram": ["64GB DDR5"], "storage": ["4TB NVMe"], "gpu": ["NVIDIA RTX 5090 16GB"], "release_year": "2025", "notes": "מסך 4K 200Hz" },
                { "name": "Blade 14 (2026) SKU-80", "screenSize": ["14\""], "cpu": ["AMD Ryzen 9 9945HS"], "ram": ["32GB DDR5"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 5070 8GB"], "release_year": "2026", "notes": "דור עתידי מטורף" },
                { "name": "Blade 16 (2026) SKU-100", "screenSize": ["16\""], "cpu": ["Intel Core Ultra 9 295H"], "ram": ["64GB DDR5"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 5090 16GB"], "release_year": "2026", "notes": "גיימינג ללא פשרות" }
            ]
        }
    ]
};
