import { PrismaClient, Role, ApprovalStatus, OnboardingStatus, ConsultationStatus } from '@swasthai/database';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PATIENTS = [
  { name: 'Krishna', email: 'krishna@swasthai.demo' },
  { name: 'Krishnakant', email: 'krishnakant@swasthai.demo' },
  { name: 'Yash', email: 'yash@swasthai.demo' },
  { name: 'Jayganesh', email: 'jayganesh@swasthai.demo' },
  { name: 'Ram', email: 'ram@swasthai.demo' },
];

async function seedPatients() {
  const password = 'patient123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Get the demo doctor
  const doctor = await prisma.user.findUnique({
    where: { email: 'doctor@swasthai.com' },
    include: { doctorProfile: true }
  });

  if (!doctor) {
    console.error('❌ Demo doctor not found. Run seed-demo-doctor.ts first.');
    return;
  }

  console.log(`Seeding ${PATIENTS.length} patients...`);

  for (const pData of PATIENTS) {
    try {
      // Clean up existing
      const existing = await prisma.user.findUnique({ where: { email: pData.email } });
      if (existing) {
        await prisma.user.delete({ where: { id: existing.id } });
      }

      // Create Patient
      const user = await prisma.user.create({
        data: {
          email: pData.email,
          fullName: pData.name,
          passwordHash,
          role: Role.PATIENT,
          approvalStatus: ApprovalStatus.NOT_REQUIRED,
          onboardingStatus: OnboardingStatus.COMPLETE,
          patientProfile: {
            create: {
              gender: 'Male',
              bloodGroup: 'O+',
              address: 'Demo Address, India'
            }
          }
        },
        include: { patientProfile: true }
      });

      // Create a dummy consultation to link to doctor
      await prisma.consultation.create({
        data: {
          patientProfileId: user.patientProfile!.id,
          doctorId: doctor.id,
          status: ConsultationStatus.COMPLETED,
          chiefComplaint: 'Past Consultation',
          startedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          endedAt: new Date(Date.now() - 86400000 * 2 + 1800000),
        }
      });

      // Create an Appointment for Today
      const today = new Date();
      today.setHours(10 + PATIENTS.indexOf(pData), 30, 0, 0); // Staggered appointments

      await prisma.appointment.create({
        data: {
          patientProfileId: user.patientProfile!.id,
          doctorId: doctor.id,
          type: 'CONSULTATION',
          status: PATIENTS.indexOf(pData) === 0 ? 'CHECKED_IN' : 'SCHEDULED',
          urgency: 'ROUTINE',
          scheduledStart: today,
          scheduledEnd: new Date(today.getTime() + 1800000), // 30 mins
          reason: 'General Checkup',
        }
      });

      console.log(`✅ Seeded: ${pData.name} (${pData.email}) with appointment today`);
    } catch (err: any) {
      console.error(`Failed to seed ${pData.name}:`, err.message);
    }
  }

  console.log('\n=======================================');
  console.log('CREDENTIALS FOR ALL 5 PATIENTS:');
  PATIENTS.forEach(p => {
    console.log(`User: ${p.email} | Pass: ${password}`);
  });
  console.log('=======================================');
}

seedPatients().catch(console.error).finally(() => prisma.$disconnect());
