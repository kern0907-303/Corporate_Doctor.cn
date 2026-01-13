# 企业医生快速检测 v2.0

## 📋 专案结构

```
├── index.html              # 主页面(14 题问卷 + 结果页)
├── styles.css              # 样式档(蒂芬妮蓝配色)
├── app.js                  # 计算逻辑与互动功能
├── google-apps-script.js   # Google Sheets 串接
├── evaluation-system.md    # 评量系统规格文件
└── README.md               # 本说明文件
```

## 🚀 部署步骤

### Step 1：部署静态网站(Netlify)

1. 登入 [Netlify](https://netlify.com)
2. 拖曳 `index.html`、`styles.css`、`app.js` 三个档案至 Netlify
3. 取得网站网址

### Step 2：设定 Google Sheets

1. 建立新的 Google Sheets
2. 在第一列贴上以下栏位标题：

```
timestamp | name | company | email | phone | industry | size | q1 | q2 | q3 | q4 | q5 | q6 | q7 | q8 | q9 | q10 | q11 | q12 | q12Details | q13 | q14 | mainBottleneck | scoreB1 | scoreB2 | scoreB3 | scoreB4 | statusLevel | problemNature | actionAbilityScore | actionAbilityLevel | goalType
```

### Step 3：部署 Google Apps Script

1. 在 Google Sheets 中：扩充功能 → Apps Script
2. 贴上 `google-apps-script.js` 的内容
3. 修改 `SPREADSHEET_ID` 为你的试算表 ID
4. 部署 → 新增部署 → 网页应用程式
5. 设定「谁可以存取」为「所有人」
6. 复制部署网址

### Step 4：更新网站设定

编辑 `app.js`，更新 CONFIG：

```javascript
const CONFIG = {
    GOOGLE_SCRIPT_URL: '贴上你的 Apps Script 网址',
    CTA_LINKS: {
        green: '绿灯 CTA 连结',
        yellow: '黄灯 CTA 连结',
        red: '红灯 CTA 连结'
    }
};
```

## 📊 问卷结构

| 区块 | 题号 | 内容 |
|------|------|------|
| 基本资料 | - | 姓名、公司、Email、电话、产业、规模 |
| 现况诊断 | Q1-Q6 | 痛点、目标、决策、执行、管理、领导负担 |
| 时间轴 | Q7-Q8 | 慢性问题、急性恶化 |
| 资源盘点 | Q9-Q11 | 时间、帮手、优势 |
| 目标设定 | Q12-Q13 | 7天目标、预测阻力 |
| 准备度 | Q14 | 信心程度 |

## 🔢 评量系统

### 四大瓶颈

- **B1 市场瓶颈**：客户来源不稳、成交率低
- **B2 管理瓶颈**：决策慢、来回多、领导者过载
- **B3 执行瓶颈**：返工多、交付不稳
- **B4 现金流瓶颈**：资金压力、周转困难

### 灯号判定

- 🟢 **绿灯**：状态良好，持续保持
- 🟡 **黄灯**：有信号，需要关注
- 🔴 **红灯**：需要立即行动

### 行动能力

根据时间 + 帮手 + 信心计算：
- **低(1-4分)**：认知建立型计划
- **中(5-8分)**：认知 + 简化行动
- **高(9-13分)**：完整实战计划

## 📧 后续整合(n8n)

可建立 n8n workflow 实现：
1. 表单提交后自动发送诊断报告 Email
2. D3 追踪信
3. D7 成果回顾信

详见 `evaluation-system.md` 中的追踪信设计。

## 📝 版本记录

- v2.0：完整重构，14 题问卷 + 行动能力评估 + 客制化 7 天计划
- v1.0：基础版 6 题问卷
