<template>
  <div class="hero-section">
    <div class="hero">
      <div class="topbar">
        <div>
          <div class="brand">
            <div class="avatar"></div>
            <div class="brand-name">Auralia</div>
          </div>
          <div class="status">
            <span class="status-dot" :class="{ active: isPlaying }"></span>
            <span>{{ isPlaying ? 'Speaking...' : 'Paused' }}</span>
          </div>
        </div>
        <div class="time">{{ currentTimeFormatted }}</div>
      </div>

      <div class="wave-bg" :class="{ paused: !isPlaying }" aria-hidden="true">
        <span
          v-for="i in 29"
          :key="i"
          :style="{ '--i': i, height: waveHeights[i - 1] + 'px' }"
        ></span>
      </div>

      <div class="center-player">
        <h1 class="center-title">{{ plainTitle }}</h1>
        <p class="center-subtitle">{{ meta }}</p>
        <div class="play-btn-wrapper">
          <span class="ripple" v-if="isPlaying"></span>
          <button class="center-play-btn" @click="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
            <svg v-if="!isPlaying" width="20" height="24" viewBox="0 0 14 16" fill="currentColor">
              <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
            <span v-else class="pause-icon"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: Boolean,
  currentTimeFormatted: { type: String, default: '0:00' },
  isCollapsed: { type: Boolean, default: false },
  plainTitle: { type: String, default: '' },
  meta: { type: String, default: '' },
})

defineEmits(['toggle-play'])

const waveHeights = [
  54, 68, 46, 82, 60, 38, 48, 74, 128, 102,
  136, 152, 126, 98, 84, 58, 44, 72, 114, 130,
  102, 94, 118, 72, 42, 64, 82, 48, 36,
]
</script>

<style scoped>
.hero-section {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero {
  position: relative;
  width: 100%;
  height: 305px;
  overflow: hidden;
  color: white;
  padding: 28px 28px 0;
  background:
    linear-gradient(180deg, rgba(6, 7, 10, 0.86), rgba(6, 7, 10, 0.98)),
    radial-gradient(circle at 30% 20%, rgba(117, 226, 189, 0.12), transparent 36%);
  transition: height var(--motion-main, 560ms) var(--ease-main, cubic-bezier(0.22, 1, 0.36, 1));
}

.collapsed .hero {
  height: 100dvh;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image: radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px);
  background-size: 18px 18px;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  pointer-events: none;
}

.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.12)),
    url("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80");
  background-size: cover;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.brand-name {
  font-size: 30px;
  letter-spacing: 5px;
  line-height: 1;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
}

.status {
  margin-top: 8px;
  font-size: 15px;
  color: var(--green);
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
}

.status-dot.active {
  box-shadow: 0 0 16px rgba(117, 226, 189, 0.95);
}

.time {
  font-size: 22px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.wave-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 147px;
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 0 28px;
  opacity: 0.92;
  z-index: 1;
  transform: translate3d(0, 0, 0) scale(0.9);
  transition:
    top var(--motion-main, 560ms) var(--ease-main, cubic-bezier(0.22, 1, 0.36, 1)),
    transform var(--motion-main, 560ms) var(--ease-main, cubic-bezier(0.22, 1, 0.36, 1)),
    opacity 260ms ease;
  will-change: top, transform, opacity;
}

.collapsed .wave-bg {
  top: 180px;
  transform: translate3d(0, 0, 0) scale(1.05);
  opacity: 0.96;
}

.wave-bg span {
  flex: 1;
  max-width: 6px;
  min-width: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  animation: wavePulse 1.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.06s);
  transform-origin: bottom;
}

.wave-bg.paused span {
  animation-play-state: paused;
}

@keyframes wavePulse {
  0%, 100% {
    transform: scaleY(0.72);
    opacity: 0.62;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.center-player {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 374px;
  text-align: center;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 240ms ease,
    transform var(--motion-main, 560ms) var(--ease-main, cubic-bezier(0.22, 1, 0.36, 1));
  will-change: opacity, transform;
}

.collapsed .center-player {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition-delay: 120ms;
}

.center-title {
  margin: 0;
  font-size: 35px;
  line-height: 1.08;
  letter-spacing: -1.7px;
  font-weight: 850;
  color: #fff;
}

.center-subtitle {
  margin: 16px 0 0;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 450;
  color: rgba(255, 255, 255, 0.32);
}

.center-play-btn {
  width: 92px;
  height: 92px;
  margin-top: 56px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #050609;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
  opacity: 0;
  transform: scale(0.82);
  transition:
    opacity 220ms ease,
    transform var(--motion-main, 560ms) var(--ease-main, cubic-bezier(0.22, 1, 0.36, 1)),
    box-shadow 260ms ease;
  will-change: opacity, transform;
}

.collapsed .center-play-btn {
  opacity: 1;
  transform: scale(1);
  transition-delay: 220ms;
}

.center-play-btn:active {
  transform: scale(0.94);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24);
}

.play-btn-wrapper {
  position: relative;
  display: inline-block;
}

.ripple {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%);
  animation: rippleAnim 1.4s ease-out infinite;
  pointer-events: none;
}

@keyframes rippleAnim {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
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
</style>