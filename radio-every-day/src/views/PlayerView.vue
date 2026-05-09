<template>
  <div class="player-view" :class="{ collapsed: isCollapsed }">
    <HeroSection
      :is-playing="isPlaying"
      :current-time-formatted="currentTimeFormatted"
      :is-collapsed="isCollapsed"
      :plain-title="currentEpisode.plainTitle"
      :meta="currentEpisode.meta"
    />

    <PlayerCard
      :title="currentEpisode.title"
      :plain-title="currentEpisode.plainTitle"
      :meta="currentEpisode.meta"
      :is-playing="isPlaying"
      :progress="progress"
      :current-time="currentTime"
      :current-time-formatted="currentTimeFormatted"
      :duration-formatted="durationFormatted"
      :transcript-lines="currentEpisode.transcriptLines"
      :is-collapsed="isCollapsed"
      @toggle-play="togglePlay"
      @seek="seek"
      @seek-to="seekToTime"
      @expand="expand"
      @collapse="collapse"
    />
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

const currentEpisode = computed(() => episodes[0])

init(currentEpisode.value.audioSrc)

function expand() {
  isCollapsed.value = false
}

function collapse() {
  isCollapsed.value = true
}

defineExpose({ expand, collapse })
</script>

<style scoped>
.player-view {
  --motion-main: 560ms;
  --ease-main: cubic-bezier(0.22, 1, 0.36, 1);
  --sheet-expanded-y: 300px;
  --sheet-collapsed-y: calc(100dvh - 122px);

  height: 100vh;
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  background: #090a0e;
  color: #fff;
}
</style>