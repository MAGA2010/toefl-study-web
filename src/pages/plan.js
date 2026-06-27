import { getPlans, addPlan, updatePlan, deletePlan } from '../store.js'
import { playBeep, sendNotification, requestPermission } from '../notify.js'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function renderPlan() {
  return `
    <div class="page-header">
      <h1>📅 学习计划</h1>
      <p>制定学习计划，设置提醒，保持节奏</p>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;font-size:15px;">➕ 新建计划</h3>
      <form id="plan-form">
        <div class="form-group">
          <label>计划名称</label>
          <input type="text" id="plan-title" placeholder="如：完成 TPO30 阅读" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>截止日期</label>
            <input type="date" id="plan-deadline" value="${todayStr()}" />
          </div>
          <div class="form-group">
            <label>提醒时间（到时间自动通知）</label>
            <input type="datetime-local" id="plan-remind-time" />
          </div>
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea id="plan-notes" rows="2" placeholder="详细说明（可选）"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">创建计划</button>
      </form>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;font-size:15px;">📋 计划列表</h3>
      <div class="filter-bar">
        <button class="filter-btn active" data-filter="pending">待完成</button>
        <button class="filter-btn" data-filter="completed">已完成</button>
        <button class="filter-btn" data-filter="all">全部</button>
      </div>
      <div id="plan-list"></div>
    </div>
  `
}

let currentFilter = 'pending'

export function bindPlan() {
  const form = document.getElementById('plan-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await requestPermission()
    const remindTimeVal = document.getElementById('plan-remind-time').value
    addPlan({
      title: document.getElementById('plan-title').value,
      deadline: document.getElementById('plan-deadline').value,
      remindTime: remindTimeVal ? new Date(remindTimeVal).toISOString() : null,
      notes: document.getElementById('plan-notes').value,
    })
    form.reset()
    document.getElementById('plan-deadline').value = todayStr()
    renderPlanList()
  })

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentFilter = btn.dataset.filter
      renderPlanList()
    })
  })

  renderPlanList()
}

function renderPlanList() {
  const container = document.getElementById('plan-list')
  if (!container) return

  let plans = getPlans()
  if (currentFilter === 'pending') plans = plans.filter(p => !p.completed)
  else if (currentFilter === 'completed') plans = plans.filter(p => p.completed)

  if (plans.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>暂无计划</p></div>'
    return
  }

  container.innerHTML = plans.map(p => `
    <div class="list-item" style="flex-direction:column;align-items:stretch;${p.completed ? 'opacity:0.6;' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:10px;">
          <input type="checkbox" class="plan-checkbox" data-id="${p.id}" ${p.completed ? 'checked' : ''} />
          <h3 style="font-size:15px;${p.completed ? 'text-decoration:line-through;' : ''}">${p.title}</h3>
        </div>
        <div class="list-item-meta">
          ${p.deadline ? `<span class="list-item-date">截止 ${p.deadline}</span>` : ''}
          ${p.remindTime ? `<span class="list-item-date" style="color:var(--warning);">⏰ ${formatDateTime(p.remindTime)}</span>` : ''}
          <button class="btn btn-sm btn-danger" data-id="${p.id}">删除</button>
        </div>
      </div>
      ${p.notes ? `<p style="font-size:13px;color:var(--text-secondary);margin-top:8px;margin-left:26px;">${p.notes}</p>` : ''}
    </div>
  `).join('')

  container.querySelectorAll('.plan-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      updatePlan(cb.dataset.id, { completed: cb.checked })
      renderPlanList()
    })
  })

  container.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      deletePlan(btn.dataset.id)
      renderPlanList()
    })
  })
}
