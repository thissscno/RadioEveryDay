<template>
  <div class="player-view" :class="{ collapsed: isCollapsed }">
    <HeroSection
      :is-playing="isPlaying"
      :is-buffering="isBuffering"
      :current-time-formatted="currentTimeFormatted"
      :is-collapsed="isCollapsed"
      :station-name="currentStation.name"
      :station-category="currentStation.category"
      :station-style="currentStation.style"
      :cover-url="currentStation.coverUrl"
      :is-logged-in="isLoggedIn"
      :user-avatar="user?.avatarUrl || ''"
      :user-vip="user?.vipType > 0"
      @toggle-login="handleToggleLogin"
    />

    <PlayerCard
      :station-name="currentStation.name"
      :station-category="currentStation.category"
      :station-style="currentStation.style"
      :station-scene="currentStation.scene"
      :is-playing="isPlaying"
      :is-buffering="isBuffering"
      :is-live-stream="isLiveStream"
      :progress="progress"
      :current-time="currentTime"
      :current-time-formatted="currentTimeFormatted"
      :duration-formatted="durationFormatted"
      :is-collapsed="isCollapsed"
      :current-index="currentIndex"
      :total-stations="allStations.length"
      :stations="allStations"
      :is-loading="stationsLoading"
      @toggle-play="togglePlay"
      @seek="seek"
      @prev="prevStation"
      @next="nextStation"
      @expand="expand"
      @collapse="collapse"
      @select-station="selectStation"
      @refresh="handleRefresh"
    />

    <div v-if="stationsLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading stations...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/player/HeroSection.vue'
import PlayerCard from '../components/player/PlayerCard.vue'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { useNeteaseStations } from '../composables/useNeteaseStations'
import { useNeteaseAuth } from '../composables/useNeteaseAuth'
import { defaultStations } from '../data/stations'

const router = useRouter()
const { user, isLoggedIn, doLogout, checkLogin } = useNeteaseAuth()

const {
  isPlaying,
  currentTime,
  progress,
  currentTimeFormatted,
  durationFormatted,
  isLiveStream,
  isBuffering,
  init,
  play,
  togglePlay,
  seek,
} = useAudioPlayer()

const {
  stations: neteaseStations,
  isLoading: stationsLoading,
  loadStations,
  refresh,
} = useNeteaseStations()

const isCollapsed = ref(false)
const currentIndex = ref(0)

const allStations = computed(() => {
  if (neteaseStations.value.length > 0) return neteaseStations.value
  return defaultStations
})

const currentStation = computed(() => allStations.value[currentIndex.value] || defaultStations[0])

function playStation(index) {
  if (index < 0 || index >= allStations.value.length) return
  currentIndex.value = index
  const station = allStations.value[index]
  if (station.url) {
    init(station.url)
    play()
  }
}

function nextStation() {
  const next = (currentIndex.value + 1) % allStations.value.length
  playStation(next)
}

function prevStation() {
  const prev = (currentIndex.value - 1 + allStations.value.length) % allStations.value.length
  playStation(prev)
}

function selectStation(index) {
  playStation(index)
}

async function handleRefresh() {
  await refresh()
  currentIndex.value = 0
  if (allStations.value.length > 0) {
    playStation(0)
  }
}

function handleToggleLogin() {
  if (isLoggedIn.value) {
    doLogout()
    handleRefresh()
  } else {
    router.push('/login')
  }
}

onMounted(async () => {
  checkLogin()
  await loadStations()
  if (allStations.value.length > 0) {
    playStation(0)
  }
})

function expand() {
  isCollapsed.value = false
}

function collapse() {
  isCollapsed.value = true
}

defineExpose({ expand, collapse })
</script>

<style scoped>
.player-view {
  --motion-main: 560ms;
  --ease-main: cubic-bezier(0.22, 1, 0.36, 1);
  --sheet-expanded-y: 300px;
  --sheet-collapsed-y: calc(100dvh - 122px);

  height: 100vh;
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  background: #090a0e;
  color: #fff;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(9, 10, 14, 0.85);
  z-index: 100;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
