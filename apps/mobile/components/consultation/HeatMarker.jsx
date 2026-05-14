import { View } from 'react-native'

export function HeatMarker({ x, y, severity = 1, radius = 20, containerWidth, containerHeight }) {
  const SEVERITY_COLORS = {
    1: { fill: 'rgba(250,204,21,0.4)', border: 'rgba(250,204,21,0.7)' },
    2: { fill: 'rgba(249,115,22,0.45)', border: 'rgba(249,115,22,0.75)' },
    3: { fill: 'rgba(239,68,68,0.5)', border: 'rgba(239,68,68,0.8)' },
    4: { fill: 'rgba(220,38,38,0.6)', border: 'rgba(220,38,38,0.9)' },
  }

  const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS[1]
  const posX = x * containerWidth - radius
  const posY = y * containerHeight - radius

  return (
    <View
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: colors.fill,
        borderWidth: 2,
        borderColor: colors.border,
      }}
    />
  )
}
