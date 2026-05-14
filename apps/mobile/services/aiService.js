// apps/mobile/services/aiService.js
// ============================================================
// AI Service — LLM1 (clinical) + LLM2 (radiology) integration
// ============================================================

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MOCK_TRANSCRIPTION = [
  { speaker: 'Doctor', text: 'Good morning Mr. Kumar. What brings you in today?', delay: 1500 },
  { speaker: 'Patient', text: 'Doctor, I have been having chest pain for the last three days. It comes and goes, mostly on the left side.', delay: 3000 },
  { speaker: 'Doctor', text: 'Can you describe the pain? Is it sharp, dull, or like a pressure?', delay: 2000 },
  { speaker: 'Patient', text: 'It feels like a heavy pressure, especially when I climb stairs. I also feel short of breath sometimes.', delay: 3500 },
  { speaker: 'Doctor', text: 'Have you noticed any sweating, nausea, or pain radiating to your arm?', delay: 2000 },
  { speaker: 'Patient', text: 'Yes, sometimes I sweat a lot and feel a tingling in my left arm.', delay: 2500 },
  { speaker: 'Doctor', text: 'Given your history of diabetes and hypertension, we need to investigate. Are you taking all medications regularly?', delay: 3000 },
  { speaker: 'Patient', text: 'I take metformin and amlodipine daily. But I sometimes forget atorvastatin at night.', delay: 2500 },
]

export const aiService = {
  startTranscription(sessionId, onChunk) {
    let idx = 0, stopped = false
    const timers = []
    function next() {
      if (stopped || idx >= MOCK_TRANSCRIPTION.length) return
      const c = MOCK_TRANSCRIPTION[idx]
      const t = setTimeout(() => {
        if (stopped) return
        onChunk({ speaker: c.speaker, text: c.text, entities: [] })
        idx++
        next()
      }, c.delay)
      timers.push(t)
    }
    next()
    return { stop: () => { stopped = true; timers.forEach(clearTimeout) } }
  },

  async generateSOAP(context) {
    await mockDelay(2500)
    return {
      soap: {
        subjective: 'Patient is a 58-year-old male presenting with intermittent left-sided chest pain for 3 days, described as heavy pressure, worsening with exertion. Associated diaphoresis and left arm tingling. Known T2DM, HTN, hyperlipidemia. Occasional atorvastatin non-compliance.',
        objective: 'BP 148/92, HR 88, SpO2 96%. Alert, mildly diaphoretic. CV: Regular rate, no murmurs. Lungs: Clear bilaterally. ECG: NSR, no ST changes.',
        assessment: 'Unstable angina vs stable angina in setting of uncontrolled CV risk factors. High ACS risk given symptom profile and comorbidities. DDx: GERD, MSK pain.',
        plan: '1. STAT Troponin-I + 12-lead ECG\n2. Chest X-Ray PA\n3. Continue current meds, reinforce atorvastatin compliance\n4. Consider Aspirin 75mg OD\n5. Cardiology referral for stress test\n6. Follow-up 1 week',
      },
      confidence: { subjective: 94, objective: 88, assessment: 91, plan: 87 },
      icdCodes: [
        { code: 'I20.0', description: 'Unstable angina', confidence: 0.78 },
        { code: 'E11.9', description: 'Type 2 DM', confidence: 0.95 },
        { code: 'I10', description: 'Essential hypertension', confidence: 0.97 },
      ],
    }
  },

  async getClinicalSuggestions(context) {
    await mockDelay(2000)
    return {
      conditions: [
        { name: 'Unstable Angina', confidence: 78, evidence: 'Exertional chest pressure + diaphoresis + left arm radiation', icdCode: 'I20.0' },
        { name: 'Stable Angina Pectoris', confidence: 65, evidence: 'Predictable exertional pattern', icdCode: 'I20.9' },
        { name: 'Acute Coronary Syndrome', confidence: 52, evidence: 'Cannot exclude without troponin', icdCode: 'I21.9' },
        { name: 'GERD', confidence: 28, evidence: 'Common chest pain mimic', icdCode: 'K21.0' },
      ],
      treatments: [
        { name: 'Aspirin 75mg OD', rationale: 'CV risk reduction', priority: 'high' },
        { name: 'Statin dose escalation', rationale: 'LDL 145 above target', priority: 'high' },
        { name: 'Beta-blocker', rationale: 'Anti-anginal effect', priority: 'moderate' },
      ],
      tests: [
        { name: 'Troponin-I (Serial)', urgency: 'STAT', reason: 'Rule out MI' },
        { name: '2D Echo', urgency: 'Within 48h', reason: 'Cardiac function assessment' },
        { name: 'Stress Test', urgency: 'Within 1 week', reason: 'Evaluate ischemia' },
      ],
      risks: [
        { risk: 'Acute MI', probability: 'Moderate', recommendation: 'Serial troponin monitoring' },
        { risk: 'Non-compliance', probability: 'High', recommendation: 'Family education, pill organizer' },
      ],
      differentialDiagnosis: [
        { condition: 'Unstable Angina', likelihood: 'Most likely' },
        { condition: 'ACS/NSTEMI', likelihood: 'Cannot exclude' },
        { condition: 'GERD', likelihood: 'Less likely' },
      ],
    }
  },

  async analyzeImage(imageUri, scanType) {
    await mockDelay(4000)
    return {
      classification: 'Cardiomegaly with mild pulmonary congestion',
      anomalies: [
        { region: 'Heart silhouette', finding: 'Enlarged cardiac silhouette (CTR > 0.55)', severity: 'moderate', confidence: 0.89 },
        { region: 'Lung fields', finding: 'Mild bilateral pulmonary vascular congestion', severity: 'mild', confidence: 0.76 },
        { region: 'Costophrenic angles', finding: 'Clear, no effusion', severity: 'normal', confidence: 0.95 },
      ],
      severity: 'moderate',
      overallConfidence: 0.87,
      heatmapData: {
        hotspots: [
          { x: 0.5, y: 0.45, intensity: 0.89, radius: 0.15, label: 'Cardiac enlargement' },
          { x: 0.35, y: 0.35, intensity: 0.58, radius: 0.1, label: 'Pulmonary congestion L' },
          { x: 0.65, y: 0.35, intensity: 0.52, radius: 0.1, label: 'Pulmonary congestion R' },
        ],
      },
    }
  },

  async getSHAPExplanation(predictionId) {
    await mockDelay(2000)
    return {
      influentialRegions: [
        { region: 'Cardiac border', importance: 0.42, description: 'Widened cardiac silhouette strongly influenced cardiomegaly prediction' },
        { region: 'Left hilum', importance: 0.21, description: 'Prominent pulmonary vasculature suggests volume overload' },
        { region: 'Right hilum', importance: 0.18, description: 'Bilateral vascular prominence consistent with congestion' },
      ],
      featureImportance: [
        { feature: 'Cardiothoracic ratio', value: 0.42 },
        { feature: 'Pulmonary vascularity', value: 0.21 },
        { feature: 'Mediastinal width', value: 0.18 },
        { feature: 'Costophrenic angle', value: 0.11 },
      ],
      uncertainty: 0.13,
      reasoning: 'Enlarged cardiac silhouette (42% importance) is the primary driver. Bilateral pulmonary prominence (39% combined) supports congestion finding.',
    }
  },
}
