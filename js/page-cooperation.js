/**
 * 全站保护配合、电气联闭锁及本体调试模块
 */
import { initCollapsibles } from './utils.js';

export function initCooperationPage() {
  renderInterlockContent();
  renderBodyDebugGuides();
  initCollapsibles();
}

function renderInterlockContent() {
  const container = document.getElementById('interlockContent');
  if (!container) return;
  
  const interlocks = [
    {
      name: "高压开关柜五防闭锁",
      standard: "GB 50171-2012、DL/T 5136-2012",
      rules: [
        "防止误分、误合断路器：操作回路需经开关位置、电气联锁闭锁",
        "防止带负荷拉、合隔离开关：断路器在合位时闭锁隔离开关操作",
        "防止带电挂（合）接地线（接地刀闸）：带电时闭锁接地刀闸合闸",
        "防止带接地线（接地刀闸）合断路器（隔离开关）：接地刀闸合位时闭锁断路器、隔离开关合闸",
        "防止误入带电间隔：柜门与接地刀闸/隔离开关机械闭锁，未接地无法开门"
      ],
      electricalInterlock: [
        "线路侧接地刀闸 → 闭锁线路隔离开关、断路器合闸",
        "母线侧接地刀闸 → 闭锁母线侧隔离开关、母联断路器合闸",
        "断路器合位 → 闭锁两侧隔离开关操作",
        "隔离开关位置接点 → 串入对应断路器操作回路",
        "手车柜：试验位置/工作位置行程接点闭锁断路器分合"
      ]
    },
    {
      name: "主变联闭锁逻辑",
      rules: [
        "主变三侧断路器跳闸联跳各侧隔离开关（可选）",
        "重瓦斯、差动保护动作闭锁有载调压",
        "温度过高启动风冷、闭锁调压，超温跳闸",
        "压力释放动作跳闸（可选报警）",
        "油位异常报警，严重低油位闭锁调压",
        "风冷全停延时跳闸（根据变压器容量，一般20~60min）"
      ],
      tripChain: "主变任意主保护动作 → 跳三侧断路器 → 联跳相邻断路器（如中压侧母联）→ 启动风冷 → 闭锁有载调压 → 发事故信号"
    },
    {
      name: "母联/分段闭锁逻辑",
      rules: [
        "母联充电保护动作跳母联，不闭锁其他元件",
        "母联失灵保护动作跳该段母线上所有元件",
        "母联死区保护动作跳两段母线所有连接元件",
        "双母线倒闸操作时，母联CT被短接，自动投入互联压板，闭锁小差选择",
        "PT并列：仅当母联合位、两段母线PT均正常时允许并列"
      ]
    },
    {
      name: "SVG/无功补偿联闭锁",
      standard: "GB/T 30137-2013 静止无功发生器(SVG)技术导则",
      rules: [
        "SVG保护动作跳并网断路器，闭锁SVG脉冲",
        "交流侧过压、欠压、过频、欠频保护跳闸",
        "直流侧过压、过温保护跳闸",
        "柜门打开闭锁装置启动，安全联锁",
        "冷却系统故障延时停机",
        "电网电压跌落超过阈值时低电压穿越，不立即跳闸"
      ]
    },
    {
      name: "接地变/站用变联闭锁",
      rules: [
        "接地变零序过流保护动作跳接地变断路器，闭锁相关备自投",
        "站用变保护动作跳站用变低压侧开关，联动备用电源切换",
        "接地变与消弧线圈联调：位移电压、脱谐度测量"
      ]
    },
    {
      name: "光储电站防孤岛保护联闭锁",
      standard: "GB/T 19964-2024、GB/T 36547-2018",
      rules: [
        "频率电压紧急控制动作切除光伏/储能逆变器",
        "防孤岛保护动作跳并网点断路器",
        "并网点断路器跳闸联跳所有光伏、储能支路",
        "SVG与储能协调控制，电压异常时快速响应",
        "AGC/AVC指令与本地保护闭锁：保护动作时闭锁远控"
      ]
    }
  ];
  
  container.innerHTML = interlocks.map(il => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header">
        <div class="card-title">🔒 ${il.name}</div>
        ${il.standard ? `<div class="card-subtitle">${il.standard}</div>` : ''}
      </div>
      <div class="card-body">
        <h5 style="margin-bottom:8px;">闭锁规则</h5>
        <ul style="padding-left:20px; font-size:14px; color:var(--text-secondary); line-height:2;">
          ${il.rules.map(r => `<li>${r}</li>`).join('')}
        </ul>
        
        ${il.electricalInterlock ? `
          <h5 style="margin:16px 0 8px;">电气联闭锁接点逻辑</h5>
          <ul style="padding-left:20px; font-size:14px; color:var(--text-secondary); line-height:2;">
            ${il.electricalInterlock.map(e => `<li>${e}</li>`).join('')}
          </ul>
        ` : ''}
        
        ${il.tripChain ? `
          <div class="result-box" style="margin-top:16px;">
            <div class="result-title">跳闸链路逻辑</div>
            <div class="result-content">${il.tripChain}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function renderBodyDebugGuides() {
  const container = document.getElementById('bodyDebugContent');
  if (!container) return;
  
  const guides = [
    {
      name: "主变压器本体调试",
      items: [
        {
          title: "本体信号传动试验",
          steps: [
            "瓦斯继电器：按压探针模拟轻瓦斯报警、重瓦斯跳闸，检查信号与出口",
            "温度指示器：模拟绕组温度、油面温度升高，检查报警、启动风冷、闭锁调压、超温跳闸接点",
            "油位计：模拟油位过高、过低，检查报警信号",
            "压力释放阀：模拟压力释放动作，检查报警/跳闸接点（根据设计要求）",
            "有载调压机构：模拟调压闭锁、调压超时、油位异常信号"
          ]
        },
        {
          title: "分接开关调试",
          steps: [
            "手动/电动升降操作检查，档位显示正确",
            "上下极限位置限位功能验证，到极限位置不能继续操作",
            "调压过程中遇故障（如瓦斯动作、过流）可靠闭锁调压",
            "就地/远方切换功能验证，档位信号远传正确",
            "两个方向操作顺序检查，无滑档、连调现象"
          ]
        },
        {
          title: "风冷控制系统调试",
          steps: [
            "手动启/停各组风扇、油泵，转向正确、无异常声响",
            "自动控制：温度达到定值时自动启动辅助冷却器，温度降低后自动停止",
            "工作冷却器故障时，备用冷却器自动投入",
            "电源自动切换：工作电源故障时备用电源自动投入，信号正确",
            "风冷全停延时跳闸校验：整定时间一般为20~60min"
          ]
        },
        {
          title: "非电量保护传动",
          steps: [
            "逐一模拟每个非电量保护动作，核对出口接点、跳闸断路器",
            "重瓦斯、压力释放等跳闸型非电量保护：跳三侧断路器",
            "轻瓦斯、温度高报警等信号型：只发信号不跳闸",
            "检查非电量保护动作信号上传至监控系统正确",
            "整组传动：与电气量保护配合，验证跳闸逻辑正确"
          ]
        }
      ],
      standard: "GB 50150-2016、GB/T 14598.300-2023"
    },
    {
      name: "SVG静止无功发生器本体调试",
      items: [
        {
          title: "上电前检查",
          steps: [
            "检查功率模块、控制柜接线正确，绝缘电阻合格",
            "检查冷却系统（风冷/水冷）管路、接线正确，无渗漏",
            "检查启动电阻、接触器、预充电回路正常",
            "检查接地可靠，柜门安全联锁有效",
            "核对控制电源、驱动电源电压等级正确"
          ]
        },
        {
          title: "控制单元调试",
          steps: [
            "控制电源上电，检查装置启动正常，无告警",
            "模拟量采样校验：电网电压、电流、直流电压采样精度误差<±2%",
            "开关量输入输出校验：所有开入、开出接点传动正确",
            "脉冲触发试验：检查各IGBT脉冲正常，相序正确",
            "保护定值校验：过压、欠压、过流、过温、直流过压等保护定值校验"
          ]
        },
        {
          title: "空载与带载调试",
          steps: [
            "空载上电：通过预充电电阻给直流电容充电，检查充电过程正常",
            "直流电压闭环控制：直流电压稳定在额定值，纹波<5%",
            "开环并网试验：小电流并网，检查输出电流波形、相位正确",
            "无功功率控制：给定无功指令，检查输出无功功率跟踪精度，响应时间<30ms",
            "谐波补偿功能验证：投入谐波补偿，检查电流谐波畸变率改善",
            "低电压穿越试验：模拟电网电压跌落，验证装置穿越能力"
          ]
        },
        {
          title: "保护功能试验",
          steps: [
            "交流过压/欠压保护：电压越限时可靠停机跳闸",
            "交流过流保护：过流时快速封锁脉冲跳闸",
            "直流过压保护：直流电压超过定值可靠保护",
            "模块过温保护：温度过高降额运行，超温停机",
            "柜门打开保护：运行中开门立即停机"
          ]
        }
      ],
      standard: "GB/T 30137-2013、DL/T 1216-2013"
    },
    {
      name: "接地变/消弧线圈本体调试",
      items: [
        {
          title: "接地变本体试验",
          steps: [
            "绕组直流电阻测量，与出厂值比较变化<±2%",
            "绝缘电阻、吸收比测量，绝缘电阻≥1000MΩ",
            "变比试验、接线组别试验，与铭牌一致",
            "工频耐压试验，按GB 50150要求执行",
            "空载试验，测量空载电流、空载损耗"
          ]
        },
        {
          title: "消弧线圈调试",
          steps: [
            "分接开关档位调节，检查档位指示正确",
            "自动调谐功能：测量系统电容电流，自动调节补偿档位",
            "脱谐度测量：一般要求脱谐度<10%，残流<10A",
            "位移电压测量：正常运行时中性点位移电压<15%相电压",
            "联调试验：单相接地试验时消弧线圈正确动作，补偿接地电流"
          ]
        }
      ],
      standard: "GB 50150-2016、DL/T 5136-2012"
    }
  ];
  
  container.innerHTML = guides.map(guide => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header">
        <div class="card-title">🔧 ${guide.name}</div>
        <div class="card-subtitle">${guide.standard}</div>
      </div>
      <div class="card-body">
        ${guide.items.map(item => `
          <div class="collapsible">
            <div class="collapsible-header">
              <span><strong>${item.title}</strong></span>
              <span class="collapsible-arrow">▼</span>
            </div>
            <div class="collapsible-content">
              <ol style="padding-left:20px; font-size:14px; color:var(--text-secondary); line-height:2;">
                ${item.steps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}
