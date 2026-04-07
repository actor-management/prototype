const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

// Fix typing errors from partial replacements
txt = txt.replace(/function getRoleLabel[\s\S]*?function getTypeLabel/m,
    `function getRoleLabel(role: string): string {
  var map: Record<string, string> = { admin: '管理员', actor: '演员', user: '普通用户' };
  return map[role] || role;
}

function getTypeLabel`);

txt = txt.replace(/function getTypeLabel[\s\S]*?function getAuthLabel/m,
    `function getTypeLabel(type: string): string {
  var map: Record<string, string> = {
    payment: '待缴费', training: '培训', exam: '考核', renewal: '年审', review: '待审核', info: '通知'
  };
  return map[type] || type;
}

function getAuthLabel`);

txt = txt.replace(/function getAuthLabel[\s\S]*?function getDaysRemaining/m,
    `function getAuthLabel(status: string): string {
  var map: Record<string, string> = {
    authenticated: '已认证', pending: '审核中', rejected: '已驳回', none: '未认证'
  };
  return map[status] || '未认证';
}

function getDaysRemaining`);

txt = txt.replace(/function getDaysRemaining[\s\S]*?export default/m,
    `function getDaysRemaining(deadline: string): string {
  var d = new Date(deadline);
  var now = new Date();
  var diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '已过期';
  if (diff === 0) return '今天截止';
  if (diff <= 7) return '剩余 ' + diff + ' 天';
  return deadline.slice(5).replace('-', '/');
}

// ===== 主组件 =====

export default`);

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('recover9 done');
