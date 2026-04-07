const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index_recovered.tsx', 'utf8');

// 1. Remove duplicate CONFIG_LIST
// txt = txt.replace(/var CONFIG_LIST: ConfigItem\[\] = \[\s*\{\s*type: 'input', attributeId: 'user_name'[^\n]*\n[^\n]*\n[^\n]*\n\];/s, '');

// 2. Global \uFFFD and incorrect text replacements
const replacer = [
    ['移动端首\ufffd', '移动端首页'],
    ['中国演艺人才\ufffd\ufffd\ufffd\ufffd与服务平台需求规格说明书', '中国演艺人才管理与服务平台需求规格说明书'],
    ['审批管理管理考核相关快捷入口', '审批管理相关快捷入口'],
    ['底部Tab\ufffd\ufffd\ufffd\ufffd\ufffd"替代"认证\ufffd\ufffd"', '底部Tab"管理"替代"证书"'],
    ['待办为审核类待\ufffd', '待办为审核类待办'],
    ['证书/培训/考核相关', '证书/培训/考核相关'],
    ['底部标\ufffdTab', '底部标准Tab'],
    ['缴费/培训/考核类\ufffd', '缴费/培训/考核类'],
    ['人才检\ufffd\ufffd\ufffd学习', '人才检索、学习'],
    ['隐藏"认证"Tab', '隐藏"验证"Tab'],
    ['待办较\ufffd', '待办较少'],
    ["用户\ufffd?',", "用户名',"],
    ["显示的用户姓\ufffd?',", "显示的用户姓名',"],
    ["张明\ufffd?'", "张明远'"],
    ["认证状\ufffd?',", "认证状态',"],
    ["用户认证状\ufffd?',", "用户认证状态',"],
    ["封面\ufffd?", "封面图"],
    ["李管\ufffd?',", "李管理',"],
    ["王观\ufffd?'", "王观钰'"],
    ["管理员?',", "管理员',"],
    ["普通用\ufffd?'", "普通用户'"],
    ["认证申领缴费审核\ufffd笔）", "证书申领缴费审核（3笔）"],
    ["红榜推荐审批管理\ufffd项）", "红榜推荐审批管理（5项）"],
    ["舆情预警处理\ufffd项）", "舆情预警处理（12项）"],
    ["¥300.00\ufffd?", "¥300.00）"],
    ["即将开\ufffd?", "即将开班"],
    ["即将到\ufffd?", "即将到期"],
    ["报名\ufffd?'", "报名中'"],
    ["张明\ufffd", "张明远"],
    ["\ufffd026", "2026"],
    ["正式启\ufffd?", "正式启动"],
    ["发\ufffd?", "发展"],
    ["审批管理中心", "审批管理中心"], // Already OK
    ["认证审核", "认证审核"],
    ["数据统计", "数据统计"],
    ["系统设置", "系统设置"],
    ["认证申领", "证书申领"],
    ["在线培训", "在线培训"],
    ["预约", "预约"],
    ["个人认证", "个人认证"],
    ["认证认证", "证书验证"],
    ["人才检\ufffd?", "人才检索"],
    ["学习中心", "学习中心"],
    ["红黑\ufffd?", "红黑榜"],
    ["\ufffd?", ""]
];

for (const [s, r] of replacer) {
    txt = txt.split(s).join(r);
}

// 3. TAB_LIST replaces
txt = txt.replace(/var TAB_LIST_BY_ROLE[\s\S]*?\]\n\};/g,
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
};`);

// 4. Any raw \ufffd
const exactReplacements = {
    "未知的动\ufffd": "未知的动作",
    "欢迎回\ufffd": "欢迎回来",
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
    "\ufffd\ufffd\ufffd\ufffd\ufffd\ufffd": "", // Any block of empty
    "\ufffd": " " // Strip remaining space
};

for (const [k, v] of Object.entries(exactReplacements)) {
    txt = txt.split(k).join(v);
}

// Missing quote fixes
txt = txt.replace(/none: '未认证(\r?\n)/g, "none: '未认证'$1");
txt = txt.replace(/return map\[status\] \|\| '未认证;/g, "return map[status] || '未认证';");
txt = txt.replace(/if \(diff <= 7\) return '剩余 ' \+ diff \+ ' \?';/g, "if (diff <= 7) return '剩余 ' + diff + ' 天';");
txt = txt.replace(/ if \(diff <= 7\) return '剩余 ' \+ diff \+ '  ';/g, " if (diff <= 7) return '剩余 ' + diff + ' 天';");

// Remove leading \ufffd
txt = txt.replace(/^\?/, "");
txt = txt.replace(/^\ufffd/, "");

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('clean_recover2.cjs finished');
