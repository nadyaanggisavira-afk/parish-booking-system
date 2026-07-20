import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('changeme123', 10);
  const umatHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'sekretariat@purbayan-paroki.org' },
    update: {},
    create: {
      nama: 'Sekretariat Paroki',
      email: 'sekretariat@purbayan-paroki.org',
      noWhatsapp: '0271-000000',
      lingkungan: 'Sekretariat',
      passwordHash: adminHash,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'yohanes@example.com' },
    update: {},
    create: {
      nama: 'Yohanes Baptista',
      email: 'yohanes@example.com',
      noWhatsapp: '0812-3456-7890',
      lingkungan: 'Wilayah II - Lingkungan St. Maria',
      passwordHash: umatHash,
      role: 'umat',
    },
  });

  // The four rooms managed by the parish (per design doc).
  const rooms = [
    { name: 'Ruang Ignatius Loyola', capacity: 20, facilities: 'Proyektor, AC, sound system' },
    { name: 'Ruang Fransiskus Xaverius', capacity: 15, facilities: 'Whiteboard, AC' },
    { name: 'Ruang Petrus Faber', capacity: 12, facilities: 'TV layar, AC' },
    {
      name: 'Gereja St. Antonius Purbayan (Utama)',
      capacity: 500,
      facilities: 'Sound system, mimbar, sakristi',
    },
  ];
  for (const room of rooms) {
    const existing = await prisma.room.findFirst({ where: { name: room.name } });
    if (!existing) await prisma.room.create({ data: room });
  }

  console.log('Seed complete.');
  console.log('  Admin: sekretariat@purbayan-paroki.org / changeme123');
  console.log('  Umat:  yohanes@example.com / password123');
  console.log('IMPORTANT: change the admin password before going live.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
