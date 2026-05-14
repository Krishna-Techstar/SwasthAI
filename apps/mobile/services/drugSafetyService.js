// apps/mobile/services/drugSafetyService.js
// ============================================================
// Drug Safety Service — Interaction checking, alternatives
// ============================================================

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const DRUG_DB = [
  { id: 'drug_001', name: 'Aspirin 75mg', category: 'Antiplatelet', generic: 'Acetylsalicylic acid' },
  { id: 'drug_002', name: 'Metformin 500mg', category: 'Antidiabetic', generic: 'Metformin HCl' },
  { id: 'drug_003', name: 'Amlodipine 5mg', category: 'CCB', generic: 'Amlodipine besylate' },
  { id: 'drug_004', name: 'Atorvastatin 20mg', category: 'Statin', generic: 'Atorvastatin calcium' },
  { id: 'drug_005', name: 'Atorvastatin 40mg', category: 'Statin', generic: 'Atorvastatin calcium' },
  { id: 'drug_006', name: 'Clopidogrel 75mg', category: 'Antiplatelet', generic: 'Clopidogrel bisulfate' },
  { id: 'drug_007', name: 'Metoprolol 25mg', category: 'Beta-blocker', generic: 'Metoprolol tartrate' },
  { id: 'drug_008', name: 'Lisinopril 10mg', category: 'ACE Inhibitor', generic: 'Lisinopril' },
  { id: 'drug_009', name: 'Pantoprazole 40mg', category: 'PPI', generic: 'Pantoprazole sodium' },
  { id: 'drug_010', name: 'Amoxicillin 500mg', category: 'Antibiotic', generic: 'Amoxicillin trihydrate' },
  { id: 'drug_011', name: 'Ibuprofen 400mg', category: 'NSAID', generic: 'Ibuprofen' },
  { id: 'drug_012', name: 'Warfarin 5mg', category: 'Anticoagulant', generic: 'Warfarin sodium' },
]

export const drugSafetyService = {
  async searchDrug(query) {
    await mockDelay(400)
    const q = query.toLowerCase()
    return DRUG_DB.filter((d) =>
      d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    )
  },

  async checkInteractions(drugs, patientProfile) {
    await mockDelay(1500)
    const interactions = []
    const alerts = []

    // Allergy check
    if (patientProfile?.allergies?.includes('Penicillin')) {
      const amox = drugs.find((d) => d.drugName?.toLowerCase().includes('amoxicillin'))
      if (amox) {
        interactions.push({
          id: 'int_001', type: 'allergy', severity: 'CRITICAL',
          drugA: amox.drugName, drugB: 'Patient Allergy: Penicillin',
          description: 'Amoxicillin is a penicillin-type antibiotic. Patient has documented penicillin allergy — risk of anaphylaxis.',
          recommendation: 'STOP immediately. Consider Azithromycin 500mg or Levofloxacin 500mg as alternatives.',
        })
        alerts.push({
          id: 'alert_001', level: 'CRITICAL', title: '⛔ PENICILLIN ALLERGY CONFLICT',
          description: 'Amoxicillin prescribed to patient with Penicillin allergy',
          affectedDrugs: [amox.drugName],
        })
      }
    }

    // NSAID + Antiplatelet
    const nsaid = drugs.find((d) => d.drugName?.toLowerCase().includes('ibuprofen'))
    const antiplatelet = drugs.find((d) => d.drugName?.toLowerCase().includes('aspirin') || d.drugName?.toLowerCase().includes('clopidogrel'))
    if (nsaid && antiplatelet) {
      interactions.push({
        id: 'int_002', type: 'drug_pair', severity: 'HIGH',
        drugA: nsaid.drugName, drugB: antiplatelet.drugName,
        description: 'NSAIDs increase bleeding risk when combined with antiplatelet agents. Ibuprofen may also reduce the cardioprotective effect of aspirin.',
        recommendation: 'Avoid combination. Use Paracetamol 500mg for pain relief instead.',
      })
    }

    // Warfarin + Aspirin
    const warfarin = drugs.find((d) => d.drugName?.toLowerCase().includes('warfarin'))
    const aspirin = drugs.find((d) => d.drugName?.toLowerCase().includes('aspirin'))
    if (warfarin && aspirin) {
      interactions.push({
        id: 'int_003', type: 'drug_pair', severity: 'HIGH',
        drugA: 'Warfarin', drugB: 'Aspirin',
        description: 'Combined anticoagulant and antiplatelet therapy significantly increases bleeding risk.',
        recommendation: 'Use only under specialist supervision. Monitor INR closely.',
      })
    }

    // Age check
    if (patientProfile?.age > 65) {
      const metoprolol = drugs.find((d) => d.drugName?.toLowerCase().includes('metoprolol'))
      if (metoprolol) {
        alerts.push({
          id: 'alert_002', level: 'LOW', title: 'Elderly Patient Advisory',
          description: 'Beta-blockers may cause orthostatic hypotension in patients >65. Start low, go slow.',
          affectedDrugs: [metoprolol.drugName],
        })
      }
    }

    const safetyScore = interactions.length === 0 ? 95 : interactions.some((i) => i.severity === 'CRITICAL') ? 15 : 55

    return { interactions, alerts, overallSafetyScore: safetyScore }
  },

  async getAlternatives(drugName, reason) {
    await mockDelay(1000)
    const alternatives = {
      amoxicillin: [
        { name: 'Azithromycin 500mg', reason: 'Macrolide — no cross-reactivity with penicillin', safetyScore: 92 },
        { name: 'Levofloxacin 500mg', reason: 'Fluoroquinolone — safe for penicillin-allergic patients', safetyScore: 88 },
        { name: 'Doxycycline 100mg', reason: 'Tetracycline — alternative for respiratory infections', safetyScore: 85 },
      ],
      ibuprofen: [
        { name: 'Paracetamol 500mg', reason: 'No GI or antiplatelet interaction risk', safetyScore: 96 },
        { name: 'Tramadol 50mg', reason: 'For moderate pain, if paracetamol insufficient', safetyScore: 78 },
      ],
    }
    const key = Object.keys(alternatives).find((k) => drugName.toLowerCase().includes(k))
    return key ? alternatives[key] : [{ name: 'Consult pharmacist', reason: 'No automated alternatives found', safetyScore: 50 }]
  },
}
