const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index_recovered.tsx', 'utf8');

// The character is \ufffd
const exactReplacements = {
    "移动端首\ufffd": "移动端首页",
    "中国演艺人才\ufffd\ufffd\ufffd\ufffd与服务平台需求规格说明书": "中国演艺人才管理与服务平台需求规格说明书",
    "审批管理管理考核相关快捷入口": "审批管理相关快捷入口",
    "底部Tab\ufffd\ufffd\ufffd\ufffd\ufffd\"替代\"认证\ufffd\ufffd\"": "底部Tab\"管理\"替代\"证书\"",
    "待办为审核类待\ufffd": "待办为审核类待办",
    "证书/培训/考核相关": "证书/培训/考核相关",
    "底部标\ufffdTab": "底部标准Tab",
    "缴费/培训/考核类\ufffd": "缴费/培训/考核类",
    "人才检\ufffd\ufffd\ufffd学习": "人才检索、学习",
    "隐藏\"认证\"Tab": "隐藏\"验证\"Tab",
    "待办较\ufffd": "待办较少",
    "用户\ufffd?',": "用户名',",
    "显示的用户姓\ufffd?',": "显示的用户姓名',",
    "张明\ufffd?'": "张明远'",
    "认证状\ufffd?',": "认证状态',",
    "用户认证状\ufffd?',": "用户认证状态',",
    "封面\ufffd?": "封面图",
    "李管\ufffd?',": "李管理',",
    "王观\ufffd?'": "王观钰'",
    "管理员?',": "管理员',",
    "普通用\ufffd?'": "普通用户'",
    "未知的动\ufffd": "未知的动作",
    "未知的动',": "未知的动作',",
    "欢迎回\ufffd": "欢迎回来",
    "欢迎回?": "欢迎回来",
    "currentRole} \ufffd": "currentRole} ▾",
    "更多功\ufffd": "更多功能",
    "去认\ufffd": "去认证",
    " setSelectedTodo(null); }}>\ufffd</": " setSelectedTodo(null); }}>✕</",
    "进度\ufffd'": "进度。'",
    "去审\ufffd": "去审批",
    "去处\ufffd": "去处理",
    "事项\ufffd<": "事项。</",
    "处理\ufffd<": "处理。</",
    "部门\ufffd<": "部门。</",
    "生效\ufffd<": "生效。</",
    "平\ufffd<": "平台<",
    "指导\ufffd<": "指导。</",
    "作品\ufffd<": "作品。</",
    "能量\ufffd<": "能量。</",
    "能力\ufffd<": "能力。</",
    "待处\ufffd<": "待处理<",
    "已处\ufffd<": "已处理<",
    "已过\ufffd'": "已过期'",
    "认证\ufffd\ufffd发放": "证书发放",
    "深入ѧϰ贯彻党的二十大精神，推动演艺事业高质量发\ufffd": "深入学习贯彻党的二十大精神，推动演艺事业高质量发展",
    "关于开026年度演员资格֤工作的通知": "关于开展2026年度演员资格认证工作的通知",
    "category: '֤  发放'": "category: '证书发放'",
    "֪ͨ公告": "通知公告",
    "֪ͨ": "通知",
    "ѧϰ": "学习",
    "Ƶ": "短视频",
    "ҵ": "我的",
    "δ  ֤": "未认证",
    "Ѳ   ": "已驳回",
    "֤  ": "认证"
};

for (const [k, v] of Object.entries(exactReplacements)) {
    txt = txt.split(k).join(v);
}

// Global specific fix for \ufffd sequences that got empty
txt = txt.replace(/\ufffd/g, "");

// Block replacers (Regex to replace completely)
txt = txt.replace(/var QUICK_ACTIONS_BY_ROLE[\s\S]*?^\};\n?/m,
    `var QUICK_ACTIONS_BY_ROLE: Record<string, Array<{ key: string; label: string; icon: string; color: string; route: string }>> = {
  admin: [
    { key: 'review', label: '审批中心', icon: 'clipboard', color: 'cert', route: '/prototypes/yanyuan-app-certification' },
    { key: 'auth_review', label: '认证审核', icon: 'usercheck', color: 'auth', route: '/prototypes/yanyuan-app-certification' },
    { key: 'stats', label: '数据统计', icon: 'chart', color: 'train', route: '/prototypes/yanyuan-app-profile' },
    { key: 'settings', label: '系统设置', icon: 'settings', color: 'exam', route: '/prototypes/yanyuan-app-profile' }
  ],
  actor: [
    { key: 'cert_apply', label: '证书申领', icon: 'file', color: 'cert', route: '/prototypes/yanyuan-app-cert-apply' },
    { key: 'training', label: '在线培训', icon: 'book', color: 'train', route: '/prototypes/yanyuan-app-training' },
    { key: 'exam', label: '考核预约', icon: 'clipboard', color: 'exam', route: '/prototypes/yanyuan-app-exam-list' },
    { key: 'auth', label: '个人认证', icon: 'shield', color: 'auth', route: '/prototypes/yanyuan-app-certification' }
  ],
  user: [
    { key: 'cert_verify', label: '证书验证', icon: 'shield', color: 'cert', route: '/prototypes/yanyuan-app-cert-verify' },
    { key: 'talent_search', label: '人才检索', icon: 'usercheck', color: 'train', route: '/prototypes/yanyuan-app-profile' },
    { key: 'learning', label: '学习中心', icon: 'book', color: 'exam', route: '/prototypes/yanyuan-app-training' },
    { key: 'honor', label: '红黑榜', icon: 'chart', color: 'auth', route: '/prototypes/yanyuan-app-profile' }
  ]
};
`);

