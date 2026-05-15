import { PrismaClient } from '@swasthai/database';

const p = new PrismaClient();

async function main() {
  const docs = await p.user.findMany({
    where: { role: 'DOCTOR' },
    select: { id: true, email: true, fullName: true, role: true, approvalStatus: true, createdAt: true },
  });
  console.log('DOCTORS IN DB:', JSON.stringify(docs, null, 2));

  const approvals = await p.approvalQueue.findMany({
    select: { id: true, role: true, status: true, userId: true, submittedAt: true },
  });
  console.log('APPROVAL QUEUE:', JSON.stringify(approvals, null, 2));

  const allUsers = await p.user.count();
  console.log('TOTAL USERS:', allUsers);

  await p.$disconnect();
}

main().catch(console.error);
