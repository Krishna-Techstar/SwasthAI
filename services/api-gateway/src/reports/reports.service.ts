import { Injectable } from '@nestjs/common';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patients: PatientsService,
  ) {}

  async patientReports(patientProfileId: string, user: AuthUser) {
    await this.patients.assertCanAccessPatient(patientProfileId, user);

    const [soapReports, radiologyReports] = await this.prisma.$transaction([
      this.prisma.soapReport.findMany({
        where: { patientProfileId },
        orderBy: { createdAt: 'desc' },
        include: { file: true, consultation: true },
      }),
      this.prisma.radiologyReport.findMany({
        where: { patientProfileId },
        orderBy: { createdAt: 'desc' },
        include: { file: true, radiologyUpload: { include: { file: true } } },
      }),
    ]);

    return { soapReports, radiologyReports };
  }

  async soapReport(id: string, user: AuthUser) {
    const report = await this.prisma.soapReport.findUnique({
      where: { id },
      include: { file: true, changes: true, consultation: true },
    });
    if (report) {
      await this.patients.assertCanAccessPatient(report.patientProfileId, user);
    }
    return report;
  }

  async radiologyReport(id: string, user: AuthUser) {
    const report = await this.prisma.radiologyReport.findUnique({
      where: { id },
      include: {
        file: true,
        changes: true,
        radiologyUpload: { include: { file: true, aiPredictions: true } },
      },
    });
    if (report) {
      await this.patients.assertCanAccessPatient(report.patientProfileId, user);
    }
    return report;
  }
}
