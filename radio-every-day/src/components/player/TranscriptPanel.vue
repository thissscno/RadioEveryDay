<template>
  <div class="transcript">
    <div
      v-for="(line, index) in lines"
      :key="index"
      class="line"
      :class="lineClass(index)"
      @click="$emit('seek', line.time)"
    >
      <div class="speaker">{{ line.speaker }} · {{ formatTime(line.time) }}</div>
      <div class="sentence">
        <template v-if="activeIndex === index">
          <span
            v-for="(char, ci) in lineChars[index]"
            :key="ci"
            class="char"
            :class="{ 'char-active': ci < highlightCount(index), 'char-inactive': ci >= highlightCount(index) }"
          >{{ char }}</span>
        </template>
        <template v-else>
          <span v-html="line.text"></span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lines: { type: Array, default: () => [] },
  currentTime: { type: Number, default: 0 },
})

defineEmits(['seek'])

const activeIndex = computed(() => {
  let idx = -1
  for (let i = 0; i < props.lines.length; i++) {
    if (props.currentTime >= props.lines[i].time) {
      idx = i
    }
  }
  return idx
})

function lineClass(index) {
  if (index < activeIndex.value) return 'past'
  if (index === activeIndex.value) return 'active'
  return ''
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '')
}

const lineChars = computed(() => {
  return props.lines.map(line => stripHtml(line.text).split(''))
})

function highlightCount(index) {
  const line = props.lines[index]
  if (!line) return 0
  const start = line.time
  const end = line.endTime || (index < props.lines.length - 1 ? props.lines[index + 1].time : start + 5)
  const span = end - start
  if (span <= 0) return 0
  const ratio = Math.min(1, Math.max(0, (props.currentTime - start) / span))
  const chars = lineChars.value[index]
  if (!chars) return 0
  return Math.round(ratio * chars.length)
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.transcript {
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.9), transparent 32%),
    var(--panel);
  border-radius: 24px;
  padding: 20px 18px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);
  position: relative;
}

.transcript::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background-image: radial-gradient(#bdbdbd 1px, transparent 1px);
  background-size: 12px 12px;
  pointer-events: none;
}

.line {
  position: relative;
  z-index: 2;
  margin-bottom: 18px;
  color: rgba(0, 0, 0, 0.16);
  cursor: pointer;
  transition: color 0.3s ease;
}

.line:last-child {
  margin-bottom: 0;
}

.line.past {
  color: rgba(0, 0, 0, 0.92);
}

.line.active {
  color: rgba(0, 0, 0, 0.92);
}

.speaker {
  font-size: 14px;
  color: inherit;
  margin-bottom: 8px;
}

.sentence {
  font-size: 20px;
  line-height: 1.35;
  letter-spacing: -0.4px;
}

.char {
  transition: color 0.15s ease;
}

.char-active {
  color: rgba(0, 0, 0, 0.92);
}

.char-inactive {
  color: rgba(0, 0, 0, 0.16);
}

:deep(.highlight) {
  background: linear-gradient(180deg, transparent 48%, rgba(117, 226, 189, 0.62) 48%);
  border-radius: 4px;
  padding: 0 2px;
}
</style>
