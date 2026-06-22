import { ref, readonly } from 'vue'
import { loginPhone, loginQrKey, loginQrCreate, loginQrCheck, fetchUserProfile, logoutApi } from '../services/neteaseApi'

const USER_KEY = 'netease_user_profile'

const user = ref(null)
const isLoggedIn = ref(false)

function loadUserFromStorage() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      user.value = JSON.parse(raw)
      isLoggedIn.value = true
    }
  } catch {
    // ignore
  }
}

function saveUserToStorage(profile) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
  } catch {
    // ignore
  }
}

function clearUserStorage() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem('netease_stations_cache')
}

loadUserFromStorage()

export function useNeteaseAuth() {
  async function checkLogin() {
    try {
      const profile = await fetchUserProfile()
      if (profile) {
        user.value = profile
        isLoggedIn.value = true
        saveUserToStorage(profile)
        return true
      }
    } catch {
      // API unreachable or not logged in
    }
    isLoggedIn.value = false
    user.value = null
    return false
  }

  async function doLoginByPhone(phone, password) {
    const result = await loginPhone(phone, password)
    if (result.profile) {
      user.value = result.profile
      isLoggedIn.value = true
      saveUserToStorage(result.profile)
      clearStationsCache()
    }
    return result
  }

  async function startQrLogin() {
    const key = await loginQrKey()
    const { qrurl, qrimg } = await loginQrCreate(key)
    return { key, qrurl, qrimg }
  }

  async function pollQrStatus(key) {
    const result = await loginQrCheck(key)
    if (result.code === 803) {
      // Login success — try to fetch profile
      const profile = await fetchUserProfile()
      if (profile) {
        user.value = profile
        isLoggedIn.value = true
        saveUserToStorage(profile)
        clearStationsCache()
      }
    }
    return result
  }

  async function doLogout() {
    try {
      await logoutApi()
    } catch {
      // ignore
    }
    user.value = null
    isLoggedIn.value = false
    clearUserStorage()
  }

  return {
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    checkLogin,
    doLoginByPhone,
    startQrLogin,
    pollQrStatus,
    doLogout,
  }
}

function clearStationsCache() {
  localStorage.removeItem('netease_stations_cache')
}
