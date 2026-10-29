/**
 * 主入口文件
 * 初始化所有模块。每个页面模块的初始化独立兜底，
 * 单个模块出错不影响其他页面和导航。
 */
import { initTheme, toggleTheme, initNavigation, initTabs } from './utils.js';
import { preloadAllPages } from './page-loader.js';

function removeInitialLoading() {
  const el = document.getElementById('initial-loading');
  if (el && el.parentNode) {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }
}

function showGlobalError(title, msg) {
  const existing = document.getElementById('global-error-tip');
  if (existing) return;
  const tip = document.createElement('div');
  tip.id = 'global-error-tip';
  tip.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;max-width:380px;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:13px;line-height:1.6;';
  tip.innerHTML = `<b>⚠️ ${title}</b><br>${msg}<br><span style="color:#b91c1c;font-size:12px;">其他功能可继续使用，按 F12 可查看详细错误。</span>`;
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 10000);
}

async function safeInit(name, fn) {
  try {
    await fn();
    console.log(`[init] ${name} OK`);
  } catch (e) {
    console.error(`[init] ${name} 初始化失败:`, e);
    showGlobalError(`${name} 模块加载异常`, e && e.message ? e.message : String(e));
  }
}

// 主初始化函数（不依赖 DOMContentLoaded 也能跑）
async function bootstrap() {
  try {
    // 1) 主题初始化（纯 DOM 操作，不依赖其他模块）
    initTheme();
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // 2) 动态加载各 page 模块（它们本身 import 了 data/standards.js，
    //    但 standards.js 很小，不会阻塞；GBK 映射表已经改为懒加载）
    const [
      { initHomePage },
      { initConfigPage },
      { initDebugPage },
      { initCooperationPage },
      { initToolsPage },
    ] = await Promise.all([
      import('./page-home.js'),
      import('./page-config.js'),
      import('./page-debug.js'),
      import('./page-cooperation.js'),
      import('./page-tools.js'),
    ]);

    // 3) 预加载所有页面 HTML 片段（fetch pages/*.html）
    await preloadAllPages();

    // 4) 初始化导航
    const showPage = initNavigation();

    // 5) 各页面模块初始化，独立 try/catch 兜底
    await safeInit('首页', initHomePage);
    await safeInit('保护配置与知识', initConfigPage);
    await safeInit('调试手册与计算工具', initDebugPage);
    await safeInit('保护配合与本体调试', initCooperationPage);
    await safeInit('核相/报告/小工具', initToolsPage);

    // 6) 标签页组件初始化
    try { initTabs(); } catch (e) { console.warn('initTabs 失败:', e); }

    // 7) 首页快速入口卡片跳转
    document.querySelectorAll('.feature-card[data-page]').forEach(card => {
      card.addEventListener('click', () => {
        const page = card.getAttribute('data-page');
        showPage(page);
      });
    });

    // 8) Logo 回首页
    const logo = document.querySelector('.logo[data-page="home"]');
    logo?.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 9) 页面片段加载完毕后（例如异步 fetch 完成后），需要重新给 feature-card 绑事件
    document.addEventListener('page:loaded', () => {
      document.querySelectorAll('.feature-card[data-page]').forEach(card => {
        if (card.dataset.bound) return;
        card.dataset.bound = '1';
        card.addEventListener('click', () => {
          const page = card.getAttribute('data-page');
          showPage(page);
        });
      });
    });

    console.log('[main] 继电保护全过程调试工具已加载完成');
  } catch (e) {
    console.error('[main] 启动过程出现致命错误:', e);
    showGlobalError('启动失败', (e && e.message) || '脚本初始化出错，请刷新重试。');
  } finally {
    removeInitialLoading();
  }
}

// 全局运行时错误兜底
window.addEventListener('error', (e) => {
  console.error('[runtime error]', e.error || e.message);
  // 不阻断页面，仅提示
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandled promise rejection]', e.reason);
});

// 启动：DOM 已就绪就直接跑；否则监听 DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
