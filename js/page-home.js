/**
 * 首页模块
 */
import { RELAY_STANDARDS } from '../data/standards.js';

export function initHomePage() {
  // 渲染标准概览
  const standardsContainer = document.getElementById('homeStandards');
  if (standardsContainer) {
    const standardCategories = [
      { name: '通用基础', count: RELAY_STANDARDS.general.length, icon: '📘' },
      { name: '元件保护', count: RELAY_STANDARDS.component.length, icon: '⚡' },
      { name: '安稳装置', count: RELAY_STANDARDS.automation.length, icon: '🛡️' },
      { name: '测量同步', count: RELAY_STANDARDS.measurement.length, icon: '📡' },
      { name: '新能源储能', count: RELAY_STANDARDS.newEnergy.length, icon: '🔋' },
      { name: '二次回路', count: RELAY_STANDARDS.secondaryCircuit.length, icon: '🔌' }
    ];
    
    standardsContainer.innerHTML = standardCategories.map(cat => `
      <div class="card" style="padding: 20px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 12px;">${cat.icon}</div>
        <div style="font-weight: 600; margin-bottom: 4px;">${cat.name}</div>
        <div style="color: var(--text-muted); font-size: 13px;">${cat.count} 项现行标准</div>
      </div>
    `).join('');
  }
  
  // 功能快速入口点击事件在导航初始化时统一处理
}
