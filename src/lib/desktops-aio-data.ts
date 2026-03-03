import { ComputerModelFamily } from "./computer-data";

export const BRAND_DESKTOPS_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Lenovo": [
        {
            "name": "Legion Tower", "type": "desktop", "subModels": [
                { "name": "Legion T5 26AMR5", "cpu": ["AMD Ryzen 7 5700G", "AMD Ryzen 7 5800"], "ram": ["16GB DDR4"], "storage": ["512GB NVMe"], "gpu": ["NVIDIA RTX 3060", "NVIDIA RTX 3060Ti"], "os": ["Windows 11"], "release_year": "2021", "sku": "DT-LEN-LEGION-T5-26AMR-01" },
                { "name": "Legion T7 34IMZ5", "cpu": ["Intel Core i7-10700K", "Intel Core i7-11700K"], "ram": ["16GB", "32GB"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 3070", "NVIDIA RTX 3080"], "os": ["Windows 11"], "release_year": "2021", "sku": "DT-LEN-LEGION-T7-34IMZ-01" },
                { "name": "Legion Tower 5i Gen 8", "cpu": ["Intel Core i5-13400F", "Intel Core i7-13700F"], "ram": ["16GB DDR5"], "storage": ["512GB SSD", "1TB SSD"], "gpu": ["NVIDIA RTX 4060", "NVIDIA RTX 4070"], "os": ["Windows 11"], "release_year": "2023", "sku": "DT-LEN-LEG-T5I-G8-01" }
            ]
        },
        {
            "name": "ThinkCentre", "type": "desktop", "subModels": [
                { "name": "ThinkCentre M70q Tiny", "cpu": ["Intel Core i5-12400T", "Intel Core i7-12700T"], "ram": ["8GB", "16GB"], "storage": ["256GB", "512GB"], "gpu": ["Intel UHD 770"], "os": ["Windows 11 Pro"], "release_year": "2022", "sku": "DT-LEN-TC-M70Q-01" },
                { "name": "ThinkCentre M90q Tiny Gen 3", "cpu": ["Intel Core i5-12500T", "Intel Core i7-12700T"], "ram": ["16GB"], "storage": ["512GB NVMe"], "gpu": ["Intel UHD 770"], "os": ["Windows 11 Pro"], "release_year": "2022", "sku": "DT-LEN-TC-M90Q-G3-01" }
            ]
        },
        {
            "name": "IdeaCentre", "type": "desktop", "subModels": [
                { "name": "IdeaCentre 5i", "cpu": ["Intel Core i5-12400", "Intel Core i7-12700"], "ram": ["8GB", "16GB"], "storage": ["512GB SSD"], "gpu": ["Intel UHD", "NVIDIA GTX 1650"], "os": ["Windows 11"], "release_year": "2022", "sku": "DT-LEN-IC-5I-01" }
            ]
        }
    ],
    "HP": [
        {
            "name": "OMEN", "type": "desktop", "subModels": [
                { "name": "OMEN 40L GT21", "cpu": ["AMD Ryzen 7 5800X", "Intel Core i7-12700K"], "ram": ["16GB", "32GB"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 3070", "AMD Radeon RX 6700 XT"], "os": ["Windows 11"], "release_year": "2022", "sku": "DT-HP-OMEN-40L-01" },
                { "name": "OMEN 45L GT22", "cpu": ["Intel Core i9-12900K", "AMD Ryzen 9 5900X"], "ram": ["32GB", "64GB"], "storage": ["2TB NVMe"], "gpu": ["NVIDIA RTX 3080", "NVIDIA RTX 3090"], "os": ["Windows 11"], "release_year": "2022", "sku": "DT-HP-OMEN-45L-01" },
                { "name": "OMEN 25L GT15", "cpu": ["Intel Core i5-13400F"], "ram": ["16GB"], "storage": ["512GB SSD"], "gpu": ["NVIDIA RTX 3060"], "os": ["Windows 11"], "release_year": "2023", "sku": "DT-HP-OMEN-25L-01" }
            ]
        },
        {
            "name": "EliteDesk", "type": "desktop", "subModels": [
                { "name": "EliteDesk 800 G9 SFF", "cpu": ["Intel Core i5-12500", "Intel Core i7-12700"], "ram": ["16GB"], "storage": ["512GB NVMe"], "gpu": ["Intel UHD 770"], "os": ["Windows 11 Pro"], "release_year": "2022", "sku": "DT-HP-ED-800-G9-01" }
            ]
        },
        {
            "name": "ProDesk", "type": "desktop", "subModels": [
                { "name": "ProDesk 400 G9 Mini", "cpu": ["Intel Core i5-12500T"], "ram": ["8GB", "16GB"], "storage": ["256GB"], "gpu": ["Intel UHD"], "os": ["Windows 11 Pro"], "release_year": "2022", "sku": "DT-HP-PD-400-G9-01" }
            ]
        }
    ],
    "Dell": [
        {
            "name": "OptiPlex", "type": "desktop", "subModels": [
                { "name": "OptiPlex 7000 Tower", "cpu": ["Intel Core i5-12500", "Intel Core i7-12700"], "ram": ["8GB", "16GB"], "storage": ["256GB", "512GB"], "gpu": ["Intel UHD 770"], "os": ["Windows 11 Pro"], "release_year": "2022", "sku": "DT-DELL-OPTIPLEX-7000-01" },
                { "name": "OptiPlex 7010 Micro", "cpu": ["Intel Core i5-13500T"], "ram": ["16GB"], "storage": ["512GB SSD"], "gpu": ["Intel UHD"], "os": ["Windows 11 Pro"], "release_year": "2023", "sku": "DT-DELL-OP-7010-M-01" }
            ]
        },
        {
            "name": "Alienware", "type": "desktop", "subModels": [
                { "name": "Aurora R13", "cpu": ["Intel Core i7-12700KF", "Intel Core i9-12900KF"], "ram": ["16GB", "32GB"], "storage": ["1TB NVMe"], "gpu": ["NVIDIA RTX 3080", "NVIDIA RTX 3090"], "os": ["Windows 11"], "release_year": "2021", "sku": "DT-DELL-AW-R13-01" },
                { "name": "Aurora R15", "cpu": ["Intel Core i9-13900KF"], "ram": ["32GB DDR5"], "storage": ["2TB SSD"], "gpu": ["NVIDIA RTX 4090"], "os": ["Windows 11"], "release_year": "2023", "sku": "DT-DELL-AW-R15-01" }
            ]
        },
        {
            "name": "Vostro", "type": "desktop", "subModels": [
                { "name": "Vostro 3910 Tower", "cpu": ["Intel Core i5-12400"], "ram": ["8GB"], "storage": ["256GB SSD"], "gpu": ["Intel UHD"], "os": ["Windows 11"], "release_year": "2022", "sku": "DT-DELL-VOSTRO-3910-01" }
            ]
        }
    ]
};

export const AIO_DATABASE: Record<string, ComputerModelFamily[]> = {
    "Apple": [
        {
            "name": "iMac", "type": "aio", "subModels": [
                { "name": "iMac 24\" M3 (2023)", "cpu": ["Apple M3 (8-core)", "Apple M3 (10-core)"], "ram": ["8GB", "16GB", "24GB"], "storage": ["256GB SSD", "512GB SSD", "1TB SSD"], "gpu": ["8-core GPU", "10-core GPU"], "os": ["macOS Sonoma"], "screenSize": ["23.5\""], "display": "4.5K Retina (4480x2520)", "release_year": "2023", "sku": "AIO-AP-IMAC-24-M3-01" },
                { "name": "iMac 24\" M1 (2021)", "cpu": ["Apple M1 (8-core)"], "ram": ["8GB", "16GB"], "storage": ["256GB SSD", "512GB SSD"], "gpu": ["7-core GPU", "8-core GPU"], "os": ["macOS Monterey"], "screenSize": ["23.5\""], "display": "4.5K Retina (4480x2520)", "release_year": "2021", "sku": "AIO-AP-IMAC-24-M1-01" },
                { "name": "iMac 27\" Intel (2020)", "cpu": ["Intel Core i5-10500", "Intel Core i7-10700K"], "ram": ["8GB", "16GB", "32GB"], "storage": ["256GB SSD", "512GB SSD"], "gpu": ["Radeon Pro 5300", "Radeon Pro 5500 XT"], "os": ["macOS Ventura"], "screenSize": ["27\""], "display": "5K Retina (5120x2880)", "release_year": "2020", "sku": "AIO-AP-IMAC-27-2020-01" }
            ]
        }
    ],
    "HP": [
        {
            "name": "Pavilion AIO", "type": "aio", "subModels": [
                { "name": "Pavilion 27-ca", "cpu": ["Intel Core i7-12700T", "AMD Ryzen 7 5825U"], "ram": ["16GB"], "storage": ["512GB", "1TB"], "gpu": ["Intel UHD 770", "AMD Radeon"], "os": ["Windows 11"], "screenSize": ["27\""], "display": "QHD (2560x1440)", "release_year": "2022", "sku": "AIO-HP-PAV-27-01" },
                { "name": "Pavilion 24-ca", "cpu": ["Intel Core i5-12400T"], "ram": ["8GB", "16GB"], "storage": ["512GB"], "gpu": ["Intel UHD"], "os": ["Windows 11"], "screenSize": ["23.8\""], "display": "FHD (1920x1080)", "release_year": "2022", "sku": "AIO-HP-PAV-24-01" }
            ]
        },
        {
            "name": "Envy AIO", "type": "aio", "subModels": [
                { "name": "Envy 34-c", "cpu": ["Intel Core i7-12700", "Intel Core i9-12900"], "ram": ["32GB", "64GB"], "storage": ["1TB SSD"], "gpu": ["NVIDIA RTX 3060", "NVIDIA RTX 3080"], "os": ["Windows 11"], "screenSize": ["34\""], "display": "5K WUHD (5120x2160)", "release_year": "2022", "sku": "AIO-HP-ENVY-34-01" }
            ]
        }
    ],
    "Dell": [
        {
            "name": "Inspiron AIO", "type": "aio", "subModels": [
                { "name": "Inspiron 24 5000", "cpu": ["Intel Core i5-1235U"], "ram": ["8GB", "16GB"], "storage": ["512GB SSD"], "gpu": ["Intel UHD"], "os": ["Windows 11"], "screenSize": ["23.8\""], "display": "FHD (1920x1080)", "release_year": "2022", "sku": "AIO-DELL-INS-24-01" },
                { "name": "Inspiron 27 7000", "cpu": ["Intel Core i7-1255U"], "ram": ["16GB"], "storage": ["1TB SSD"], "gpu": ["Intel Iris Xe"], "os": ["Windows 11"], "screenSize": ["27\""], "display": "FHD (1920x1080)", "release_year": "2022", "sku": "AIO-DELL-INS-27-01" }
            ]
        }
    ],
    "Lenovo": [
        {
            "name": "Yoga AIO", "type": "aio", "subModels": [
                { "name": "Yoga AIO 7 27ACH", "cpu": ["AMD Ryzen 7 5800H"], "ram": ["16GB", "32GB"], "storage": ["512GB", "1TB"], "gpu": ["NVIDIA RTX 3050"], "os": ["Windows 11"], "screenSize": ["27\""], "display": "4K UHD (3840x2160)", "release_year": "2021", "sku": "AIO-LEN-YOGA-7-01" },
                { "name": "Yoga AIO 9i Gen 8", "cpu": ["Intel Core i9-13900H"], "ram": ["32GB DDR5"], "storage": ["1TB SSD"], "gpu": ["NVIDIA RTX 4050"], "os": ["Windows 11"], "screenSize": ["31.5\""], "display": "4K UHD (3840x2160)", "release_year": "2023", "sku": "AIO-LEN-YOGA-9I-01" }
            ]
        },
        {
            "name": "IdeaCentre AIO", "type": "aio", "subModels": [
                { "name": "IdeaCentre AIO 3i Gen 7", "cpu": ["Intel Core i5-1240P"], "ram": ["8GB", "16GB"], "storage": ["512GB SSD"], "gpu": ["Intel UHD"], "os": ["Windows 11"], "screenSize": ["23.8\"", "27\""], "display": "FHD (1920x1080)", "release_year": "2022", "sku": "AIO-LEN-IC-3I-01" }
            ]
        }
    ],
    "ASUS": [
        {
            "name": "Zen AiO", "type": "aio", "subModels": [
                { "name": "Zen AiO 24 A5401", "cpu": ["Intel Core i7-10700T"], "ram": ["16GB"], "storage": ["512GB"], "gpu": ["Intel UHD"], "os": ["Windows 11"], "screenSize": ["23.8\""], "display": "FHD (1920x1080)", "release_year": "2021", "sku": "AIO-ASUS-ZEN-24-01" }
            ]
        }
    ]
};
