import { getStudyLogs, getPlans } from '../store.js'

const SUBJECTS = {
  listening: '听力',
  reading: '阅读',
  speaking: '口语',
  writing: '写作',
  vocab: '词汇',
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function weekDay(dateStr) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return '周' + days[new Date(dateStr).getDay()]
}

function getTodayLogs() {
  const today = todayStr()
  return getStudyLogs().filter(l => l.date === today)
}

function getWeekData() {
  const logs = getStudyLogs()
  const result = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayLogs = logs.filter(l => l.date === dateStr)
    const total = dayLogs.reduce((s, l) => s + (Number(l.duration) || 0), 0)
    result.push({ date: dateStr, label: weekDay(dateStr), total })
  }
  return result
}

export function renderDashboard() {
  const todayLogs = getTodayLogs()
  const todayMinutes = todayLogs.reduce((s, l) => s + (Number(l.duration) || 0), 0)
  const weekData = getWeekData()
  const weekTotal = weekData.reduce((s, d) => s + d.total, 0)
  const maxBar = Math.max(...weekData.map(d => d.total), 1)
  const plans = getPlans().filter(p => !p.completed)
  const todaySubjectSet = new Set(todayLogs.map(l => l.subject))

  return `
    <div class="page-header">
      <h1>📊 今日概览</h1>
      <p>${todayStr()} ${weekDay(todayStr())}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${todayMinutes}</div>
        <div class="stat-label">今日学习（分钟）</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${weekTotal}</div>
        <div class="stat-label">本周累计（分钟）</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${todayLogs.length}</div>
        <div class="stat-label">今日记录条数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${plans.length}</div>
        <div class="stat-label">待完成计划</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;font-size:15px;">📈 本周学习时长</h3>
      <div class="bar-chart">
        ${weekData.map(d => `
          <div class="bar-col">
            <div class="bar-value">${d.total ? d.total + '分' : ''}</div>
            <div class="bar" style="height:${(d.total / maxBar) * 120}px"></div>
            <div class="bar-label">${d.label}</div>
          </div>
        `).join('')}
      </div>
    </div>

    ${todaySubjectSet.size > 0 ? `
    <div class="card">
      <h3 style="margin-bottom:12px;font-size:15px;">🎯 今日已学科目</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${[...todaySubjectSet].map(s => `<span class="tag tag-${s}">${SUBJECTS[s] || s}</span>`).join('')}
      </div>
    </div>` : ''}

    ${plans.length > 0 ? `
    <div class="card">
      <h3 style="margin-bottom:12px;font-size:15px;">📋 待完成计划</h3>
      ${plans.slice(0, 5).map(p => `
        <div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:14px;">
          ${p.title}
          ${p.deadline ? `<span style="color:var(--text-secondary);font-size:12px;margin-left:8px;">截止 ${p.deadline}</span>` : ''}
        </div>
      `).join('')}
    </div>` : ''}
  `
}
