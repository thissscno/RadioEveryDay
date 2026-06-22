<template>
  <div class="login-view">
    <div class="login-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="login-title">Login</h1>
    </div>

    <div class="login-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'qr' }"
        @click="activeTab = 'qr'"
      >QR Code</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'phone' }"
        @click="activeTab = 'phone'"
      >Phone</button>
    </div>

    <!-- QR Code Login -->
    <div v-if="activeTab === 'qr'" class="login-body">
      <div class="qr-container">
        <div v-if="qrLoading" class="qr-loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="qrImg" class="qr-wrapper">
          <img :src="qrImg" alt="QR Code" class="qr-image" />
          <div v-if="qrStatus === 802" class="qr-overlay">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#75e2bd" stroke-width="2.5" stroke-linecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Scanned, confirm on phone</span>
          </div>
          <div v-if="qrStatus === 800" class="qr-overlay expired" @click="initQr">
            <span>Expired, tap to refresh</span>
          </div>
        </div>
        <div v-else class="qr-error">
          <span>{{ qrError || 'Failed to load QR code' }}</span>
          <button class="retry-btn" @click="initQr">Retry</button>
        </div>
      </div>
      <p class="qr-hint">Open NetEase Cloud Music app and scan the QR code</p>
    </div>

    <!-- Phone Login -->
    <div v-if="activeTab === 'phone'" class="login-body">
      <form class="phone-form" @submit.prevent="handlePhoneLogin">
        <div class="form-field">
          <label>Phone Number</label>
          <input
            v-model="phone"
            type="tel"
            placeholder="Enter phone number"
            autocomplete="tel"
          />
        </div>
        <div class="form-field">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
          />
        </div>
        <div v-if="phoneError" class="form-error">{{ phoneError }}</div>
        <button
          type="submit"
          class="submit-btn"
          :disabled="phoneLoading || !phone || !password"
        >
          <div v-if="phoneLoading" class="spinner small"></div>
          <span v-else>Login</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNeteaseAuth } from '../composables/useNeteaseAuth'

const router = useRouter()
const { doLoginByPhone, startQrLogin, pollQrStatus, isLoggedIn } = useNeteaseAuth()

const activeTab = ref('qr')

// QR state
const qrImg = ref('')
const qrKey = ref('')
const qrLoading = ref(false)
const qrStatus = ref(0)
const qrError = ref('')
let qrPollTimer = null

// Phone state
const phone = ref('')
const password = ref('')
const phoneLoading = ref(false)
const phoneError = ref('')

function goBack() {
  router.push('/')
}

async function initQr() {
  qrLoading.value = true
  qrError.value = ''
  qrImg.value = ''
  qrStatus.value = 0

  try {
    const { key, qrimg } = await startQrLogin()
    qrKey.value = key
    qrImg.value = qrimg
    startQrPolling()
  } catch (err) {
    qrError.value = err.message
  } finally {
    qrLoading.value = false
  }
}

function startQrPolling() {
  stopQrPolling()
  qrPollTimer = setInterval(async () => {
    if (!qrKey.value) return
    try {
      const result = await pollQrStatus(qrKey.value)
      qrStatus.value = result.code
      if (result.code === 803) {
        stopQrPolling()
        setTimeout(() => router.push('/'), 800)
      } else if (result.code === 800) {
        stopQrPolling()
      }
    } catch {
      // ignore polling errors
    }
  }, 2000)
}

function stopQrPolling() {
  if (qrPollTimer) {
    clearInterval(qrPollTimer)
    qrPollTimer = null
  }
}

async function handlePhoneLogin() {
  if (!phone.value || !password.value) return
  phoneLoading.value = true
  phoneError.value = ''

  try {
    await doLoginByPhone(phone.value, password.value)
    router.push('/')
  } catch (err) {
    phoneError.value = err.message || 'Login failed'
  } finally {
    phoneLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'qr' && !qrImg.value) {
    initQr()
  }
})

onMounted(() => {
  if (isLoggedIn.value) {
    router.push('/')
    return
  }
  initQr()
})

onUnmounted(() => {
  stopQrPolling()
})
</script>

<style scoped>
.login-view {
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
  background: #090a0e;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
}

.login-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  flex-shrink: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.08);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s;
}

.back-btn:active {
  background: rgba(255,255,255,0.15);
}

.login-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 32px;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 4px;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.login-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* QR */
.qr-container {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.qr-loading {
  display: grid;
  place-items: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  border-color: rgba(255,255,255,0.3);
  border-top-color: #fff;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.qr-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 16px;
}

.qr-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.qr-overlay.expired {
  cursor: pointer;
  background: rgba(0,0,0,0.6);
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
  font-size: 13px;
}

.retry-btn {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.qr-hint {
  margin-top: 24px;
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  text-align: center;
}

/* Phone */
.phone-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
}

.form-field input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-field input::placeholder {
  color: rgba(255,255,255,0.2);
}

.form-field input:focus {
  border-color: rgba(117, 226, 189, 0.5);
}

.form-error {
  font-size: 13px;
  color: #e74c3c;
  margin-top: -8px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #75e2bd, #5bc4a0);
  color: #090a0e;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.15s;
  margin-top: 8px;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
  transform: scale(0.98);
}
</style>
