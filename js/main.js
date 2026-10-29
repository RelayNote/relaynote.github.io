/**
 * 主入口文件
 * 初始化所有模块
 */
import { initTheme, toggleTheme, initNavigation, initTabs } from './utils.js';
import { preloadAllPages } from './page-loader.js';
import { initHomePage } from './page-home.js';
import { initConfigPage } from './page-config.js';
import { initDebugPage } from './page-debug.js';
import { initCooperationPage } from './page-cooperation.js';
import { initToolsPage } from './page-tools.js';

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
  
  console.log('继电保护全过程调试工具已加载完成');
});
