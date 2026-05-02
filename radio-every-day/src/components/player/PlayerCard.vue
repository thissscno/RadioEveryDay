<template>
  <div class="player-card">
    <div class="sheet-content" :style="{ top: sheetTop + 'px' }">
      <div class="sheet-header">
        <h2 class="song-title" v-html="title"></h2>
        <div class="song-meta">{{ meta }}</div>

        <div class="main-progress">
          <button class="round-btn" @click="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
            <svg v-if="!isPlaying" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
              <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
            <span v-else class="pause-icon"></span>
          </button>
          <div class="bar" @click="onBarClick" ref="barRef">
            <div class="bar-fill" :style="{ width: (progress * 100) + '%' }"></div>
          </div>
          <div class="duration">{{ currentTimeFormatted }} / {{ durationFormatted }}</div>
        </div>
      </div>

      <div class="sheet-scroll">
        <TranscriptPanel
          :lines="transcriptLines"
          :current-time="currentTime"
          @seek="$emit('seek-to', $event)"
        />
      </div>

      <div class="mini-click-area" @click="$emit('expand')">
        <MiniPlayer
          :is-playing="isPlaying"
          :current-time-formatted="currentTimeFormatted"
          @toggle-play="$emit('toggle-play')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TranscriptPanel from './TranscriptPanel.vue'
import MiniPlayer from './MiniPlayer.vue'

const props = defineProps({
  title: String,
  meta: String,
  isPlaying: Boolean,
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
  currentTimeFormatted: { type: String, default: '0:00' },
  durationFormatted: { type: String, default: '0:00' },
  transcriptLines: { type: Array, default: () => [] },
  expanded: { type: Boolean, default: true },
  isCollapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-play', 'seek', 'seek-to', 'expand'])

const barRef = ref(null)

const sheetTop = computed(() => props.isCollapsed ? 350 : 40)

function onBarClick(e) {
  if (!barRef.value) return
  const rect = barRef.value.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  emit('seek', Math.max(0, Math.min(1, ratio)))
}
</script>

<style scoped>
.player-card {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.sheet-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 265px;
  bottom: 0;
  background: var(--card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: top 0.56s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.18s ease;
}

.sheet-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 26px 20px;
  -webkit-overflow-scrolling: touch;
}

.sheet-header {
  padding: 28px 26px 0;
}

.song-title {
  margin: 0 0 6px;
  font-size: 44px;
  line-height: 0.96;
  letter-spacing: -1.5px;
  font-weight: 820;
}

.song-meta {
  color: #8a8a8a;
  font-size: 16px;
  margin-bottom: 22px;
}

.main-progress {
  display: grid;
  grid-template-columns: 38px 1fr auto;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.round-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #0c0c0d;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.round-btn:active {
  transform: scale(0.95);
}

.pause-icon {
  width: 14px;
  height: 16px;
  display: flex;
  gap: 4px;
}

.pause-icon::before,
.pause-icon::after {
  content: "";
  width: 4px;
  border-radius: 8px;
  background: currentColor;
}

.bar {
  height: 4px;
  background: #dddddd;
  border-radius: 999px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.bar::after {
  content: '';
  position: absolute;
  inset: -8px 0;
}

.bar-fill {
  height: 100%;
  background: #111;
  border-radius: inherit;
  transition: width 0.1s linear;
}

.duration {
  font-size: 16px;
  color: #9a9a9a;
  white-space: nowrap;
}

.mini-click-area {
  cursor: pointer;
}
</style>