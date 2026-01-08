// ============== Configuration ==============
const CONFIG = {
    // ⚠️ 請填入您的 Google Apps Script 網址
    GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    // ⚠️ 請填入您的 Line 官方帳号連結 (这是單一帳号，门诊入口)
    CTA_LINKS: {
        line: 'https://line.me/ti/p/YOUR_LINE_ID' 
    }
};

// ============== Dynamic Micro-Signals (第一性原理版) ==============
const MICRO_SIGNALS = {
    B1: [
        "🧟 殭屍復活：曾已读不回的潜在客户，突然主动联系。",
        "⚡ 決策加速：客户猶豫时間变短，比平常更快給出答案。",
        "✨ 精准共时：心中剛想到的痛点，剛好有客户或文章提到。"
    ],
    B2: [
        "🤫 異常安靜：手機救火通知变少，員工默默解決了問題。",
        "🧠 意識同步：会議中，員工搶先說出您心里想的方案。",
        "👁️ 視野清晰：突然能一眼看出待辦事项中哪個該丟、哪個該做。"
    ],
    B3: [
        "🎯 一次過关：團隊交付的成果完全符合标准，無需退件。",
        "🛡️ 主动止損：員工主动承認錯誤或風險，而非掩蓋。",
        "🌊 意外順暢：預期会卡关的跨部门協作，莫名順利通過。"
    ],
    B4: [
        "🔓 滯帳鬆动：拖欠已久的款项，对方突然有了动作或回应。",
        "🛑 止漏覺察：極度敏銳地发现一筆「不必要」開銷並砍掉。",
        "🔄 資源置換：发现能用现有資源或人脈解決問題，無需花錢。"
    ]
};

// ============== State ==============
let currentStep = 0;
const totalSteps = 15;
const formData = {
    basicInfo: {},
    q1: [], q2: [],
    q3: null, q4: null, q5: null, q6: null,
    q7: [], q8: [],
    q9: null, q10: [], q11: [],
    q12: [], q12Details: {},
    q13: null, q14: null
};

// 全域变數儲存結果
let finalResult = null;

// ============== Smart Counter Algorithm ==============
function getSmartCount() {
    const startDate = new Date('2024-01-01').getTime(); 
    const baseCount = 1520; 
    const growthRate = 14400000; // 每4小时+1
    const now = Date.now();
    const timePassed = now - startDate;
    const extraCount = Math.floor(timePassed / growthRate);
    return baseCount + extraCount;
}

// ============== Logic Functions ==============
function calculateScores() {
    const { q1, q3, q4, q5, q6, q7, q8 } = formData;
    const countMatches = (arr, targets) => (arr || []).filter(v => targets.includes(v)).length;
    const hasMatch = (arr, target) => (arr || []).includes(target);

    // B1 市場瓶颈
    const b1_base = countMatches(q1, ['新客來源不穩', '成交率不如預期']) * 1.5;
    const b1_chronic = hasMatch(q7, '獲客沒有穩定方法') ? 1.0 : 0;
    const b1_acute = countMatches(q8, ['業績明顯下滑', '重要客户流失']) * 1.5;
    const b1_bonus = (q3 <= 3 && q4 <= 3) ? 1 : 0;
    const scoreB1 = b1_base + b1_chronic + b1_acute + b1_bonus;

    // B2 管理瓶颈
    const b2_quant = (q3 * 0.35) + (q4 * 0.30) + (q6 * 0.25) + (q5 * 0.10);
    const b2_chronic_score = countMatches(q7, ['老闆是最大瓶颈', '管理制度建不起來']) * 1.0; 
    const scoreB2 = b2_quant + b2_chronic_score;

    // B3 執行瓶颈
    const b3_quant = (q4 * 0.45) + (q5 * 0.30) + (q6 * 0.25);
    const b3_chronic = hasMatch(q7, '團隊執行力長期不穩') ? 1.0 : 0;
    const b3_acute = countMatches(q8, ['关鍵人員異动', '專案嚴重卡关']) * 1.5;
    const scoreB3 = b3_quant + b3_chronic + b3_acute;

    // B4 现金流瓶颈
    const b4_subjective = (hasMatch(q1, '现金流壓力') ? 3 : 0) + (hasMatch(formData.q2, '现金流安全感') ? 2 : 0);
    const b4_chronic = hasMatch(q7, '现金流一直偏緊') ? 1.5 : 0;
    const b4_acute = hasMatch(q8, '现金流突然吃緊') ? 2.0 : 0;
    const scoreB4 = b4_subjective + b4_chronic + b4_acute;

    return { B1: scoreB1, B2: scoreB2, B3: scoreB3, B4: scoreB4 };
}

