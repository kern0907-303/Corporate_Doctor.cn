// =================================================================
// 🔴 CONFIG
// =================================================================
const COZE_CONFIG = {
    api_url: 'https://api.coze.cn/open_api/v2/chat',
    api_token: 'pat_hqnI0e3VpVIfZqJjbQ2E6OVKJdTCNHfN3MOhej6wPwtpSWEKT6VAIiuWsSxUJUk6', 
    bot_id: '7592910227734200320' 
};

// =================================================================
// 導航邏輯 (全 14 題)
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

function submitForm() {
    document.querySelector(`.step-card[data-step="${totalSteps}"]`).classList.add('hidden');
    document.getElementById('loadingCard').classList.remove('hidden');

    setTimeout(() => {
        document.getElementById('loadingCard').classList.add('hidden');
        document.getElementById('progressContainer').classList.add('hidden');
        document.getElementById('formContainer').classList.add('hidden');
        
        // 顯示結果頁
        document.getElementById('resultsContainer').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        document.getElementById('statusTitle').innerText = "診斷類型：B2 管理效能型";
        document.getElementById('statusDesc').innerText = "特徵：決策速度快但落實難，老闆容易成為唯一驅動力。";
    }, 1000);
}

// =================================================================
// ⚡️ Coze API 量子分析
// =================================================================
async function runCozeAnalysis() {
    const btn = document.getElementById('analyzeBtn');
    const resultArea = document.getElementById('resultArea');

    btn.disabled = true;
    btn.innerHTML = `<span style="font-style:italic;">⚡ 正在校準 TimeWaver 頻率...</span>`;
    resultArea.style.display = 'block';
    resultArea.innerHTML = ""; 
    
    // 去名化文字
    await typeWriterSimple("正在連結初八企業顧問大腦...\n讀取高維度管理模型資料庫...\n校準 B2 場域能量參數...\n--------------------------------\n", resultArea);

    const diagnosisData = {
        "bottleneck": "B2 (管理瓶頸)",
        "keywords": "能量耗竭、強人依賴、決策雜訊",
        "risk_level": "High (高危)",
        "context": "老闆每天救火，員工等待指令"
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

        if (data && data.messages) {
            const aiMessage = data.messages.find(msg => msg.type === 'answer');
            if (aiMessage) {
                btn.innerHTML = "✅ 分析完成";
                typeWriterEffect(aiMessage.content, resultArea);
            }
        }
    } catch (error) {
        console.error("Coze Error:", error);
        resultArea.innerHTML += `\n\n⚠️ [演示模式] API 未連接。\n錯誤：${error.message}`;
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
// 🟢 Modal 邏輯 (B選項不刷新)
// =================================================================
function handleChoice(choice) {
    const modal = document.getElementById('peakModal');
    const body = document.getElementById('modalBodyContent');
    const actionContainer = document.getElementById('modalActionContainer');
    
    const name = document.getElementById('userName').value || "王總";
    const email = document.getElementById('userEmail').value || "(未填寫 Email)";
    
    actionContainer.innerHTML = ''; 

    if (choice === 'A') {
        body.innerHTML = `
            <p><strong>${name} 您好，</strong></p>
            <p>您即將啟動 <strong>72小時免費頻率共振測試</strong>。</p>
            <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
            <p style="font-size:0.9em; color:#555;">請確認您的資料：<br>Email: <strong>${email}</strong></p>
            <p style="color:#666; font-size:0.9em; margin-top:5px;">點擊按鈕將開啟微信/Line，本頁面會保留。</p>
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
        // 選項 B
        body.innerHTML = `
            <p><strong>${name} 您好，</strong></p>
            <p>您選擇僅獲取報告。我們已記錄需求。</p>
            <hr style="border:0; border-top:1px dashed #ccc; margin:10px 0;">
            <p><strong>系統將把診斷報告發送至：</strong><br><span style="color:#2563eb; font-weight:bold;">${email}</span></p>
            <p style="font-size:0.9em; color:#666; margin-top:5px;">(若信箱有誤，請點擊左下角修改)</p>
        `;
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'modal-btn';
        btn.style.background = '#64748b';
        btn.innerText = '👌 我知道了';
        btn.onclick = closeModal; // 只關閉，不刷新
        actionContainer.appendChild(btn);
    }
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('peakModal').classList.add('hidden');
}
