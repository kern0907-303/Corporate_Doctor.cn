// =================================================================
// 🔴 CONFIG (请确认 Key 已填写正确)
// =================================================================
const COZE_CONFIG = {
    api_url: 'https://api.coze.cn/open_api/v2/chat',
    // 您的 PAT Token (保持原样)
    api_token: 'pat_Tv62rVIFCCSmohdrOe7nVY3qCrJ4tHCq6PzAf2XgCkQch2FZXuqIPr4EuNyVuiIP', 
    // 您的 Bot ID (保持原样)
    bot_id: '7592910227734200320' 
};

// =================================================================
// 🎨 行业人设字典 (新增功能：让 AI 说行话)
// =================================================================
const INDUSTRY_PERSONAS = {
    "科技": "请扮演一位资深 CTO 或互联网产品专家。在解释瓶颈时，请使用'技术债'、'敏捷迭代'、'MVP'、'系统架构'等科技术语进行比喻。强调速度与扩展性的平衡。",
    "制造": "请扮演一位精益生产管理专家。在解释瓶颈时，请使用'库存周转'、'流水线瓶颈'、'良率'、'产能利用率'等术语。强调流程优化与降本增效。",
    "零售": "请扮演一位新零售运营专家。在解释瓶颈时，请使用'人货场'、'坪效'、'转化率'、'客单价'等术语。强调流量获取与客户体验。",
    "服务": "请扮演一位专业服务事务所合伙人。在解释瓶颈时，请使用'人效'、'交付质量'、'客户满意度'、'知识沉淀'等术语。强调人才密度与服务标准化。",
    "金融": "请扮演一位风控专家或投行顾问。在解释瓶颈时，请使用'杠杆率'、'风险敞口'、'ROI'、'资产配置'等术语。强调资金安全与复利效应。",
    "地产": "请扮演一位地产项目总经理。在解释瓶颈时，请使用'周转快'、'现金回正'、'工程节点'、'去化率'等术语。强调资金链与项目周期。",
    "医疗": "请扮演一位医院院长或医疗顾问。在解释瓶颈时，请使用'临床路径'、'对症下药'、'医患关系'、'疗程'等术语。强调专业度与信任感。",
    "法律": "请扮演一位资深律师。在解释瓶颈时，请使用'合规性'、'风险隔离'、'契约精神'等术语。语言要严谨、逻辑性强。",
    "餐饮": "请扮演一位连锁餐饮创始人。在解释瓶颈时，请使用'翻台率'、'中央厨房'、'SOP标准化'、'单店模型'等术语。强调复制能力与口味一致性。",
    "文娱": "请扮演一位金牌制作人。在解释瓶颈时，请使用'爆款逻辑'、'IP孵化'、'粉丝粘性'、'内容生命周期'等术语。强调创意变现与流量留存。",
    "其他": "请扮演一位通用的顶级商业咨询顾问（如麦肯锡风格）。语言专业、客观、直击痛点。"
};

// =================================================================
// 1. 导航逻辑
// =================================================================
let currentStep = 0;
const totalSteps = 14; 

// =================================================================
// 1.5 每题最多选择 N 项 + 提示文案
// =================================================================
const MAX_CHOICES_PER_QUESTION = 3; 
const QUESTION_HINT_TEXT = '提示：请选择最关键的 3 项，以利系统精准诊断。';

