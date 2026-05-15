import axios from 'axios'

const SPEECH_API_KEY = process.env.EXPO_PUBLIC_SPEECH_API_KEY
const TRANSCRIBE_URL = process.env.EXPO_PUBLIC_SPEECH_API_URL || 'https://flinch-lapping-rewash.ngrok-free.dev/transcribe'

export const speechService = {
  /**
   * Transcribes an audio chunk or file using your hosted ML model
   * @param {string} audioUri - URI of the audio file to transcribe
   */
  async transcribeAudio(audioUri) {
    if (!audioUri) throw new Error('audioUri is required')
    
    const formData = new FormData()
    const fileName = audioUri.split('/').pop()
    
    // Most medical STT models prefer wav or m4a
    formData.append('file', {
      uri: audioUri,
      name: fileName,
      type: 'audio/m4a',
    })

    try {
      console.log(`[LLM1] Sending audio to: ${TRANSCRIBE_URL}`)
      const response = await axios.post(TRANSCRIBE_URL, formData, {
        headers: {
          'x-api-key': SPEECH_API_KEY, // Sending as x-api-key header
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      })

      // We expect the model to return the transcribed text
      return response.data.text || response.data.transcription || response.data
    } catch (error) {
      console.error('[LLM1] Transcription failed:', error.response?.data || error.message)
      throw new Error('Live transcription failed. Please check the audio server.')
    }
  },

  /**
   * Mock for live stream initialization
   */
  async startLiveTranscription(sessionId, onTranscript) {
    console.log('[LLM1] Live session active on:', TRANSCRIBE_URL)
    return {
      stop: () => console.log('[LLM1] Session closed')
    }
  }
}
