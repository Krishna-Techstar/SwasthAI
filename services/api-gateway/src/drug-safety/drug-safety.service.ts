import { Injectable } from '@nestjs/common';
import { PrescriptionStatus, Prisma, Role, Severity } from '@swasthai/database';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsService } from '../patients/patients.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthUser } from '../common/types';
import { CheckDrugSafetyDto } from './dto/check-drug-safety.dto';
import { SearchMedicationsDto } from './dto/search-medications.dto';

@Injectable()
export class DrugSafetyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patients: PatientsService,
    private readonly realtime: RealtimeService,
  ) {}

  async searchMedications(dto: SearchMedicationsDto) {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        generic_name: string | null;
        rx_norm_code: string | null;
        atc_code: string | null;
      }>
    >`
      SELECT id, name, generic_name, rx_norm_code, atc_code
      FROM medications
      WHERE is_active = true
        AND (
          to_tsvector('english', unaccent(coalesce(name, '') || ' ' || coalesce(generic_name, '') || ' ' || coalesce(search_text, '')))
          @@ plainto_tsquery('english', unaccent(${dto.q}))
          OR name ILIKE ${`%${dto.q}%`}
          OR generic_name ILIKE ${`%${dto.q}%`}
        )
      ORDER BY name ASC
      LIMIT ${dto.limit}
      OFFSET ${dto.skip}
    `;

    return { items: rows, page: dto.page, limit: dto.limit };
  }

  async check(dto: CheckDrugSafetyDto, user: AuthUser) {
    await this.patients.assertCanAccessPatient(dto.patientProfileId, user);

    const [patientAllergies, chronicDiseases, medications] = await Promise.all([
      this.prisma.allergy.findMany({
        where: { patientProfileId: dto.patientProfileId, isActive: true },
      }),
      this.prisma.chronicDisease.findMany({ where: { patientProfileId: dto.patientProfileId } }),
      this.resolveMedications(dto.drugs),
    ]);

    const medicationIds = medications.flatMap((item) => (item.medicationId ? [item.medicationId] : []));
    const [interactions, allergyConflicts, contraindications] = await Promise.all([
      medicationIds.length >= 2
        ? this.prisma.drugInteraction.findMany({
            where: {
              isActive: true,
              OR: this.pairs(medicationIds).flatMap(([a, b]) => [
                { medicationAId: a, medicationBId: b },
                { medicationAId: b, medicationBId: a },
              ]),
            },
            include: { medicationA: true, medicationB: true },
          })
        : [],
      medicationIds.length
        && patientAllergies.length
        ? this.prisma.allergyConflict.findMany({
            where: {
              isActive: true,
              medicationId: { in: medicationIds },
              OR: patientAllergies.map((allergy) => ({
                allergen: { contains: allergy.substance, mode: 'insensitive' },
              })),
            },
            include: { medication: true },
          })
        : [],
      medicationIds.length
        && chronicDiseases.length
        ? this.prisma.contraindication.findMany({
            where: {
              isActive: true,
              medicationId: { in: medicationIds },
              OR: chronicDiseases.flatMap((disease) => [
                { diseaseName: { contains: disease.name, mode: 'insensitive' } },
                ...(disease.icdCode ? [{ icdCode: disease.icdCode }] : []),
              ]),
            },
            include: { medication: true },
          })
        : [],
    ]);

    const findings = {
      interactions: interactions.map((item) => ({
        id: item.id,
        type: 'drug_pair',
        severity: item.severity,
        drugA: item.medicationA.name,
        drugB: item.medicationB.name,
        mechanism: item.mechanism,
        clinicalEffect: item.clinicalEffect,
        recommendation: item.recommendation,
        evidenceLevel: item.evidenceLevel,
      })),
      allergyConflicts: allergyConflicts.map((item) => ({
        id: item.id,
        type: 'allergy',
        severity: item.severity,
        drug: item.medication.name,
        allergen: item.allergen,
        crossSensitivityGroup: item.crossSensitivityGroup,
        reactionRisk: item.reactionRisk,
        recommendation: item.recommendation,
      })),
      contraindications: contraindications.map((item) => ({
        id: item.id,
        type: 'contraindication',
        severity: item.severity,
        drug: item.medication.name,
        diseaseName: item.diseaseName,
        icdCode: item.icdCode,
        rationale: item.rationale,
        recommendation: item.recommendation,
      })),
      checkedDrugCount: dto.drugs.length,
    };
    const score = this.score(findings);
    const status = score < 40 ? 'BLOCKED' : score < 75 ? 'REVIEW_REQUIRED' : 'CLEAR';

    const check = await this.prisma.$transaction(async (tx) => {
      const created = await tx.drugSafetyCheck.create({
        data: {
          prescriptionId: dto.prescriptionId,
          consultationId: dto.consultationId,
          patientProfileId: dto.patientProfileId,
          checkedById: user.userId,
          status,
          score,
          findings: findings as Prisma.InputJsonValue,
        },
      });

      if (dto.prescriptionId) {
        await tx.prescription.update({
          where: { id: dto.prescriptionId },
          data: {
            safetyStatus: status,
            status: status === 'BLOCKED' ? PrescriptionStatus.SAFETY_BLOCKED : PrescriptionStatus.READY,
          },
        });
      }

      await this.realtime.enqueue(tx, {
        eventName: 'drug_safety.checked',
        aggregateType: 'drug_safety_check',
        aggregateId: created.id,
        patientProfileId: dto.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          this.realtime.patientRoom(dto.patientProfileId),
          ...(dto.consultationId ? [this.realtime.consultationRoom(dto.consultationId)] : []),
        ],
        payload: { checkId: created.id, status, score, findings },
      });

      return created;
    });

    await this.patients.invalidateContext(dto.patientProfileId);
    return { ...check, findings };
  }

  private async resolveMedications(drugs: CheckDrugSafetyDto['drugs']) {
    return Promise.all(
      drugs.map(async (drug) => {
        if (drug.medicationId) {
          const medication = await this.prisma.medication.findUnique({ where: { id: drug.medicationId } });
          return { medicationId: drug.medicationId, drugName: medication?.name ?? drug.drugName };
        }

        const medication = drug.drugName
          ? await this.prisma.medication.findFirst({
              where: {
                isActive: true,
                OR: [
                  { name: { equals: drug.drugName, mode: 'insensitive' } },
                  { genericName: { equals: drug.drugName, mode: 'insensitive' } },
                ],
              },
            })
          : null;

        return { medicationId: medication?.id, drugName: drug.drugName ?? medication?.name };
      }),
    );
  }

  private pairs(ids: string[]) {
    const output: Array<[string, string]> = [];
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        output.push([ids[i], ids[j]]);
      }
    }
    return output;
  }

  private score(findings: {
    interactions: Array<{ severity: Severity }>;
    allergyConflicts: Array<{ severity: Severity }>;
    contraindications: Array<{ severity: Severity }>;
  }) {
    const severities = [
      ...findings.interactions.map((item) => item.severity),
      ...findings.allergyConflicts.map((item) => item.severity),
      ...findings.contraindications.map((item) => item.severity),
    ];
    if (severities.includes(Severity.CRITICAL)) return 10;
    if (severities.includes(Severity.HIGH)) return 45;
    if (severities.includes(Severity.MODERATE)) return 70;
    if (severities.includes(Severity.LOW)) return 85;
    return 100;
  }
}
