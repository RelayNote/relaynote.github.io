/**
 * 继电保护调试指导手册与计算工具模块
 */
import { RELAY_STANDARDS, PROTECTION_KNOWLEDGE } from '../data/standards.js';
import { calcCTRatio, calcSecondaryCurrent, formatNumber, degToRad, radToDeg, showResult, initCollapsibles } from './utils.js';

export function initDebugPage() {
  initCollapsibles();
  initTripMatrix();
  initCTCalc();
  initLoadTestGuide();
  initVectorDiagram();
  renderDebugGuides();
}

// 渲染调试指导手册
function renderDebugGuides() {
  const container = document.getElementById('debugGuides');
  if (!container) return;
  
  const guides = [
    {
      name: "CT极性核查与带负荷测试",
      standard: "DL/T 995-2016 继电保护和安全自动装置检验规程",
      steps: [
        "试验前检查CT二次回路无开路、一点接地可靠，接线正确性",
        "测量CT二次回路绝缘电阻（>1MΩ），核对二次绕组变比、准确级",
        "一次通流试验：在一次侧通入已知电流（如100A），核对各侧二次电流幅值、相位正确",
        "带负荷测试条件：变压器/线路带上足够负荷（建议>10%额定电流）",
        "测量各相电流幅值、相位，绘制向量图，验证CT极性正确",
        "主变差动差流检查：差流不平衡度应<5%Ie，超过需检查CT极性、变比",
        "母差保护大差、小差差流检查，验证各间隔极性正确"
      ],
      notes: [
        "CT二次回路严禁开路，开路会产生高电压危及人身和设备安全",
        "测试相位时需以同一参考电压为基准",
        "注意CT减极性标注：P1进、P2出，S1出、S2进为减极性"
      ]
    },
    {
      name: "一次通流试验方法",
      standard: "GB 50150-2016 电气装置安装工程电气设备交接试验标准",
      steps: [
        "准备大电流发生器（升流器），根据试验电流选择合适容量",
        "将升流器一次侧串接在被试CT一次回路中，确保接触良好",
        "CT二次侧接入相位表/钳形电流表，记录各绕组二次电流",
        "缓慢升流至试验值（通常从10%开始，逐步升至额定值的20%~50%）",
        "核对CT变比：二次电流 = 一次电流 / CT变比，误差应<±5%",
        "检查差动回路差流，幅值近似为0则极性正确",
        "检查测量、计量、保护各绕组电流幅值、相位一致性"
      ],
      notes: [
        "通流前确认二次回路无开路，所有绕组接入对应装置或可靠短接",
        "升流过程中注意观察设备有无异常声响、发热",
        "一次通流同时验证CT二次回路接线正确性"
      ]
    },
    {
      name: "PT二次通压试验",
      standard: "DL/T 995-2016",
      steps: [
        "试验前断开PT一次侧隔离开关，确认一次无电压",
        "在PT二次侧通入额定二次电压（100V），注意相序正确",
        "测量保护装置、测量表计、计量装置各相电压幅值",
        "检查开口三角电压：正常三相平衡时开口三角电压<1V",
        "检查电压并列/切换装置动作正确性，PT并列时二次电压一致",
        "验证电压回路相序、相位正确，N线可靠接地"
      ],
      notes: [
        "二次通压时需防止电压反送到一次侧，一次侧必须可靠断开",
        "检查PT二次回路一点接地，严禁多点接地"
      ]
    },
    {
      name: "跳闸矩阵调试方法",
      standard: "DL/T 995-2016",
      steps: [
        "根据设计图纸编制跳闸矩阵表，明确每种保护动作应跳的断路器",
        "断开断路器操作电源，或接模拟断路器进行传动试验",
        "模拟每种保护动作，核对跳闸出口接点、断路器动作行为",
        "验证失灵启动、闭锁重合闸、联切负荷等辅助接点正确性",
        "逐一核对矩阵中每个勾选/未勾选出口的正确性，避免漏跳、误跳",
        "带断路器整组传动试验：模拟实际故障，检查从保护动作到断路器跳闸全链路"
      ],
      notes: [
        "跳闸矩阵是母线、主变保护调试的核心，必须100%正确",
        "注意不同运行方式（单母/双母/互联）下跳闸逻辑的正确性"
      ]
    },
    {
      name: "故障录波装置调试",
      standard: "DL/T 663-2019 电力系统故障动态记录装置通用技术条件",
      items: [
        "交流量精度校验：电压、电流幅值误差<±2%，相位误差<2°",
        "开关量变位分辨率校验：<1ms",
        "启动量校验：模拟故障量达到启动值时可靠启动录波",
        "记录时间校验：故障前0.1s、故障后3~10s连续记录",
        "对时功能校验：与GPS/北斗对时，误差<1ms",
        "远传功能校验：录波文件正确上传至调度主站"
      ]
    },
    {
      name: "稳控装置/PMU/SPDC调试要点",
      standards: ["GB/T 15148-2022", "GB/T 26865-2011"],
      items: [
        "PMU同步相量测量：幅值误差<±0.2%，相位误差<0.5°，对时精度<1μs",
        "稳控策略校验：根据策略表模拟故障，验证切机、切负荷出口正确性",
        "SPDC（同步相量数据集中器）：数据采集、转发功能验证，存储容量校验",
        "频率电压紧急控制：各轮次动作值、动作时间校验，误差<±0.02Hz，时间误差<±10ms",
        "SV/GOOSE报文（数字站）：检查采样值发送间隔、GOOSE订阅正确性",
        "通信通道测试：与调度主站通信正常，数据刷新周期符合要求"
      ]
    }
  ];
  
  container.innerHTML = guides.map(guide => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header">
        <div class="card-title">${guide.name}</div>
        <div class="card-subtitle">${guide.standard || guide.standards?.join(' / ') || ''}</div>
      </div>
      <div class="card-body">
        ${guide.steps ? `
          <h5 style="margin-bottom:8px;">📋 调试步骤</h5>
          <ol style="padding-left:20px; font-size:14px; color:var(--text-secondary); line-height:2;">
            ${guide.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        ` : ''}
        ${guide.items ? `
          <h5 style="margin:12px 0 8px;">📋 试验项目</h5>
          <ul style="padding-left:20px; font-size:14px; color:var(--text-secondary); line-height:2;">
            ${guide.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        ` : ''}
        ${guide.notes ? `
          <div class="alert alert-warning" style="margin-top:12px;">
            <span>⚠️</span>
            <div>
              <strong>注意事项：</strong>
              <ul style="margin-top:4px; padding-left:18px;">
                ${guide.notes.map(n => `<li>${n}</li>`).join('')}
              </ul>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// 跳闸矩阵交互
function initTripMatrix() {
  const table = document.getElementById('tripMatrixTable');
  if (!table) return;
  
  const protections = [
    "差动保护", "差动速断", "复压过流I段", "复压过流II段", 
    "零序过流I段", "零序过流II段", "间隙零序", "过负荷", "瓦斯保护", "温度保护"
  ];
  const breakers = ["高压侧断路器", "中压侧断路器", "低压侧断路器", "母联断路器", "闭锁调压", "启动风冷", "闭锁重合闸"];
  
  let html = `<thead><tr><th>保护名称</th>${breakers.map(b => `<th>${b}</th>`).join('')}</tr></thead><tbody>`;
  protections.forEach(prot => {
    html += `<tr><td><strong>${prot}</strong></td>`;
    breakers.forEach(() => {
      html += `<td><input type="checkbox" class="trip-checkbox"></td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody>`;
  table.innerHTML = html;
  
  // 预设默认值
  const defaults = {
    "差动保护": [1,1,1,1,0,0,1],
    "差动速断": [1,1,1,1,0,0,1],
    "瓦斯保护": [1,1,1,1,0,0,1],
    "复压过流I段": [1,1,1,1,0,1,1],
    "复压过流II段": [1,1,1,0,0,0,0],
    "零序过流I段": [1,1,0,1,0,0,1],
    "零序过流II段": [1,0,0,0,0,0,0],
    "间隙零序": [1,1,1,0,0,0,0],
    "过负荷": [0,0,0,0,1,1,0],
    "温度保护": [0,0,0,0,1,1,0]
  };
  
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach((row, idx) => {
    const protName = protections[idx];
    const checkboxes = row.querySelectorAll('.trip-checkbox');
    if (defaults[protName]) {
      defaults[protName].forEach((v, i) => {
        checkboxes[i].checked = v === 1;
      });
    }
  });
}

// CT变比计算工具
function initCTCalc() {
  const btn = document.getElementById('calcCTBtn');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    const primary = parseFloat(document.getElementById('ctPrimary').value);
    const secondary = parseFloat(document.getElementById('ctSecondary').value);
    const loadCurrent = parseFloat(document.getElementById('loadCurrent').value);
    
    if (!primary || !secondary) {
      showResult('ctResult', '请输入CT一次、二次额定电流', 'danger');
      return;
    }
    
    const ratio = calcCTRatio(primary, secondary);
    let html = `<ul>`;
    html += `<li>CT变比：<span class="value">${primary}/${secondary} = ${formatNumber(ratio)}</span></li>`;
    
    if (loadCurrent) {
      const secI = calcSecondaryCurrent(loadCurrent, ratio);
      html += `<li>当一次电流为 ${loadCurrent}A 时，二次电流为：<span class="value">${formatNumber(secI, 3)}A</span></li>`;
      const percent = (secI / secondary * 100).toFixed(1);
      html += `<li>二次电流占额定值：${percent}% ${percent < 10 ? '<span style="color:var(--accent-warning)">（建议负荷≥10%再做带负荷测试）</span>' : '<span style="color:var(--accent-primary)">（满足带负荷测试条件）</span>'}</li>`;
    }
    
    html += `</ul>`;
    html += `<div style="margin-top:8px; font-size:13px; color:var(--text-muted);">标准依据：DL/T 995-2016 变比误差应≤±5%</div>`;
    showResult('ctResult', html);
  });
}

// 带负荷测试参考
function initLoadTestGuide() {
  const container = document.getElementById('loadTestPhases');
  if (!container) return;
  
  const phaseData = [
    { component: "主变差动（Ynd11）", phaseA: "0°", phaseB: "-120°", phaseC: "120°", diff: "<5%Ie", note: "高压侧电流超前低压侧30°" },
    { component: "线路光纤差动", phaseA: "180°", phaseB: "180°", phaseC: "180°", diff: "<0.1In", note: "两侧电流相位差180°" },
    { component: "母线大差", phaseA: "-", phaseB: "-", phaseC: "-", diff: "<0.05In", note: "所有连接元件电流矢量和≈0" },
    { component: "母差小差", phaseA: "-", phaseB: "-", phaseC: "-", diff: "<0.05In", note: "该母线上元件电流矢量和≈0" },
    { component: "电容器差压", phaseA: "0°", phaseB: "-120°", phaseC: "120°", diff: "<1V", note: "开口三角不平衡电压" }
  ];
  
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>保护类型</th>
          <th>A相相位参考</th>
          <th>B相相位参考</th>
          <th>C相相位参考</th>
          <th>不平衡量要求</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        ${phaseData.map(row => `
          <tr>
            <td><strong>${row.component}</strong></td>
            <td>${row.phaseA}</td>
            <td>${row.phaseB}</td>
            <td>${row.phaseC}</td>
            <td><span class="tag tag-primary">${row.diff}</span></td>
            <td style="font-size:13px; color:var(--text-secondary);">${row.note}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// 核相向量图绘制
function initVectorDiagram() {
  const btn = document.getElementById('drawVectorBtn');
  const svg = document.getElementById('vectorSvg');
  if (!btn || !svg) return;
  
  function drawVectors(angleA, angleB, angleC) {
    const cx = 200, cy = 200, radius = 150;
    const colors = { A: '#ef4444', B: '#10b981', C: '#3b82f6', N: '#94a3b8' };
    
    function getPoint(angleDeg, r = radius) {
      const rad = degToRad(angleDeg - 90); // 0度向上
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad)
      };
    }
    
    let svgContent = `
      <!-- 坐标轴 -->
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--border-color)" stroke-dasharray="4,4"/>
      <line x1="${cx}" y1="20" x2="${cx}" y2="380" stroke="var(--border-color)" stroke-width="1"/>
      <line x1="20" y1="${cy}" x2="380" y2="${cy}" stroke="var(--border-color)" stroke-width="1"/>
      <text x="${cx+5}" y="30" fill="var(--text-muted)" font-size="12">0°</text>
      <text x="380" y="${cy-5}" fill="var(--text-muted)" font-size="12" text-anchor="end">90°</text>
      <text x="${cx+5}" y="385" fill="var(--text-muted)" font-size="12">180°</text>
      <text x="10" y="${cy-5}" fill="var(--text-muted)" font-size="12">270°</text>
    `;
    
    const phases = [
      { name: 'Ia', angle: angleA, color: colors.A },
      { name: 'Ib', angle: angleB, color: colors.B },
      { name: 'Ic', angle: angleC, color: colors.C }
    ];
    
    phases.forEach(p => {
      const p1 = getPoint(p.angle, 0);
      const p2 = getPoint(p.angle);
      // 箭头
      const arrowSize = 10;
      const arrowAngle = degToRad(p.angle - 90);
      const p3 = {
        x: p2.x - arrowSize * Math.cos(arrowAngle - 0.4),
        y: p2.y - arrowSize * Math.sin(arrowAngle - 0.4)
      };
      const p4 = {
        x: p2.x - arrowSize * Math.cos(arrowAngle + 0.4),
        y: p2.y - arrowSize * Math.sin(arrowAngle + 0.4)
      };
      
      svgContent += `
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${p.color}" stroke-width="3"/>
        <polygon points="${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}" fill="${p.color}"/>
        <text x="${p2.x + 8*Math.cos(arrowAngle)}" y="${p2.y + 8*Math.sin(arrowAngle) + 5}" fill="${p.color}" font-weight="bold">${p.name} (${p.angle}°)</text>
      `;
    });
    
    svgContent += `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--text-primary)"/>`;
    svg.innerHTML = svgContent;
  }
  
  // 默认正相序
  drawVectors(0, 240, 120);
  
  btn.addEventListener('click', () => {
    const angleA = parseFloat(document.getElementById('angleA').value) || 0;
    const angleB = parseFloat(document.getElementById('angleB').value) || 240;
    const angleC = parseFloat(document.getElementById('angleC').value) || 120;
    drawVectors(angleA, angleB, angleC);
    
    // 检查相序
    let phaseSeq = '';
    const diffAB = (angleB - angleA + 360) % 360;
    const diffBC = (angleC - angleB + 360) % 360;
    if (Math.abs(diffAB - 120) < 5 && Math.abs(diffBC - 120) < 5) {
      phaseSeq = '<span style="color:var(--accent-primary)">✅ 正相序（A-B-C）正确</span>';
    } else if (Math.abs(diffAB - 240) < 5 && Math.abs(diffBC - 240) < 5) {
      phaseSeq = '<span style="color:var(--accent-warning)">⚠️ 逆相序（A-C-B），需检查相序</span>';
    } else {
      phaseSeq = '<span style="color:var(--accent-danger)">❌ 相位异常，需检查CT接线极性</span>';
    }
    
    document.getElementById('vectorResult').innerHTML = `
      <div class="result-box">
        <div class="result-title">相序判断结果</div>
        <div class="result-content">
          ${phaseSeq}<br>
          三相相位差：Ua-Ub: ${diffAB.toFixed(1)}°，Ub-Uc: ${diffBC.toFixed(1)}°<br>
          <span style="font-size:12px; color:var(--text-muted);">提示：二次核相时，若电压/电流相位与参考值相差180°，通常为CT极性接反</span>
        </div>
      </div>
    `;
  });
}
