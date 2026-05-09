<template>
  <div class="bottom-bar" @click.self="$emit('expand')">
    <div class="bar-content" @click="$emit('expand')">
      <div class="title-wrap">
        <div class="title-scroll" :class="{ scrolling: needsScroll }">
          <span class="title-text">{{ title }}</span>
          <span v-if="needsScroll" class="title-text title-text-copy">{{ title }}</span>
        </div>
      </div>
    </div>
    <div class="bar-actions">
      <button class="ctrl-btn" @click.stop="$emit('toggle-play')" :aria-label="isPlaying ? 'pause' : 'play'">
        <svg v-if="!isPlaying" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
          <path d="M2 2.1L12 8L2 13.9V2.1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
        <span v-else class="pause-icon"></span>
      </button>
      <button class="ctrl-btn" @click.stop="$emit('next')" aria-label="next">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2.8L9 8L2 13.2V2.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
          <rect x="11" y="3" width="2" height="10" rx="0.8" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  title: String,
  isPlaying: Boolean,
})

defineEmits(['toggle-play', 'next', 'expand'])

const needsScroll = ref(false)
const titleWrapRef = ref(null)

function checkScroll() {
  const el = document.querySelector('.bottom-bar .title-text')
  const wrap = document.querySelector('.bottom-bar .title-wrap')
  if (el && wrap) {
    needsScroll.value = el.scrollWidth > wrap.clientWidth + 2
  }
}

let observer = null

onMounted(() => {
  checkScroll()
  observer = new ResizeObserver(checkScroll)
  const wrap = document.querySelector('.bottom-bar .title-wrap')
  if (wrap) observer.observe(wrap)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

watch(() => props.title, () => {
  setTimeout(checkScroll, 50)
})
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 16px;
  padding-bottom: env(safe-area-inset-bottom, 8px);
}

.bar-content {
  display: flex;
  align-items: center;
  height: 56px;
  cursor: pointer;
}

.title-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  height: 24px;
  line-height: 24px;
}

.title-scroll {
  display: flex;
  white-space: nowrap;
}

.title-scroll.scrolling {
  animation: marquee 8s linear infinite;
}

.title-text {
  display: inline-block;
  font-size: 16px;
  font-weight: 600;
  color: #111;
  padding-right: 48px;
  flex-shrink: 0;
}

.title-text-copy {
  padding-left: 48px;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.bar-actions {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #0c0c0d;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.ctrl-btn:active {
  transform: scale(0.92);
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
