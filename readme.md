# 企业医生快速检测 v2.0

## 📋 專案結構

```
├── index.html              # 主頁面(14 題問卷 + 結果頁)
├── styles.css              # 樣式檔(蒂芬妮藍配色)
├── app.js                  # 計算邏輯与互动功能
├── google-apps-script.js   # Google Sheets 串接
├── evaluation-system.md    # 評量系统規格文件
└── README.md               # 本說明文件
```

## 🚀 部署步驟

### Step 1：部署靜態網站(Netlify)

1. 登入 [Netlify](https://netlify.com)
2. 拖曳 `index.html`、`styles.css`、`app.js` 三個檔案至 Netlify
3. 取得網站網址

### Step 2：設定 Google Sheets

1. 建立新的 Google Sheets
2. 在第一列貼上以下欄位标題：

```
timestamp | name | company | email | phone | industry | size | q1 | q2 | q3 | q4 | q5 | q6 | q7 | q8 | q9 | q10 | q11 | q12 | q12Details | q13 | q14 | mainBottleneck | scoreB1 | scoreB2 | scoreB3 | scoreB4 | statusLevel | problemNature | actionAbilityScore | actionAbilityLevel | goalType
```

### Step 3：部署 Google Apps Script

1. 在 Google Sheets 中：擴充功能 → Apps Script
2. 貼上 `google-apps-script.js` 的內容
3. 修改 `SPREADSHEET_ID` 為你的試算表 ID
4. 部署 → 新增部署 → 網頁应用程式
5. 設定「誰可以存取」為「所有人」
6. 複製部署網址

### Step 4：更新網站設定

編輯 `app.js`，更新 CONFIG：

```javascript
const CONFIG = {
    GOOGLE_SCRIPT_URL: '貼上你的 Apps Script 網址',
    CTA_LINKS: {
        green: '綠燈 CTA 連結',
        yellow: '黃燈 CTA 連結',
        red: '紅燈 CTA 連結'
    }
};
```

## 📊 問卷結構

| 區塊 | 題号 | 內容 |
|------|------|------|
| 基本資料 | - | 姓名、公司、Email、電話、產業、規模 |
| 现況诊断 | Q1-Q6 | 痛点、目标、決策、執行、管理、領導负擔 |
| 时間軸 | Q7-Q8 | 慢性問題、急性惡化 |
| 資源盤点 | Q9-Q11 | 时間、幫手、優勢 |
| 目标設定 | Q12-Q13 | 7天目标、預测阻力 |
| 准备度 | Q14 | 信心程度 |

## 🔢 評量系统

### 四大瓶颈

- **B1 市場瓶颈**：客户來源不穩、成交率低
- **B2 管理瓶颈**：決策慢、來回多、領導者過載
- **B3 執行瓶颈**：返工多、交付不穩
- **B4 现金流瓶颈**：資金壓力、週轉困難

### 燈号判定

- 🟢 **綠燈**：狀態良好，持續保持
- 🟡 **黃燈**：有信号，需要关注
- 🔴 **紅燈**：需要立即行动

### 行动能力

根據时間 + 幫手 + 信心計算：
- **低(1-4分)**：認知建立型計畫
- **中(5-8分)**：認知 + 簡化行动
- **高(9-13分)**：完整實戰計畫

## 📧 后續整合(n8n)

可建立 n8n workflow 實现：
1. 表單提交后自动发送诊断報告 Email
2. D3 追蹤信
3. D7 成果回顾信

詳見 `evaluation-system.md` 中的追蹤信設計。

## 📝 版本記錄

- v2.0：完整重構，14 題問卷 + 行动能力評估 + 客製化 7 天計畫
- v1.0：基礎版 6 題問卷
