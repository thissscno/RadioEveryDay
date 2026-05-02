<template>
  <div class="player-view">
    <HeroSection
      :is-playing="isPlaying"
      :current-time-formatted="currentTimeFormatted"
      :expanded="!isCollapsed"
      @expand="expand"
    />

    <div class="content-area">
      <div
        class="sheet-container"
        :class="{ collapsed: isCollapsed }"
        @touchstart="onCardTouchStart"
        @touchmove="onCardTouchMove"
        @touchend="onCardTouchEnd"
        @click="expandIfCollapsed"
      >
        <PlayerCard
          :title="currentEpisode.title"
          :meta="currentEpisode.meta"
          :is-playing="isPlaying"
          :progress="progress"
          :current-time="currentTime"
          :current-time-formatted="currentTimeFormatted"
          :duration-formatted="durationFormatted"
          :transcript-lines="currentEpisode.transcriptLines"
          :expanded="!isCollapsed"
          :is-collapsed="isCollapsed"
          @toggle-play="togglePlay"
          @seek="seek"
          @seek-to="seekToTime"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import HeroSection from '../components/player/HeroSection.vue'
import PlayerCard from '../components/player/PlayerCard.vue'
import { useAudioPlayer } from '../composables/useAudioPlayer'

const {
  isPlaying,
  currentTime,
  progress,
  currentTimeFormatted,
  durationFormatted,
  init,
  togglePlay,
  seek,
  seekToTime,
} = useAudioPlayer()

const isCollapsed = ref(false)
const currentIndex = ref(0)

const episodes = [
  {
    title: 'Monday Night<br />Exhale',
    plainTitle: 'Monday Night Exhale',
    meta: 'If — Bread',
    audioSrc: '/demo.mp3',
    transcriptLines: [
      {
        speaker: 'Auralia',
        time: 5,
        endTime: 11,
        text: 'Back in 1971, David picked up a <span class="highlight">nylon-string</span> guitar and let every line end in a whisper.',
      },
      {
        speaker: 'Auralia',
        time: 11,
        endTime: 14,
        text: "You'll feel yourself lift off the ground a little.",
      },
      {
        speaker: 'Auralia',
        time: 14,
        endTime: 15,
        text: 'This one is called If.',
      },
      {
        speaker: 'Auralia',
        time: 15,
        endTime: 20,
        text: 'After a long day, just breathe and let the room get quiet.',
      },
    ],
  },
  {
    title: 'Golden Hour<br />Drift',
    plainTitle: 'Golden Hour Drift',
    meta: 'Golden Slumbers — The Beatles',
    audioSrc: '/demo.mp3',
    transcriptLines: [
      {
        speaker: 'Auralia',
        time: 3,
        endTime: 8,
        text: 'There was a time when <span class="highlight">Paul McCartney</span> wrote a lullaby disguised as a rock song.',
      },
      {
        speaker: 'Auralia',
        time: 8,
        endTime: 13,
        text: 'Close your eyes and let the harmonies carry you home.',
      },
      {
        speaker: 'Auralia',
        time: 13,
        endTime: 18,
        text: 'This is Golden Slumbers, from the Abbey Road finale.',
      },
      {
        speaker: 'Auralia',
        time: 18,
        endTime: 24,
        text: 'Sometimes the simplest melody is the one that stays with you the longest.',
      },
    ],
  },
  {
    title: 'Rainy Day<br />Reverie',
    plainTitle: 'Rainy Day Reverie',
    meta: 'Riders on the Storm — The Doors',
    audioSrc: '/demo.mp3',
    transcriptLines: [
      {
        speaker: 'Auralia',
        time: 4,
        endTime: 10,
        text: 'Thunder sounds and <span class="highlight">Ray Manzarek</span> keys — this track was recorded with actual rain in the studio.',
      },
      {
        speaker: 'Auralia',
        time: 10,
        endTime: 15,
        text: 'Let the storm outside become the soundtrack inside your head.',
      },
      {
        speaker: 'Auralia',
        time: 15,
        endTime: 20,
        text: 'Riders on the Storm, from 1971.',
      },
      {
        speaker: 'Auralia',
        time: 20,
        endTime: 28,
        text: 'The best rainy day songs make you forget the rain is even there.',
      },
    ],
  },
]

const currentEpisode = computed(() => episodes[currentIndex.value])

function next() {
  currentIndex.value = (currentIndex.value + 1) % episodes.length
  init(currentEpisode.value.audioSrc)
}

init(currentEpisode.value.audioSrc)

let cardTouchStartY = 0
let cardTouchStartX = 0

function onCardTouchStart(e) {
  cardTouchStartY = e.touches[0].clientY
  cardTouchStartX = e.touches[0].clientX
}

function onCardTouchMove(e) {
  const dy = e.touches[0].clientY - cardTouchStartY
  const dx = Math.abs(e.touches[0].clientX - cardTouchStartX)
  if (dy > 80 && dy > dx) {
    isCollapsed.value = true
  }
}

function onCardTouchEnd() {}

function expandIfCollapsed() {
  if (isCollapsed.value) {
    isCollapsed.value = false
  }
}

function expand() {
  isCollapsed.value = false
}
</script>

<style scoped>
.player-view {
  height: 100vh;
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #f5f5f7;
}

.content-area {
  flex: 1;
  position: relative;
  z-index: 10;
}

.sheet-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}
</style>