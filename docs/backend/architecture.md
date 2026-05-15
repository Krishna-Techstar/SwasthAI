# SwasthAI Backend Architecture

## Source of Truth

PostgreSQL is the only durable source of truth. React Native, Next.js admin, Socket.io, Redis caches, and FastAPI workers read from or write back to Postgres through the NestJS API. Redis is used only for cache, queues, pub/sub, websocket fanout, and temporary buffers.

## PostgreSQL Relationships

- `users` owns authentication identity and role state for `DOCTOR`, `NURSE`, and `PATIENT`. Admin login is env-backed, with admin sessions recorded in `sessions` and `refresh_tokens`.
- `doctor_profiles`, `nurse_profiles`, and `patient_profiles` are one-to-one role extensions of `users`.
- `approval_queues` links doctor/nurse users to admin review state; `approval_events` and `admin_actions` preserve review history.
- `patient_profiles` is the anchor for medical memory: `allergies`, `chronic_diseases`, `medication_statements`, `vitals`, `symptoms`, `diagnoses`, `consultations`, `prescriptions`, `soap_reports`, `radiology_uploads`, `radiology_reports`, `ai_insights`, and `patient_timeline_events`.
- `consultations` owns live workflow state and links notes, transcripts, body-map points, SOAP reports, prescriptions, vitals, radiology uploads, consents, and AI jobs.
- `radiology_uploads` links source files to AI predictions, heatmaps, contour maps, segmentation masks, SHAP outputs, and radiology reports.
- `file_objects` stores Cloudinary/S3 references, metadata, ownership, and clinical linkage. Binary data stays in Cloudinary/S3.
- `realtime_event_outbox` is the reliable cross-dashboard sync log. Domain services insert outbox rows in the same transaction as clinical writes.

## NestJS Modules

- `AuthModule`: doctor/nurse/patient signup, user login, admin env login, refresh rotation, logout/session invalidation.
- `AdminModule`: approval queue list, approve, reject, audit/admin action recording.
- `PatientsModule`: patient context retrieval, search, cache invalidation, timeline writes.
- `ConsentModule`: AI consent grant/revoke and active-consent enforcement before AI jobs.
- `ConsultationsModule`: consultation lifecycle, notes, transcripts, vitals, body maps, SOAP creation/signing, clinical AI job queueing.
- `RadiologyModule`: radiology uploads, AI predictions, overlay refs, radiology report history.
- `FilesModule`: Cloudinary signatures, S3 presigned URLs, uploaded-file registration.
- `DrugSafetyModule`: medication search, interaction/allergy/contraindication checks from database tables.
- `AppointmentsModule`: schedules, appointments, reminders, FastAPI-backed follow-up suggestions.
- `RealtimeModule`: Socket.io `/sync`, Redis adapter, transactional outbox publisher.
- `AiModule`: FastAPI callback endpoints protected by `x-internal-api-key`.
- `AuditModule`: audit logs, login logs, report change logs, admin action tracking.

## Redis Architecture

- `patient:context:{patientProfileId}`: 60-second patient memory cache; invalidated after any consultation, report, vitals, radiology, appointment, or drug-safety write.
- BullMQ queues: `ai:clinical` and `ai:radiology`; jobs store durable state in `ai_processing_jobs` and Redis carries execution.
- Socket.io Redis adapter: multi-instance websocket room synchronization.
- Pub/sub channel `swasthai:realtime`: realtime event broadcast metadata.
- Future OTP/session caches should use short TTL keys such as `otp:{phone}` and `session:blacklist:{jti}`.

## Realtime Sync Flow

1. Domain service starts a Prisma transaction.
2. It writes the clinical/admin/report data.
3. It invalidates or schedules invalidation of patient context.
4. It inserts a `realtime_event_outbox` row in the same transaction.
5. `RealtimeService` publishes pending outbox rows every five seconds through Socket.io rooms:
   - `patient:{patientProfileId}`
   - `consultation:{consultationId}`
   - `user:{userId}`
   - `role:{role}`
   - `admin:approvals`
6. Clients receive the event and reload from API/Postgres-backed endpoints, not local duplicated state.

## API Route Structure

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/admin/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/otp/send`
- `POST /api/v1/auth/otp/verify`
- `GET /api/v1/users/me`
- `GET /api/v1/users/me/dashboard`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/approvals`
- `PATCH /api/v1/admin/approvals/:id/approve`
- `PATCH /api/v1/admin/approvals/:id/reject`
- `GET /api/v1/admin/reports`
- `GET /api/v1/admin/ai-jobs`
- `GET /api/v1/admin/realtime/health`
- `GET /api/v1/admin/hospitals`
- `GET /api/v1/patients/search`
- `GET /api/v1/patients/:id/context`
- `POST /api/v1/consents`
- `PATCH /api/v1/consents/:id/revoke`
- `POST /api/v1/consultations`
- `GET /api/v1/consultations/:id`
- `POST /api/v1/consultations/:id/notes`
- `POST /api/v1/consultations/:id/transcripts`
- `POST /api/v1/consultations/:id/vitals`
- `POST /api/v1/consultations/:id/body-map`
- `POST /api/v1/consultations/:id/soap-reports/generate-ai`
- `POST /api/v1/consultations/:id/soap-reports`
- `PATCH /api/v1/consultations/soap-reports/:reportId/sign`
- `PATCH /api/v1/consultations/:id/end`
- `POST /api/v1/radiology/uploads`
- `POST /api/v1/radiology/uploads/:id/predictions`
- `POST /api/v1/radiology/uploads/:id/reports`
- `POST /api/v1/files/sign-upload`
- `POST /api/v1/files`
- `GET /api/v1/drug-safety/medications`
- `POST /api/v1/drug-safety/check`
- `POST /api/v1/appointments`
- `POST /api/v1/appointments/ai-suggestions`
- `POST /api/v1/appointments/schedules`
- `GET /api/v1/appointments/providers/:providerId/schedule`
- `GET /api/v1/reports/patients/:patientProfileId`
- `GET /api/v1/reports/soap/:id`
- `GET /api/v1/reports/radiology/:id`
- `POST /api/v1/ai/callbacks/soap-completed`
- `POST /api/v1/ai/callbacks/radiology-completed/:uploadId`

## Security

- JWT access tokens are short lived.
- Refresh tokens are stored hashed, rotated on refresh, and invalidated on logout.
- Admin has no signup. `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in env are manually validated.
- `JwtAuthGuard`, `RolesGuard`, and `ApprovalGuard` protect routes.
- Doctor/nurse access is blocked until admin approval is `APPROVED`.
- FastAPI callbacks require `AI_SERVICE_API_KEY`.
- Audit tables track login attempts, sensitive access, admin actions, and report changes.

## Indexing And Search

Prisma defines relational indexes for patient-history and dashboard reads. `packages/database/prisma/sql/001_postgres_extensions_and_indexes.sql` adds PostgreSQL-specific GIN/trigram/full-text indexes for users, medications, timeline, search documents, and SOAP reports.

## Folder Structure

- `packages/database/prisma/schema.prisma`: full relational schema.
- `packages/database/prisma/sql`: PostgreSQL extension/index scripts.
- `services/api-gateway/src`: production NestJS modular backend.
- `docs/backend/architecture.md`: backend operating model and route map.