function enforceMaxChoicesPerQuestion() {
    const boxes = document.querySelectorAll('input[type="checkbox"][name]');

    boxes.forEach(box => {
        if (box.dataset.maxChoiceBound === '1') return;
        box.dataset.maxChoiceBound = '1';

        box.addEventListener('change', (e) => {
            const name = e.target.name;
            if (!name) return;
            if (!/^q\d+$/i.test(name)) return;

            const checked = document.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`);
            if (checked.length > MAX_CHOICES_PER_QUESTION) {
                e.target.checked = false;
                alert(`每题最多选择 ${MAX_CHOICES_PER_QUESTION} 项，请先取消一个选项再继续。`);
            }
        });
    });
}

function injectQuestionHints() {
    const cards = document.querySelectorAll('.step-card[data-step]');

    cards.forEach(card => {
        const step = Number(card.getAttribute('data-step'));
        if (!Number.isFinite(step) || step <= 0 || step > totalSteps) return;

        const hasCheckbox = card.querySelector('input[type="checkbox"]');
        if (!hasCheckbox) return; 

        if (card.querySelector('.question-hint')) return;

        const hint = document.createElement('p');
        hint.className = 'question-hint';
        hint.innerText = QUESTION_HINT_TEXT;
        hint.style.margin = '10px 0 0 0';
        hint.style.fontSize = '0.95rem';
        hint.style.opacity = '0.9';
        hint.style.color = '#f59e0b'; 

        const titleEl = card.querySelector('h2, h3, .question-title, .step-title');
        if (titleEl && titleEl.parentNode) {
            titleEl.insertAdjacentElement('afterend', hint);
        } else {
            card.insertAdjacentElement('afterbegin', hint);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    injectQuestionHints();
    enforceMaxChoicesPerQuestion();
});


function nextStep() {
    if (currentStep === 0) {
        const name = document.getElementById('userName').value;
        const contact = document.getElementById('userContact').value;
        if (!name) { alert("请填写您的称呼"); return; }
        if (!contact) { alert("请填写微信号或手机号，以便接收报告"); return; }
    }
    document.querySelector(`.step-card[data-step="${currentStep}"]`).classList.add('hidden');
    currentStep++;
    const nextCard = document.querySelector(`.step-card[data-step="${currentStep}"]`);
    if (nextCard) nextCard.classList.remove('hidden');
    updateProgress();
}

function prevStep() {
    if (currentStep > 0) {
        document.querySelector(`.step-card[data-step="${currentStep}"]`).classList.add('hidden');
        currentStep--;
        document.querySelector(`.step-card[data-step="${currentStep}"]`).classList.remove('hidden');
        updateProgress();
    }
}

function updateProgress() {
    const percent = Math.round((currentStep / totalSteps) * 100);
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('percentText').innerText = `${percent}%`;
}

// =================================================================
// 2. 核心算法：计算瓶颈 (Scoring Engine)
// =================================================================
function calculateDiagnosis() {
    const getVals = (name) => {
        const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(el => el.value);
    };
    
    let scores = { B1: 0, B2: 0, B3: 0, B4: 0 };

    // 简单计分逻辑 (保持原样)
    const q1 = getVals('q1');
    if (q1.includes('新客来源不稳') || q1.includes('成交率不如预期')) scores.B1 += 3;
    if (q1.includes('决策常被拖慢') || q1.includes('老板负担过重')) scores.B2 += 3;
    if (q1.includes('团队执行力不一致') || q1.includes('人员留不住')) scores.B3 += 3;
    if (q1.includes('现金流压力')) scores.B4 += 4; 

    const q2 = getVals('q2');
    if (q2.includes('新客成长')) scores.B1 += 2;
    if (q2.includes('老板压力下降')) scores.B2 += 2;
    if (q2.includes('团队稳定与效率')) scores.B3 += 2;
    if (q2.includes('现金流安全感')) scores.B4 += 2;

    const q7 = getVals('q7');
    if (q7.includes('获客没有稳定方法')) scores.B1 += 2;
    if (q7.includes('老板是最大瓶颈')) scores.B2 += 3;
    if (q7.includes('团队执行力长期不稳')) scores.B3 += 2;
    if (q7.includes('现金流一直偏紧')) scores.B4 += 3;

    const q8 = getVals('q8');
    if (q8.includes('业绩明显下滑')) scores.B1 += 2;
    if (q8.includes('现金流突然吃紧')) scores.B4 += 4;

    let maxType = 'B2'; 
    let maxScore = -1;
    
    if (scores.B4 >= 5) {
        maxType = 'B4';
    } else {
        for (const [type, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                maxType = type;
            }
        }
    }
    return maxType;
}

const RESULTS_CONTENT = {
    'B1': {
        title: '诊断类型：B1 市场闭塞型',
        field: '市场场域',
        desc: '特征：好产品却没人看见，客源不稳定，像是在对着空旷的房间演讲。',
        analysis: '您的能量卡在“对外输出的管道”。不是产品不好，而是连结市场的频率断裂，导致价值无法变现。'
    },
    'B2': {
        title: '诊断类型：B2 管理效能型',
        field: '管理场域',
        desc: '特征：决策速度快但落实难，老板容易成为唯一驱动力，身心俱疲。',
        analysis: '您的能量呈现“单点过热”。老板像超载的发电机，而团队处于低频待机，能量无法有效传导与分配。'
    },
    'B3': {
        title: '诊断类型：B3 执行内耗型',
        field: '执行场域',
        desc: '特征：团队频率不对频，简单的事情需要反复沟通，内耗大于产出。',
        analysis: '您的能量场存在“破口与乱流”。指令下达后会产生杂讯，导致执行动作变形，团队共振效应极低。'
    },
    'B4': {
        title: '诊断类型：B4 财富淤积型',
        field: '财富场域',
        desc: '特征：赚得到但留不住，或是现金流长期紧绷，如同血管硬化。',
        analysis: '这是最紧急的“能量淤塞”。财富能量流动受阻，如果不疏通底层恐惧与限制性信念，注入再多资源都会流失。'
    }
};

let finalResultType = 'B2'; 

function submitForm() {
    document.querySelector(`.step-card[data-step="${totalSteps}"]`).classList.add('hidden');
    document.getElementById('loadingCard').classList.remove('hidden');

    finalResultType = calculateDiagnosis();
    const resultData = RESULTS_CONTENT[finalResultType];

    setTimeout(() => {
        document.getElementById('loadingCard').classList.add('hidden');
        document.getElementById('progressContainer').classList.add('hidden');
        document.getElementById('formContainer').classList.add('hidden');
        
        document.getElementById('resultsContainer').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        document.getElementById('statusTitle').innerText = resultData.title;
        document.getElementById('statusDesc').innerText = resultData.desc;
        
        const lockText = document.getElementById('quantumLockText');
        if (lockText) {
            lockText.innerText = `系统已锁定 ${resultData.field}，点击按钮连结全球资料库...`;
        }
        
        // 动态更新前端分析文案 (虽然 AI 会再出一次，但这里先给个静态的)
        const analysisBlock = document.querySelectorAll('.insight-block p')[2]; 
        if(analysisBlock) analysisBlock.innerText = resultData.analysis;

    }, 1000);
}

function editData() {
    closeModal();
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('formContainer').classList.remove('hidden');
    document.getElementById('progressContainer').classList.remove('hidden');
    document.querySelectorAll('.step-card').forEach(el => el.classList.add('hidden'));
    document.querySelector('.step-card[data-step="0"]').classList.remove('hidden');
    currentStep = 0;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =================================================================
// ⚡️ Coze API 量子分析 (🟢 核心升级部分)
// =================================================================
async function runCozeAnalysis() {
    const btn = document.getElementById('analyzeBtn');
    const resultArea = document.getElementById('resultArea');

    if (!COZE_CONFIG.api_token || !COZE_CONFIG.bot_id) {
        resultArea.style.display = 'block';
        resultArea.innerHTML = "<span style='color:red;'>❌ 错误：API Key 未设定。</span>";
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span style="font-style:italic;">⚡ 正在校准 TimeWaver 频率...</span>`;
    resultArea.style.display = 'block';
    resultArea.innerHTML = ""; 
    
    // 1. 获取用户选择的产业
    const industrySelect = document.getElementById('industry');
    const userIndustry = industrySelect.value || "其他";
    
    // 2. 从字典中获取对应的 Prompt
    const industryPrompt = INDUSTRY_PERSONAS[userIndustry] || INDUSTRY_PERSONAS["其他"];

    const typeName = RESULTS_CONTENT[finalResultType].title.split('：')[1];
    await typeWriterSimple(`正在连结初八企业顾问大脑...\n检测到产业特征：[${userIndustry}]...\n锁定诊断类型：${typeName}...\n--------------------------------\n`, resultArea);

    const diagnosisData = {
        "bottleneck": finalResultType,
        "context": RESULTS_CONTENT[finalResultType].desc,
        "user_name": document.getElementById('userName').value,
        "industry": userIndustry, // 告诉 AI 产业
        "system_instruction": industryPrompt // 告诉 AI 怎么扮演
    };

    try {
        const response = await fetch(COZE_CONFIG.api_url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COZE_CONFIG.api_token}`,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify({
                "conversation_id": "conv_" + Date.now(),
                "bot_id": COZE_CONFIG.bot_id,
                "user": "vip_demo_user",
                // 🟢 关键：把 industryPrompt 塞进 query 里，强制 AI 听从
                "query": `[初八系统指令] 请根据以下资料生成诊断。${industryPrompt} \n 用户数据：${JSON.stringify(diagnosisData)}`,
                "stream": false
            })
        });

        const data = await response.json();

        if (data.code && data.code !== 0) {
            throw new Error(`API Error ${data.code}: ${data.msg}`);
        }

        if (data && data.messages) {
            const aiMessage = data.messages.find(msg => msg.type === 'answer');
            if (aiMessage) {
                btn.innerHTML = "✅ 分析完成";
                typeWriterEffect(aiMessage.content, resultArea);
            } else {
                const backupMsg = data.messages[0] ? data.messages[0].content : "分析完成。"; 
                btn.innerHTML = "✅ 分析完成";
                typeWriterEffect(backupMsg, resultArea);
            }
        } else {
            console.log("Coze Response:", data);
            throw new Error("API 回传格式异常");
        }

    } catch (error) {
        console.error("Coze Error Details:", error);
        resultArea.innerHTML += `\n\n<span style="color:red;">⚠️ 连线异常：${error.message}</span>`;
        btn.disabled = false;
        btn.innerHTML = "⚡ 重新启动";
    }
}

function typeWriterSimple(text, element) {
    return new Promise(resolve => { element.innerHTML += text; resolve(); });
}
function typeWriterEffect(text, element, index = 0) {
    if (index < text.length) {
        element.innerHTML += (text.charAt(index) === '\n') ? '<br>' : text.charAt(index);
        element.scrollTop = element.scrollHeight;
        setTimeout(() => typeWriterEffect(text, element, index + 1), 30);
    }
}

// =================================================================
// 🚀 发送资料到 Coze Bot (作为资料库)
// =================================================================
async function sendDataToCoze(userChoice) {
    const name = document.getElementById('userName').value;
    const contact = document.getElementById('userContact').value;
    const company = document.getElementById('companyName').value;
    const industry = document.getElementById('industry').value || "未选择"; // 🟢 记录产业
    
    const logMessage = `
    【新客户名单】
    --------------------
    姓名：${name}
    联系：${contact}
    公司：${company}
    产业：${industry}  <-- 新增
    诊断：${finalResultType}
    意向：${userChoice === 'A' ? '🔥 高 (选择测试)' : '❄️ 低 (仅看报告)'}
    时间：${new Date().toLocaleString()}
    --------------------
    `;

    try {
        await fetch(COZE_CONFIG.api_url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COZE_CONFIG.api_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "conversation_id": "lead_" + Date.now(),
                "bot_id": COZE_CONFIG.bot_id,
                "user": "lead_collector",
                "query": logMessage, 
                "stream": false
            })
        });
        console.log("Lead data sent to Coze successfully.");
    } catch (error) {
        console.error("Failed to send lead data:", error);
    }
}

// =================================================================
// 🟢 Modal 逻辑 (保持原样)
// =================================================================
function handleChoice(choice) {
    const modal = document.getElementById('peakModal');
    const body = document.getElementById('modalBodyContent');
    const actionContainer = document.getElementById('modalActionContainer');
    
    sendDataToCoze(choice);
    
    actionContainer.innerHTML = ''; 

    // 假图片
    const qrCodeWeCom = "https://placehold.co/200x200/2563eb/ffffff?text=WeCom+QR";
    const qrCodeOA = "https://placehold.co/200x200/475569/ffffff?text=Official+Account";

    if (choice === 'A') {
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#0b1121; margin-bottom:15px;">已启动高频通道</p>
            <p style="color:#475569; font-size:1rem;">为了确保频率校准的精确性，<br>请直接添加首席顾问的企业微信。</p>
            <div style="margin:20px 0; text-align:center;">
                <img src="${qrCodeWeCom}" style="border-radius:10px; border:3px solid #3b82f6; width:180px; height:180px;">
                <p style="color:#2563eb; font-size:0.9rem; margin-top:10px;">扫码后请发送代码：<strong>“启动测试”</strong></p>
            </div>
            <div style="background:rgba(59, 130, 246, 0.1); border-left:4px solid #3b82f6; padding:15px; margin:20px 0; font-size:0.95rem; color:#1e293b; font-style:italic;">
                <span style="color:#2563eb; font-weight:bold;">🚀 顾问留言：</span><br>
                “决心是宇宙最强的频率。当您扫码的那一刻，底层校准就已经开始了。”
            </div>
        `;
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.innerText = '完成，我已添加';
        btn.onclick = closeModal;
        actionContainer.appendChild(btn);
    } else {
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#0b1121; margin-bottom:15px;">报告已生成 (加密版)</p>
            <p style="color:#475569; font-size:1rem;">为了保护您的企业隐私，报告已上传至云端保险箱。</p>
            <div style="margin:20px 0; text-align:center;">
                <img src="${qrCodeOA}" style="border-radius:10px; border:3px solid #94a3b8; width:180px; height:180px;">
                <p style="color:#475569; font-size:0.9rem; margin-top:10px;">关注公众号，回复：<strong>“B2报告”</strong><br>即可获取完整分析。</p>
            </div>
            <div style="background:rgba(245, 158, 11, 0.1); border-left:4px solid #f59e0b; padding:15px; margin:20px 0; font-size:0.95rem; color:#1e293b; font-style:italic;">
                <span style="color:#d97706; font-weight:bold;">💡 顾问的洞察：</span><br>
                “看见问题只是第一步。愿这份报告，成为您打破惯性的第一道光。”
            </div>
        `;
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.style.background = '#475569'; 
        btn.innerText = '关闭视窗';
        btn.onclick = closeModal;
        actionContainer.appendChild(btn);
    }
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('peakModal').classList.add('hidden');
}