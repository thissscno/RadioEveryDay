<template>
  <div class="hero-section" :class="{ collapsed: !expanded }">
    <div class="hero">
      <div class="topbar">
        <div>
          <div class="brand">
            <div class="avatar"></div>
            <div class="brand-name">Auralia</div>
          </div>
          <div class="status" v-if="expanded">
            <span class="status-dot" :class="{ active: isPlaying }"></span>
            <span>{{ isPlaying ? 'Speaking...' : 'Paused' }}</span>
          </div>
        </div>
        <div class="time">{{ currentTimeFormatted }}</div>
      </div>

      <div class="wave-bg" aria-hidden="true">
        <span
          v-for="i in 29"
          :key="i"
          :style="{ '--i': i, height: waveHeights[i - 1] + 'px' }"
        ></span>
      </div>

      <div class="collapsed-indicator" @click="$emit('expand')" v-if="!expanded">
        <div class="handle"></div>
        <div class="hint">上滑展开讲稿</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: Boolean,
  currentTimeFormatted: { type: String, default: '0:00' },
  expanded: { type: Boolean, default: true },
})

defineEmits(['expand'])

const waveHeights = [
  54, 68, 46, 82, 60, 38, 48, 74, 128, 102,
  136, 152, 126, 98, 84, 58, 44, 72, 114, 130,
  102, 94, 118, 72, 42, 64, 82, 48, 36,
]
</script>

<style scoped>
.hero-section {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1;
}

.hero {
  position: relative;
  overflow: hidden;
  color: white;
  padding: 28px 28px 0;
  background:
    linear-gradient(180deg, rgba(6, 7, 10, 0.86), rgba(6, 7, 10, 0.98)),
    radial-gradient(circle at 30% 20%, rgba(117, 226, 189, 0.12), transparent 36%);
  height: 305px;
  transition: height 0.56s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.56s cubic-bezier(0.4, 0, 0.2, 1);
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

.hero-section.collapsed .hero {
  height: 90px;
  padding: 18px 28px 16px;
}

.hero-section.collapsed .hero::before {
  mask-image: linear-gradient(to bottom, black 30%, transparent 100%);
}

.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-section.collapsed .topbar {
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-section.collapsed .brand {
  gap: 10px;
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
  transition: width 0.56s cubic-bezier(0.4, 0, 0.2, 1),
              height 0.56s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-section.collapsed .avatar {
  width: 30px;
  height: 30px;
}

.brand-name {
  font-size: 30px;
  letter-spacing: 5px;
  line-height: 1;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  transition: font-size 0.56s cubic-bezier(0.4, 0, 0.2, 1),
              letter-spacing 0.56s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-section.collapsed .brand-name {
  font-size: 22px;
  letter-spacing: 4px;
}

.status {
  margin-top: 8px;
  font-size: 15px;
  color: var(--green);
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 1;
  transition: opacity 0.22s ease 0.12s;
}

.hero-section.collapsed .status {
  opacity: 0;
  transition: opacity 0.15s ease;
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
  transition: font-size 0.56s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-section.collapsed .time {
  font-size: 18px;
}

.wave-bg {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 8px;
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 0 28px;
  opacity: 0.92;
  z-index: 1;
  transition: transform 0.44s cubic-bezier(0.4, 0, 0.2, 1) 0.08s,
              opacity 0.44s ease 0.08s;
}

.hero-section.collapsed .wave-bg {
  transform: translateY(-60px);
  opacity: 0;
  transition: transform 0.44s cubic-bezier(0.4, 0, 0.2, 1) 0.08s,
              opacity 0.3s ease;
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

.collapsed-indicator {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.22s ease 0.3s,
              transform 0.22s ease 0.3s;
  z-index: 20;
  pointer-events: auto;
  cursor: pointer;
}

.hero-section.collapsed .collapsed-indicator {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.22s ease 0.3s,
              transform 0.22s ease 0.3s;
}

.handle {
  width: 36px;
  height: 5px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3px;
}

.hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
}
</style>