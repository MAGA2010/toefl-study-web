import { getStudyLogs, addStudyLog, deleteStudyLog } from '../store.js'

const SUBJECTS = [
  { value: 'listening', label: '听力' },
  { value: 'reading', label: '阅读' },
  { value: 'speaking', label: '口语' },
  { value: 'writing', label: '写作' },
  { value: 'vocab', label: '词汇' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function renderStudyLog() {
  return `
    <div class="page-header">
      <h1>📝 学习记录</h1>
      <p>记录你每天的学习内容</p>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;font-size:15px;">➕ 新增记录</h3>
      <form id="study-log-form">
        <div class="form-row">
          <div class="form-group">
            <label>科目</label>
            <select id="log-subject" required>
              ${SUBJECTS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>学习时长（分钟）</label>
            <input type="number" id="log-duration" min="1" placeholder="如 30" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>日期</label>
            <input type="date" id="log-date" value="${todayStr()}" required />
          </div>
          <div class="form-group">
            <label>练习内容</label>
            <input type="text" id="log-content" placeholder="如 TPO23 听力 L1" />
          </div>
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea id="log-notes" placeholder="今天的学习感受、难点等" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">保存记录</button>
      </form>
    </div>

    <div class="card" id="log-list-card">
      <h3 style="margin-bottom:16px;font-size:15px;">📋 历史记录</h3>
      <div id="log-list"></div>
    </div>
  `
}

export function bindStudyLog() {
  const form = document.getElementById('study-log-form')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    addStudyLog({
      subject: document.getElementById('log-subject').value,
      duration: Number(document.getElementById('log-duration').value),
      date: document.getElementById('log-date').value,
      content: document.getElementById('log-content').value,
      notes: document.getElementById('log-notes').value,
    })
    form.reset()
    document.getElementById('log-date').value = todayStr()
    renderLogList()
  })

  renderLogList()
}

function renderLogList() {
  const container = document.getElementById('log-list')
  if (!container) return

  const logs = getStudyLogs()
  if (logs.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p>暂无学习记录，快来添加第一条吧！</p></div>'
    return
  }

  const subjectMap = Object.fromEntries(SUBJECTS.map(s => [s.value, s.label]))

  container.innerHTML = logs.map(l => `
    <div class="list-item">
      <div class="list-item-content">
        <h3>
          <span class="tag tag-${l.subject}">${subjectMap[l.subject] || l.subject}</span>
          <span style="margin-left:8px;">${l.content || '未填写内容'}</span>
        </h3>
        <p>${l.duration} 分钟${l.notes ? '\n' + l.notes : ''}</p>
      </div>
      <div class="list-item-meta">
        <span class="list-item-date">${formatDate(l.date)}</span>
        <button class="btn btn-sm btn-danger" data-id="${l.id}" onclick="this.closest('.list-item').remove()">删除</button>
      </div>
    </div>
  `).join('')

  container.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteStudyLog(btn.dataset.id)
      renderLogList()
    })
  })
}
