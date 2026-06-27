import './style.css'
import { registerPage, initRouter } from './router.js'
import { initNotify } from './notify.js'
import { renderDashboard } from './pages/dashboard.js'
import { renderStudyLog, bindStudyLog } from './pages/study-log.js'
import { renderWrongQuestions, bindWrongQuestions } from './pages/wrong-questions.js'
import { renderPlan, bindPlan } from './pages/plan.js'

// 注册页面
registerPage('dashboard', () => renderDashboard())
registerPage('study-log', () => renderStudyLog())
registerPage('wrong-questions', () => renderWrongQuestions())
registerPage('plan', () => renderPlan())

// 页面挂载后绑定事件
document.addEventListener('page:mounted', (e) => {
  const page = e.detail.page
  if (page === 'study-log') bindStudyLog()
  if (page === 'wrong-questions') bindWrongQuestions()
  if (page === 'plan') bindPlan()
})

// 移动端侧边栏
const sidebar = document.getElementById('sidebar')
const overlay = document.createElement('div')
overlay.className = 'overlay'
document.body.appendChild(overlay)

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('hamburger')) {
    sidebar.classList.toggle('open')
    overlay.classList.toggle('open')
  }
  if (e.target === overlay || e.target.classList.contains('nav-item')) {
    sidebar.classList.remove('open')
    overlay.classList.remove('open')
  }
})

// 初始化
initRouter()
initNotify()
