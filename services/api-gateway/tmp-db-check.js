const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const [users, pending] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'DOCTOR' },
        select: { id: true, email: true, fullName: true, approvalStatus: true, createdAt: true },
      }),
      prisma.approvalQueue.findMany({
        where: { status: 'PENDING' },
        select: { id: true, userId: true, role: true, submittedAt: true },
      }),
    ]);
    console.log('doctors', users.length);
    console.log(JSON.stringify(users, null, 2));
    console.log('pending approvals', pending.length);
    console.log(JSON.stringify(pending, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
