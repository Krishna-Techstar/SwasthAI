// apps/mobile/components/ui/UploadBox.jsx
import { useState, useRef } from 'react'
import { View, Text, Pressable, Animated, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { doctorTheme as t } from '../../constants/doctorTheme'

const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
}

export function UploadBox({ label, description, accept = 'PDF / Image', onUpload, required = false }) {
  const [status, setStatus]     = useState(STATUS.IDLE)
  const [fileName, setFileName] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const progressAnim = useRef(new Animated.Value(0)).current

  const handlePress = async () => {
    if (status === STATUS.DONE) return

    setErrorMessage(null)

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      })

      if (result.canceled) return

      const file = result.assets?.[0]
      if (!file) throw new Error('No file selected')

      setStatus(STATUS.UPLOADING)
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: false,
      }).start(() => {
        setFileName(file.name ?? 'Selected document')
        setStatus(STATUS.DONE)
        onUpload?.({
          uri: file.uri,
          name: file.name,
          fileName: file.name,
          mimeType: file.mimeType,
          size: file.size,
        })
      })
    } catch (error) {
      const message = error.message ?? 'Could not open document picker'
      setStatus(STATUS.ERROR)
      setErrorMessage(message)
      progressAnim.setValue(0)
      onUpload?.({ error: message })
    }
  }

  const handleRemove = () => {
    setStatus(STATUS.IDLE)
    setFileName(null)
    setErrorMessage(null)
    progressAnim.setValue(0)
    onUpload?.(null)
  }

  const iconName =
    status === STATUS.DONE ? 'checkmark-circle' :
    status === STATUS.ERROR ? 'alert-circle' :
    'cloud-upload-outline'

  const iconColor =
    status === STATUS.DONE ? t.semantic.success :
    status === STATUS.ERROR ? t.semantic.error :
    t.brand.teal

  return (
    <Pressable onPress={handlePress} disabled={status === STATUS.UPLOADING}>
      <View
        style={{
          backgroundColor: t.bg.secondary,
          borderWidth: 1.5,
          borderColor: status === STATUS.DONE
            ? t.semantic.success + '60'
            : status === STATUS.ERROR
            ? t.semantic.error + '60'
            : t.border.subtle,
          borderStyle: status === STATUS.IDLE ? 'dashed' : 'solid',
          borderRadius: t.radius.card,
          paddingVertical: 20,
          paddingHorizontal: 16,
          marginBottom: 12,
          overflow: 'hidden',
        }}
      >
        {/* Upload progress background */}
        {status === STATUS.UPLOADING && (
          <Animated.View
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              backgroundColor: t.brand.tealDim,
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }}
          />
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {/* Icon */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: status === STATUS.DONE ? t.semantic.successDim : t.bg.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {status === STATUS.UPLOADING ? (
              <ActivityIndicator color={t.brand.teal} size="small" />
            ) : (
              <Ionicons name={iconName} size={22} color={iconColor} />
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={{ ...t.typography.bodySemi, color: t.text.primary, fontSize: 14 }}>
                {label}
              </Text>
              {required && (
                <Text style={{ ...t.typography.caption, color: t.semantic.error }}>*</Text>
              )}
            </View>

            {status === STATUS.DONE ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="document-outline" size={12} color={t.semantic.success} />
                <Text style={{ ...t.typography.caption, color: t.semantic.success }}>{fileName}</Text>
              </View>
            ) : status === STATUS.UPLOADING ? (
              <Text style={{ ...t.typography.caption, color: t.brand.teal }}>Uploading...</Text>
            ) : (
              <Text style={{ ...t.typography.caption, color: t.text.muted }}>
                {description ?? `Tap to upload - ${accept}`}
              </Text>
            )}
            {status === STATUS.ERROR && errorMessage ? (
              <Text style={{ ...t.typography.caption, color: t.semantic.error, marginTop: 4 }}>
                {errorMessage}
              </Text>
            ) : null}
          </View>

          {/* Remove button */}
          {status === STATUS.DONE && (
            <Pressable onPress={handleRemove} hitSlop={10}>
              <Ionicons name="close-circle" size={22} color={t.text.muted} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  )
}
