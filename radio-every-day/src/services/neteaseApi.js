const API_BASE = import.meta.env.VITE_NETEASE_API_URL || '/netease-api'

async function request(path, params = {}) {
  const url = new URL(path, window.location.origin)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  const data = await res.json()
  if (data.code !== 200) throw new Error(`NetEase API error: ${data.code}`)
  return data
}

// requestRaw does not check code — for endpoints like /login/qr/check
// that use non-200 codes to indicate different states
async function requestRaw(path, params = {}) {
  const url = new URL(path, window.location.origin)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function fetchPlaylistDetail(playlistId) {
  const data = await request(`${API_BASE}/playlist/detail`, { id: playlistId })
  return data.playlist
}

export async function fetchSongUrl(songId) {
  const data = await request(`${API_BASE}/song/url`, { id: songId })
  return data.data?.[0] || null
}

export async function fetchBatchSongUrls(songIds) {
  const ids = Array.isArray(songIds) ? songIds.join(',') : songIds
  const data = await request(`${API_BASE}/song/url`, { id: ids })
  return data.data || []
}

export async function fetchPersonalizedSongs() {
  const data = await request(`${API_BASE}/personalized/newsong`)
  return data.result || []
}

export async function fetchDjPrograms() {
  const data = await request(`${API_BASE}/personalized/djprogram`)
  return data.programs || data.result || []
}

export async function fetchPlaylistTracks(playlistId) {
  const playlist = await fetchPlaylistDetail(playlistId)
  if (!playlist?.tracks?.length) return []

  const songIds = playlist.tracks.map(t => t.id)
  const urls = await fetchBatchSongUrls(songIds)

  const urlMap = new Map()
  for (const item of urls) {
    if (item.url) urlMap.set(item.id, item)
  }

  return playlist.tracks.map(track => {
    const urlInfo = urlMap.get(track.id)
    return {
      id: track.id,
      name: track.name,
      artist: track.ar?.map(a => a.name).join(' / ') || '',
      album: track.al?.name || '',
      coverUrl: track.al?.picUrl ? `${track.al?.picUrl}?param=300y300` : '',
      url: urlInfo?.url || '',
      duration: urlInfo?.time || track.dt || 0,
      br: urlInfo?.br || 128000,
    }
  }).filter(t => t.url)
}

// --- Auth APIs ---

export async function loginQrKey() {
  const data = await request(`${API_BASE}/login/qr/key`, { timestamp: Date.now() })
  return data.data?.unikey || ''
}

export async function loginQrCreate(key) {
  const data = await request(`${API_BASE}/login/qr/create`, {
    key,
    qrimg: true,
    timestamp: Date.now(),
  })
  return {
    qrurl: data.data?.qrurl || '',
    qrimg: data.data?.qrimg || '',
  }
}

export async function loginQrCheck(key) {
  const data = await requestRaw(`${API_BASE}/login/qr/check`, {
    key,
    timestamp: Date.now(),
  })
  return {
    code: data.code,
    message: data.message || '',
    cookie: data.cookie || '',
  }
}

export async function loginPhone(phone, password) {
  const data = await request(`${API_BASE}/login/cellphone`, {
    phone,
    password,
    timestamp: Date.now(),
  })
  return {
    profile: data.profile || null,
    cookie: data.cookie || '',
    token: data.token || '',
  }
}

export async function fetchLoginStatus() {
  const data = await requestRaw(`${API_BASE}/login/status`, { timestamp: Date.now() })
  return data.data || {}
}

export async function fetchUserProfile() {
  const data = await requestRaw(`${API_BASE}/user/account`, { timestamp: Date.now() })
  return data.profile || data.account || null
}

export async function logoutApi() {
  const data = await requestRaw(`${API_BASE}/logout`, { timestamp: Date.now() })
  return data
}
