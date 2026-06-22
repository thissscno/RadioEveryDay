const STORAGE_KEY = 'custom_stations_v1'

export function loadCustomStations() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomStations(stations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
}

export function clearCustomStations() {
  localStorage.removeItem(STORAGE_KEY)
}