function generateResults() {
    const scores = calculateScores();
    const { q7, q8, q6 } = formData;

    let mainBottleneck = 'B1';
    if (scores.B4 >= 4) { 
        mainBottleneck = 'B4';
    } else {
        const maxScore = Math.max(scores.B1, scores.B2, scores.B3, scores.B4);
        if (scores.B4 === maxScore) mainBottleneck = 'B4';
        else if (scores.B2 === maxScore) mainBottleneck = 'B2';
        else if (scores.B3 === maxScore) mainBottleneck = 'B3';
        else mainBottleneck = 'B1';
    }

    const q8Count = (q8 || []).filter(x => x !== '最近还算穩定').length;
    const isCashAcute = (q8 || []).includes('现金流突然吃緊') ? 2 : 0;
    const isBossOverload = q6 >= 4 ? 1 : 0;
    const mainScore = scores[mainBottleneck];
    const urgencyScore = mainScore + (q8Count * 1.5) + isCashAcute + isBossOverload;

    let statusLevel = 'green';
    if (urgencyScore >= 8 || scores.B4 >= 4.5) {
        statusLevel = 'red';
    } else if (urgencyScore >= 3.0 || mainScore >= 2.5 || (q7 || []).length >= 2) {
        statusLevel = 'yellow';
    }

    return { scores, mainBottleneck, statusLevel, urgencyScore };
}

// ============== Render Results ==============
function renderResults(result) {
    finalResult = result;
    const { q7, q8 } = formData;
    const { statusLevel } = result;

    const currentCount = getSmartCount().toLocaleString();
    const countEl = document.getElementById('userCount');
    if(countEl) countEl.textContent = currentCount;

    const statusMessages = {
        green: { icon: '🌲', title: '检测完成：狀態穩定', desc: '你的企業目前處於相对穩定的區間，但穩定有时也是一種慣性。' },
        yellow: { icon: '🍂', title: '检测完成：发现信号', desc: '系统偵测到數個反覆出现的循環，这通常是改变发生的前兆。' },
        red: { icon: '🔥', title: '检测完成：高壓狀態', desc: '目前的负載已接近臨界值，这不是你的問題，而是結構的問題。' }
    };
    const status = statusMessages[statusLevel];
    
    document.getElementById('statusCard').className = `status-card ${statusLevel}`;
    document.getElementById('statusIcon').textContent = status.icon;
    document.getElementById('statusTitle').textContent = status.title;
    document.getElementById('statusDesc').textContent = status.desc;

    const insightList = document.getElementById('insightList1');
    insightList.innerHTML = '';
    
    let symptoms = [];
    if (q8 && q8.length > 0 && !q8.includes('最近还算穩定')) symptoms.push(...q8);
    if (q7 && q7.length > 0 && !q7.includes('以上都沒有')) symptoms.push(...q7);
    
    if (symptoms.length < 2) {
        symptoms = ['問題存在已久', '決策需要反覆確認', '節奏難以穩定', '很多关鍵事情仍集中在你身上'];
    }

    symptoms.slice(0, 4).forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        insightList.appendChild(li);
    });

    window.lineLink = CONFIG.CTA_LINKS.line;
}

// ============== Handle Choice (Revised) ==============
function handleChoice(option) {
    if (option === 'A') {
        // Option A: Test (Dynamic Micro-Signals)
        const modalBody = document.getElementById('modalBodyContent');
        const company = formData.basicInfo.company || '您的企业';
        const name = formData.basicInfo.name || '负责人';
        const bottleneck = finalResult ? finalResult.mainBottleneck : 'B1';
        
        // Get dynamic signals based on bottleneck
        const signals = MICRO_SIGNALS[bottleneck] || MICRO_SIGNALS.B1;
        const signalsHtml = signals.map(s => `<li>${s}</li>`).join('');

        modalBody.innerHTML = `
            <div style="background:#fff3cd; border:1px solid #ffecb5; color:#856404; padding:10px; border-radius:6px; font-size:13px; margin-bottom:15px; text-align:left;">
                <strong>⚠️ 安全提示</strong><br>
                信息場投射依賴精准資料。若資料有誤，頻率将無法正確抵達。請確保以下锁定資料無誤：
            </div>
            
            <div style="text-align:left; margin-bottom:15px; padding:0 10px; font-size:14px; color:#1c3f60;">
                <div>🏢 <strong>锁定企業：</strong>${company}</div>
                <div>👤 <strong>负责人：</strong>${name}</div>
                <div>🎯 <strong>校准标的：</strong>${bottleneck} 结构层</div>
            </div>

            <div class="peak-preview-box" style="margin:10px 0;">
                <div class="peak-blur-text">
                    <span>📡 72小时共振测試程序</span>
                    <ul style="list-style:none; margin-top:5px; font-size:12px; line-height:1.4;">
                       ${signalsHtml}
                    </ul>
                </div>
                <div class="peak-lock-overlay">
                    等待确认后启动
                </div>
            </div>

            <p style="font-size:13px; color:#64748b; margin-top:10px;">
                点击確認，系统将锁定坐标，<br>并引导至 Line 启动第一波发送。
            </p>
        `;
        
        document.getElementById('peakModal').classList.remove('hidden');

    } else {
        // Option B: Archive & Return Home
        const userEmail = formData.basicInfo.email || '您的邮箱';
        document.getElementById('resultsContainer').innerHTML = `
            <div style="text-align:center; padding: 60px 20px; animation: fadeIn 0.5s;">
                <div style="font-size:50px; margin-bottom:20px;">📨</div>
                <h2 style="color:var(--primary); margin-bottom:15px;">报告已发送</h2>
                <p style="color:var(--text-sub); line-height:1.6; margin-bottom:30px;">
                    完整的诊断報告书已发送至：<br>
                    <strong style="color:var(--text-main);">${userEmail}</strong>
                </p>
                <div style="background:#f8fbfe; padding:20px; border-radius:12px; font-size:14px; color:#555; text-align:left; margin-bottom:30px; border:1px solid #e2e8f0;">
                    <strong>💡 顾問的小建議：</strong><br>
                    即使不进行頻率测試，建議您本週可以試著觀察團隊中是否有「重複发生」的溝通断层。那是結構瓶颈最明顯的徵兆。
                </div>
                
                <button onclick="window.location.reload()" class="btn btn-secondary" style="width:100%; max-width:200px;">
                    返回检测首頁
                </button>
            </div>
        `;
    }
}

