const STORAGE_KEYS = {
  STUDY_LOGS: 'toefl_study_logs',
  WRONG_QUESTIONS: 'toefl_wrong_questions',
  PLANS: 'toefl_plans',
}

function get(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// --- 学习记录 ---
export function getStudyLogs() {
  return get(STORAGE_KEYS.STUDY_LOGS)
}

export function addStudyLog(log) {
  const logs = getStudyLogs()
  logs.unshift({ id: genId(), ...log, createdAt: new Date().toISOString() })
  set(STORAGE_KEYS.STUDY_LOGS, logs)
}

export function deleteStudyLog(id) {
  const logs = getStudyLogs().filter(l => l.id !== id)
  set(STORAGE_KEYS.STUDY_LOGS, logs)
}

// --- 错题 ---
export function getWrongQuestions() {
  return get(STORAGE_KEYS.WRONG_QUESTIONS)
}

export function addWrongQuestion(q) {
  const qs = getWrongQuestions()
  qs.unshift({ id: genId(), ...q, createdAt: new Date().toISOString() })
  set(STORAGE_KEYS.WRONG_QUESTIONS, qs)
}

export function updateWrongQuestion(id, updates) {
  const qs = getWrongQuestions().map(q => q.id === id ? { ...q, ...updates } : q)
  set(STORAGE_KEYS.WRONG_QUESTIONS, qs)
}

export function deleteWrongQuestion(id) {
  const qs = getWrongQuestions().filter(q => q.id !== id)
  set(STORAGE_KEYS.WRONG_QUESTIONS, qs)
}

// --- 学习计划 ---
export function getPlans() {
  return get(STORAGE_KEYS.PLANS)
}

export function addPlan(plan) {
  const plans = getPlans()
  plans.push({
    id: genId(),
    ...plan,
    completed: false,
    reminded: false,
    createdAt: new Date().toISOString()
  })
  set(STORAGE_KEYS.PLANS, plans)
}

export function updatePlan(id, updates) {
  const plans = getPlans().map(p => p.id === id ? { ...p, ...updates } : p)
  set(STORAGE_KEYS.PLANS, plans)
}

export function deletePlan(id) {
  const plans = getPlans().filter(p => p.id !== id)
  set(STORAGE_KEYS.PLANS, plans)
}

export function getDuePlans() {
  const now = new Date()
  return getPlans().filter(p => {
    if (p.completed) return false
    if (!p.remindTime) return false
    return new Date(p.remindTime) <= now && !p.reminded
  })
}
