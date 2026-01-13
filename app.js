// =================================================================
// 🔴 CONFIG (请确认 Key 已填写正确)
// =================================================================
const COZE_CONFIG = {
// 👇 请将刚刚 Google Apps Script 部署的网址贴在这里
    api_url: 'https://api.coze.cn/open_api/v2/chat',

    api_url: 'https://api.coze.cn/open_api/v2/chat',
    // 您的 PAT Token
    api_token: 'pat_Tv62rVIFCCSmohdrOe7nVY3qCrJ4tHCq6PzAf2XgCkQch2FZXuqIPr4EuNyVuiIP', 
    // 您的 Bot ID
    bot_id: '7592910227734200320' 
};

// =================================================================
// 1. 导航逻辑
// =================================================================
let currentStep = 0;
const totalSteps = 14; 


// =================================================================
// 1.5 每题最多选择 2 项 + 提示文案（仅新增提示与选择上限，不改原有流程）
// =================================================================
const MAX_CHOICES_PER_QUESTION = 2;
const QUESTION_HINT_TEXT = '提示：本题最多可选 2 项，请选择你目前最需要调整的方向。';

function enforceMaxChoicesPerQuestion() {
    // 仅限制多选题（checkbox）。单选题（radio）不受影响
    const boxes = document.querySelectorAll('input[type="checkbox"][name]');

    boxes.forEach(box => {
        // 避免重复绑定
        if (box.dataset.maxChoiceBound === '1') return;
        box.dataset.maxChoiceBound = '1';

        box.addEventListener('change', (e) => {
            const name = e.target.name;
            if (!name) return;

            // 只对 q1~q14 这类题目做限制
            if (!/^q\d+$/i.test(name)) return;

            const checked = document.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`);
            if (checked.length > MAX_CHOICES_PER_QUESTION) {
                // 超过上限：取消本次勾选
                e.target.checked = false;
                alert(`每题最多选择 ${MAX_CHOICES_PER_QUESTION} 项，请先取消一个选项再继续。`);
            }
        });
    });
}

function injectQuestionHints() {
    // 尝试在每个题目卡片中插入提示文案（不依赖特定结构，尽量兼容）
    const cards = document.querySelectorAll('.step-card[data-step]');

    cards.forEach(card => {
        const step = Number(card.getAttribute('data-step'));
        // 0 通常是信息填写页；大于 totalSteps 的可能是 loading/results，不插入
        if (!Number.isFinite(step) || step <= 0 || step > totalSteps) return;

        // 已经有提示就不重复插入
        if (card.querySelector('.question-hint')) return;

        const hint = document.createElement('p');
        hint.className = 'question-hint';
        hint.innerText = QUESTION_HINT_TEXT;

        // 用最小侵入的方式加一点点可读性（不改 CSS 文件）
        hint.style.margin = '10px 0 0 0';
        hint.style.fontSize = '0.95rem';
        hint.style.opacity = '0.85';

        // 优先插在标题后面；找不到标题就插在卡片最前面
        const titleEl = card.querySelector('h2, h3, .question-title, .step-title');
        if (titleEl && titleEl.parentNode) {
            titleEl.insertAdjacentElement('afterend', hint);
        } else {
            card.insertAdjacentElement('afterbegin', hint);
        }
    });
}

// DOM 准备好之后再执行，避免抓不到节点
document.addEventListener('DOMContentLoaded', () => {
    injectQuestionHints();
    enforceMaxChoicesPerQuestion();
});


function nextStep() {
    if (currentStep === 0) {
        // 🟢 验证改为检查 userContact
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

    // Q1 权重
    const q1 = getVals('q1');
    if (q1.includes('新客来源不稳') || q1.includes('成交率不如预期')) scores.B1 += 3;
    if (q1.includes('决策常被拖慢') || q1.includes('老板负担过重')) scores.B2 += 3;
    if (q1.includes('团队执行力不一致') || q1.includes('人员留不住')) scores.B3 += 3;
    if (q1.includes('现金流压力')) scores.B4 += 4; 

    // Q2 权重
    const q2 = getVals('q2');
    if (q2.includes('新客成长')) scores.B1 += 2;
    if (q2.includes('老板压力下降')) scores.B2 += 2;
    if (q2.includes('团队稳定与效率')) scores.B3 += 2;
    if (q2.includes('现金流安全感')) scores.B4 += 2;

    // Q7 权重
    const q7 = getVals('q7');
    if (q7.includes('获客没有稳定方法')) scores.B1 += 2;
    if (q7.includes('老板是最大瓶颈')) scores.B2 += 3;
    if (q7.includes('团队执行力长期不稳')) scores.B3 += 2;
    if (q7.includes('现金流一直偏紧')) scores.B4 += 3;

    // Q8 权重
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

// 结果文案库
const RESULTS_CONTENT = {
    'B1': {
        title: '诊断类型：B1 市场闭塞型',
        field: '市场场域',
        desc: '特征：好产品却没人看见，客源不稳定，像是在对著空旷的房间演讲。',
        analysis: '您的能量卡在「对外输出的管道」。不是产品不好，而是连结市场的频率断裂，导致价值无法变现。'
    },
    'B2': {
        title: '诊断类型：B2 管理效能型',
        field: '管理场域',
        desc: '特征：决策速度快但落实难，老板容易成为唯一驱动力，身心俱疲。',
        analysis: '您的能量呈现「单点过热」。老板像超载的发电机，而团队处于低频待机，能量无法有效传导与分配。'
    },
    'B3': {
        title: '诊断类型：B3 执行内耗型',
        field: '执行场域',
        desc: '特征：团队频率不对频，简单的事情需要反复沟通，内耗大于产出。',
        analysis: '您的能量场存在「破口与乱流」。指令下达后会产生杂讯，导致执行动作变形，团队共振效应极低。'
    },
    'B4': {
        title: '诊断类型：B4 财富淤积型',
        field: '财富场域',
        desc: '特征：赚得到但留不住，或是现金流长期紧绷，如同血管硬化。',
        analysis: '这是最紧急的「能量淤塞」。财富能量流动受阻，如果不疏通底层恐惧与限制性信念，注入再多资源都会流失。'
    }
};

// =================================================================
// 3. 提交表单
// =================================================================
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
// ⚡️ Coze API 量子分析
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
    
    const typeName = RESULTS_CONTENT[finalResultType].title.split('：')[1];
    await typeWriterSimple(`正在连结初八企业顾问大脑...\n锁定诊断类型：${typeName}...\n校准 ${finalResultType} 场域能量参数...\n--------------------------------\n`, resultArea);

    const diagnosisData = {
        "bottleneck": finalResultType,
        "context": RESULTS_CONTENT[finalResultType].desc,
        "user_name": document.getElementById('userName').value
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
                "query": `[初八系统诊断数据] ${JSON.stringify(diagnosisData)}`,
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
// 🚀 新增：发送资料到 Coze Bot (作为资料库)
// =================================================================
async function sendDataToCoze(userChoice) {
    const name = document.getElementById('userName').value;
    const contact = document.getElementById('userContact').value;
    const company = document.getElementById('companyName').value;
    
    // 组合讯息 (给 Coze 机器人看的日志)
    const logMessage = `
    【新客户名单】
    --------------------
    姓名：${name}
    联系：${contact}
    公司：${company}
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
                "query": logMessage, // 把客户资料当作对话发送
                "stream": false
            })
        });
        console.log("Lead data sent to Coze successfully.");
    } catch (error) {
        console.error("Failed to send lead data:", error);
    }
}

