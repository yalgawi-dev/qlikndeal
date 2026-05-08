import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const sql = neon(process.env.DATABASE_URL);
const adapter = new PrismaNeonHTTP(sql);
const prisma = new PrismaClient({ adapter });

try {
  const count = await prisma.marketplaceListing.count();
  console.log('✅ DB OK via HTTP — listings count:', count);

  const sample = await prisma.marketplaceListing.findMany({
    where: { status: "ACTIVE", listingType: "SELL" },
    take: 3,
    orderBy: { createdAt: "desc" }
  });
  console.log('✅ Sample query — found:', sample.length, 'active SELL listings');
  sample.forEach(l => console.log('  -', l.id.substring(0,8), '|', l.title?.substring(0, 50)));

} catch (e) {
  console.error('❌ DB ERROR:', e.message);
} finally {
  await prisma.$disconnect();
}
