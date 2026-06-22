import { ref, readonly } from 'vue'
import { fetchPlaylistTracks } from '../services/neteaseApi'
import { neteaseSources } from '../data/neteaseSources'
import { defaultStations } from '../data/stations'

const CACHE_KEY = 'netease_stations_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const stations = ref([])
const isLoading = ref(false)
const error = ref(null)

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw)
    if (Date.now() - cache.timestamp > CACHE_TTL) return null
    return cache.stations
  } catch {
    return null
  }
}

function saveCache(stationList) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      stations: stationList,
    }))
  } catch {
    // ignore quota errors
  }
}

async function fetchFromNetease() {
  const allStations = []

  for (const source of neteaseSources) {
    try {
      const tracks = await fetchPlaylistTracks(source.id)
      if (!tracks.length) continue

      // Pick first track from each playlist as a "station"
      // The playlist itself acts as a station with one representative track
      const representative = tracks[0]
      allStations.push({
        name: source.name,
        category: source.category,
        url: representative.url,
        style: source.style,
        scene: source.scene,
        coverUrl: representative.coverUrl || '',
        artist: representative.artist || '',
        album: representative.album || '',
        // Store all tracks for potential future "play all" feature
        tracks: tracks,
        sourceId: source.id,
        isNetease: true,
      })
    } catch (err) {
      console.warn(`Failed to fetch playlist ${source.name} (${source.id}):`, err.message)
    }
  }

  return allStations
}

export function useNeteaseStations() {
  async function loadStations() {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null

    // Try cache first
    const cached = loadCache()
    if (cached && cached.length > 0) {
      stations.value = cached
      isLoading.value = false
      return
    }

    try {
      const fetched = await fetchFromNetease()
      if (fetched.length > 0) {
        stations.value = fetched
        saveCache(fetched)
      } else {
        stations.value = defaultStations
        error.value = 'No stations fetched from NetEase, using defaults'
      }
    } catch (err) {
      console.error('NetEase API unavailable:', err.message)
      stations.value = defaultStations
      error.value = 'NetEase API unavailable, using fallback stations'
    } finally {
      isLoading.value = false
    }
  }

  async function refresh() {
    localStorage.removeItem(CACHE_KEY)
    await loadStations()
  }

  return {
    stations: readonly(stations),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadStations,
    refresh,
  }
}