// =================================================================
// 🟢 Modal 逻辑 (QR Code 版 + 自动发送资料)
// =================================================================
function handleChoice(choice) {
    const modal = document.getElementById('peakModal');
    const body = document.getElementById('modalBodyContent');
    const actionContainer = document.getElementById('modalActionContainer');
    
    // 🟢 触发背景发送 (这是您的资料库)
    sendDataToCoze(choice);
    
    actionContainer.innerHTML = ''; 

    // 假图片 (请替换成您真实的 QR Code)
    const qrCodeWeCom = "https://placehold.co/200x200/2563eb/ffffff?text=WeCom+QR";
    const qrCodeOA = "https://placehold.co/200x200/475569/ffffff?text=Official+Account";

    if (choice === 'A') {
        // 🟢 选项 A：企业微信 (高意向)
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#ffffff; margin-bottom:15px;">已启动高频通道</p>
            <p style="color:#e2e8f0; font-size:1rem;">为了确保频率校准的精确性，<br>请直接添加首席顾问的企业微信。</p>
            
            <div style="margin:20px 0; text-align:center;">
                <img src="${qrCodeWeCom}" style="border-radius:10px; border:3px solid #3b82f6; width:180px; height:180px;">
                <p style="color:#60a5fa; font-size:0.9rem; margin-top:10px;">扫码后请发送代码：<strong>「启动测试」</strong></p>
            </div>

            <div style="background:rgba(59, 130, 246, 0.2); border-left:4px solid #3b82f6; padding:15px; margin:20px 0; font-size:0.95rem; color:#ffffff; font-style:italic;">
                <span style="color:#60a5fa; font-weight:bold;">🚀 顾问留言：</span><br>
                「决心是宇宙最强的频率。当您扫码的那一刻，底层校准就已经开始了。」
            </div>
        `;
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.innerText = '完成，我已添加';
        btn.onclick = closeModal;
        actionContainer.appendChild(btn);

    } else {
        // 🟢 选项 B：公众号 (低意向)
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#ffffff; margin-bottom:15px;">报告已生成 (加密版)</p>
            <p style="color:#e2e8f0; font-size:1rem;">为了保护您的企业隐私，报告已上传至云端保险箱。</p>
            
            <div style="margin:20px 0; text-align:center;">
                <img src="${qrCodeOA}" style="border-radius:10px; border:3px solid #94a3b8; width:180px; height:180px;">
                <p style="color:#cbd5e1; font-size:0.9rem; margin-top:10px;">关注公众号，回复：<strong>「B2报告」</strong><br>即可获取完整分析。</p>
            </div>

            <div style="background:rgba(245, 158, 11, 0.15); border-left:4px solid #f59e0b; padding:15px; margin:20px 0; font-size:0.95rem; color:#ffffff; font-style:italic;">
                <span style="color:#fbbf24; font-weight:bold;">💡 顾问的洞察：</span><br>
                「看见问题只是第一步。愿这份报告，成为您打破惯性的第一道光。」
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

