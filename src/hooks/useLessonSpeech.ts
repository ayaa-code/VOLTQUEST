import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lesson } from '../data/lessons'

export function narrationParts(lesson: Lesson) {
  return [
    lesson.title,
    ...lesson.blocks.map((block) => block.spoken ?? block.text),
  ].flatMap((text) => {
    const chunks: string[] = []
    let chunk = ''
    for (const word of text.split(/\s+/)) {
      if (chunk.length + word.length > 180) {
        chunks.push(chunk)
        chunk = ''
      }
      chunk += (chunk ? ' ' : '') + word
    }
    if (chunk) chunks.push(chunk)
    return chunks
  })
}

export function useLessonSpeech(lesson: Lesson) {
  const supported =
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  const [status, setStatus] = useState<
    'idle' | 'preparing' | 'reading' | 'paused' | 'finished' | 'error'
  >('idle')
  const [part, setPart] = useState(0)
  const [rate, setRateState] = useState(1)
  const rateRef = useRef(1)
  const position = useRef(0)
  const restartOnResume = useRef(false)
  const [indonesianVoice, setIndonesianVoice] = useState(false)
  const voices = useRef<SpeechSynthesisVoice[]>([])
  const generation = useRef(0)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const startTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const parts = narrationParts(lesson)
  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const loadVoices = () => {
      voices.current = synth.getVoices()
      setIndonesianVoice(
        voices.current.some((voice) => /^id(?:-|$)/i.test(voice.lang)),
      )
    }
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    const cancel = () => {
      generation.current++
      clearTimeout(startTimer.current)
      synth.cancel()
    }
    window.addEventListener('pagehide', cancel)
    return () => {
      cancel()
      utterance.current = null
      synth.removeEventListener('voiceschanged', loadVoices)
      window.removeEventListener('pagehide', cancel)
    }
  }, [supported, lesson])
  const stop = useCallback(() => {
    generation.current++
    clearTimeout(startTimer.current)
    window.speechSynthesis?.cancel()
    utterance.current = null
    restartOnResume.current = false
    setStatus('idle')
    setPart(0)
  }, [])
  function startFrom(index = 0) {
    if (!supported) return
    generation.current++
    clearTimeout(startTimer.current)
    if (
      utterance.current ||
      window.speechSynthesis.speaking ||
      window.speechSynthesis.pending
    )
      window.speechSynthesis.cancel()
    restartOnResume.current = false
    setStatus('preparing')
    const token = generation.current
    const synth = window.speechSynthesis
    const speak = (index: number) => {
      if (token !== generation.current) return
      if (index >= parts.length) {
        setStatus('finished')
        utterance.current = null
        return
      }
      const next = new SpeechSynthesisUtterance(parts[index])
      next.lang = 'id-ID'
      const currentVoices = synth.getVoices()
      if (currentVoices.length) voices.current = currentVoices
      const voice =
        voices.current.find(
          (item) => /^id(?:-|$)/i.test(item.lang) && item.localService,
        ) ?? voices.current.find((item) => /^id(?:-|$)/i.test(item.lang))
      if (voice) next.voice = voice
      next.rate = rateRef.current
      next.onstart = () => {
        if (token === generation.current) {
          clearTimeout(startTimer.current)
          setStatus('reading')
        }
      }
      next.onend = () => speak(index + 1)
      next.onerror = () => {
        if (token === generation.current) {
          clearTimeout(startTimer.current)
          setStatus('error')
        }
      }
      utterance.current = next
      position.current = index
      setPart(index + 1)
      clearTimeout(startTimer.current)
      startTimer.current = setTimeout(() => {
        if (token === generation.current) {
          generation.current++
          synth.cancel()
          setStatus('error')
        }
      }, 15000)
      synth.speak(next)
    }
    // Some engines retain a paused state after cancel().
    if (synth.paused) synth.resume()
    speak(index)
  }
  function start() {
    startFrom(0)
  }
  function setRate(value: number) {
    if (![0.8, 1, 1.5, 2].includes(value)) return
    rateRef.current = value
    setRateState(value)
    if (status === 'reading' || status === 'preparing')
      startFrom(position.current)
    else if (status === 'paused') {
      // Apply on explicit resume; changing speed must not unpause audio.
      generation.current++
      window.speechSynthesis.cancel()
      utterance.current = null
      restartOnResume.current = true
    }
  }
  function pause() {
    if (supported && status === 'reading') {
      window.speechSynthesis.pause()
      setStatus('paused')
    }
  }
  function resume() {
    if (supported && status === 'paused') {
      if (restartOnResume.current) {
        startFrom(position.current)
        return
      }
      window.speechSynthesis.resume()
      setStatus('reading')
    }
  }
  return {
    supported,
    status,
    part,
    total: parts.length,
    rate,
    setRate,
    indonesianVoice,
    start,
    stop,
    pause,
    resume,
  }
}
