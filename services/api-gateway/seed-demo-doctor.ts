import { PrismaClient, Role, ApprovalStatus, OnboardingStatus } from '@swasthai/database';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemoDoctor() {
  const email = 'doctor@swasthai.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Delete existing if any
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        await prisma.user.delete({ where: { id: existing.id } });
    }

    const user = await prisma.user.create({
      data: {
        email,
        fullName: 'Dr. Rahul Sharma',
        phone: '+91 98765 43210',
        passwordHash,
        role: Role.DOCTOR,
        approvalStatus: ApprovalStatus.APPROVED,
        onboardingStatus: OnboardingStatus.COMPLETE,
        doctorProfile: {
          create: {
            registrationNumber: 'MCI/12345/678',
            specialization: 'Cardiology',
            experienceYears: 12,
            bio: 'Expert cardiologist with 12+ years of experience in clinical practice.',
            consultationFee: 500
          }
        }
      }
    });

    console.log('✅ Demo Doctor Seeded Successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error seeding demo doctor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoDoctor().catch(console.error);
