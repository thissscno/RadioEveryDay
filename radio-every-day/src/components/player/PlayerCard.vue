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
        <!-- collapsed mini-player -->
        <div class="collapsed-mini-player">
          <div class="mini-handle" @click.stop="$emit('expand')"></div>
          <div class="mini-content" @click.stop="$emit('expand')">
            <div class="mini-info">
              <div class="mini-station-name">{{ stationName }}</div>
              <div class="mini-station-meta">{{ stationStyle }}</div>
            </div>
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
            <div class="mini-controls">
              <button class="mini-btn" @click.stop="$emit('prev')" aria-label="previous">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 1L3 6l7 5V1zM2 1v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="mini-play-btn" @click.stop="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
                <svg v-if="!isPlaying" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
                  <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
                </svg>
                <span v-else class="mini-pause-icon"></span>
              </button>
              <button class="mini-btn" @click.stop="$emit('next')" aria-label="next">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 1l7 5-7 5V1zM10 1v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- expanded content -->
        <div class="expanded-content">
          <div class="sheet-header">
            <div class="station-badge">{{ stationCategory }}</div>
            <h2 class="station-name">{{ stationName }}</h2>
            <div class="station-meta">{{ stationStyle }}</div>
            <div class="station-scene" v-if="stationScene">{{ stationScene }}</div>

            <div class="main-controls">
              <button class="round-btn small" @click.stop="$emit('prev')" aria-label="previous">
                <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 1L3 6l7 5V1zM2 1v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="round-btn" @click.stop="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
                <div v-if="isBuffering" class="spinner"></div>
                <svg v-else-if="!isPlaying" width="16" height="18" viewBox="0 0 14 16" fill="currentColor">
                  <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
                </svg>
                <span v-else class="pause-icon"></span>
              </button>
              <button class="round-btn small" @click.stop="$emit('next')" aria-label="next">
                <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 1l7 5-7 5V1zM10 1v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="progress-section" v-if="!isLiveStream">
              <div class="bar" @click="onBarClick" ref="barRef">
                <div class="bar-fill" :style="{ width: (progress * 100) + '%' }"></div>
              </div>
              <div class="time-row">
                <span>{{ currentTimeFormatted }}</span>
                <span>{{ durationFormatted }}</span>
              </div>
            </div>
            <div class="live-indicator" v-else>
              <span class="live-dot"></span>
              <span>LIVE</span>
            </div>
          </div>

          <div class="station-list-section">
            <div class="list-header">
              <span class="list-title">Stations</span>
              <div class="list-actions">
                <span class="list-count">{{ currentIndex + 1 }} / {{ totalStations }}</span>
                <button class="refresh-btn" @click.stop="$emit('refresh')" :disabled="isLoading" aria-label="refresh">
                  <svg :class="{ spinning: isLoading }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                    <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="station-list">
              <div
                v-for="(station, index) in stations"
                :key="station.name + index"
                class="station-item"
                :class="{ active: index === currentIndex }"
                @click="$emit('select-station', index)"
              >
                <img
                  v-if="station.coverUrl"
                  :src="station.coverUrl"
                  :alt="station.name"
                  class="station-item-cover"
                  loading="lazy"
                />
                <div v-else class="station-item-cover-placeholder"></div>
                <div class="station-item-info">
                  <div class="station-item-name">{{ station.name }}</div>
                  <div class="station-item-style">
                    <span v-if="station.artist">{{ station.artist }}</span>
                    <span v-else>{{ station.style }}</span>
                  </div>
                </div>
                <div class="station-item-playing" v-if="index === currentIndex && isPlaying">
                  <span v-for="i in 3" :key="i" class="playing-bar" :style="{ '--i': i }"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Motion>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Motion } from 'motion-v'

const props = defineProps({
  stationName: { type: String, default: '' },
  stationCategory: { type: String, default: '' },
  stationStyle: { type: String, default: '' },
  stationScene: { type: String, default: '' },
  isPlaying: Boolean,
  isBuffering: Boolean,
  isLiveStream: Boolean,
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
  currentTimeFormatted: { type: String, default: '0:00' },
  durationFormatted: { type: String, default: 'Live' },
  isCollapsed: { type: Boolean, default: false },
  currentIndex: { type: Number, default: 0 },
  totalStations: { type: Number, default: 0 },
  stations: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-play', 'seek', 'prev', 'next', 'expand', 'collapse', 'select-station', 'refresh'])

const barRef = ref(null)

const miniWaveHeights = [
  18, 22, 26, 18, 24, 12, 16, 22, 28, 36,
  32, 20, 18, 24, 14, 12, 20, 16,
]

let touchStartY = 0
let touchStartTarget = null

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY
  touchStartTarget = e.target
}

function onTouchMove(e) {
  if (touchStartTarget && touchStartTarget.closest('button')) return
  const dy = e.touches[0].clientY - touchStartY
  if (dy > 80 && !props.isCollapsed) {
    emit('collapse')
  } else if (dy < -60 && props.isCollapsed) {
    emit('expand')
  }
}

function onTouchEnd() {
  touchStartTarget = null
}

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

/* collapsed mini-player */
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
  cursor: pointer;
}

.mini-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.mini-info {
  min-width: 0;
}

.mini-station-name {
  font-size: 15px;
  font-weight: 650;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-station-meta {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  0%, 100% { transform: scaleY(0.8); }
  50% { transform: scaleY(1.25); }
}

.mini-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.mini-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #555;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s;
}

.mini-btn:active {
  background: rgba(0,0,0,0.06);
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
  position: relative;
  z-index: 2;
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

/* expanded content */
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
  overflow: hidden;
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

.station-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(0,0,0,0.06);
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.station-name {
  margin: 0 0 8px;
  font-size: clamp(36px, 8vw, 48px);
  line-height: 0.96;
  letter-spacing: -2px;
  font-weight: 820;
}

.station-meta {
  color: #8a8a8a;
  font-size: 16px;
}

.station-scene {
  color: #aaa;
  font-size: 13px;
  margin-top: 4px;
}

.main-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 28px 0;
}

.round-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #0c0c0d;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.round-btn.small {
  width: 42px;
  height: 42px;
  background: #f0f0f0;
  color: #333;
}

.round-btn:active {
  transform: scale(0.95);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.progress-section {
  margin-bottom: 8px;
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

.time-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #999;
  margin-top: 6px;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e74c3c;
  margin: 16px 0 8px;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  animation: livePulse 1.5s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* station list */
.station-list-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 28px 100px;
  -webkit-overflow-scrolling: touch;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 12px;
  border-bottom: 1px solid #f0f0f0;
}

.list-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-count {
  font-size: 12px;
  color: #999;
}

.refresh-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #666;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.2s;
}

.refresh-btn:active {
  transform: scale(0.9);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

.station-list {
  display: flex;
  flex-direction: column;
}

.station-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
}

.station-item:active {
  background: #fafafa;
}

.station-item.active .station-item-name {
  color: #111;
  font-weight: 700;
}

.station-item-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 12px;
}

.station-item-cover-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  flex-shrink: 0;
  margin-right: 12px;
  background: linear-gradient(135deg, #e8e8e8, #f5f5f5);
}

.station-item-info {
  min-width: 0;
  flex: 1;
}

.station-item-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-item-style {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.station-item-playing {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  margin-left: 12px;
}

.playing-bar {
  width: 3px;
  border-radius: 999px;
  background: #111;
  animation: playingBar 0.8s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
}

@keyframes playingBar {
  0%, 100% { height: 4px; }
  50% { height: 14px; }
}
</style>
