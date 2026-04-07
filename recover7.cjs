const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

// 1. replace getRoleLabel
const fn1_start = txt.indexOf('function getRoleLabel');
if (fn1_start !== -1) {
    const fn1_end = txt.indexOf('}', fn1_start);
    txt = txt.substring(0, fn1_start) +
        `function getRoleLabel(role: string): string {
  var map: Record<string, string> = { admin: '管理员', actor: '演员', user: '普通用户' };
  return map[role] || role;
` + txt.substring(fn1_end + 1);
}

// 2. replace getTypeLabel
const fn2_start = txt.indexOf('function getTypeLabel');
if (fn2_start !== -1) {
    const fn2_end = txt.indexOf('}', fn2_start);
    txt = txt.substring(0, fn2_start) +
        `function getTypeLabel(type: string): string {
  var map: Record<string, string> = {
    payment: '待缴费', training: '培训', exam: '考核', renewal: '年审', review: '待审核', info: '通知'
  };
  return map[type] || type;
` + txt.substring(fn2_end + 1);
}

// 3. replace getAuthLabel
const fn3_start = txt.indexOf('function getAuthLabel');
if (fn3_start !== -1) {
    const fn3_end = txt.indexOf('}', fn3_start);
    txt = txt.substring(0, fn3_start) +
        `function getAuthLabel(status: string): string {
  var map: Record<string, string> = {
    authenticated: '已认证', pending: '审核中', rejected: '已驳回', none: '未认证'
  };
  return map[status] || '未认证';
` + txt.substring(fn3_end + 1);
}

// 4. replace getDaysRemaining
const fn4_start = txt.indexOf('function getDaysRemaining');
if (fn4_start !== -1) {
    const fn4_end = txt.indexOf('}', fn4_start);
    txt = txt.substring(0, fn4_start) +
        `function getDaysRemaining(deadline: string): string {
  var d = new Date(deadline);
  var now = new Date();
  var diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '已过期';
  if (diff === 0) return '今天截止';
  if (diff <= 7) return '剩余 ' + diff + ' 天';
  return deadline.slice(5).replace('-', '/');
` + txt.substring(fn4_end + 1);
}

// 5. Replace broken unicode characters from GBK decoding artifacts
txt = txt.replace(/֪ͨ/g, "通知");
txt = txt.replace(/ѧϰ/g, "学习");
txt = txt.replace(/Ƶ/g, "短视频");
txt = txt.replace(/ҵ/g, "我的");
txt = txt.replace(/δ\s*֤/g, "未认证");
txt = txt.replace(/Ѳ\s*/g, "已驳回");
txt = txt.replace(/֤\s*/g, "认证");

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('recover7 done');
