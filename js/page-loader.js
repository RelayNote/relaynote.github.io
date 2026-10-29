/**
 * 页面HTML加载器
 * 从pages目录加载各页面HTML片段，注入到对应容器中
 *
 * 兼容 GitHub Pages 子路径部署：自动从 <base> 标签或当前脚本路径
 * 推算出项目根路径，避免 fetch('pages/xxx.html') 被解析到站点根。
 */

// 动态推算项目根路径（带结尾斜杠），兼容子路径部署、file:// 直开等场景
function resolveBasePath() {
  // 1) 如果页面显式设置了 <base href="...">，优先用它
  const baseEl = document.querySelector('base[href]');
  if (baseEl && baseEl.href) {
    const href = baseEl.getAttribute('href');
    // 支持相对路径的 base
    if (/^https?:\/\//.test(baseEl.href)) {
      return baseEl.href;
    }
    // 相对 base：以当前页面所在目录为基准
    return new URL(href, window.location.href).href;
  }

  // 2) 通过当前脚本的 src 推算项目根（main.js 固定位于 js/ 目录）
  //    <script type="module" src="js/main.js"> 可能是相对/绝对路径
  const scripts = document.querySelectorAll('script[src$="main.js"]');
  for (const s of scripts) {
    try {
      const url = new URL(s.src, window.location.href);
      // 去掉末尾的 "js/main.js"
      const idx = url.pathname.lastIndexOf('/js/main.js');
      if (idx !== -1) {
        return url.origin + url.pathname.slice(0, idx + 1);
      }
    } catch (e) { /* ignore */ }
  }

  // 3) 兜底：使用当前页面所在目录
  return new URL('.', window.location.href).href;
}

const BASE_PATH = resolveBasePath();

// 统一的页面资源请求：带重试 + 多种路径回退，兼容 file:// 和子路径部署
async function fetchPageText(pageId) {
  const candidates = [
    `${BASE_PATH}pages/${pageId}.html`,
    `pages/${pageId}.html`,
    `./pages/${pageId}.html`,
  ];

  let lastErr;
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  // file:// 场景下 fetch 通常直接被禁，给出明显提示，不要静默失败
  if (window.location.protocol === 'file:') {
    throw new Error('当前以 file:// 协议直接打开，浏览器会阻止动态加载页面片段。请通过本地静态服务器（如 python3 -m http.server）或部署到 GitHub Pages 后访问。');
  }
  if (lastErr) throw lastErr;
  throw new Error(`页面 ${pageId}.html 加载失败：所有候选路径均 404。`);
}

export async function loadPage(pageId) {
  const container = document.getElementById(pageId);
  if (!container) return;
  if (container.dataset.loaded) return;

  try {
    const html = await fetchPageText(pageId);
    container.innerHTML = html;
    container.dataset.loaded = 'true';
  } catch (e) {
    console.error(`Failed to load page ${pageId}:`, e);
    container.innerHTML = `
      <div class="card" style="border-left:4px solid #ef4444;background:var(--danger-bg,#fef2f2);">
        <h3 style="color:#dc2626;margin-bottom:8px;">⚠️ 页面加载失败：${pageId}.html</h3>
        <p style="margin:0;color:#991b1b;">${e && e.message ? e.message : '未知错误'}</p>
        <p style="margin-top:8px;color:#7f1d1d;font-size:13px;">
          如果你是在 GitHub Pages 上看到此提示，请确认 <code>pages/</code> 目录已正确上传到仓库根目录；
          如果你直接双击打开了 index.html，请使用 <code>python3 -m http.server</code> 启动本地服务后访问。
        </p>
      </div>`;
  }
}

// 预加载所有页面HTML
export async function preloadAllPages() {
  const pages = ['home', 'config', 'debug', 'cooperation', 'tools'];
  // 逐个加载（遇到 404 也继续加载其余页面），避免某一个失败导致 Promise.all 整体 reject
  for (const p of pages) {
    try {
      await loadPage(p);
    } catch (e) {
      console.warn(`preload ${p} failed:`, e);
    }
  }
}
