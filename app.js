// =================================================================
// 🔴 CONFIG (請確認 Key 已填寫正確)
// =================================================================
const COZE_CONFIG = {
// 👇 請將剛剛 Google Apps Script 部署的網址貼在這裡
    api_url: 'https://api.coze.cn/open_api/v2/chat',

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
        // 🟢 驗證改為檢查 userContact
        const name = document.getElementById('userName').value;
        const contact = document.getElementById('userContact').value;
        if (!name) { alert("請填寫您的稱呼"); return; }
        if (!contact) { alert("請填寫微信號或手機號，以便接收報告"); return; }
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
// 🚀 新增：發送資料到 Coze Bot (作為資料庫)
// =================================================================
async function sendDataToCoze(userChoice) {
    const name = document.getElementById('userName').value;
    const contact = document.getElementById('userContact').value;
    const company = document.getElementById('companyName').value;
    
    // 組合訊息 (給 Coze 機器人看的日誌)
    const logMessage = `
    【新客戶名單】
    --------------------
    姓名：${name}
    聯繫：${contact}
    公司：${company}
    診斷：${finalResultType}
    意向：${userChoice === 'A' ? '🔥 高 (選擇測試)' : '❄️ 低 (僅看報告)'}
    時間：${new Date().toLocaleString()}
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
                "query": logMessage, // 把客戶資料當作對話發送
                "stream": false
            })
        });
        console.log("Lead data sent to Coze successfully.");
    } catch (error) {
        console.error("Failed to send lead data:", error);
    }
}

// =================================================================
// 🟢 Modal 邏輯 (QR Code 版 + 自動發送資料)
// =================================================================
function handleChoice(choice) {
    const modal = document.getElementById('peakModal');
    const body = document.getElementById('modalBodyContent');
    const actionContainer = document.getElementById('modalActionContainer');
    
    // 🟢 觸發背景發送 (這是您的資料庫)
    sendDataToCoze(choice);
    
    actionContainer.innerHTML = ''; 

    // 假圖片 (請替換成您真實的 QR Code)
    const qrCodeWeCom = "https://placehold.co/200x200/2563eb/ffffff?text=WeCom+QR";
    const qrCodeOA = "https://placehold.co/200x200/475569/ffffff?text=Official+Account";

    if (choice === 'A') {
        // 🟢 選項 A：企業微信 (高意向)
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#ffffff; margin-bottom:15px;">已啟動高頻通道</p>
            <p style="color:#e2e8f0; font-size:1rem;">為了確保頻率校準的精確性，<br>請直接添加首席顧問的企業微信。</p>
            
            <div style="margin:20px 0; text-align:center;">
                <img src="${qrCodeWeCom}" style="border-radius:10px; border:3px solid #3b82f6; width:180px; height:180px;">
                <p style="color:#60a5fa; font-size:0.9rem; margin-top:10px;">掃碼後請發送代碼：<strong>「啟動測試」</strong></p>
            </div>

            <div style="background:rgba(59, 130, 246, 0.2); border-left:4px solid #3b82f6; padding:15px; margin:20px 0; font-size:0.95rem; color:#ffffff; font-style:italic;">
                <span style="color:#60a5fa; font-weight:bold;">🚀 顧問留言：</span><br>
                「決心是宇宙最強的頻率。當您掃碼的那一刻，底層校準就已經開始了。」
            </div>
        `;
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.innerText = '完成，我已添加';
        btn.onclick = closeModal;
        actionContainer.appendChild(btn);

    } else {
        // 🟢 選項 B：公眾號 (低意向)
        body.innerHTML = `
            <p style="font-size:1.2rem; font-weight:bold; color:#ffffff; margin-bottom:15px;">報告已生成 (加密版)</p>
            <p style="color:#e2e8f0; font-size:1rem;">為了保護您的企業隱私，報告已上傳至雲端保險箱。</p>
            
            <div style="margin:20px 0; text-align:center;">
                <img src="${qrCodeOA}" style="border-radius:10px; border:3px solid #94a3b8; width:180px; height:180px;">
                <p style="color:#cbd5e1; font-size:0.9rem; margin-top:10px;">關注公眾號，回覆：<strong>「B2報告」</strong><br>即可獲取完整分析。</p>
            </div>

            <div style="background:rgba(245, 158, 11, 0.15); border-left:4px solid #f59e0b; padding:15px; margin:20px 0; font-size:0.95rem; color:#ffffff; font-style:italic;">
                <span style="color:#fbbf24; font-weight:bold;">💡 顧問的洞察：</span><br>
                「看見問題只是第一步。願這份報告，成為您打破慣性的第一道光。」
            </div>
        `;
        
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.style.background = '#475569'; 
        btn.innerText = '關閉視窗';
        btn.onclick = closeModal;
        actionContainer.appendChild(btn);
    }
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('peakModal').classList.add('hidden');
}
