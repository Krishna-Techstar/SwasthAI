-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'LOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'PROFILE_INCOMPLETE', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'COMPLETE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('GRANTED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'AI_GENERATED', 'UNDER_REVIEW', 'SIGNED', 'AMENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ClinicalSource" AS ENUM ('HUMAN', 'AI', 'DEVICE', 'IMPORT');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('CLOUDINARY', 'S3');

-- CreateEnum
CREATE TYPE "FileCategory" AS ENUM ('PROFILE_IMAGE', 'VERIFICATION_DOCUMENT', 'XRAY', 'CT_SCAN', 'MRI_SCAN', 'ULTRASOUND', 'RADIOLOGY_OVERLAY', 'AUDIO_RECORDING', 'GENERATED_REPORT', 'CLINICAL_ATTACHMENT');

-- CreateEnum
CREATE TYPE "RadiologyScanType" AS ENUM ('XRAY', 'CT', 'MRI', 'ULTRASOUND', 'PET', 'OTHER');

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'SAFETY_CHECK_PENDING', 'SAFETY_BLOCKED', 'READY', 'SIGNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CONSULTATION', 'FOLLOW_UP', 'RADIOLOGY', 'LAB_REVIEW', 'TELEHEALTH');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('ROUTINE', 'MODERATE', 'HIGH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('PUSH', 'SMS', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RealtimeDeliveryStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "hospitals" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(32),
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "abha_id" VARCHAR(64),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "full_name" TEXT NOT NULL,
    "profile_image_file_id" UUID,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hospital_id" UUID,
    "registration_number" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "department" TEXT,
    "experience_years" INTEGER,
    "consultation_fee" DECIMAL(10,2),
    "bio" TEXT,
    "license_document_file_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hospital_id" UUID,
    "license_number" TEXT NOT NULL,
    "department" TEXT,
    "experience_years" INTEGER,
    "license_document_file_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "nurse_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE,
    "gender" TEXT,
    "blood_group" VARCHAR(8),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(5,2),
    "insurance_info" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT,
    "phone" VARCHAR(32) NOT NULL,
    "email" VARCHAR(320),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_queues" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "hospital_id" UUID,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by_email" VARCHAR(320),
    "rejection_reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "approval_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_events" (
    "id" UUID NOT NULL,
    "approval_queue_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_email" VARCHAR(320),
    "from_status" "ApprovalStatus",
    "to_status" "ApprovalStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "admin_email" VARCHAR(320),
    "role" "Role" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "access_jti" TEXT NOT NULL,
    "refresh_token_id" UUID,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_id" TEXT,
    "revoked_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "admin_email" VARCHAR(320),
    "session_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "rotated_from_token_id" UUID,
    "revoked_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "substance" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" "Severity",
    "source" "ClinicalSource" NOT NULL DEFAULT 'HUMAN',
    "recorded_by_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronic_diseases" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icd_code" VARCHAR(32),
    "status" TEXT,
    "onset_date" DATE,
    "notes" TEXT,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronic_diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "rx_norm_code" TEXT,
    "atc_code" TEXT,
    "form" TEXT,
    "strength" TEXT,
    "route" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "search_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_statements" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "medication_id" UUID,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "prescribed_by_id" UUID,
    "source" "ClinicalSource" NOT NULL DEFAULT 'HUMAN',
    "started_at" DATE,
    "ended_at" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medication_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "consultation_id" UUID,
    "recorded_by_id" UUID,
    "type" TEXT NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "measured_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "nurse_id" UUID,
    "hospital_id" UUID,
    "appointment_id" UUID,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'ACTIVE',
    "chief_complaint" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_notes" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "note_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previous_version_id" UUID,
    "autosaved_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_at" TIMESTAMPTZ(6),

    CONSTRAINT "consultation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_transcripts" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "speaker_role" "Role",
    "speaker_user_id" UUID,
    "sequence" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DECIMAL(5,4),
    "ai_provider" TEXT,
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" UUID NOT NULL,
    "consultation_id" UUID,
    "patient_profile_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "onset" TEXT,
    "severity" "Severity",
    "body_region" TEXT,
    "notes" TEXT,
    "source" "ClinicalSource" NOT NULL DEFAULT 'HUMAN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" UUID NOT NULL,
    "consultation_id" UUID,
    "patient_profile_id" UUID NOT NULL,
    "created_by_id" UUID,
    "code" VARCHAR(32),
    "system" TEXT DEFAULT 'ICD-10',
    "description" TEXT NOT NULL,
    "confidence" DECIMAL(5,4),
    "rank" INTEGER,
    "status" TEXT,
    "source" "ClinicalSource" NOT NULL DEFAULT 'HUMAN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "consultation_id" UUID,
    "patient_profile_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "safety_status" TEXT,
    "notes" TEXT,
    "signed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_medications" (
    "id" UUID NOT NULL,
    "prescription_id" UUID NOT NULL,
    "medication_id" UUID,
    "drug_name" TEXT NOT NULL,
    "dose" TEXT,
    "route" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "instructions" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_map_points" (
    "id" UUID NOT NULL,
    "consultation_id" UUID,
    "patient_profile_id" UUID NOT NULL,
    "region" TEXT NOT NULL,
    "side" TEXT,
    "x" DECIMAL(8,5),
    "y" DECIMAL(8,5),
    "pain_score" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "body_map_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soap_reports" (
    "id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_model" TEXT,
    "confidence" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "file_id" UUID,
    "search_text" TEXT,
    "signed_by_id" UUID,
    "signed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "soap_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_uploads" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "consultation_id" UUID,
    "ordered_by_doctor_id" UUID,
    "uploaded_by_id" UUID,
    "file_id" UUID NOT NULL,
    "scan_type" "RadiologyScanType" NOT NULL,
    "body_region" TEXT,
    "metadata" JSONB,
    "ai_status" "AiJobStatus" NOT NULL DEFAULT 'QUEUED',
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "radiology_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_predictions" (
    "id" UUID NOT NULL,
    "radiology_upload_id" UUID NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_version" TEXT,
    "status" "AiJobStatus" NOT NULL DEFAULT 'RUNNING',
    "classification" TEXT,
    "confidence" DECIMAL(5,4),
    "severity" "Severity",
    "prediction" JSONB,
    "error_message" TEXT,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contour_maps" (
    "id" UUID NOT NULL,
    "ai_prediction_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contour_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heatmaps" (
    "id" UUID NOT NULL,
    "ai_prediction_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "intensity_stats" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heatmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segmentation_masks" (
    "id" UUID NOT NULL,
    "ai_prediction_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "segmentation_masks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shap_outputs" (
    "id" UUID NOT NULL,
    "ai_prediction_id" UUID NOT NULL,
    "file_id" UUID,
    "explanation" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shap_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_reports" (
    "id" UUID NOT NULL,
    "radiology_upload_id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "consultation_id" UUID,
    "doctor_id" UUID,
    "ai_prediction_id" UUID,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "findings" TEXT,
    "impression" TEXT,
    "recommendation" TEXT,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "file_id" UUID,
    "signed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "radiology_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_objects" (
    "id" UUID NOT NULL,
    "provider" "StorageProvider" NOT NULL,
    "bucket" TEXT,
    "storage_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secure_url" TEXT,
    "public_id" TEXT,
    "etag" TEXT,
    "checksum" TEXT,
    "mime_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "category" "FileCategory" NOT NULL,
    "owner_user_id" UUID,
    "patient_profile_id" UUID,
    "consultation_id" UUID,
    "metadata" JSONB,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "file_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" UUID NOT NULL,
    "medication_a_id" UUID NOT NULL,
    "medication_b_id" UUID NOT NULL,
    "severity" "Severity" NOT NULL,
    "mechanism" TEXT,
    "clinical_effect" TEXT,
    "recommendation" TEXT NOT NULL,
    "evidence_level" TEXT,
    "source" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergy_conflicts" (
    "id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "allergen" TEXT NOT NULL,
    "cross_sensitivity_group" TEXT,
    "severity" "Severity" NOT NULL,
    "reaction_risk" TEXT,
    "recommendation" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allergy_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contraindications" (
    "id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "disease_name" TEXT NOT NULL,
    "icd_code" VARCHAR(32),
    "severity" "Severity" NOT NULL,
    "rationale" TEXT,
    "recommendation" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contraindications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_safety_checks" (
    "id" UUID NOT NULL,
    "prescription_id" UUID,
    "consultation_id" UUID,
    "patient_profile_id" UUID NOT NULL,
    "checked_by_id" UUID,
    "status" TEXT NOT NULL,
    "score" INTEGER,
    "findings" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_safety_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "nurse_id" UUID,
    "hospital_id" UUID,
    "created_by_id" UUID,
    "type" "AppointmentType" NOT NULL DEFAULT 'CONSULTATION',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'ROUTINE',
    "scheduled_start" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_end" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_for" TIMESTAMPTZ(6) NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "hospital_id" UUID,
    "weekday" INTEGER NOT NULL,
    "start_time" VARCHAR(8) NOT NULL,
    "end_time" VARCHAR(8) NOT NULL,
    "slot_minutes" INTEGER NOT NULL DEFAULT 15,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "valid_from" DATE,
    "valid_until" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_consents" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "consultation_id" UUID,
    "status" "ConsentStatus" NOT NULL DEFAULT 'GRANTED',
    "consent_version" TEXT NOT NULL,
    "scope" JSONB NOT NULL,
    "session_info" JSONB,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" UUID NOT NULL,
    "ai_consent_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actorRole" "Role",
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "consultation_id" UUID,
    "radiology_report_id" UUID,
    "type" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "confidence" DECIMAL(5,4),
    "created_by_service" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processing_jobs" (
    "id" UUID NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" "AiJobStatus" NOT NULL DEFAULT 'QUEUED',
    "patient_profile_id" UUID,
    "consultation_id" UUID,
    "radiology_upload_id" UUID,
    "ai_consent_id" UUID,
    "redis_job_id" TEXT,
    "request_payload" JSONB NOT NULL,
    "result_payload" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_timeline_events" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "source_table" TEXT NOT NULL,
    "source_id" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "search_text" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_documents" (
    "id" UUID NOT NULL,
    "patient_profile_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "search_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realtime_event_outbox" (
    "id" UUID NOT NULL,
    "event_name" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "patient_profile_id" UUID,
    "actor_user_id" UUID,
    "role_scope" "Role"[],
    "room_names" TEXT[],
    "payload" JSONB NOT NULL,
    "delivery_status" "RealtimeDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "realtime_event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "patient_profile_id" UUID,
    "type" TEXT NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "delivered_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_email" VARCHAR(320),
    "actor_role" "Role",
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "patient_profile_id" UUID,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_logs" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "user_id" UUID,
    "role" "Role",
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_change_logs" (
    "id" UUID NOT NULL,
    "soap_report_id" UUID,
    "radiology_report_id" UUID,
    "edited_by_id" UUID,
    "change_type" TEXT NOT NULL,
    "version_from" INTEGER,
    "version_to" INTEGER,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" UUID NOT NULL,
    "admin_email" VARCHAR(320) NOT NULL,
    "action" TEXT NOT NULL,
    "target_user_id" UUID,
    "approval_queue_id" UUID,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_code_key" ON "hospitals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_abha_id_key" ON "users"("abha_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_image_file_id_key" ON "users"("profile_image_file_id");

-- CreateIndex
CREATE INDEX "users_role_approval_status_idx" ON "users"("role", "approval_status");

-- CreateIndex
CREATE INDEX "users_full_name_idx" ON "users"("full_name");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_user_id_key" ON "doctor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_registration_number_key" ON "doctor_profiles"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_license_document_file_id_key" ON "doctor_profiles"("license_document_file_id");

-- CreateIndex
CREATE INDEX "doctor_profiles_hospital_id_specialization_idx" ON "doctor_profiles"("hospital_id", "specialization");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_profiles_user_id_key" ON "nurse_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_profiles_license_number_key" ON "nurse_profiles"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_profiles_license_document_file_id_key" ON "nurse_profiles"("license_document_file_id");

-- CreateIndex
CREATE INDEX "nurse_profiles_hospital_id_department_idx" ON "nurse_profiles"("hospital_id", "department");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_user_id_key" ON "patient_profiles"("user_id");

-- CreateIndex
CREATE INDEX "patient_profiles_date_of_birth_idx" ON "patient_profiles"("date_of_birth");

-- CreateIndex
CREATE INDEX "emergency_contacts_patient_profile_id_is_primary_idx" ON "emergency_contacts"("patient_profile_id", "is_primary");

-- CreateIndex
CREATE INDEX "approval_queues_status_submitted_at_idx" ON "approval_queues"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "approval_queues_role_status_idx" ON "approval_queues"("role", "status");

-- CreateIndex
CREATE INDEX "approval_events_approval_queue_id_created_at_idx" ON "approval_events"("approval_queue_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_access_jti_key" ON "sessions"("access_jti");

-- CreateIndex
CREATE INDEX "sessions_user_id_status_idx" ON "sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "sessions_admin_email_status_idx" ON "sessions"("admin_email", "status");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_expires_at_idx" ON "refresh_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_admin_email_expires_at_idx" ON "refresh_tokens"("admin_email", "expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_session_id_idx" ON "refresh_tokens"("session_id");

-- CreateIndex
CREATE INDEX "allergies_patient_profile_id_is_active_idx" ON "allergies"("patient_profile_id", "is_active");

-- CreateIndex
CREATE INDEX "allergies_substance_idx" ON "allergies"("substance");

-- CreateIndex
CREATE INDEX "chronic_diseases_patient_profile_id_name_idx" ON "chronic_diseases"("patient_profile_id", "name");

-- CreateIndex
CREATE INDEX "chronic_diseases_icd_code_idx" ON "chronic_diseases"("icd_code");

-- CreateIndex
CREATE INDEX "medications_name_idx" ON "medications"("name");

-- CreateIndex
CREATE INDEX "medications_generic_name_idx" ON "medications"("generic_name");

-- CreateIndex
CREATE INDEX "medications_rx_norm_code_idx" ON "medications"("rx_norm_code");

-- CreateIndex
CREATE INDEX "medication_statements_patient_profile_id_is_active_idx" ON "medication_statements"("patient_profile_id", "is_active");

-- CreateIndex
CREATE INDEX "medication_statements_medication_id_idx" ON "medication_statements"("medication_id");

-- CreateIndex
CREATE INDEX "vitals_patient_profile_id_measured_at_idx" ON "vitals"("patient_profile_id", "measured_at");

-- CreateIndex
CREATE INDEX "vitals_consultation_id_idx" ON "vitals"("consultation_id");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_appointment_id_key" ON "consultations"("appointment_id");

-- CreateIndex
CREATE INDEX "consultations_patient_profile_id_started_at_idx" ON "consultations"("patient_profile_id", "started_at");

-- CreateIndex
CREATE INDEX "consultations_doctor_id_status_started_at_idx" ON "consultations"("doctor_id", "status", "started_at");

-- CreateIndex
CREATE INDEX "consultations_status_updated_at_idx" ON "consultations"("status", "updated_at");

-- CreateIndex
CREATE INDEX "consultation_notes_consultation_id_autosaved_at_idx" ON "consultation_notes"("consultation_id", "autosaved_at");

-- CreateIndex
CREATE UNIQUE INDEX "consultation_notes_consultation_id_note_type_version_key" ON "consultation_notes"("consultation_id", "note_type", "version");

-- CreateIndex
CREATE INDEX "live_transcripts_consultation_id_created_at_idx" ON "live_transcripts"("consultation_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "live_transcripts_consultation_id_sequence_key" ON "live_transcripts"("consultation_id", "sequence");

-- CreateIndex
CREATE INDEX "symptoms_patient_profile_id_created_at_idx" ON "symptoms"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "symptoms_consultation_id_idx" ON "symptoms"("consultation_id");

-- CreateIndex
CREATE INDEX "diagnoses_patient_profile_id_created_at_idx" ON "diagnoses"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_code_idx" ON "diagnoses"("code");

-- CreateIndex
CREATE INDEX "prescriptions_patient_profile_id_created_at_idx" ON "prescriptions"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "prescriptions_doctor_id_status_idx" ON "prescriptions"("doctor_id", "status");

-- CreateIndex
CREATE INDEX "prescription_medications_prescription_id_idx" ON "prescription_medications"("prescription_id");

-- CreateIndex
CREATE INDEX "prescription_medications_medication_id_idx" ON "prescription_medications"("medication_id");

-- CreateIndex
CREATE INDEX "body_map_points_patient_profile_id_created_at_idx" ON "body_map_points"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "body_map_points_consultation_id_idx" ON "body_map_points"("consultation_id");

-- CreateIndex
CREATE UNIQUE INDEX "soap_reports_file_id_key" ON "soap_reports"("file_id");

-- CreateIndex
CREATE INDEX "soap_reports_patient_profile_id_created_at_idx" ON "soap_reports"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "soap_reports_doctor_id_status_idx" ON "soap_reports"("doctor_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "soap_reports_consultation_id_version_key" ON "soap_reports"("consultation_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_uploads_file_id_key" ON "radiology_uploads"("file_id");

-- CreateIndex
CREATE INDEX "radiology_uploads_patient_profile_id_uploaded_at_idx" ON "radiology_uploads"("patient_profile_id", "uploaded_at");

-- CreateIndex
CREATE INDEX "radiology_uploads_consultation_id_idx" ON "radiology_uploads"("consultation_id");

-- CreateIndex
CREATE INDEX "radiology_uploads_ai_status_uploaded_at_idx" ON "radiology_uploads"("ai_status", "uploaded_at");

-- CreateIndex
CREATE INDEX "ai_predictions_radiology_upload_id_requested_at_idx" ON "ai_predictions"("radiology_upload_id", "requested_at");

-- CreateIndex
CREATE INDEX "ai_predictions_status_requested_at_idx" ON "ai_predictions"("status", "requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "contour_maps_file_id_key" ON "contour_maps"("file_id");

-- CreateIndex
CREATE INDEX "contour_maps_ai_prediction_id_idx" ON "contour_maps"("ai_prediction_id");

-- CreateIndex
CREATE UNIQUE INDEX "heatmaps_file_id_key" ON "heatmaps"("file_id");

-- CreateIndex
CREATE INDEX "heatmaps_ai_prediction_id_idx" ON "heatmaps"("ai_prediction_id");

-- CreateIndex
CREATE UNIQUE INDEX "segmentation_masks_file_id_key" ON "segmentation_masks"("file_id");

-- CreateIndex
CREATE INDEX "segmentation_masks_ai_prediction_id_idx" ON "segmentation_masks"("ai_prediction_id");

-- CreateIndex
CREATE UNIQUE INDEX "shap_outputs_file_id_key" ON "shap_outputs"("file_id");

-- CreateIndex
CREATE INDEX "shap_outputs_ai_prediction_id_idx" ON "shap_outputs"("ai_prediction_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_reports_file_id_key" ON "radiology_reports"("file_id");

-- CreateIndex
CREATE INDEX "radiology_reports_patient_profile_id_created_at_idx" ON "radiology_reports"("patient_profile_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_reports_radiology_upload_id_version_key" ON "radiology_reports"("radiology_upload_id", "version");

-- CreateIndex
CREATE INDEX "file_objects_patient_profile_id_uploaded_at_idx" ON "file_objects"("patient_profile_id", "uploaded_at");

-- CreateIndex
CREATE INDEX "file_objects_owner_user_id_uploaded_at_idx" ON "file_objects"("owner_user_id", "uploaded_at");

-- CreateIndex
CREATE INDEX "file_objects_category_uploaded_at_idx" ON "file_objects"("category", "uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "file_objects_provider_storage_key_key" ON "file_objects"("provider", "storage_key");

-- CreateIndex
CREATE INDEX "drug_interactions_severity_is_active_idx" ON "drug_interactions"("severity", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "drug_interactions_medication_a_id_medication_b_id_key" ON "drug_interactions"("medication_a_id", "medication_b_id");

-- CreateIndex
CREATE INDEX "allergy_conflicts_allergen_is_active_idx" ON "allergy_conflicts"("allergen", "is_active");

-- CreateIndex
CREATE INDEX "allergy_conflicts_medication_id_idx" ON "allergy_conflicts"("medication_id");

-- CreateIndex
CREATE INDEX "contraindications_disease_name_is_active_idx" ON "contraindications"("disease_name", "is_active");

-- CreateIndex
CREATE INDEX "contraindications_icd_code_idx" ON "contraindications"("icd_code");

-- CreateIndex
CREATE INDEX "drug_safety_checks_patient_profile_id_created_at_idx" ON "drug_safety_checks"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "drug_safety_checks_prescription_id_idx" ON "drug_safety_checks"("prescription_id");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_scheduled_start_idx" ON "appointments"("doctor_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "appointments_patient_profile_id_scheduled_start_idx" ON "appointments"("patient_profile_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "appointments_status_scheduled_start_idx" ON "appointments"("status", "scheduled_start");

-- CreateIndex
CREATE INDEX "reminders_status_scheduled_for_idx" ON "reminders"("status", "scheduled_for");

-- CreateIndex
CREATE INDEX "schedules_provider_id_weekday_is_active_idx" ON "schedules"("provider_id", "weekday", "is_active");

-- CreateIndex
CREATE INDEX "ai_consents_patient_profile_id_status_granted_at_idx" ON "ai_consents"("patient_profile_id", "status", "granted_at");

-- CreateIndex
CREATE INDEX "ai_consents_doctor_id_granted_at_idx" ON "ai_consents"("doctor_id", "granted_at");

-- CreateIndex
CREATE INDEX "consent_logs_ai_consent_id_created_at_idx" ON "consent_logs"("ai_consent_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_insights_patient_profile_id_created_at_idx" ON "ai_insights"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_insights_type_created_at_idx" ON "ai_insights"("type", "created_at");

-- CreateIndex
CREATE INDEX "ai_processing_jobs_status_created_at_idx" ON "ai_processing_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "ai_processing_jobs_patient_profile_id_created_at_idx" ON "ai_processing_jobs"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "patient_timeline_events_patient_profile_id_occurred_at_idx" ON "patient_timeline_events"("patient_profile_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "patient_timeline_events_source_table_source_id_event_type_key" ON "patient_timeline_events"("source_table", "source_id", "event_type");

-- CreateIndex
CREATE INDEX "search_documents_patient_profile_id_updated_at_idx" ON "search_documents"("patient_profile_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "search_documents_entity_type_entity_id_key" ON "search_documents"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "realtime_event_outbox_delivery_status_created_at_idx" ON "realtime_event_outbox"("delivery_status", "created_at");

-- CreateIndex
CREATE INDEX "realtime_event_outbox_patient_profile_id_created_at_idx" ON "realtime_event_outbox"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "notifications_patient_profile_id_created_at_idx" ON "notifications"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_patient_profile_id_created_at_idx" ON "audit_logs"("patient_profile_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "login_logs_email_created_at_idx" ON "login_logs"("email", "created_at");

-- CreateIndex
CREATE INDEX "login_logs_success_created_at_idx" ON "login_logs"("success", "created_at");

-- CreateIndex
CREATE INDEX "report_change_logs_soap_report_id_created_at_idx" ON "report_change_logs"("soap_report_id", "created_at");

-- CreateIndex
CREATE INDEX "report_change_logs_radiology_report_id_created_at_idx" ON "report_change_logs"("radiology_report_id", "created_at");

-- CreateIndex
CREATE INDEX "admin_actions_admin_email_created_at_idx" ON "admin_actions"("admin_email", "created_at");

-- CreateIndex
CREATE INDEX "admin_actions_target_user_id_created_at_idx" ON "admin_actions"("target_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profile_image_file_id_fkey" FOREIGN KEY ("profile_image_file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_license_document_file_id_fkey" FOREIGN KEY ("license_document_file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_license_document_file_id_fkey" FOREIGN KEY ("license_document_file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_queues" ADD CONSTRAINT "approval_queues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_queues" ADD CONSTRAINT "approval_queues_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_events" ADD CONSTRAINT "approval_events_approval_queue_id_fkey" FOREIGN KEY ("approval_queue_id") REFERENCES "approval_queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_events" ADD CONSTRAINT "approval_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_rotated_from_token_id_fkey" FOREIGN KEY ("rotated_from_token_id") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronic_diseases" ADD CONSTRAINT "chronic_diseases_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_statements" ADD CONSTRAINT "medication_statements_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_statements" ADD CONSTRAINT "medication_statements_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_statements" ADD CONSTRAINT "medication_statements_prescribed_by_id_fkey" FOREIGN KEY ("prescribed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_notes" ADD CONSTRAINT "consultation_notes_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_notes" ADD CONSTRAINT "consultation_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_notes" ADD CONSTRAINT "consultation_notes_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "consultation_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_transcripts" ADD CONSTRAINT "live_transcripts_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_transcripts" ADD CONSTRAINT "live_transcripts_speaker_user_id_fkey" FOREIGN KEY ("speaker_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medications" ADD CONSTRAINT "prescription_medications_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medications" ADD CONSTRAINT "prescription_medications_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_map_points" ADD CONSTRAINT "body_map_points_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_map_points" ADD CONSTRAINT "body_map_points_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_reports" ADD CONSTRAINT "soap_reports_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_reports" ADD CONSTRAINT "soap_reports_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_reports" ADD CONSTRAINT "soap_reports_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_reports" ADD CONSTRAINT "soap_reports_signed_by_id_fkey" FOREIGN KEY ("signed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_reports" ADD CONSTRAINT "soap_reports_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_uploads" ADD CONSTRAINT "radiology_uploads_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_uploads" ADD CONSTRAINT "radiology_uploads_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_uploads" ADD CONSTRAINT "radiology_uploads_ordered_by_doctor_id_fkey" FOREIGN KEY ("ordered_by_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_uploads" ADD CONSTRAINT "radiology_uploads_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_uploads" ADD CONSTRAINT "radiology_uploads_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_predictions" ADD CONSTRAINT "ai_predictions_radiology_upload_id_fkey" FOREIGN KEY ("radiology_upload_id") REFERENCES "radiology_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contour_maps" ADD CONSTRAINT "contour_maps_ai_prediction_id_fkey" FOREIGN KEY ("ai_prediction_id") REFERENCES "ai_predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contour_maps" ADD CONSTRAINT "contour_maps_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heatmaps" ADD CONSTRAINT "heatmaps_ai_prediction_id_fkey" FOREIGN KEY ("ai_prediction_id") REFERENCES "ai_predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heatmaps" ADD CONSTRAINT "heatmaps_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentation_masks" ADD CONSTRAINT "segmentation_masks_ai_prediction_id_fkey" FOREIGN KEY ("ai_prediction_id") REFERENCES "ai_predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentation_masks" ADD CONSTRAINT "segmentation_masks_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shap_outputs" ADD CONSTRAINT "shap_outputs_ai_prediction_id_fkey" FOREIGN KEY ("ai_prediction_id") REFERENCES "ai_predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shap_outputs" ADD CONSTRAINT "shap_outputs_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_radiology_upload_id_fkey" FOREIGN KEY ("radiology_upload_id") REFERENCES "radiology_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_ai_prediction_id_fkey" FOREIGN KEY ("ai_prediction_id") REFERENCES "ai_predictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_objects" ADD CONSTRAINT "file_objects_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_objects" ADD CONSTRAINT "file_objects_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_objects" ADD CONSTRAINT "file_objects_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_medication_a_id_fkey" FOREIGN KEY ("medication_a_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_medication_b_id_fkey" FOREIGN KEY ("medication_b_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergy_conflicts" ADD CONSTRAINT "allergy_conflicts_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contraindications" ADD CONSTRAINT "contraindications_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_safety_checks" ADD CONSTRAINT "drug_safety_checks_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_safety_checks" ADD CONSTRAINT "drug_safety_checks_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_safety_checks" ADD CONSTRAINT "drug_safety_checks_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_safety_checks" ADD CONSTRAINT "drug_safety_checks_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_consents" ADD CONSTRAINT "ai_consents_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_consents" ADD CONSTRAINT "ai_consents_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_consents" ADD CONSTRAINT "ai_consents_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_ai_consent_id_fkey" FOREIGN KEY ("ai_consent_id") REFERENCES "ai_consents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_radiology_report_id_fkey" FOREIGN KEY ("radiology_report_id") REFERENCES "radiology_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing_jobs" ADD CONSTRAINT "ai_processing_jobs_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing_jobs" ADD CONSTRAINT "ai_processing_jobs_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing_jobs" ADD CONSTRAINT "ai_processing_jobs_radiology_upload_id_fkey" FOREIGN KEY ("radiology_upload_id") REFERENCES "radiology_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_processing_jobs" ADD CONSTRAINT "ai_processing_jobs_ai_consent_id_fkey" FOREIGN KEY ("ai_consent_id") REFERENCES "ai_consents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_timeline_events" ADD CONSTRAINT "patient_timeline_events_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_documents" ADD CONSTRAINT "search_documents_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_change_logs" ADD CONSTRAINT "report_change_logs_soap_report_id_fkey" FOREIGN KEY ("soap_report_id") REFERENCES "soap_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_change_logs" ADD CONSTRAINT "report_change_logs_radiology_report_id_fkey" FOREIGN KEY ("radiology_report_id") REFERENCES "radiology_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_change_logs" ADD CONSTRAINT "report_change_logs_edited_by_id_fkey" FOREIGN KEY ("edited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