function redirectToLine() {
    if(window.lineLink && window.lineLink.includes('http')) {
        // Redirect to LINE (Single Account Strategy)
        window.location.href = window.lineLink;
    } else {
        alert('請在 app.js 的 CONFIG 中設定正確的 Line 連結');
    }
}

function closeModal() {
    document.getElementById('peakModal').classList.add('hidden');
}

// ============== Navigation (Same as before) ==============
function updateProgress() {
    const percent = Math.round((currentStep / totalSteps) * 100);
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('stepText').textContent = currentStep === 0 ? '基本資料' : `Q${currentStep}`;
    document.getElementById('percentText').textContent = percent + '%';
}

function showStep(step) {
    document.querySelectorAll('.step-card').forEach(c => c.classList.add('hidden'));
    const target = document.querySelector(`.step-card[data-step="${step}"]`);
    if (target) {
        target.classList.remove('hidden');
        target.scrollTop = 0;
    }
}

function nextStep() {
    if (!validateCurrentStep()) return;
    saveCurrentStepData();
    currentStep++;
    if (currentStep < totalSteps) { showStep(currentStep); updateProgress(); }
}

function prevStep() {
    if (currentStep > 0) { currentStep--; showStep(currentStep); updateProgress(); }
}

function validateCurrentStep() {
    if (currentStep === 0) {
        const fields = ['userName', 'companyName', 'userEmail', 'userPhone', 'industry', 'companySize'];
        for (const f of fields) {
            const el = document.getElementById(f);
            if (!el) { alert('請重新整理頁面'); return false; }
            if (!el.value.trim()) { alert('請填寫所有必填欄位'); el.focus(); return false; }
        }
        return true;
    }
    const name = `q${currentStep}`;
    const inputs = document.querySelectorAll(`input[name="${name}"]`);
    if (inputs.length > 0 && !document.querySelector(`input[name="${name}"]:checked`)) {
        alert('請选擇一個选项');
        return false;
    }
    return true;
}

function getElementValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : ''; 
}

function saveCurrentStepData() {
    if (currentStep === 0) {
        formData.basicInfo = {
            name: getElementValue('userName'),
            company: getElementValue('companyName'),
            email: getElementValue('userEmail'),
            phone: getElementValue('userPhone'),
            industry: getElementValue('industry'),
            size: getElementValue('companySize')
        };
    } else {
        const name = `q${currentStep}`;
        const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`));
        if (checked.length) {
            formData[name] = checked[0].type === 'radio' ? parseInt(checked[0].value) : checked.map(c => c.value);
        }
    }
}

async function submitForm() {
    saveCurrentStepData();
    document.getElementById('formContainer').classList.add('hidden');
    document.getElementById('progressContainer').classList.add('hidden');
    document.getElementById('loadingCard').classList.remove('hidden');

    const results = generateResults();
    const finalData = { ...formData, ...results, timestamp: new Date().toISOString() };
    
    if (CONFIG.GOOGLE_SCRIPT_URL && CONFIG.GOOGLE_SCRIPT_URL.includes('script.google.com')) {
        try {
            await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });
        } catch (error) {
            console.error('Data sent error:', error);
        }
    }

    setTimeout(() => {
        document.getElementById('loadingCard').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');
        renderResults(results);
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => { 
    updateProgress(); 
    showStep(0);
    const countEl = document.getElementById('userCount');
    if(countEl) countEl.textContent = getSmartCount().toLocaleString();
});