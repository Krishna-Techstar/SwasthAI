import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiJobStatus, Prisma, Role } from '@swasthai/database';
import { Job, Queue, Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { RedisService } from '../redis/redis.service';

type AiJobEventRecord = {
  id: string;
  patientProfileId: string | null;
  consultationId: string | null;
  radiologyUploadId: string | null;
};

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private readonly radiologyQueue: Queue;
  private readonly clinicalQueue: Queue;
  private readonly workers: Worker[] = [];

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly realtime: RealtimeService,
  ) {
    this.radiologyQueue = new Queue('ai_radiology', { connection: this.redis.client });
    this.clinicalQueue = new Queue('ai_clinical', { connection: this.redis.client });
  }

  onModuleInit() {
    this.workers.push(
      new Worker('ai_clinical', (job) => this.processClinicalJob(job), {
        connection: this.redis.client,
        concurrency: Number(this.config.get('AI_CLINICAL_CONCURRENCY') ?? 3),
      }),
      new Worker('ai_radiology', (job) => this.processRadiologyJob(job), {
        connection: this.redis.client,
        concurrency: Number(this.config.get('AI_RADIOLOGY_CONCURRENCY') ?? 2),
      }),
    );
  }

  async enqueueRadiologyPrediction(jobId: string, payload: Record<string, unknown>) {
    return this.radiologyQueue.add(
      'radiology_prediction',
      { jobId, ...payload },
      {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: { age: 86_400 },
        removeOnFail: { age: 604_800 },
      },
    );
  }

  async enqueueSoapGeneration(jobId: string, payload: Record<string, unknown>) {
    return this.clinicalQueue.add(
      'soap_generation',
      { jobId, ...payload },
      {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: { age: 86_400 },
        removeOnFail: { age: 604_800 },
      },
    );
  }

  async onModuleDestroy() {
    await Promise.all([
      ...this.workers.map((worker) => worker.close()),
      this.radiologyQueue.close(),
      this.clinicalQueue.close(),
    ]);
  }

  private async processClinicalJob(job: Job<Record<string, unknown>>) {
    const jobId = String(job.data.jobId);
    const record = await this.markJobRunning(jobId, 'ai.soap.running');
    try {
      await this.submitFastApi({
        baseUrl: this.config.get<string>('FASTAPI_CLINICAL_URL'),
        apiKey: this.config.get<string>('FASTAPI_CLINICAL_API_KEY'),
        bearerToken: this.config.get<string>('FASTAPI_CLINICAL_BEARER_TOKEN'),
        path: this.config.get<string>('FASTAPI_CLINICAL_SOAP_PATH') ?? '/jobs/soap',
        payload: {
          ...job.data,
          callbackUrl: `${this.callbackBaseUrl()}/ai/callbacks/soap-completed`,
        },
      });
    } catch (error) {
      await this.markJobFailed(record.id, error, 'ai.soap.failed');
      throw error;
    }
  }

  private async processRadiologyJob(job: Job<Record<string, unknown>>) {
    const jobId = String(job.data.jobId);
    const uploadId = String(job.data.radiologyUploadId);
    const record = await this.markJobRunning(jobId, 'ai.radiology.running');
    try {
      await this.submitFastApi({
        baseUrl: this.config.get<string>('FASTAPI_RADIOLOGY_URL'),
        apiKey: this.config.get<string>('FASTAPI_RADIOLOGY_API_KEY'),
        bearerToken: this.config.get<string>('FASTAPI_RADIOLOGY_BEARER_TOKEN'),
        path: this.config.get<string>('FASTAPI_RADIOLOGY_PATH') ?? '/jobs/radiology',
        payload: {
          ...job.data,
          callbackUrl: `${this.callbackBaseUrl()}/ai/callbacks/radiology-completed/${uploadId}`,
        },
      });
    } catch (error) {
      await this.markJobFailed(record.id, error, 'ai.radiology.failed');
      throw error;
    }
  }

  private async markJobRunning(jobId: string, eventName: string) {
    const job = await this.prisma.aiProcessingJob.update({
      where: { id: jobId },
      data: {
        status: AiJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    await this.enqueueJobEvent(job, eventName, { jobId: job.id, status: job.status });
    return job;
  }

  private async markJobFailed(jobId: string, error: unknown, eventName: string) {
    const message = error instanceof Error ? error.message : 'AI job failed';
    const job = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.aiProcessingJob.update({
        where: { id: jobId },
        data: {
          status: AiJobStatus.FAILED,
          errorMessage: message,
          completedAt: new Date(),
        },
      });

      await this.realtime.enqueue(tx, this.jobEvent(updated, eventName, {
        jobId: updated.id,
        status: updated.status,
        errorMessage: message,
      }));

      return updated;
    });

    this.logger.error(`AI job ${job.id} failed: ${message}`);
    return job;
  }

  private async enqueueJobEvent(job: AiJobEventRecord, eventName: string, payload: Prisma.InputJsonValue) {
    await this.prisma.$transaction(async (tx) => {
      await this.realtime.enqueue(tx, this.jobEvent(job, eventName, payload));
    });
  }

  private jobEvent(
    job: AiJobEventRecord,
    eventName: string,
    payload: Prisma.InputJsonValue,
  ) {
    return {
      eventName,
      aggregateType: 'ai_processing_job',
      aggregateId: job.id,
      patientProfileId: job.patientProfileId ?? undefined,
      roleScope: [Role.DOCTOR, Role.NURSE, Role.PATIENT, Role.ADMIN],
      roomNames: [
        ...(job.patientProfileId ? [this.realtime.patientRoom(job.patientProfileId)] : []),
        ...(job.consultationId ? [this.realtime.consultationRoom(job.consultationId)] : []),
        this.realtime.roleRoom(Role.ADMIN),
      ],
      payload,
    };
  }

  private async submitFastApi(input: {
    baseUrl?: string;
    apiKey?: string;
    bearerToken?: string;
    path: string;
    payload: Record<string, unknown>;
  }) {
    if (!input.baseUrl) {
      throw new Error('FastAPI model URL is not configured');
    }

    const attempts = Number(this.config.get('AI_SUBMIT_ATTEMPTS') ?? 3);
    const timeoutMs = Number(this.config.get('AI_REQUEST_TIMEOUT_MS') ?? 30_000);
    const url = `${input.baseUrl.replace(/\/$/, '')}${input.path}`;
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(input.apiKey ? { 'x-api-key': input.apiKey } : {}),
            ...(input.bearerToken ? { Authorization: `Bearer ${input.bearerToken}` } : {}),
          },
          body: JSON.stringify(input.payload),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          return response.headers.get('content-type')?.includes('application/json')
            ? response.json()
            : response.text();
        }

        const text = await response.text();
        lastError = new Error(`FastAPI request failed with ${response.status}: ${text}`);
        if (![408, 409, 425, 429, 500, 502, 503, 504].includes(response.status)) {
          throw lastError;
        }
      } catch (error) {
        clearTimeout(timeout);
        lastError = error;
        if (attempt === attempts) {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 750 * 2 ** (attempt - 1)));
    }

    throw lastError;
  }

  private callbackBaseUrl() {
    const explicit = this.config.get<string>('AI_CALLBACK_BASE_URL');
    if (explicit) {
      return explicit.replace(/\/$/, '');
    }

    const port = Number(this.config.get('PORT') ?? 3001);
    const prefix = this.config.get<string>('API_PREFIX') ?? 'api/v1';
    return `http://localhost:${port}/${prefix}`;
  }
}
