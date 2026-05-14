import { View } from 'react-native'
import { router } from 'expo-router'
import { doctorTheme as t } from '../../../constants/doctorTheme'
import { useConsultationStore } from '../../../store/consultationStore'
import { CONSENT_VERSION } from '../../../constants/medicalConstants'
import { ConsentModal } from '../../../components/consultation/ConsentModal'
import { WorkflowSelector } from '../../../components/consultation/WorkflowSelector'

export default function ConsentScreen() {
  const consentCaptured = useConsultationStore((s) => s.consentCaptured)
  const captureConsent = useConsultationStore((s) => s.captureConsent)
  const setWorkflowType = useConsultationStore((s) => s.setWorkflowType)
  const setStatus = useConsultationStore((s) => s.setStatus)

  const handleAccept = (consentData) => {
    captureConsent(CONSENT_VERSION, { platform: 'mobile', timestamp: consentData.timestamp })
  }

  const handleDecline = () => {
    router.back()
  }

  const handleWorkflowSelect = (type) => {
    setWorkflowType(type)
    setStatus('active')
    if (type === 'consultation') {
      router.push('/(doctor)/consultation/active')
    } else {
      router.push('/(doctor)/consultation/radiology')
    }
  }

  // Show consent first, then workflow selection after consent
  if (!consentCaptured) {
    return <ConsentModal onAccept={handleAccept} onDecline={handleDecline} />
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg.primary, paddingHorizontal: t.space.base, paddingTop: t.space.lg }}>
      <WorkflowSelector onSelect={handleWorkflowSelect} />
    </View>
  )
}
