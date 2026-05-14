// apps/mobile/constants/medicalConstants.js
// ============================================================
// SWASTHAI MEDICAL CONSTANTS — Clinical data reference
// ============================================================

// ── Body Map Regions ──────────────────────────────────────────────────────────

export const BODY_REGIONS_FRONT = [
  { id: 'head',          label: 'Head',           x: 0.5,  y: 0.06, radius: 0.045 },
  { id: 'forehead',      label: 'Forehead',       x: 0.5,  y: 0.04, radius: 0.03 },
  { id: 'left_eye',      label: 'Left Eye',       x: 0.46, y: 0.065, radius: 0.015 },
  { id: 'right_eye',     label: 'Right Eye',      x: 0.54, y: 0.065, radius: 0.015 },
  { id: 'nose',          label: 'Nose',           x: 0.5,  y: 0.08, radius: 0.012 },
  { id: 'mouth',         label: 'Mouth',          x: 0.5,  y: 0.095, radius: 0.015 },
  { id: 'neck',          label: 'Neck',           x: 0.5,  y: 0.13, radius: 0.025 },
  { id: 'left_shoulder', label: 'Left Shoulder',  x: 0.35, y: 0.17, radius: 0.035 },
  { id: 'right_shoulder',label: 'Right Shoulder', x: 0.65, y: 0.17, radius: 0.035 },
  { id: 'chest',         label: 'Chest',          x: 0.5,  y: 0.22, radius: 0.06 },
  { id: 'left_breast',   label: 'Left Chest',     x: 0.42, y: 0.22, radius: 0.03 },
  { id: 'right_breast',  label: 'Right Chest',    x: 0.58, y: 0.22, radius: 0.03 },
  { id: 'upper_abdomen', label: 'Upper Abdomen',  x: 0.5,  y: 0.30, radius: 0.05 },
  { id: 'lower_abdomen', label: 'Lower Abdomen',  x: 0.5,  y: 0.38, radius: 0.05 },
  { id: 'left_arm_upper',label: 'Left Upper Arm', x: 0.28, y: 0.25, radius: 0.03 },
  { id: 'right_arm_upper',label:'Right Upper Arm', x: 0.72, y: 0.25, radius: 0.03 },
  { id: 'left_elbow',    label: 'Left Elbow',     x: 0.25, y: 0.32, radius: 0.02 },
  { id: 'right_elbow',   label: 'Right Elbow',    x: 0.75, y: 0.32, radius: 0.02 },
  { id: 'left_forearm',  label: 'Left Forearm',   x: 0.23, y: 0.38, radius: 0.025 },
  { id: 'right_forearm', label: 'Right Forearm',  x: 0.77, y: 0.38, radius: 0.025 },
  { id: 'left_hand',     label: 'Left Hand',      x: 0.20, y: 0.46, radius: 0.02 },
  { id: 'right_hand',    label: 'Right Hand',     x: 0.80, y: 0.46, radius: 0.02 },
  { id: 'pelvis',        label: 'Pelvis',         x: 0.5,  y: 0.44, radius: 0.05 },
  { id: 'left_thigh',    label: 'Left Thigh',     x: 0.42, y: 0.54, radius: 0.04 },
  { id: 'right_thigh',   label: 'Right Thigh',    x: 0.58, y: 0.54, radius: 0.04 },
  { id: 'left_knee',     label: 'Left Knee',      x: 0.42, y: 0.64, radius: 0.025 },
  { id: 'right_knee',    label: 'Right Knee',     x: 0.58, y: 0.64, radius: 0.025 },
  { id: 'left_shin',     label: 'Left Shin',      x: 0.42, y: 0.74, radius: 0.03 },
  { id: 'right_shin',    label: 'Right Shin',     x: 0.58, y: 0.74, radius: 0.03 },
  { id: 'left_ankle',    label: 'Left Ankle',     x: 0.42, y: 0.85, radius: 0.02 },
  { id: 'right_ankle',   label: 'Right Ankle',    x: 0.58, y: 0.85, radius: 0.02 },
  { id: 'left_foot',     label: 'Left Foot',      x: 0.42, y: 0.92, radius: 0.025 },
  { id: 'right_foot',    label: 'Right Foot',     x: 0.58, y: 0.92, radius: 0.025 },
]

