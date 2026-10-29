/**
 * 页面HTML加载器
 * 从pages目录加载各页面HTML片段，注入到对应容器中
 */

export async function loadPage(pageId) {
  const container = document.getElementById(pageId);
  if (!container || container.dataset.loaded) return;
  
  try {
    const response = await fetch(`pages/${pageId}.html`);
    if (response.ok) {
      container.innerHTML = await response.text();
      container.dataset.loaded = 'true';
    }
  } catch(e) {
    console.warn(`Failed to load page ${pageId}:`, e);
  }
}

// 预加载所有页面HTML
export async function preloadAllPages() {
  const pages = ['home', 'config', 'debug', 'cooperation', 'tools'];
  await Promise.all(pages.map(p => loadPage(p)));
}
