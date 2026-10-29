/**
 * 通用工具函数库
 */

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
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
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

// GBK编码转HEX
export function strToGbkHex(str) {
  // 使用TextEncoder GBK编码
  const encoder = new TextEncoder('gbk');
  const bytes = encoder.encode(str);
  return Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

// HEX转字符串（GBK）
export function gbkHexToStr(hex) {
  const cleanHex = hex.replace(/\s/g, '');
  const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(h => parseInt(h, 16)));
  const decoder = new TextDecoder('gbk');
  return decoder.decode(bytes);
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