export const BODY_REGIONS_BACK = [
  { id: 'back_head',       label: 'Back of Head',    x: 0.5,  y: 0.06, radius: 0.045 },
  { id: 'upper_back',      label: 'Upper Back',      x: 0.5,  y: 0.20, radius: 0.06 },
  { id: 'mid_back',        label: 'Mid Back',        x: 0.5,  y: 0.30, radius: 0.05 },
  { id: 'lower_back',      label: 'Lower Back',      x: 0.5,  y: 0.38, radius: 0.05 },
  { id: 'left_scapula',    label: 'Left Scapula',    x: 0.38, y: 0.20, radius: 0.035 },
  { id: 'right_scapula',   label: 'Right Scapula',   x: 0.62, y: 0.20, radius: 0.035 },
  { id: 'sacrum',          label: 'Sacrum',          x: 0.5,  y: 0.44, radius: 0.04 },
  { id: 'left_gluteal',    label: 'Left Gluteal',    x: 0.42, y: 0.48, radius: 0.04 },
  { id: 'right_gluteal',   label: 'Right Gluteal',   x: 0.58, y: 0.48, radius: 0.04 },
  { id: 'left_hamstring',  label: 'Left Hamstring',  x: 0.42, y: 0.58, radius: 0.04 },
  { id: 'right_hamstring', label: 'Right Hamstring', x: 0.58, y: 0.58, radius: 0.04 },
  { id: 'left_calf',       label: 'Left Calf',       x: 0.42, y: 0.74, radius: 0.03 },
  { id: 'right_calf',      label: 'Right Calf',      x: 0.58, y: 0.74, radius: 0.03 },
  { id: 'left_heel',       label: 'Left Heel',       x: 0.42, y: 0.90, radius: 0.02 },
  { id: 'right_heel',      label: 'Right Heel',      x: 0.58, y: 0.90, radius: 0.02 },
]

// ── Pain Severity ────────────────────────────────────────────────────────────

export const PAIN_SEVERITY = [
  { level: 1, label: 'Mild',     color: '#FACC15', opacity: 0.4 },
  { level: 2, label: 'Moderate', color: '#F97316', opacity: 0.55 },
  { level: 3, label: 'Severe',   color: '#EF4444', opacity: 0.7 },
  { level: 4, label: 'Critical', color: '#DC2626', opacity: 0.9 },
]

export const MARKER_TYPES = [
  { id: 'pain',          label: 'Pain',          icon: 'flash-outline' },
  { id: 'inflammation',  label: 'Inflammation',  icon: 'flame-outline' },
  { id: 'fracture',      label: 'Fracture',      icon: 'bandage-outline' },
  { id: 'swelling',      label: 'Swelling',      icon: 'water-outline' },
  { id: 'numbness',      label: 'Numbness',      icon: 'remove-circle-outline' },
  { id: 'wound',         label: 'Wound',         icon: 'cut-outline' },
]

// ── SOAP Templates ───────────────────────────────────────────────────────────

export const SOAP_SECTIONS = {
  S: {
    key: 'subjective',
    title: 'Subjective',
    subtitle: 'Patient-reported symptoms, history, and concerns',
    placeholder: 'Chief complaint, HPI, ROS, past medical history...',
    icon: 'person-outline',
  },
  O: {
    key: 'objective',
    title: 'Objective',
    subtitle: 'Physical exam findings, vitals, lab results',
    placeholder: 'Vitals, physical examination, diagnostic results...',
    icon: 'clipboard-outline',
  },
  A: {
    key: 'assessment',
    title: 'Assessment',
    subtitle: 'Clinical assessment and diagnosis',
    placeholder: 'Primary diagnosis, differential diagnoses, ICD codes...',
    icon: 'analytics-outline',
  },
  P: {
    key: 'plan',
    title: 'Plan',
    subtitle: 'Treatment plan, prescriptions, follow-up',
    placeholder: 'Medications, procedures, referrals, follow-up...',
    icon: 'list-outline',
  },
}

// ── Radiology Scan Types ──────────────────────────────────────────────────────

export const SCAN_TYPES = [
  { id: 'xray',  label: 'X-Ray',  icon: 'scan-outline',  extensions: ['png', 'jpg', 'jpeg', 'dicom'] },
  { id: 'ct',    label: 'CT Scan', icon: 'disc-outline',  extensions: ['png', 'jpg', 'jpeg', 'dicom'] },
  { id: 'mri',   label: 'MRI',     icon: 'radio-outline', extensions: ['png', 'jpg', 'jpeg', 'dicom'] },
  { id: 'ultra', label: 'Ultrasound', icon: 'pulse-outline', extensions: ['png', 'jpg', 'jpeg'] },
]

// ── Drug Risk Categories ──────────────────────────────────────────────────────

