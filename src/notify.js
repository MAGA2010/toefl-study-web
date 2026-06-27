import { getDuePlans, updatePlan } from './store.js'

let audioCtx = null

function playBeep() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = 800
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8)
  osc.start(audioCtx.currentTime)
  osc.stop(audioCtx.currentTime + 0.8)
}

function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '📚',
      requireInteraction: true,
    })
  }
}

function checkDuePlans() {
  const due = getDuePlans()
  due.forEach(plan => {
    sendNotification('TOEFL 学习提醒', plan.title)
    playBeep()
    updatePlan(plan.id, { reminded: true })
  })
}

export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function initNotify() {
  requestPermission()
  setInterval(checkDuePlans, 30000)
  checkDuePlans()
}

export { playBeep, sendNotification }
