/**
 * 主入口文件
 * 初始化所有模块
 */
import { initTheme, toggleTheme, initNavigation, initTabs } from '../js/utils.js';
import { preloadAllPages } from '../js/page-loader.js';
import { initHomePage } from '../js/page-home.js';
import { initConfigPage } from '../js/page-config.js';
import { initDebugPage } from '../js/page-debug.js';
import { initCooperationPage } from '../js/page-cooperation.js';
import { initToolsPage } from '../js/page-tools.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化主题
  initTheme();
  
  // 主题切换按钮事件
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  
  // 预加载所有页面HTML
  await preloadAllPages();
  
  // 初始化导航
  const showPage = initNavigation();
  
  // 初始化各页面模块（HTML已加载完成）
  initHomePage();
  initConfigPage();
  initDebugPage();
  initCooperationPage();
  initToolsPage();
  
  // 初始化标签页（在各页面DOM渲染完成后）
  initTabs();
  
  // 首页快速入口点击跳转
  document.querySelectorAll('.feature-card[data-page]').forEach(card => {
    card.addEventListener('click', () => {
      const page = card.getAttribute('data-page');
      showPage(page);
    });
  });

  // 点击 Logo 返回首页
  const logo = document.querySelector('.logo[data-page="home"]');
  logo?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 全局错误兜底：任何未捕获异常都显示提示，不白屏
  window.addEventListener('error', (e) => {
    console.error('运行时错误:', e.error || e.message);
    const existing = document.getElementById('global-error-tip');
    if (existing) return;
    const tip = document.createElement('div');
    tip.id = 'global-error-tip';
    tip.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-left:4px solid #ef4444;padding:12px 16px;border-radius:8px;max-width:360px;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:13px;line-height:1.6;';
    tip.innerHTML = '<b>⚠️ 脚本运行异常</b><br>' + (e.message || '未知错误') + '<br><span style="color:#b91c1c;font-size:12px;">已尝试继续运行，若功能异常请刷新页面或在 GitHub 提 Issue。</span>';
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 8000);
  });

  console.log('继电保护全过程调试工具已加载完成，基础路径:', (document.querySelector('base')?.href || location.href));
});
