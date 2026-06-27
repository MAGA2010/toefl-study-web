import { getWrongQuestions, addWrongQuestion, deleteWrongQuestion, updateWrongQuestion } from '../store.js'

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

export function renderWrongQuestions() {
  return `
    <div class="page-header">
      <h1>❌ 错题本</h1>
      <p>记录你的错题和反思，方便复习</p>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;font-size:15px;">➕ 添加错题</h3>
      <form id="wq-form">
        <div class="form-row">
          <div class="form-group">
            <label>科目</label>
            <select id="wq-subject" required>
              ${SUBJECTS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>题型</label>
            <input type="text" id="wq-type" placeholder="如 推断题、主旨题" />
          </div>
        </div>
        <div class="form-group">
          <label>题目 / 题干</label>
          <textarea id="wq-question" rows="3" placeholder="粘贴或描述题目内容" required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>我的错误答案</label>
            <input type="text" id="wq-my-answer" placeholder="你选了什么" />
          </div>
          <div class="form-group">
            <label>正确答案</label>
            <input type="text" id="wq-correct-answer" placeholder="正确答案是" />
          </div>
        </div>
        <div class="form-group">
          <label>错误原因 / 反思</label>
          <textarea id="wq-reason" rows="2" placeholder="为什么错了？下次如何避免？"></textarea>
        </div>
        <div class="form-group">
          <label>来源</label>
          <input type="text" id="wq-source" placeholder="如 TPO23 L1、机经" />
        </div>
        <button type="submit" class="btn btn-primary">保存错题</button>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;font-size:15px;">🔍 筛选错题</h3>
      <div class="search-bar">
        <input type="text" id="wq-search" placeholder="搜索题目关键词..." />
        <select id="wq-filter-subject">
          <option value="">全部科目</option>
          ${SUBJECTS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
        </select>
      </div>
      <div id="wq-list"></div>
    </div>
  `
}

export function bindWrongQuestions() {
  const form = document.getElementById('wq-form')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    addWrongQuestion({
      subject: document.getElementById('wq-subject').value,
      type: document.getElementById('wq-type').value,
      question: document.getElementById('wq-question').value,
      myAnswer: document.getElementById('wq-my-answer').value,
      correctAnswer: document.getElementById('wq-correct-answer').value,
      reason: document.getElementById('wq-reason').value,
      source: document.getElementById('wq-source').value,
      date: todayStr(),
    })
    form.reset()
    renderWQList()
  })

  const searchInput = document.getElementById('wq-search')
  const filterSelect = document.getElementById('wq-filter-subject')
  if (searchInput) searchInput.addEventListener('input', renderWQList)
  if (filterSelect) filterSelect.addEventListener('change', renderWQList)

  renderWQList()
}

function renderWQList() {
  const container = document.getElementById('wq-list')
  if (!container) return

  const keyword = (document.getElementById('wq-search')?.value || '').toLowerCase()
  const filterSubject = document.getElementById('wq-filter-subject')?.value || ''

  let qs = getWrongQuestions()
  if (keyword) qs = qs.filter(q => q.question.toLowerCase().includes(keyword) || (q.reason || '').toLowerCase().includes(keyword))
  if (filterSubject) qs = qs.filter(q => q.subject === filterSubject)

  if (qs.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><p>暂无错题记录</p></div>'
    return
  }

  const subjectMap = Object.fromEntries(SUBJECTS.map(s => [s.value, s.label]))

  container.innerHTML = qs.map(q => `
    <div class="list-item" style="flex-direction:column;align-items:stretch;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <span class="tag tag-${q.subject}">${subjectMap[q.subject] || q.subject}</span>
          ${q.type ? `<span style="font-size:12px;color:var(--text-secondary);margin-left:8px;">${q.type}</span>` : ''}
          ${q.source ? `<span style="font-size:12px;color:var(--text-secondary);margin-left:8px;">来源: ${q.source}</span>` : ''}
        </div>
        <div class="list-item-meta">
          <span class="list-item-date">${q.date || ''}</span>
          <button class="btn btn-sm btn-danger" data-id="${q.id}">删除</button>
        </div>
      </div>
      <div style="font-size:14px;margin-bottom:8px;white-space:pre-line;">${q.question}</div>
      <div style="display:flex;gap:24px;font-size:13px;flex-wrap:wrap;">
        ${q.myAnswer ? `<div><span style="color:var(--danger);">我的答案：</span>${q.myAnswer}</div>` : ''}
        ${q.correctAnswer ? `<div><span style="color:var(--success);">正确答案：</span>${q.correctAnswer}</div>` : ''}
      </div>
      ${q.reason ? `<div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:13px;color:var(--text-secondary);white-space:pre-line;">💡 ${q.reason}</div>` : ''}
    </div>
  `).join('')

  container.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteWrongQuestion(btn.dataset.id)
      renderWQList()
    })
  })
}
