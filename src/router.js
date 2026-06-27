const pages = {}

export function registerPage(name, renderFn) {
  pages[name] = renderFn
}

export function navigateTo(pageName) {
  if (!pages[pageName]) return
  const container = document.getElementById('page-container')
  container.innerHTML = ''
  const content = pages[pageName]()
  if (typeof content === 'string') {
    container.innerHTML = content
  } else if (content instanceof HTMLElement) {
    container.appendChild(content)
  }

  // 更新导航高亮
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageName)
  })

  // 绑定页面事件
  const event = new CustomEvent('page:mounted', { detail: { page: pageName } })
  document.dispatchEvent(event)
}

export function initRouter() {
  const defaultPage = 'dashboard'

  function handleHash() {
    const hash = location.hash.slice(1) || defaultPage
    navigateTo(hash)
  }

  window.addEventListener('hashchange', handleHash)

  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const page = el.dataset.page
      location.hash = page
    })
  })

  handleHash()
}