export const DRUG_RISK_LEVELS = {
  CRITICAL: { label: 'Critical', color: '#DC2626', bgColor: '#FEE2E2', icon: 'alert-circle' },
  HIGH:     { label: 'High Risk', color: '#EF4444', bgColor: '#FEF2F2', icon: 'warning' },
  MODERATE: { label: 'Moderate',  color: '#F97316', bgColor: '#FFF7ED', icon: 'alert' },
  LOW:      { label: 'Low Risk',  color: '#FACC15', bgColor: '#FEFCE8', icon: 'information-circle' },
  SAFE:     { label: 'Safe',      color: '#22C55E', bgColor: '#F0FDF4', icon: 'checkmark-circle' },
}

export const INTERACTION_TYPES = [
  { id: 'allergy',     label: 'Allergy Conflict',        icon: 'warning-outline' },
  { id: 'chronic',     label: 'Chronic Disease Conflict', icon: 'heart-dislike-outline' },
  { id: 'drug_pair',   label: 'Dangerous Drug Pair',     icon: 'flask-outline' },
  { id: 'dosage',      label: 'Dosage Issue',            icon: 'speedometer-outline' },
  { id: 'pregnancy',   label: 'Pregnancy Risk',          icon: 'female-outline' },
  { id: 'age',         label: 'Age Risk',                icon: 'people-outline' },
]

// ── Consent Text ─────────────────────────────────────────────────────────────

export const CONSENT_VERSION = '2.1.0'

export const CONSENT_ITEMS = [
  {
    id: 'ai_diagnostics',
    title: 'AI-Assisted Diagnostics',
    description: 'I understand that AI systems will assist the doctor in analyzing my symptoms, medical history, and diagnostic data to support clinical decision-making. All AI outputs are reviewed and approved by a licensed physician.',
    required: true,
  },
  {
    id: 'ai_reports',
    title: 'AI-Generated Reports',
    description: 'I consent to AI-generated clinical reports including SOAP notes, radiology analysis, and drug safety checks. These reports are reviewed, edited, and signed off by my attending doctor.',
    required: true,
  },
  {
    id: 'encrypted_processing',
    title: 'Encrypted Data Processing',
    description: 'I acknowledge that my medical data will be processed using end-to-end encryption. Data is encrypted at rest and in transit using AES-256 and TLS 1.3 protocols.',
    required: true,
  },
  {
    id: 'medical_data_usage',
    title: 'Medical Data Usage',
    description: 'I consent to the use of my anonymized medical data for improving AI model accuracy. My personal identity will never be linked to training data. I can opt out at any time.',
    required: true,
  },
  {
    id: 'doctor_supervision',
    title: 'Doctor Supervision Acknowledgment',
    description: 'I understand that all AI-assisted diagnostics and treatments are performed under the direct supervision of a licensed medical professional. The AI never overrides doctor authority.',
    required: true,
  },
]

// ── Quick Tags for Notes ──────────────────────────────────────────────────────

export const QUICK_TAGS = [
  { id: 'urgent',        label: '🔴 Urgent',        color: '#EF4444' },
  { id: 'follow_up',     label: '📅 Follow-up',     color: '#8B5CF6' },
  { id: 'lab_needed',    label: '🧪 Lab Needed',    color: '#3B82F6' },
  { id: 'imaging',       label: '📷 Imaging',       color: '#F97316' },
  { id: 'referral',      label: '🔗 Referral',      color: '#7C3AED' },
  { id: 'chronic',       label: '🔄 Chronic',       color: '#FACC15' },
  { id: 'medication',    label: '💊 Medication',     color: '#22C55E' },
  { id: 'allergy',       label: '⚠️ Allergy',       color: '#DC2626' },
]

// ── Follow-up Urgency Levels ──────────────────────────────────────────────────

export const FOLLOWUP_URGENCY = [
  { id: 'routine',   label: 'Routine',          days: 30, color: '#22C55E', icon: 'calendar-outline' },
  { id: 'moderate',  label: 'Moderate Priority', days: 14, color: '#FACC15', icon: 'time-outline' },
  { id: 'high',      label: 'High Priority',     days: 7,  color: '#F97316', icon: 'alert-outline' },
  { id: 'urgent',    label: 'Urgent',            days: 3,  color: '#EF4444', icon: 'warning-outline' },
  { id: 'immediate', label: 'Immediate',         days: 1,  color: '#DC2626', icon: 'flash-outline' },
]

// ── Reminder Types ────────────────────────────────────────────────────────────

export const REMINDER_TYPES = [
  { id: 'sms',   label: 'SMS',            icon: 'chatbox-outline' },
  { id: 'email', label: 'Email',          icon: 'mail-outline' },
  { id: 'push',  label: 'Push Notification', icon: 'notifications-outline' },
  { id: 'whatsapp', label: 'WhatsApp',    icon: 'logo-whatsapp' },
]
