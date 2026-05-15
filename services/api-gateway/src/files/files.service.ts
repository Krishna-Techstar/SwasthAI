import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileCategory, Prisma, Role, StorageProvider } from '@swasthai/database';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PatientsService } from '../patients/patients.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuthUser } from '../common/types';
import { CreateUploadSignatureDto } from './dto/create-upload-signature.dto';
import { RegisterFileDto } from './dto/register-file.dto';

@Injectable()
export class FilesService {
  private readonly s3: S3Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly patients: PatientsService,
    private readonly realtime: RealtimeService,
  ) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION') ?? 'ap-south-1',
    });
  }

  async createUploadSignature(dto: CreateUploadSignatureDto, user: AuthUser) {
    if (dto.patientProfileId) {
      await this.patients.assertCanAccessPatient(dto.patientProfileId, user);
    }

    if (dto.provider === StorageProvider.CLOUDINARY) {
      return this.createCloudinarySignature(dto, user);
    }

    return this.createS3SignedUrl(dto, user);
  }

  async registerUploadedFile(dto: RegisterFileDto, user: AuthUser) {
    if (dto.patientProfileId) {
      await this.patients.assertCanAccessPatient(dto.patientProfileId, user);
    }

    const file = await this.prisma.$transaction(async (tx) => {
      const created = await tx.fileObject.create({
        data: {
          provider: dto.provider,
          bucket: dto.bucket,
          storageKey: dto.storageKey,
          url: dto.url,
          secureUrl: dto.secureUrl,
          publicId: dto.publicId,
          etag: dto.etag,
          checksum: dto.checksum,
          mimeType: dto.mimeType,
          sizeBytes: BigInt(dto.sizeBytes),
          category: dto.category,
          ownerUserId: user.userId,
          patientProfileId: dto.patientProfileId,
          consultationId: dto.consultationId,
          metadata: dto.metadata as Prisma.InputJsonValue,
        },
      });

      await this.realtime.enqueue(tx, {
        eventName: 'file.registered',
        aggregateType: 'file_object',
        aggregateId: created.id,
        patientProfileId: dto.patientProfileId,
        actorUserId: user.userId,
        roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
        roomNames: [
          ...(dto.patientProfileId ? [this.realtime.patientRoom(dto.patientProfileId)] : []),
          ...(dto.consultationId ? [this.realtime.consultationRoom(dto.consultationId)] : []),
          ...(user.userId ? [this.realtime.userRoom(user.userId)] : []),
        ],
        payload: {
          fileId: created.id,
          category: created.category,
          patientProfileId: created.patientProfileId,
          consultationId: created.consultationId,
        },
      });

      return created;
    });

    if (dto.patientProfileId) {
      await this.patients.invalidateContext(dto.patientProfileId);
    }

    return file;
  }

  private createCloudinarySignature(dto: CreateUploadSignatureDto, user: AuthUser) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary credentials are not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = this.storageFolder(dto.category, dto.patientProfileId);
    const publicId = `${folder}/${randomUUID()}-${dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const params = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const payload = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const signature = createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');

    return {
      provider: StorageProvider.CLOUDINARY,
      cloudName,
      apiKey,
      timestamp,
      folder,
      publicId,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      metadata: {
        requestedBy: user.userId ?? user.adminEmail,
        category: dto.category,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
      },
    };
  }

  private async createS3SignedUrl(dto: CreateUploadSignatureDto, user: AuthUser) {
    const bucket = this.config.get<string>('AWS_S3_BUCKET');
    if (!bucket) {
      throw new BadRequestException('AWS_S3_BUCKET is not configured');
    }

    const key = `${this.storageFolder(dto.category, dto.patientProfileId)}/${randomUUID()}-${dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.mimeType,
      Metadata: {
        category: dto.category,
        requestedBy: user.userId ?? user.adminEmail ?? 'system',
      },
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });

    return {
      provider: StorageProvider.S3,
      bucket,
      key,
      uploadUrl,
      headers: { 'content-type': dto.mimeType },
      expiresIn: 900,
    };
  }

  private storageFolder(category: FileCategory, patientProfileId?: string) {
    const root = patientProfileId ? `patients/${patientProfileId}` : 'system';
    return `${root}/${category.toLowerCase()}`;
  }
}
