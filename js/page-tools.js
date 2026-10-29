/**
 * 核相助手、报告工具、其他小工具模块
 */
import { strToGbkHex, gbkHexToStr, formatNumber, generateReport, degToRad } from './utils.js';

export function initToolsPage() {
  initPhaseCheckTool();
  initReportTool();
  initGbkTool();
  initSmallTools();
}

// ========== 二次核相助手 ==========
function initPhaseCheckTool() {
  const btn = document.getElementById('phaseCheckBtn');
  const resultDiv = document.getElementById('phaseCheckResult');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    const refVoltage = document.getElementById('refVoltage').value;
    const testPoint = document.getElementById('testPoint').value;
    const Uab = parseFloat(document.getElementById('Uab').value);
    const Ubc = parseFloat(document.getElementById('Ubc').value);
    const Uca = parseFloat(document.getElementById('Uca').value);
    const Uan = parseFloat(document.getElementById('Uan').value);
    const Ubn = parseFloat(document.getElementById('Ubn').value);
    const Ucn = parseFloat(document.getElementById('Ucn').value);
    const Un = parseFloat(document.getElementById('nVoltage').value);
    
    const Un_rated = 100; // 二次额定相电压
    const U_line_rated = 100 * Math.sqrt(3); // 二次额定线电压
    
    let html = '';
    let errors = [];
    let warnings = [];
    
    // 电压幅值检查
    if (Uan && Ubn && Ucn) {
      const phaseAvg = (Uan + Ubn + Ucn) / 3;
      html += `<p><strong>三相相电压测量值：</strong>Uan=${Uan}V, Ubn=${Ubn}V, Ucn=${Ucn}V，平均${formatNumber(phaseAvg)}V</p>`;
      if (Math.abs(phaseAvg - Un_rated) > 5) {
        errors.push(`相电压异常，正常应为约100V，当前平均${formatNumber(phaseAvg)}V`);
      } else {
        html += `<p style="color:var(--accent-primary);">✅ 相电压幅值正常</p>`;
      }
      
      // 三相不平衡度
      const maxDev = Math.max(Math.abs(Uan-phaseAvg), Math.abs(Ubn-phaseAvg), Math.abs(Ucn-phaseAvg)) / phaseAvg * 100;
      html += `<p>三相电压不平衡度：${formatNumber(maxDev)}%</p>`;
      if (maxDev > 5) {
        warnings.push(`三相电压不平衡度超过5%，建议检查PT二次回路`);
      }
    }
    
    // 线电压检查
    if (Uab && Ubc && Uca) {
      const lineAvg = (Uab + Ubc + Uca) / 3;
      html += `<p style="margin-top:8px;"><strong>三相线电压测量值：</strong>Uab=${Uab}V, Ubc=${Ubc}V, Uca=${Uca}V，平均${formatNumber(lineAvg)}V</p>`;
      if (Math.abs(lineAvg - U_line_rated) > 10) {
        errors.push(`线电压异常，正常应为约173V，当前平均${formatNumber(lineAvg)}V`);
      } else {
        html += `<p style="color:var(--accent-primary);">✅ 线电压幅值正常</p>`;
      }
    }
    
    // N线电压检查
    if (Un !== undefined) {
      html += `<p style="margin-top:8px;"><strong>N线对地电压：</strong>${Un}V</p>`;
      if (Un > 5) {
        warnings.push(`N线对地电压偏高(${Un}V)，可能存在多点接地或N线断线`);
      } else {
        html += `<p style="color:var(--accent-primary);">✅ N线接地正常</p>`;
      }
    }
    
    // 核相结论
    let conclusion = '';
    if (errors.length === 0 && warnings.length === 0) {
      conclusion = `<div class="result-box"><div class="result-title" style="color:var(--accent-primary);">✅ 核相结论：二次电压回路正常，相序正确</div><div class="result-content">${testPoint} 二次电压幅值、相序符合要求，可以投入运行。<br><br>${html}</div></div>`;
    } else {
      conclusion = `<div class="result-box danger"><div class="result-title" style="color:var(--accent-danger);">❌ 发现问题，需检查处理</div><div class="result-content">`;
      if (errors.length > 0) {
        conclusion += `<strong>严重问题：</strong><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
      }
      if (warnings.length > 0) {
        conclusion += `<strong>警告：</strong><ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul>`;
      }
      conclusion += `<br><strong>测量详情：</strong><br>${html}</div></div>`;
    }
    
    resultDiv.innerHTML = conclusion;
  });
}

// ========== 报告出具工具 ==========
function initReportTool() {
  const generateBtn = document.getElementById('generateReportBtn');
  const copyBtn = document.getElementById('copyReportBtn');
  const downloadBtn = document.getElementById('downloadReportBtn');
  const outputDiv = document.getElementById('reportOutput');
  if (!generateBtn) return;
  
  generateBtn.addEventListener('click', () => {
    const projectName = document.getElementById('projectName').value || '未命名项目';
    const stationType = document.getElementById('stationType').value;
    const voltageLevel = document.getElementById('voltageLevel').value;
    const testDate = document.getElementById('testDate').value || new Date().toLocaleDateString('zh-CN');
    const tester = document.getElementById('tester').value || '调试人员';
    const testItems = Array.from(document.querySelectorAll('.report-item-check:checked')).map(c => c.value);
    const conclusion = document.getElementById('reportConclusion').value || '所试项目均符合规程及设计要求，可以投入运行。';
    
    const content = `
一、工程概况
────────────────────────────────
工程名称：${projectName}
电站类型：${stationType}
电压等级：${voltageLevel}
试验日期：${testDate}
试验人员：${tester}
环境温度：${document.getElementById('envTemp').value || '25'}℃
相对湿度：${document.getElementById('envHumidity').value || '60'}%

二、试验依据
────────────────────────────────
1. GB 50150-2016 《电气装置安装工程电气设备交接试验标准》
2. DL/T 995-2016 《继电保护和安全自动装置检验规程》
3. GB/T 14285-2006 《继电保护和安全自动装置技术规程》
4. 设计图纸、厂家技术说明书
5. 相关设备出厂试验报告

三、试验项目及结果
────────────────────────────────
${testItems.map((item, i) => `${i+1}. ${item}：试验结果合格，符合规程要求`).join('\n')}

四、绝缘测试
────────────────────────────────
电流回路对地绝缘电阻：≥100MΩ（1000V兆欧表）
电压回路对地绝缘电阻：≥100MΩ（1000V兆欧表）
跳合闸回路对地绝缘电阻：≥50MΩ（500V兆欧表）
各回路之间绝缘电阻：≥100MΩ

五、整组传动试验
────────────────────────────────
模拟各类区内外故障，保护动作行为正确，跳闸出口正确，
断路器动作可靠，信号上传正确，动作时间符合整定要求。
带负荷测试差流合格，CT极性正确，相量图正确。

六、结论
────────────────────────────────
${conclusion}

试验人员签字：______________
监理人员签字：______________
建设单位签字：______________
日期：${testDate}
`;
    
    outputDiv.textContent = generateReport(`${projectName} 继电保护调试报告`, content);
  });
  
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(outputDiv.textContent).then(() => {
      copyBtn.textContent = '已复制!';
      setTimeout(() => copyBtn.textContent = '复制报告', 2000);
    });
  });
  
  downloadBtn?.addEventListener('click', () => {
    const blob = new Blob([outputDiv.textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `继电保护调试报告_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ========== GBK编码HEX转换工具 ==========
function initGbkTool() {
  const toHexBtn = document.getElementById('strToHexBtn');
  const toStrBtn = document.getElementById('hexToStrBtn');
  if (!toHexBtn) return;
  
  toHexBtn.addEventListener('click', async () => {
    const str = document.getElementById('inputStr').value;
    if (!str) return;
    const resultEl = document.getElementById('gbkResult');
    resultEl.innerHTML = `<div class="result-box" style="color:#64748b;">⏳ 首次使用正在加载 GBK 编码表，请稍候...</div>`;
    try {
      const hex = await strToGbkHex(str);
      resultEl.innerHTML = `<div class="code-output">${hex}</div>`;
    } catch(e) {
      resultEl.innerHTML = `<div class="result-box danger">转换失败：${e.message}</div>`;
    }
  });
  
  toStrBtn.addEventListener('click', async () => {
    const hex = document.getElementById('inputHex').value;
    if (!hex) return;
    const resultEl = document.getElementById('gbkResult');
    resultEl.innerHTML = `<div class="result-box" style="color:#64748b;">⏳ 首次使用正在加载 GBK 编码表，请稍候...</div>`;
    try {
      const str = await gbkHexToStr(hex);
      resultEl.innerHTML = `<div class="code-output">${str}</div>`;
    } catch(e) {
      resultEl.innerHTML = `<div class="result-box danger">转换失败：${e.message}，请检查HEX格式是否正确</div>`;
    }
  });
}

// ========== 其他小工具 ==========
function initSmallTools() {
  // 定值换算：一次值 ↔ 二次值
  const convertBtn = document.getElementById('convertSettingBtn');
  convertBtn?.addEventListener('click', () => {
    const type = document.getElementById('convertType').value;
    const value = parseFloat(document.getElementById('convertValue').value);
    const ctPrimary = parseFloat(document.getElementById('ctPrimaryConv').value);
    const ctSecondary = parseFloat(document.getElementById('ctSecondaryConv').value) || 5;
    const ptRatio = parseFloat(document.getElementById('ptRatio').value) || 1;
    
    if (!value || !ctPrimary) {
      document.getElementById('convertResult').innerHTML = `<div class="result-box danger">请输入需要转换的值和CT一次额定值</div>`;
      return;
    }
    
    const ctRatio = ctPrimary / ctSecondary;
    let result, label1, label2;
    
    if (type === 'primaryToSecondary') {
      if (document.getElementById('settingType').value === 'current') {
        result = value / ctRatio;
        label1 = '一次电流值';
        label2 = '二次电流值';
      } else {
        result = value / ptRatio;
        label1 = '一次电压值';
        label2 = '二次电压值';
      }
    } else {
      if (document.getElementById('settingType').value === 'current') {
        result = value * ctRatio;
        label1 = '二次电流值';
        label2 = '一次电流值';
      } else {
        result = value * ptRatio;
        label1 = '二次电压值';
        label2 = '一次电压值';
      }
    }
    
    document.getElementById('convertResult').innerHTML = `
      <div class="result-box">
        <div class="result-title">换算结果</div>
        <div class="result-content">
          ${label1}：${value} → ${label2}：<span class="value">${formatNumber(result, 3)}</span><br>
          CT变比：${ctPrimary}/${ctSecondary} = ${formatNumber(ctRatio)}${ptRatio > 1 ? `<br>PT变比：${formatNumber(ptRatio)}` : ''}
        </div>
      </div>
    `;
  });
  
  // 动作时间计算
  const timeCalcBtn = document.getElementById('calcTimeBtn');
  timeCalcBtn?.addEventListener('click', () => {
    const setTime = parseFloat(document.getElementById('setTime').value);
    const measuredTime = parseFloat(document.getElementById('measuredTime').value);
    if (isNaN(setTime) || isNaN(measuredTime)) return;
    
    const error = ((measuredTime - setTime) / setTime * 100).toFixed(2);
    const qualified = Math.abs(measuredTime - setTime) < 0.01 || Math.abs(error) < 5;
    
    document.getElementById('timeCalcResult').innerHTML = `
      <div class="result-box ${qualified ? '' : 'danger'}">
        <div class="result-title">动作时间校验结果</div>
        <div class="result-content">
          整定值：${setTime}s，实测值：${measuredTime}s，误差：<span class="${qualified ? 'value' : ''}" style="color:${qualified ? 'var(--accent-primary)' : 'var(--accent-danger)'}">${error}%</span><br>
          ${qualified ? '✅ 误差在允许范围内（≤±5%），合格' : '❌ 误差超出允许范围，不合格，需检查装置'}
        </div>
      </div>
    `;
  });
  
  // 阻抗换算
  const impedanceBtn = document.getElementById('calcImpedanceBtn');
  impedanceBtn?.addEventListener('click', () => {
    const voltage = parseFloat(document.getElementById('lineVoltage').value);
    const current = parseFloat(document.getElementById('lineCurrent').value);
    const lineLength = parseFloat(document.getElementById('lineLength').value);
    const unitZ = parseFloat(document.getElementById('unitImpedance').value) || 0.4;
    
    if (voltage && current) {
      const z1 = voltage / Math.sqrt(3) / current;
      let html = `线路一次阻抗：<span class="value">${formatNumber(z1, 2)}Ω</span><br>`;
      if (lineLength) {
        const totalZ = unitZ * lineLength;
        html += `按单位阻抗${unitZ}Ω/km计算，${lineLength}km线路总阻抗：<span class="value">${formatNumber(totalZ, 2)}Ω</span><br>`;
        html += `距离I段（80%）整定阻抗：<span class="value">${formatNumber(totalZ*0.8, 2)}Ω</span>`;
      }
      document.getElementById('impedanceResult').innerHTML = `<div class="result-box"><div class="result-title">阻抗计算结果</div><div class="result-content">${html}</div></div>`;
    }
  });
}
