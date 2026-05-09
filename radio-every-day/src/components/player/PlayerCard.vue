<template>
  <div class="player-card" :class="{ collapsed: isCollapsed }">
    <Motion
      class="sheet-content"
      :animate="{ y: sheetY }"
      :transition="{ type: 'spring', stiffness: 260, damping: 32 }"
      :css="false"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="sheet-inner">
        <!-- 折叠状态下的mini-player控制条 -->
        <div class="collapsed-mini-player">
          <div class="mini-handle" @click.stop="$emit('expand')" @touchend.stop.prevent="$emit('expand')"></div>
          <div class="mini-content" @click.stop="$emit('expand')" @touchend.stop.prevent="$emit('expand')">
            <div class="mini-time">{{ currentTimeFormatted }}</div>
            <div class="mini-wave" :class="{ paused: !isPlaying }" aria-hidden="true">
              <span
                v-for="i in 18"
                :key="i"
                :style="{
                  '--i': i,
                  '--h': miniWaveHeights[i - 1],
                  '--o': i <= 11 ? 0.95 : 0.2 + (0.15 * (11 / i)),
                }"
              ></span>
            </div>
            <button class="mini-play-btn" @click.stop="$emit('toggle-play')" @touchend.stop.prevent="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
              <svg v-if="!isPlaying" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
                <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
              </svg>
              <span v-else class="mini-pause-icon"></span>
            </button>
          </div>
        </div>

        <div class="expanded-content">
          <div class="sheet-header">
            <h2 class="song-title" v-html="title"></h2>
            <div class="song-meta">{{ meta }}</div>

            <div class="main-progress">
              <button class="round-btn" @click.stop="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
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

          <MiniPlayer
            :is-playing="isPlaying"
            :current-time-formatted="currentTimeFormatted"
            @toggle-play="$emit('toggle-play')"
          />
        </div>
      </div>
    </Motion>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Motion } from 'motion-v'
import TranscriptPanel from './TranscriptPanel.vue'
import MiniPlayer from './MiniPlayer.vue'

const props = defineProps({
  title: String,
  plainTitle: String,
  meta: String,
  isPlaying: Boolean,
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
  currentTimeFormatted: { type: String, default: '0:00' },
  durationFormatted: { type: String, default: '0:00' },
  transcriptLines: { type: Array, default: () => [] },
  isCollapsed: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-play', 'seek', 'seek-to', 'expand', 'collapse'])

const barRef = ref(null)

const miniWaveHeights = [
  18, 22, 26, 18, 24, 12, 16, 22, 28, 36,
  32, 20, 18, 24, 14, 12, 20, 16,
]

let touchStartY = 0

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY
}

function onTouchMove(e) {
  const dy = e.touches[0].clientY - touchStartY
  if (dy > 80 && !props.isCollapsed) {
    emit('collapse')
  } else if (dy < -60 && props.isCollapsed) {
    emit('expand')
  }
}

function onTouchEnd() {}

const expandedY = 265
const collapsedY = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerHeight - 96
  }
  return 700
})

const sheetY = computed(() => props.isCollapsed ? collapsedY.value : expandedY)

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
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.sheet-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100dvh;
  background: #fff;
  color: #08090d;
  border-radius: 48px 48px 0 0;
  box-shadow: 0 -28px 80px rgba(0, 0, 0, 0.28);
  overflow: hidden;
  pointer-events: auto;
  will-change: transform;
}

.sheet-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 折叠状态下的mini-player控制条 */
.collapsed-mini-player {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 96px;
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translate3d(0, 12px, 0);
  transition:
    opacity 200ms ease,
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  cursor: pointer;
}

.collapsed .collapsed-mini-player {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition-delay: 260ms;
  pointer-events: auto;
}

.mini-handle {
  width: 50px;
  height: 5px;
  border-radius: 999px;
  background: #d4d4d4;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.mini-content {
  flex: 1;
  display: grid;
  grid-template-columns: 52px 1fr 52px;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.mini-time {
  font-size: 18px;
  font-weight: 650;
  color: #111;
  text-align: center;
}

.mini-wave {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
}

.mini-wave span {
  width: 5px;
  border-radius: 999px;
  background: #111;
  height: calc(8px + var(--h) * 1px);
  opacity: var(--o);
  animation: miniWave 1.2s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.045s);
}

.mini-wave.paused span {
  animation-play-state: paused;
}

@keyframes miniWave {
  0%, 100% {
    transform: scaleY(0.8);
  }
  50% {
    transform: scaleY(1.25);
  }
}

.mini-play-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #0c0c0d;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  justify-self: center;
}

.mini-play-btn:active {
  transform: scale(0.95);
}

.mini-pause-icon {
  width: 14px;
  height: 16px;
  display: flex;
  gap: 4px;
}

.mini-pause-icon::before,
.mini-pause-icon::after {
  content: "";
  width: 4px;
  border-radius: 8px;
  background: currentColor;
}

.expanded-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  filter: blur(0);
  transition:
    opacity 180ms ease,
    transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 180ms ease;
  will-change: opacity, transform, filter;
  overflow: visible;
  position: relative;
}

.collapsed .expanded-content {
  opacity: 0;
  transform: translate3d(0, 28px, 0);
  filter: blur(4px);
  pointer-events: none;
}

.sheet-header {
  padding: 48px 28px 0;
  flex-shrink: 0;
}

.song-title {
  margin: 0 0 10px;
  font-size: clamp(40px, 8vw, 52px);
  line-height: 0.96;
  letter-spacing: -2px;
  font-weight: 820;
}

.song-meta {
  color: #8a8a8a;
  font-size: 18px;
  margin-bottom: 30px;
}

.main-progress {
  display: grid;
  grid-template-columns: 38px 1fr auto;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
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
  width: 13px;
  height: 15px;
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

.sheet-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 18px 100px;
  -webkit-overflow-scrolling: touch;
}
</style>