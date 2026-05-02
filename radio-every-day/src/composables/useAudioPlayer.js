import { ref, computed, onUnmounted } from 'vue'

export function useAudioPlayer() {
  const audio = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const buffered = ref(0)

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return currentTime.value / duration.value
  })

  const currentTimeFormatted = computed(() => formatTime(currentTime.value))
  const durationFormatted = computed(() => formatTime(duration.value))

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
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
    }
  }

  function init(src) {
    destroy()
    audio.value = new Audio(src)
    audio.value.addEventListener('timeupdate', onTimeUpdate)
    audio.value.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.value.addEventListener('ended', onEnded)
    audio.value.addEventListener('progress', onProgress)
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
  }

  function onTimeUpdate() {
    currentTime.value = audio.value.currentTime
  }

  function onLoadedMetadata() {
    duration.value = audio.value.duration
  }

  function onEnded() {
    isPlaying.value = false
  }

  function onProgress() {
    if (audio.value.buffered.length > 0) {
      buffered.value = audio.value.buffered.end(audio.value.buffered.length - 1)
    }
  }

  function play() {
    if (audio.value) {
      audio.value.play()
      isPlaying.value = true
    }
  }

  function pause() {
    if (audio.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  function togglePlay() {
    isPlaying.value ? pause() : play()
  }

  function seek(ratio) {
    if (audio.value && duration.value) {
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
    init,
    destroy,
    play,
    pause,
    togglePlay,
    seek,
    seekToTime,
  }
}
