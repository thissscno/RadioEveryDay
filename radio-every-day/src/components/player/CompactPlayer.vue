<template>
  <div class="compact-player">
    <div class="compact-content">
      <div class="compact-content-dots" aria-hidden="true"></div>

      <div class="wave-standalone" aria-hidden="true">
        <span
          v-for="i in 29"
          :key="i"
          :style="{ '--i': i, height: waveHeights[i - 1] + 'px' }"
        ></span>
      </div>

      <div class="compact-info">
        <div class="compact-title" v-html="plainTitle"></div>
        <div class="compact-meta">{{ meta }}</div>
      </div>

      <div class="play-btn-wrap" :class="{ playing: isPlaying }">
        <div class="ripple r1"></div>
        <div class="ripple r2"></div>
        <button class="play-btn" @click.stop="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
          <svg v-if="!isPlaying" width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
            <path d="M3 2.5L17 11L3 19.5V2.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          </svg>
          <span v-else class="pause-icon"></span>
        </button>
      </div>
    </div>

    <div
      class="collapsed-card"
      @touchstart="onDragStart"
      @touchmove="onDragMove"
      @touchend="onDragEnd"
    >
      <div class="drag-handle"></div>
      <div class="drag-hint">上滑展开讲稿</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plainTitle: String,
  meta: String,
  isPlaying: Boolean,
})

const emit = defineEmits(['toggle-play', 'expand'])

const waveHeights = [
  54, 68, 46, 82, 60, 38, 48, 74, 128, 102,
  136, 152, 126, 98, 84, 58, 44, 72, 114, 130,
  102, 94, 118, 72, 42, 64, 82, 48, 36,
]

let dragStartY = 0

function onDragStart(e) {
  dragStartY = e.touches[0].clientY
}

function onDragMove(e) {
  const dy = e.touches[0].clientY - dragStartY
  if (dy < -60) {
    emit('expand')
  }
}

function onDragEnd() {}
</script>

<style scoped>
.compact-player {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.compact-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 32px 20px;
  position: relative;
}

.compact-content-dots {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image: radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px);
  background-size: 16px 16px;
  pointer-events: none;
}

.wave-standalone {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  margin-bottom: 36px;
  position: relative;
  z-index: 1;
}

.wave-standalone span {
  flex: 1;
  max-width: 6px;
  min-width: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  animation: wavePulse 1.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.06s);
  transform-origin: bottom;
}

@keyframes wavePulse {
  0%, 100% {
    transform: scaleY(0.72);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 0.9;
  }
}

.compact-info {
  text-align: center;
  margin-bottom: 52px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.compact-title {
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: -1px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.compact-meta {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.2px;
}

.play-btn-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  pointer-events: none;
}

.playing .ripple {
  animation: rippleExpand 2.4s ease-out infinite;
}

.playing .r2 {
  animation-delay: 1.2s;
}

@keyframes rippleExpand {
  0% {
    transform: scale(1);
    opacity: 0.45;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

.play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #111;
  display: grid;
  place-items: center;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: transform 0.15s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.play-btn:active {
  transform: scale(0.93);
}

.pause-icon {
  width: 16px;
  height: 18px;
  display: flex;
  gap: 5px;
}

.pause-icon::before,
.pause-icon::after {
  content: "";
  width: 5px;
  border-radius: 8px;
  background: currentColor;
}

.collapsed-card {
  background: white;
  border-radius: 28px 28px 0 0;
  height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  touch-action: none;
}

.drag-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #d0d0d0;
  margin-bottom: 8px;
}

.drag-hint {
  font-size: 11px;
  color: #aaa;
  letter-spacing: 0.5px;
}
</style>