txt = txt.replace(/var TAB_LIST_BY_ROLE[\s\S]*?^\};\n?/m,
    `var TAB_LIST_BY_ROLE: Record<string, Array<{ label: string; icon: string }>> = {
  admin: [
    { label: '首页', icon: 'home' },
    { label: '短视频', icon: 'video' },
    { label: '管理', icon: 'settings' },
    { label: '证书', icon: 'award' },
    { label: '学习', icon: 'book' },
    { label: '我的', icon: 'user' }
  ],
  actor: [
    { label: '首页', icon: 'home' },
    { label: '短视频', icon: 'video' },
    { label: '认证', icon: 'shield' },
    { label: '证书', icon: 'award' },
    { label: '学习', icon: 'book' },
    { label: '我的', icon: 'user' }
  ],
  user: [
    { label: '首页', icon: 'home' },
    { label: '短视频', icon: 'video' },
    { label: '验证', icon: 'shield' },
    { label: '学习', icon: 'book' },
    { label: '我的', icon: 'user' }
  ]
};
`);

txt = txt.replace(/function getRoleLabel[\s\S]*? return map\[role\][^\}]+?\}/,
    `function getRoleLabel(role: string): string {
  var map: Record<string, string> = { admin: '管理员', actor: '演员', user: '普通用户' };
  return map[role] || role;
}`);

txt = txt.replace(/function getTypeLabel[\s\S]*? return map\[type\][^\}]+?\}/,
    `function getTypeLabel(type: string): string {
  var map: Record<string, string> = {
    payment: '待缴费', training: '培训', exam: '考核', renewal: '年审', review: '待审核', info: '通知'
  };
  return map[type] || type;
}`);

txt = txt.replace(/function getAuthLabel[\s\S]*? return map\[status\][^\}]+?\}/,
    `function getAuthLabel(status: string): string {
  var map: Record<string, string> = {
    authenticated: '已认证', pending: '审核中', rejected: '已驳回', none: '未认证'
  };
  return map[status] || '未认证';
}`);

txt = txt.replace(/function getDaysRemaining[\s\S]*? return deadline.slice[^\}]+?\}/,
    `function getDaysRemaining(deadline: string): string {
  var d = new Date(deadline);
  var now = new Date();
  var diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '已过期';
  if (diff === 0) return '今天截止';
  if (diff <= 7) return '剩余 ' + diff + ' 天';
  return deadline.slice(5).replace('-', '/');
}`);

txt = txt.replace(/admin: \[\s*\{\s*id: 'atd-1'[\s\S]*?\]\,/m,
    `admin: [
    { id: 'atd-1', title: '3份演员认证申请待审核', type: 'review', deadline: '2026-03-31', action_url: '' },
    { id: 'atd-2', title: '证书申领缴费审核（5笔）', type: 'review', deadline: '2026-04-06', action_url: '' },
    { id: 'atd-3', title: '红榜推荐审批（2项）', type: 'review', deadline: '2026-04-10', action_url: '' },
    { id: 'atd-4', title: '舆情预警处理（1项）', type: 'review', deadline: '2026-03-30', action_url: '' }
  ],`);

// Fix Missing Quotes and Logic Updates from index_recovered
txt = txt.replace(/none: '未认证(\r?\n)/g, "none: '未认证'$1");
txt = txt.replace(/none: 'δ[\\s\\S]*?认证(\r?\n)/g, "none: '未认证'$1");
txt = txt.replace(/\{userName\}，欢迎回/g, '{userName}，欢迎回来');
txt = txt.replace(/\{getRoleLabel\(currentRole\)\} /g, '{getRoleLabel(currentRole)} ▾');
txt = txt.replace(/\{currentRole !== 'user' && todos\.length > 0 && \(/g, `{todos.length > 0 && (`);

txt = txt.replace(/<span className="title-dot" \/>\s*待办事项/g,
    `<span className="title-dot" />\n                {currentRole === 'user' ? '消息动态' : '待处理事项'}`);

txt = txt.replace(/<span className="yanyuan-home-fullscreen-title">待办事项/g,
    `<span className="yanyuan-home-fullscreen-title">{currentRole === 'user' ? '消息动态' : '待处理事项'}`);


// Remove remaining ? at start
txt = txt.replace(/^\?/, "");
txt = txt.replace(/^\ufffd/, "");

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('master recover 2 done');
