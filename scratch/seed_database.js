require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const categories = [
  {
    id: 1,
    name_he: 'משרד, למידה וגלישה',
    name_en: 'Office & School',
    desc: 'מיועד לעבודה משרדית, זום, אופיס וגלישה מרובת טאבים',
    cpu: 'Core i3 / Ryzen 3',
    ram: 16,
    storage: 512,
    storage_type: 'SSD NVMe',
    gpu: 'Integrated',
    mfg: 'Dell Vostro, Lenovo IdeaPad, HP',
    dyn: JSON.stringify({ icon: 'Briefcase' })
  },
  {
    id: 2,
    name_he: 'גיימינג (Gaming)',
    name_en: 'Gaming',
    desc: 'להרצת משחקים מודרניים ברזולוציית 1080p בצורה חלקה',
    cpu: 'Core i5 / Ryzen 5',
    ram: 16,
    storage: 1000,
    storage_type: 'SSD NVMe PCIe Gen 4',
    gpu: 'RTX 4060 / RX 7600',
    mfg: 'Lenovo Legion, ASUS ROG/TUF',
    dyn: JSON.stringify({ icon: 'Gamepad2' })
  },
  {
    id: 3,
    name_he: 'עריכת מדיה ותלת-ממד',
    name_en: 'Content Creation',
    desc: 'עבור תוכנות עריכת וידאו 4K, גרפיקה כבדה ורינדור',
    cpu: 'Core i7 / Ryzen 7',
    ram: 32,
    storage: 1000,
    storage_type: 'SSD NVMe PCIe Gen 4',
    gpu: 'RTX 4060 Ti 16GB / RTX 4070',
    mfg: 'NVIDIA Required. MacBook Pro, ASUS ProArt',
    dyn: JSON.stringify({ icon: 'Paintbrush' })
  },
  {
    id: 4,
    name_he: 'פיתוח תוכנה וסייבר',
    name_en: 'Software Development',
    desc: 'להרצת סביבות פיתוח, קומפילציה, Docker ומכונות וירטואליות',
    cpu: 'Core i7 / Ryzen 7',
    ram: 32,
    storage: 1000,
    storage_type: 'SSD NVMe PCIe Gen 4',
    gpu: 'Integrated / Dedicated',
    mfg: 'MacBook Pro, Lenovo ThinkPad T/X1',
    dyn: JSON.stringify({ icon: 'Code' })
  },
  {
    id: 5,
    name_he: 'מחשב קל משקל לדרכים',
    name_en: 'Ultra-Portable',
    desc: 'לסטודנטים ואנשי עסקים בתנועה - דגש על משקל וסוללה',
    cpu: 'Core Ultra 5 / Ryzen 5 U',
    ram: 16,
    storage: 512,
    storage_type: 'SSD NVMe',
    gpu: 'Integrated',
    mfg: 'MacBook Air, ASUS Zenbook, Dell XPS 13',
    dyn: JSON.stringify({ icon: 'Laptop' })
  }
];

