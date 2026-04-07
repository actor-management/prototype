const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

// Fix Welcome Area
txt = txt.replace(/\{userName\}，欢迎回/g, '{userName}，欢迎回来');
txt = txt.replace(/\{getRoleLabel\(currentRole\)\} /g, '{getRoleLabel(currentRole)} ▾');

// Fix 深入学习
txt = txt.replace(/深入ѧϰ贯彻/g, '深入学习贯彻');
txt = txt.replace(/关于开026年度演员资格֤工作的通知/g, '关于开展2026年度演员资格认证工作的通知');
txt = txt.replace(/category: '֤  发放'/g, "category: '证书发放'");

// Fix 未知的动作
txt = txt.replace(/未知的动', name\);/g, "未知的动作', name);");

// Rewrite admin todos block
txt = txt.replace(/admin: \[\s*\{\s*id: 'atd-1'[\s\S]*?\]\,/m,
    `admin: [
    { id: 'atd-1', title: '3份演员认证申请待审核', type: 'review', deadline: '2026-03-31', action_url: '' },
    { id: 'atd-2', title: '证书申领缴费审核（5笔）', type: 'review', deadline: '2026-04-06', action_url: '' },
    { id: 'atd-3', title: '红榜推荐审批（2项）', type: 'review', deadline: '2026-04-10', action_url: '' },
    { id: 'atd-4', title: '舆情预警处理（1项）', type: 'review', deadline: '2026-03-30', action_url: '' }
  ],`);

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('recover5 done');
