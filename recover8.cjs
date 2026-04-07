const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

// 1. Fix Welcome Area
txt = txt.replace(/\{userName\}，欢迎回\b/g, '{userName}，欢迎回来');
txt = txt.replace(/\{getRoleLabel\(currentRole\)\} \n/g, '{getRoleLabel(currentRole)} ▾\n');
txt = txt.replace(/\{getRoleLabel\(currentRole\)\}\s*<\/span>/g, '{getRoleLabel(currentRole)} ▾\n                </span>');

// 2. Fix admin getRoleLabel
txt = txt.replace(/var map: Record<string, string> = \{ admin: '    ', actor: '演员', user: '普通用户' \}/g,
    `var map: Record<string, string> = { admin: '管理员', actor: '演员', user: '普通用户' }`);

// 3. Fix getDaysRemaining
txt = txt.replace(/if \(diff < 0\) return '已过';/g, "if (diff < 0) return '已过期';");
txt = txt.replace(/if \(diff <= 7\) return '剩余 ' \+ diff \+ ' ';\s*return deadline.slice\(5\).replace\('-', '\/'\);/g,
    "if (diff <= 7) return '剩余 ' + diff + ' 天';\n  return deadline.slice(5).replace('-', '/');");

// 4. Complete replace the admin array in todosByRole
txt = txt.replace(/admin: \[\s*\{\s*id: 'atd-1', title: '3份演员认证申请待审核'[\s\S]*?\]\,/m,
    `admin: [
    { id: 'atd-1', title: '3份演员认证申请待审核', type: 'review', deadline: '2026-03-31', action_url: '' },
    { id: 'atd-2', title: '证书申领缴费审核（5笔）', type: 'review', deadline: '2026-04-06', action_url: '' },
    { id: 'atd-3', title: '红榜推荐审批（2项）', type: 'review', deadline: '2026-04-10', action_url: '' },
    { id: 'atd-4', title: '舆情预警处理（1项）', type: 'review', deadline: '2026-03-30', action_url: '' }
  ],`);

// 5. Replace any stray unicode chars
txt = txt.replace(/֪ͨ/g, "通知");
txt = txt.replace(/>\s*֪ͨ公告/g, ">\n                通知公告");

// Write back
fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('recover8 done');
