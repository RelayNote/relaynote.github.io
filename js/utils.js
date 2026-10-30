/**
 * 通用工具函数库
 *
 * 注意：GBK 映射表（700KB+）改为**动态懒加载**，不在首屏 import，
 * 只有当用户真正使用 "GBK ↔ HEX" 工具时才拉取，避免首屏阻塞导致白屏。
 */

// GBK 映射表缓存（Promise）
let _gbkMapPromise = null;
function loadGbkMap() {
  if (!_gbkMapPromise) {
    // 通过 import.meta.url 推算 data/ 路径，不再依赖 <base>
    const dataUrl = new URL('../data/gbk-map.js', import.meta.url).href;
    _gbkMapPromise = import(dataUrl).then(mod => ({
      GBK_MAP: mod.GBK_MAP,
      GBK_DECODE_MAP: mod.GBK_DECODE_MAP,
    })).catch(err => {
      console.error('GBK 映射表加载失败：', err);
      _gbkMapPromise = null; // 失败后允许重试
      throw err;
    });
  }
  return _gbkMapPromise;
}

// ========== 主题切换 ==========
export function initTheme() {
  const savedTheme = localStorage.getItem('relay-tool-theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
  updateThemeIcon(savedTheme);
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('relay-tool-theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark ? 'dark' : 'light');
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? 'Bright' : 'Dark';
  }
}

// ========== 导航与路由 ==========
export function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  const sections = document.querySelectorAll('.page-section');
  
  function showPage(pageId) {
    sections.forEach(section => {
      section.classList.remove('active');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    const targetSection = document.getElementById(pageId);
    const targetLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetLink) targetLink.classList.add('active');
    
    // 收起移动端菜单
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('show');
    
    localStorage.setItem('relay-tool-last-page', pageId);
  }
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      showPage(pageId);
    });
  });
  
  // 移动端菜单
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay.classList.remove('show');
  });
  
  // 展开/收起子菜单
  document.querySelectorAll('.nav-item.has-submenu > .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      link.parentElement.classList.toggle('open');
    });
  });
  
  // 恢复上次访问页面
  const lastPage = localStorage.getItem('relay-tool-last-page') || 'home';
  showPage(lastPage);
  
  return showPage;
}

// ========== 标签页切换 ==========
export function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const btns = tabContainer.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const parent = tabContainer.parentElement;
        parent.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        parent.querySelector(`.tab-pane[data-tab="${target}"]`)?.classList.add('active');
      });
    });
  });
}

// ========== 折叠面板 ==========
export function initCollapsibles() {
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });
}

// ========== 数字计算工具 ==========
// 角度转弧度
export function degToRad(deg) {
  return deg * Math.PI / 180;
}

// 弧度转角度
export function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

// 格式化数字保留小数
export function formatNumber(num, decimals = 2) {
  if (isNaN(num) || !isFinite(num)) return '-';
  return Number(num).toFixed(decimals);
}

// 计算CT变比
export function calcCTRatio(primary, secondary) {
  return primary / secondary;
}

// 计算二次电流
export function calcSecondaryCurrent(primaryCurrent, ctRatio) {
  return primaryCurrent / ctRatio;
}

// GBK编码转HEX（纯查表实现，兼容所有现代浏览器，不依赖 TextEncoder('gbk')）
// 改为 async：首次调用时才加载 GBK 映射表（懒加载），不阻塞首屏
export async function strToGbkHex(str) {
  const { GBK_MAP } = await loadGbkMap();
  const parts = [];
  for (const ch of str) {
    const code = GBK_MAP[ch];
    if (code) {
      for (let i = 0; i < code.length; i += 2) {
        parts.push(code.substr(i, 2));
      }
    } else {
      parts.push('3F');
    }
  }
  return parts.join(' ');
}

// HEX转字符串（GBK，纯查表）
export async function gbkHexToStr(hex) {
  const { GBK_DECODE_MAP } = await loadGbkMap();
  const clean = hex.replace(/\s+/g, '').toUpperCase();
  let result = '';
  let i = 0;
  while (i < clean.length) {
    if (i + 1 < clean.length) {
      const b1 = parseInt(clean.substr(i, 2), 16);
      if (b1 < 0x80) {
        const c1 = GBK_DECODE_MAP[clean.substr(i, 2)];
        result += c1 || String.fromCharCode(b1);
        i += 2;
        continue;
      }
      if (i + 3 < clean.length) {
        const dbl = clean.substr(i, 4);
        const c2 = GBK_DECODE_MAP[dbl];
        if (c2) {
          result += c2;
          i += 4;
          continue;
        }
      }
    }
    const b = parseInt(clean.substr(i, 2), 16);
    result += String.fromCharCode(isNaN(b) ? 0x3F : b);
    i += 2;
  }
  return result;
}

// 导出CSV
export function exportToCSV(data, filename) {
  const csvContent = "data:text/csv;charset=utf-8," 
    + data.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 生成报告文本
export function generateReport(title, content, data) {
  let report = `═══════════════════════════════════════\n`;
  report += `  ${title}\n`;
  report += `  生成时间：${new Date().toLocaleString('zh-CN')}\n`;
  report += `═══════════════════════════════════════\n\n`;
  report += content + '\n\n';
  
  if (data && data.length) {
    report += `─────── 测试数据 ───────\n`;
    data.forEach((row, i) => {
      report += `${i+1}. ${Object.entries(row).map(([k,v]) => `${k}: ${v}`).join(' | ')}\n`;
    });
  }
  
  report += `\n═══════════════════════════════════════\n`;
  report += `  本报告由继电保护调试工具自动生成\n`;
  return report;
}

// 显示结果
export function showResult(containerId, content, type = 'success') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="result-box ${type}">
      <div class="result-title">计算结果</div>
      <div class="result-content">${content}</div>
    </div>
  `;
}
