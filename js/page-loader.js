/**
 * 页面HTML加载器
 * 从 pages/ 目录加载各页面 HTML 片段，注入到对应容器中
 *
 * 兼容 GitHub Pages 子路径部署：
 *   通过 import.meta.url 精确推算当前 JS 所在目录的上一级（即网站根），
 *   不再依赖 <base> 标签，避免 base 改变 fetch / ES Module 相对路径解析的边界问题。
 */

// 通过当前模块自身的 URL 推算项目根（带结尾斜杠），这是最稳健的方式：
// 本文件位于 js/ 下，因此去掉末尾的 "js/page-loader.js" 即得到根。
function resolveRoot() {
  try {
    const url = new URL('.', import.meta.url); // js/ 目录
    const root = new URL('../', url.href);     // 项目根
    return root.href;
  } catch (e) {
    return './';
  }
}

const ROOT = resolveRoot();
// 页面所在位置可能是 /xxx/ 或 /xxx/yyy/ 等子路径，GitHub Pages 上若仓库名被漏掉会 404，
// 但我们直接使用相对 pages/xxx.html 即可（浏览器会以 main.js 所在目录为基准解析，非常稳定）。

async function fetchText(pathList) {
  let lastErr;
  for (const url of pathList) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return { url, text };
      }
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error('所有候选路径均未返回内容');
}

export async function loadPage(pageId) {
  const container = document.getElementById(pageId);
  if (!container) return;
  if (container.dataset.loaded === 'true') return;

  // 显示加载骨架，避免白屏
  container.innerHTML = `
    <div class="card" style="text-align:center;padding:40px;color:#94a3b8;">
      <div style="width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#10b981;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;"></div>
      <p style="margin-top:12px;font-size:13px;">正在加载 ${pageId}.html ...</p>
    </div>`;
  if (!document.getElementById('__spin_kf')) {
    const s = document.createElement('style');
    s.id = '__spin_kf';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }

  // 多候选路径：优先使用 ROOT+pages/ 绝对形式，再尝试相对路径（兼容 file:// 等边缘场景）
  const candidates = [
    `${ROOT}pages/${pageId}.html`,
    `pages/${pageId}.html`,
    `./pages/${pageId}.html`,
    `../pages/${pageId}.html`,
  ];

  try {
    const { url, text } = await fetchText(candidates);
    container.innerHTML = text;
    container.dataset.loaded = 'true';
    container.dataset.loadedFrom = url;
    // 触发一个自定义事件，供各 page-*.js 重新初始化（如果需要）
    document.dispatchEvent(new CustomEvent('page:loaded', { detail: { pageId, url } }));
  } catch (e) {
    console.error(`[page-loader] Failed to load ${pageId}.html:`, e);
    const isFile = location.protocol === 'file:';
    container.innerHTML = `
      <div class="card" style="border-left:4px solid #ef4444;background:#fef2f2;">
        <h3 style="color:#dc2626;margin:0 0 8px 0;">⚠️ 页面片段加载失败：${pageId}.html</h3>
        <p style="margin:0 0 8px 0;color:#991b1b;font-size:14px;">${e && e.message ? e.message : '未知网络错误'}</p>
        ${isFile ? `<p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.7;">
          检测到当前以 <b>file://</b> 协议直接打开，浏览器会阻止 <code>fetch()</code> 加载 <code>pages/*.html</code>。<br>
          请在项目目录执行 <code style="background:#fee2e2;padding:2px 6px;border-radius:4px;">python3 -m http.server 8000</code>，
          再访问 <code>http://localhost:8000</code>；或部署到 GitHub Pages 后访问。
        </p>` : `<p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.7;">
          请确认仓库中存在 <code>pages/${pageId}.html</code> 文件，且 GitHub Pages 已完成部署构建（设置页提示 Your site is live 才算完成）。<br>
          推断的项目根路径：<code>${ROOT}</code>
        </p>`}
      </div>`;
    container.dataset.loaded = 'error';
  }
}

export async function preloadAllPages() {
  const pages = ['home', 'config', 'debug', 'cooperation', 'tools'];
  for (const p of pages) {
    try {
      await loadPage(p);
    } catch (e) {
      console.warn(`preload ${p} failed (non-fatal):`, e);
    }
  }
}
