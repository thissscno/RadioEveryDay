import { ref, computed, onUnmounted } from 'vue'

export function useAudioPlayer() {
  const audio = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const buffered = ref(0)
  const isBuffering = ref(false)
  const hasError = ref(false)

  const isLiveStream = computed(() => {
    return duration.value === 0 || !isFinite(duration.value)
  })

  const progress = computed(() => {
    if (isLiveStream.value) return 0
    if (duration.value === 0) return 0
    return currentTime.value / duration.value
  })

  const currentTimeFormatted = computed(() => formatTime(currentTime.value))
  const durationFormatted = computed(() =>
    isLiveStream.value ? 'Live' : formatTime(duration.value)
  )

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function removeListeners() {
    if (audio.value) {
      audio.value.removeEventListener('timeupdate', onTimeUpdate)
      audio.value.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.value.removeEventListener('ended', onEnded)
      audio.value.removeEventListener('progress', onProgress)
      audio.value.removeEventListener('playing', onPlaying)
      audio.value.removeEventListener('waiting', onWaiting)
      audio.value.removeEventListener('error', onError)
    }
  }

  function init(src) {
    destroy()
    hasError.value = false
    isBuffering.value = true

    audio.value = new Audio(src)
    audio.value.crossOrigin = 'anonymous'
    audio.value.preload = 'auto'

    audio.value.addEventListener('timeupdate', onTimeUpdate)
    audio.value.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.value.addEventListener('ended', onEnded)
    audio.value.addEventListener('progress', onProgress)
    audio.value.addEventListener('playing', onPlaying)
    audio.value.addEventListener('waiting', onWaiting)
    audio.value.addEventListener('error', onError)

    currentTime.value = 0
    duration.value = 0
    buffered.value = 0
    isPlaying.value = false
  }

  function destroy() {
    if (audio.value) {
      audio.value.pause()
      removeListeners()
      audio.value.src = ''
      audio.value = null
    }
    isPlaying.value = false
    isBuffering.value = false
    hasError.value = false
  }

  function onTimeUpdate() {
    currentTime.value = audio.value.currentTime
  }

  function onLoadedMetadata() {
    const d = audio.value.duration
    duration.value = isFinite(d) ? d : 0
    isBuffering.value = false
    hasError.value = false
  }

  function onEnded() {
    isPlaying.value = false
  }

  function onProgress() {
    if (audio.value.buffered.length > 0) {
      buffered.value = audio.value.buffered.end(audio.value.buffered.length - 1)
    }
  }

  function onPlaying() {
    isBuffering.value = false
    hasError.value = false
  }

  function onWaiting() {
    isBuffering.value = true
  }

  function onError() {
    hasError.value = true
    isBuffering.value = false
    isPlaying.value = false
  }

  function play() {
    if (audio.value) {
      audio.value.play().catch(() => {})
    }
    isPlaying.value = true
  }

  function pause() {
    if (audio.value) {
      audio.value.pause()
    }
    isPlaying.value = false
  }

  function togglePlay() {
    isPlaying.value ? pause() : play()
  }

  function seek(ratio) {
    if (audio.value && duration.value && isFinite(duration.value)) {
      audio.value.currentTime = ratio * duration.value
    }
  }

  function seekToTime(time) {
    if (audio.value) {
      audio.value.currentTime = time
    }
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    isPlaying,
    currentTime,
    duration,
    buffered,
    progress,
    currentTimeFormatted,
    durationFormatted,
    isLiveStream,
    isBuffering,
    hasError,
    init,
    destroy,
    play,
    pause,
    togglePlay,
    seek,
    seekToTime,
  }
}
