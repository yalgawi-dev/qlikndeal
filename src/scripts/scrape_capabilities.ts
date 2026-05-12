import { PrismaClient } from '@prisma/client';
// import { chromium } from 'playwright'; // Make sure playwright is installed if you want to use the actual scraper.

const prisma = new PrismaClient();

// Initial dataset with popular games and software to jumpstart the Learning Engine.
const INITIAL_SEED_DATA = [
  { keyword: 'Fortnite', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Minecraft', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'GTA V', minRam: 8, minCpuTier: 2, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'Call of Duty', minRam: 16, minCpuTier: 3, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Warzone', minRam: 16, minCpuTier: 3, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Cyberpunk 2077', minRam: 16, minCpuTier: 4, minGpuTier: 5, category: 'Laptops' },
  { keyword: 'FIFA 24', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'League of Legends', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Valorant', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'CS:GO', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'PUBG', minRam: 8, minCpuTier: 2, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'Red Dead Redemption 2', minRam: 12, minCpuTier: 3, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Apex Legends', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Rust', minRam: 16, minCpuTier: 3, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'ARK', minRam: 16, minCpuTier: 3, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'Dota 2', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Roblox', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'SolidWorks', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'AutoCAD', minRam: 16, minCpuTier: 3, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'Photoshop', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Premiere Pro', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'After Effects', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Blender', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Maya', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Unity', minRam: 16, minCpuTier: 3, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'Unreal Engine', minRam: 32, minCpuTier: 5, minGpuTier: 5, category: 'Laptops' },
  { keyword: 'Figma', minRam: 8, minCpuTier: 2, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Visual Studio', minRam: 8, minCpuTier: 2, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Android Studio', minRam: 16, minCpuTier: 3, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Ableton Live', minRam: 8, minCpuTier: 3, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'FL Studio', minRam: 8, minCpuTier: 2, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Office', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Zoom', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Chrome', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Sims 4', minRam: 8, minCpuTier: 2, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Genshin Impact', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Elden Ring', minRam: 16, minCpuTier: 3, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Hogwarts Legacy', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Starfield', minRam: 16, minCpuTier: 4, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Baldurs Gate 3', minRam: 16, minCpuTier: 3, minGpuTier: 4, category: 'Laptops' },
  { keyword: 'Diablo IV', minRam: 16, minCpuTier: 3, minGpuTier: 3, category: 'Laptops' },
  { keyword: 'Overwatch 2', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Rainbow Six', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Rocket League', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Dead by Daylight', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Phasmophobia', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Destiny 2', minRam: 8, minCpuTier: 2, minGpuTier: 2, category: 'Laptops' },
  { keyword: 'Terraria', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Stardew Valley', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' },
  { keyword: 'Garrys Mod', minRam: 4, minCpuTier: 1, minGpuTier: 1, category: 'Laptops' }
];

async function run() {
  console.log("Starting Capability Scraper Engine...");
  
  // Future Playwright implementation for dynamic scraping:
  /*
  console.log("Launching Playwright...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://systemrequirementslab.com/cyri');
  // ... dynamic scraping logic ...
  await browser.close();
  */

  console.log(`Seeding ${INITIAL_SEED_DATA.length} initial items to CapabilityMapping...`);
  let count = 0;
  for (const item of INITIAL_SEED_DATA) {
    try {
      await prisma.capabilityMapping.upsert({
        where: { keyword: item.keyword },
        update: { ...item },
        create: { ...item },
      });
      count++;
    } catch (e) {
      console.error(`Error saving ${item.keyword}:`, e);
    }
  }
  console.log(`Successfully seeded ${count} capabilities into the knowledge base.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