const softwareList = [
  // --- CATEGORY 1: OFFICE, SCHOOL & HOME ---
  { name_en: 'Google Chrome', name_he: 'גוגל כרום', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Microsoft Excel', name_he: 'אקסל', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Microsoft Word', name_he: 'וורד', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Microsoft PowerPoint', name_he: 'פאוורפוינט', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Google Docs / Sheets', name_he: 'גוגל דוקס / שיטס', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Zoom', name_he: 'זום', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Slack', name_he: 'סלאק', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Microsoft Teams', name_he: 'טיימס', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'WhatsApp Desktop', name_he: 'וואטסאפ למחשב', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Canva', name_he: 'קנבה', category_id: 1, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Netflix', name_he: 'נטפליקס', category_id: 1, ram_override: 16, vram_override: null, is_popular: false },

  // --- CATEGORY 2: GAMING ---
  { name_en: 'Fortnite', name_he: 'פורטנייט', category_id: 2, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Grand Theft Auto V / GTA 5', name_he: "ג'י טי איי 5", category_id: 2, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Cyberpunk 2077', name_he: 'סייברפאנק', category_id: 2, ram_override: 16, vram_override: 8, is_popular: false },
  { name_en: 'Call of Duty: Warzone', name_he: 'קול אוף דיוטי וורזון', category_id: 2, ram_override: 16, vram_override: 8, is_popular: true },
  { name_en: 'Valorant', name_he: 'וולורנט', category_id: 2, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Counter-Strike 2 / CS2', name_he: 'קאונטר סטרייק / סי אם', category_id: 2, ram_override: 16, vram_override: 6, is_popular: true },
  { name_en: 'EA Sports FC / FIFA', name_he: 'פיפא / אלטרוניק ארטס FC', category_id: 2, ram_override: 16, vram_override: 6, is_popular: true },
  { name_en: 'League of Legends / LoL', name_he: "ליג אוף לג'נדס", category_id: 2, ram_override: 16, vram_override: 2, is_popular: true },
  { name_en: 'Minecraft', name_he: 'מיינקראפט', category_id: 2, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Roblox Studio', name_he: 'רובלוקס סטודיו', category_id: 2, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Apex Legends', name_he: "אייפקס / אייפקס לג'נדס", category_id: 2, ram_override: 16, vram_override: 6, is_popular: true },
  { name_en: 'PUBG', name_he: "פאבג'י", category_id: 2, ram_override: 16, vram_override: 6, is_popular: true },
  { name_en: 'Red Dead Redemption 2 / RDR2', name_he: 'רד דד 2 / רד דד רידמפשן', category_id: 2, ram_override: 16, vram_override: 6, is_popular: true },
  { name_en: 'Hogwarts Legacy', name_he: 'הוגוורטס לגסי', category_id: 2, ram_override: 16, vram_override: 8, is_popular: false },
  { name_en: 'Elden Ring', name_he: 'אלדן רינג', category_id: 2, ram_override: 16, vram_override: 6, is_popular: true },
  { name_en: 'The Sims 4', name_he: 'סימס 4', category_id: 2, ram_override: 16, vram_override: 2, is_popular: true },
  { name_en: 'Rocket League', name_he: 'רוקט ליג', category_id: 2, ram_override: 16, vram_override: 2, is_popular: true },
  { name_en: 'The Witcher 3', name_he: "המכשף 3 / וויצ'ר", category_id: 2, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: 'Diablo IV', name_he: 'דיאבלו 4', category_id: 2, ram_override: 16, vram_override: 6, is_popular: false },
  { name_en: 'Overwatch 2', name_he: "אוברווץ' 2", category_id: 2, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: 'Dota 2', name_he: 'דוטא 2', category_id: 2, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: "Baldur's Gate 3", name_he: 'בלדורז גייט 3', category_id: 2, ram_override: 16, vram_override: 8, is_popular: true },

  // --- CATEGORY 3: CONTENT CREATION, 3D & ENGINEERING (CAD) ---
  { name_en: 'Adobe Photoshop', name_he: 'פוטושופ', category_id: 3, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Adobe Premiere Pro', name_he: 'פרימייר', category_id: 3, ram_override: 32, vram_override: 6, is_popular: true },
  { name_en: 'Blender', name_he: 'בלנדר', category_id: 3, ram_override: 32, vram_override: 8, is_popular: true },
  { name_en: 'AutoCAD', name_he: 'אוטוקאד', category_id: 3, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Adobe After Effects', name_he: 'אפטר אפקטס', category_id: 3, ram_override: 32, vram_override: 8, is_popular: false },
  { name_en: 'SolidWorks', name_he: 'סולידוורקס', category_id: 3, ram_override: 32, vram_override: 8, is_popular: true },
  { name_en: 'Autodesk Maya', name_he: 'מאיה', category_id: 3, ram_override: 32, vram_override: 8, is_popular: false },
  { name_en: 'Autodesk 3ds Max', name_he: 'תלת-ממד מקס', category_id: 3, ram_override: 32, vram_override: 8, is_popular: false },
  { name_en: 'Revit', name_he: 'רוויט', category_id: 3, ram_override: 32, vram_override: 6, is_popular: true },
  { name_en: 'Civil 3D', name_he: 'סיביל תלת מימד / הנדסת תשתיות', category_id: 3, ram_override: 32, vram_override: 6, is_popular: false },
  { name_en: 'ArchiCAD', name_he: 'ארכיקאד', category_id: 3, ram_override: 32, vram_override: 6, is_popular: false },
  { name_en: 'Lumion', name_he: 'לומיון', category_id: 3, ram_override: 32, vram_override: 10, is_popular: true },
  { name_en: 'V-Ray', name_he: 'וי ריי / וי-ריי', category_id: 3, ram_override: 32, vram_override: 8, is_popular: false },
  { name_en: 'SketchUp', name_he: 'סקצאפ / סקצ\'אפ', category_id: 3, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Rhino 3D', name_he: 'ריינו', category_id: 3, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: 'MicroStation', name_he: 'מיקרוסטיישן', category_id: 3, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: 'Tekla Structures', name_he: 'טקלה סטראקצ\'רס / קונסטרוקציה', category_id: 3, ram_override: 32, vram_override: 6, is_popular: false },
  { name_en: 'Ansys', name_he: 'אנסיס / סימולציות הנדסיות', category_id: 3, ram_override: 64, vram_override: 8, is_popular: false },
  { name_en: 'CATIA', name_he: "קאטיה / הנדסת מכונות", category_id: 3, ram_override: 32, vram_override: 8, is_popular: false },
  { name_en: 'Fusion 360', name_he: "פיוז'ן 360", category_id: 3, ram_override: 16, vram_override: 4, is_popular: true },
  { name_en: 'Vectorworks', name_he: 'וקטורוורקס', category_id: 3, ram_override: 32, vram_override: 6, is_popular: false },
  { name_en: 'Bentley Systems', name_he: 'בנטלי תשתיות', category_id: 3, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: 'Solid Edge', name_he: "סוליד אדג'", category_id: 3, ram_override: 16, vram_override: 4, is_popular: false },
  { name_en: 'Adobe Illustrator', name_he: 'אילוסטרייטור', category_id: 3, ram_override: 16, vram_override: 2, is_popular: true },
  { name_en: 'Adobe InDesign', name_he: 'אינדיזיין', category_id: 3, ram_override: 16, vram_override: 2, is_popular: false },
  { name_en: 'Figma', name_he: 'פיגמה', category_id: 3, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'DaVinci Resolve', name_he: "דאווינצ'י ריזולב", category_id: 3, ram_override: 32, vram_override: 8, is_popular: true },
  { name_en: 'Avid Media Composer', name_he: 'אוויד', category_id: 3, ram_override: 32, vram_override: 4, is_popular: false },
  { name_en: 'Cubase', name_he: 'קיובייס (הפקה מוזיקלית)', category_id: 3, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'FL Studio', name_he: 'אף אל סטודיו', category_id: 3, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Ableton Live', name_he: 'אייבלטון', category_id: 3, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Pro Tools', name_he: 'פרו טולס', category_id: 3, ram_override: 32, vram_override: null, is_popular: false },
  { name_en: 'Cinema 4D', name_he: 'סינמה 4 די', category_id: 3, ram_override: 32, vram_override: 8, is_popular: false },
  { name_en: 'ZBrush', name_he: 'זיבראש', category_id: 3, ram_override: 32, vram_override: 4, is_popular: false },

  // --- CATEGORY 4: SOFTWARE DEVELOPMENT & CYBER ---
  { name_en: 'VS Code', name_he: 'ויזואל סטודיו קוד', category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Visual Studio', name_he: 'ויזואל סטודיו מלא', category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Docker Desktop', name_he: 'דוקר', category_id: 4, ram_override: 32, vram_override: null, is_popular: true },
  { name_en: 'IntelliJ IDEA', name_he: "אינטליג'יי", category_id: 4, ram_override: 32, vram_override: null, is_popular: true },
  { name_en: 'PyCharm', name_he: "פאיצ'ארם / פאי צ'ארם", category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'WebStorm', name_he: "וובסטורם / ווב סטורם", category_id: 4, ram_override: 16, vram_override: null, is_popular: false },
  { name_en: 'Android Studio', name_he: 'אנדרואיד סטודיו', category_id: 4, ram_override: 32, vram_override: null, is_popular: true },
  { name_en: 'XCode', name_he: 'אקס קוד / אקס-קוד', category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Eclipse', name_he: 'איקליפס', category_id: 4, ram_override: 16, vram_override: null, is_popular: false },
  { name_en: 'CLion', name_he: 'סי ליון', category_id: 4, ram_override: 16, vram_override: null, is_popular: false },
  { name_en: 'Postman', name_he: 'פוסטמן', category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Kubernetes / Minikube', name_he: 'קיוברנטיס', category_id: 4, ram_override: 32, vram_override: null, is_popular: false },
  { name_en: 'MATLAB', name_he: 'מטלאב', category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Anaconda / Jupyter', name_he: "ג'ופייטר / אנקונדה", category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Power BI', name_he: 'פאוור בי איי', category_id: 4, ram_override: 16, vram_override: null, is_popular: true },
  { name_en: 'Tableau', name_he: 'טאבלו', category_id: 4, ram_override: 16, vram_override: null, is_popular: false },
  { name_en: 'Wireshark', name_he: 'וירשארק', category_id: 4, ram_override: 16, vram_override: null, is_popular: false },
  { name_en: 'Burp Suite', name_he: 'בארפ סוויט / סייבר', category_id: 4, ram_override: 16, vram_override: null, is_popular: false },
  { name_en: 'VirtualBox', name_he: 'וירטואל בוקס / מכונות וירטואליות', category_id: 4, ram_override: 32, vram_override: null, is_popular: true },
  { name_en: 'VMware Workstation', name_he: 'ויאמוור', category_id: 4, ram_override: 32, vram_override: null, is_popular: true },
  { name_en: 'Unity Editor', name_he: 'יוניטי', category_id: 4, ram_override: 32, vram_override: 6, is_popular: true },
  { name_en: 'Unreal Engine 5', name_he: "אנריל אנג'ין 5", category_id: 4, ram_override: 32, vram_override: 8, is_popular: true }
];

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  console.log("Seeding categories...");
  for (const cat of categories) {
    await sql`
      INSERT INTO computer_use_categories (id, category_name_he, category_name_en, description, min_cpu_tier, min_ram_gb, min_storage_gb, storage_type, recommended_gpu, manufacturer_recommendation, dynamic_attributes)
      VALUES (${cat.id}, ${cat.name_he}, ${cat.name_en}, ${cat.desc}, ${cat.cpu}, ${cat.ram}, ${cat.storage}, ${cat.storage_type}, ${cat.gpu}, ${cat.mfg}, ${cat.dyn})
      ON CONFLICT (id) DO UPDATE SET 
        category_name_he = EXCLUDED.category_name_he,
        category_name_en = EXCLUDED.category_name_en,
        description = EXCLUDED.description,
        min_cpu_tier = EXCLUDED.min_cpu_tier,
        min_ram_gb = EXCLUDED.min_ram_gb,
        min_storage_gb = EXCLUDED.min_storage_gb,
        storage_type = EXCLUDED.storage_type,
        recommended_gpu = EXCLUDED.recommended_gpu,
        manufacturer_recommendation = EXCLUDED.manufacturer_recommendation,
        dynamic_attributes = EXCLUDED.dynamic_attributes
    `;
  }
  console.log("Categories seeded.");

  console.log("Cleaning old software applications...");
  await sql`DELETE FROM software_applications`;

  console.log("Seeding software applications...");
  for (const app of softwareList) {
    await sql`
      INSERT INTO software_applications (app_name_en, app_name_he, category_id, min_ram_gb_override, min_vram_gb_override, is_popular)
      VALUES (${app.name_en}, ${app.name_he}, ${app.category_id}, ${app.ram_override}, ${app.vram_override}, ${app.is_popular})
    `;
  }
  console.log("Software applications seeded successfully.");
}

main().catch(err => {
  console.error("Seed failed:", err);
});
