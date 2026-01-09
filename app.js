// =================================================================
// 🔴 CONFIG (請確認 Key 已填寫正確)
// =================================================================
const COZE_CONFIG = {
// 👇 請將剛剛 Google Apps Script 部署的網址貼在這裡
    google_script_url: 'https://script.google.com/macros/s/AKfycbw1fOqvitcjBRBb78fsLHP172scH1JLpVxX3VY6QhjMTEjwVwPF4YhlYeqlB4L8HUa_zA/exec',

    api_url: 'https://api.coze.cn/open_api/v2/chat',
    // 您的 PAT Token
    api_token: 'pat_Tv62rVIFCCSmohdrOe7nVY3qCrJ4tHCq6PzAf2XgCkQch2FZXuqIPr4EuNyVuiIP', 
    // 您的 Bot ID
    bot_id: '7592910227734200320' 
};

// =================================================================
// 1. 導航邏輯
// =================================================================
let currentStep = 0;
const totalSteps = 14; 

function nextStep() {
    if (currentStep === 0) {
        const name = document.getElementById('userName').value;
        if (!name) { alert("請填寫您的稱呼"); return; }
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
// 2. 核心算法：計算瓶頸 (Scoring Engine)
// =================================================================
function calculateDiagnosis() {
    const getVals = (name) => {
        const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(el => el.value);
    };
    
    let scores = { B1: 0, B2: 0, B3: 0, B4: 0 };

    // Q1 權重
    const q1 = getVals('q1');
    if (q1.includes('新客來源不穩') || q1.includes('成交率不如預期')) scores.B1 += 3;
    if (q1.includes('決策常被拖慢') || q1.includes('老闆負擔過重')) scores.B2 += 3;
    if (q1.includes('團隊執行力不一致') || q1.includes('人员留不住')) scores.B3 += 3;
    if (q1.includes('现金流壓力')) scores.B4 += 4; 

    // Q2 權重
    const q2 = getVals('q2');
    if (q2.includes('新客成長')) scores.B1 += 2;
    if (q2.includes('老闆壓力下降')) scores.B2 += 2;
    if (q2.includes('團隊穩定与效率')) scores.B3 += 2;
    if (q2.includes('现金流安全感')) scores.B4 += 2;

    // Q7 權重
    const q7 = getVals('q7');
    if (q7.includes('獲客沒有穩定方法')) scores.B1 += 2;
    if (q7.includes('老闆是最大瓶颈')) scores.B2 += 3;
    if (q7.includes('團隊執行力長期不穩')) scores.B3 += 2;
    if (q7.includes('现金流一直偏緊')) scores.B4 += 3;

    // Q8 權重
    const q8 = getVals('q8');
    if (q8.includes('業績明顯下滑')) scores.B1 += 2;
    if (q8.includes('现金流突然吃緊')) scores.B4 += 4;

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

// 結果文案庫
const RESULTS_CONTENT = {
    'B1': {
        title: '診斷類型：B1 市場閉塞型',
        field: '市場場域',
        desc: '特徵：好產品卻沒人看見，客源不穩定，像是在對著空曠的房間演講。',
        analysis: '您的能量卡在「對外輸出的管道」。不是產品不好，而是連結市場的頻率斷裂，導致價值無法變現。'
    },
    'B2': {
        title: '診斷類型：B2 管理效能型',
        field: '管理場域',
        desc: '特徵：決策速度快但落實難，老闆容易成為唯一驅動力，身心俱疲。',
        analysis: '您的能量呈現「單點過熱」。老闆像超載的發電機，而團隊處於低頻待機，能量無法有效傳導與分配。'
    },
    'B3': {
        title: '診斷類型：B3 執行內耗型',
        field: '執行場域',
        desc: '特徵：團隊頻率不對頻，簡單的事情需要反覆溝通，內耗大於產出。',
        analysis: '您的能量場存在「破口與亂流」。指令下達後會產生雜訊，導致執行動作變形，團隊共振效應極低。'
    },
    'B4': {
        title: '診斷類型：B4 財富淤積型',
        field: '財富場域',
        desc: '特徵：賺得到但留不住，或是現金流長期緊繃，如同血管硬化。',
        analysis: '這是最緊急的「能量淤塞」。財富能量流動受阻，如果不疏通底層恐懼與限制性信念，注入再多資源都會流失。'
    }
};

// =================================================================
// 3. 提交表單
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
            lockText.innerText = `系統已鎖定 ${resultData.field}，點擊按鈕連結全球資料庫...`;
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
        resultArea.innerHTML = "<span style='color:red;'>❌ 錯誤：API Key 未設定。</span>";
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span style="font-style:italic;">⚡ 正在校準 TimeWaver 頻率...</span>`;
    resultArea.style.display = 'block';
    resultArea.innerHTML = ""; 
    
    const typeName = RESULTS_CONTENT[finalResultType].title.split('：')[1];
    await typeWriterSimple(`正在連結初八企業顧問大腦...\n鎖定診斷類型：${typeName}...\n校準 ${finalResultType} 場域能量參數...\n--------------------------------\n`, resultArea);

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
                "query": `[初八系統診斷數據] ${JSON.stringify(diagnosisData)}`,
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
            throw new Error("API 回傳格式異常");
        }

    } catch (error) {
        console.error("Coze Error Details:", error);
        resultArea.innerHTML += `\n\n<span style="color:red;">⚠️ 連線異常：${error.message}</span>`;
        btn.disabled = false;
        btn.innerHTML = "⚡ 重新啟動";
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
// 🟢 Modal 邏輯 (文字顏色全數修正為高對比白色)
// =================================================================
function handleChoice(choice) {
    const modal = document.getElementById('peakModal');
    const body = document.getElementById('modalBodyContent');
    const actionContainer = document.getElementById('modalActionContainer');
    
    const name = document.getElementById('userName').value || "王總";
    const email = document.getElementById('userEmail').value || "(未填寫 Email)";
    
    actionContainer.innerHTML = ''; 

    if (choice === 'A') {
        // 🟢 選項 A：賦能與確認 (修正文字顏色)
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#ffffff; margin-bottom:15px;">${name} 您好，</p>
            <p style="color:#e2e8f0; font-size:1rem;">您即將啟動 <strong>72小時免費頻率共振測試</strong>。</p>
            
            <div style="background:rgba(59, 130, 246, 0.2); border-left:4px solid #3b82f6; padding:15px; margin:20px 0; font-size:1rem; line-height:1.6; color:#ffffff; font-style:italic;">
                <span style="color:#60a5fa; font-weight:bold;">🚀 來自場域的訊息：</span><br>
                「決心，是宇宙最強的頻率。<br>當您選擇『看見』的那一刻，校準就已經開始了。」
            </div>

            <hr style="border:0; border-top:1px dashed #64748b; margin:20px 0;">
            <p style="font-size:0.95rem; color:#cbd5e1;">請確認您的資料：<br>Email: <span style="color:#ffffff; font-weight:bold;">${email}</span></p>
            <p style="color:#94a3b8; font-size:0.85rem; margin-top:10px;">點擊按鈕將開啟 Line，本頁面會保留。</p>
        `;
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.innerText = '✅ 資料無誤，前往啟動測試';
        btn.onclick = function() {
            window.open("https://line.me/R/ti/p/@initial8", "_blank"); 
            closeModal();
        };
        actionContainer.appendChild(btn);

    } else {
        // 🟢 選項 B：挽留與洞察 (修正文字顏色)
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#ffffff; margin-bottom:15px;">${name} 您好，</p>
            <p style="color:#e2e8f0; font-size:1rem;">您選擇僅獲取報告。我們已記錄需求。</p>
            
            <div style="background:rgba(245, 158, 11, 0.15); border-left:4px solid #f59e0b; padding:15px; margin:20px 0; font-size:1rem; line-height:1.6; color:#ffffff; font-style:italic;">
                <span style="color:#fbbf24; font-weight:bold;">💡 顧問的洞察：</span><br>
                「看見問題只是第一步，穿越它需要能量。<br>願這份報告，成為您打破慣性的第一道光。」
            </div>

            <hr style="border:0; border-top:1px dashed #64748b; margin:20px 0;">
            
            <p style="margin-bottom:5px; color:#cbd5e1;">系統將把診斷報告發送至：</p>
            <p style="color:#ffffff; font-weight:bold; font-size:1.1rem; margin:0;">${email}</p>
            <p style="font-size:0.85rem; color:#94a3b8; margin-top:5px;">(若信箱有誤，請點擊左下角修改)</p>
        `;
        
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.style.background = '#475569'; // 灰色按鈕
        btn.innerText = '👌 我知道了';
        btn.onclick = closeModal;
        actionContainer.appendChild(btn);
    }
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('peakModal').classList.add('hidden');
}
