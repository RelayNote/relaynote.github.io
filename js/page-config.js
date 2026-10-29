/**
 * 全站保护配置与知识讲解模块
 */
import { RELAY_STANDARDS, PROTECTION_KNOWLEDGE } from '../data/standards.js';
import { initCollapsibles } from './utils.js';

export function initConfigPage() {
  // 渲染标准列表
  renderStandards();
  // 渲染保护知识
  renderProtectionKnowledge();
  // 初始化折叠面板
  initCollapsibles();
}

function renderStandards() {
  const container = document.getElementById('standardsList');
  if (!container) return;
  
  const allStandards = [
    ...RELAY_STANDARDS.general,
    ...RELAY_STANDARDS.component,
    ...RELAY_STANDARDS.automation,
    ...RELAY_STANDARDS.measurement,
    ...RELAY_STANDARDS.newEnergy,
    ...RELAY_STANDARDS.secondaryCircuit,
    ...RELAY_STANDARDS.reactiveCompensation
  ];
  
  container.innerHTML = allStandards.map(std => `
    <tr>
      <td><strong>${std.code}</strong></td>
      <td>${std.name}</td>
      <td style="font-size:13px; color:var(--text-secondary);">${std.desc}</td>
    </tr>
  `).join('');
}

function renderProtectionKnowledge() {
  const container = document.getElementById('protectionKnowledge');
  if (!container) return;
  
  const knowledge = PROTECTION_KNOWLEDGE;
  
  container.innerHTML = `
    <!-- 主变保护 -->
    <div class="knowledge-card card">
      <h4>🔌 ${knowledge.mainTransformer.name}</h4>
      <div class="standard-block">GB/T 14598.300-2023 电力变压器保护技术导则、GB/T 50062-2008 电力装置的继电保护和自动装置设计规范</div>
      
      ${knowledge.mainTransformer.configs.map(config => `
        <div class="collapsible">
          <div class="collapsible-header">
            <span><strong>${config.name}</strong></span>
            <span class="collapsible-arrow">▼</span>
          </div>
          <div class="collapsible-content">
            ${config.principle ? `<p style="margin-bottom:8px;"><strong>工作原理：</strong>${config.principle}</p>` : ''}
            ${config.scope ? `<p style="margin-bottom:8px;"><strong>保护范围：</strong>${config.scope}</p>` : ''}
            ${config.types ? `
              <p style="margin-bottom:8px;"><strong>保护类型：</strong></p>
              <ul>
                ${config.types.map(t => `<li>${t}</li>`).join('')}
              </ul>
            ` : ''}
            ${config.desc ? `<p style="margin-bottom:8px;">${config.desc}</p>` : ''}
            ${config.considerations ? `
              <p style="margin-bottom:8px; margin-top:12px;"><strong>调试注意事项：</strong></p>
              <ul>
                ${config.considerations.map(c => `<li>${c}</li>`).join('')}
              </ul>
            ` : ''}
            ${config.setting ? `
              <p style="margin-bottom:8px; margin-top:12px;"><strong>整定参考值：</strong></p>
              <ul>
                ${config.setting.map(s => `<li>${s}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- 母线保护 -->
    <div class="knowledge-card card">
      <h4>🔲 ${knowledge.busbar.name}</h4>
      <div class="standard-block">DL/T 670-2010 母线保护装置通用技术条件</div>
      
      <p style="margin-bottom:12px;"><strong>工作原理：</strong>${knowledge.busbar.principle}</p>
      
      <p style="margin:12px 0 8px;"><strong>保护类型：</strong></p>
      <div class="grid-2" style="margin-bottom:16px;">
        ${knowledge.busbar.types.map(t => `
          <div class="card" style="padding:14px;">
            <div style="font-weight:600; margin-bottom:4px;">${t.name}</div>
            <div style="font-size:13px; color:var(--text-secondary);">${t.features}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="collapsible">
        <div class="collapsible-header">
          <span><strong>跳闸矩阵说明</strong></span>
          <span class="collapsible-arrow">▼</span>
        </div>
        <div class="collapsible-content">
          <p>${knowledge.busbar.tripMatrix.desc}</p>
          <ul style="margin-top:8px;">
            ${knowledge.busbar.tripMatrix.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="collapsible" style="margin-top:8px;">
        <div class="collapsible-header">
          <span><strong>主要调试试验项目</strong></span>
          <span class="collapsible-arrow">▼</span>
        </div>
        <div class="collapsible-content">
          <ul>
            ${knowledge.busbar.testItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 线路保护 -->
    <div class="knowledge-card card">
      <h4>📏 ${knowledge.line.name}</h4>
      <div class="standard-block">DL/T 584-2017 3kV～110kV电网继电保护装置运行整定规程、DL/T 559-2018 220kV～750kV电网继电保护装置运行整定规程</div>
      
      <div style="margin-top:12px;">
        ${knowledge.line.protections.map(p => `
          <div class="collapsible">
            <div class="collapsible-header">
              <span><strong>${p.name}</strong> <span class="tag tag-blue">${p.voltage || ''}</span></span>
              <span class="collapsible-arrow">▼</span>
            </div>
            <div class="collapsible-content">
              <p><strong>原理：</strong>${p.principle}</p>
              ${p.types ? `
                <p style="margin-top:8px;"><strong>类型：</strong>${p.types.join('、')}</p>
                <p style="margin-top:4px; font-size:13px; color:var(--text-secondary);">${p.desc}</p>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- 备自投 -->
    <div class="knowledge-card card">
      <h4>🔄 ${knowledge.bzt.name}</h4>
      <div class="standard-block">DL/T 526-2013 备用电源自动投入装置技术条件</div>
      
      <p style="margin-bottom:12px;"><strong>工作原理：</strong>${knowledge.bzt.principle}</p>
      
      <p style="margin:12px 0 8px;"><strong>常见类型：</strong></p>
      <ul style="margin-bottom:12px;">
        ${knowledge.bzt.commonTypes.map(t => `<li>${t}</li>`).join('')}
      </ul>
      
      <p style="margin:12px 0 8px;"><strong>动作条件（必须同时满足）：</strong></p>
      <ul style="margin-bottom:12px;">
        ${knowledge.bzt.conditions.map(c => `<li>${c}</li>`).join('')}
      </ul>
      
      <div class="collapsible">
        <div class="collapsible-header">
          <span><strong>主要调试试验项目</strong></span>
          <span class="collapsible-arrow">▼</span>
        </div>
        <div class="collapsible-content">
          <ul>
            ${knowledge.bzt.testItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 频率电压紧急控制 -->
    <div class="knowledge-card card">
      <h4>📊 ${knowledge.freqVoltageControl.name}</h4>
      <div class="standard-block">DL/T 723-2000 电力系统安全稳定控制技术导则、GB/T 15148-2022 电力系统安全稳定控制装置通用技术条件</div>
      
      <p style="margin-bottom:12px;"><strong>工作原理：</strong>${knowledge.freqVoltageControl.principle}</p>
      
      <p style="margin:12px 0 8px;"><strong>典型轮次配置：</strong></p>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>轮次</th>
              <th>动作值</th>
              <th>延时</th>
              <th>动作行为</th>
            </tr>
          </thead>
          <tbody>
            ${knowledge.freqVoltageControl.rounds.map((r, i) => `
              <tr>
                <td>第${i+1}轮</td>
                <td>${r.freq ? r.freq + 'Hz' : r.voltage}</td>
                <td>${r.delay || '-'}</td>
                <td>${r.load || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 主接线图配置说明 -->
    <div class="knowledge-card card">
      <h4>🗺️ 典型接线保护配置原则</h4>
      
      <div class="alert alert-info" style="margin-top:12px;">
        <span>💡</span>
        <span>根据不同电压等级和主接线形式，保护配置需遵循GB/T 14285-2006的规定，以下为典型配置方案：</span>
      </div>
      
      <div class="grid-2" style="margin-top:16px;">
        <div>
          <h5 style="margin-bottom:8px;">110kV单母线分段接线</h5>
          <ul style="font-size:14px; color:var(--text-secondary); line-height:1.8;">
            <li>母线：比率制动式母差保护</li>
            <li>进线：光纤差动/距离保护</li>
            <li>主变：差动+瓦斯+复合电压过流+零序保护</li>
            <li>分段（母联）：充电保护+过流保护</li>
            <li>备自投：母联备自投/进线备自投</li>
            <li>稳控/低压低频减载配置</li>
            <li>故障录波装置</li>
          </ul>
        </div>
        <div>
          <h5 style="margin-bottom:8px;">光储电站升压站典型配置</h5>
          <ul style="font-size:14px; color:var(--text-secondary); line-height:1.8;">
            <li>35kV集电线路：过流+零序保护</li>
            <li>储能/光伏SVG单元：本体保护+联闭锁</li>
            <li>接地变：零序过流+间隙保护</li>
            <li>站用变：电流速断+过流+瓦斯</li>
            <li>频率电压紧急控制（防孤岛）</li>
            <li>PMU同步相量测量</li>
            <li>电能量采集与SPDC</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}
