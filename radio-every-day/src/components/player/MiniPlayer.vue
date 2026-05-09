<template>
  <div class="mini-player">
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
    <button class="round-btn" @click.stop="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
      <svg v-if="!isPlaying" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
        <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
      <span v-else class="pause-icon"></span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: Boolean,
  currentTimeFormatted: { type: String, default: '0:00' },
})

defineEmits(['toggle-play'])

const miniWaveHeights = [
  18, 22, 26, 18, 24, 12, 16, 22, 28, 36,
  32, 20, 18, 24, 14, 12, 20, 16,
]
</script>

<style scoped>
.mini-player {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 96px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
  display: grid;
  grid-template-columns: 52px 1fr 52px;
  align-items: center;
  gap: 14px;
  padding: 14px 22px 22px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.mini-time {
  font-size: 18px;
  font-weight: 650;
  color: #111;
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
</style>
