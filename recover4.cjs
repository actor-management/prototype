const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

// 1. Rewrite QUICK_ACTIONS_BY_ROLE
txt = txt.replace(/var QUICK_ACTIONS_BY_ROLE: Record<string, Array<\{.*?\}>> = \{[\s\S]*?^\};\n?/m,
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

// 2. Rewrite TAB_LIST_BY_ROLE
txt = txt.replace(/var TAB_LIST_BY_ROLE: Record<string, Array<\{.*?\}>> = \{[\s\S]*?^\};\n?/m,
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

// 3. Rewrite getTypeLabel
txt = txt.replace(/function getTypeLabel[\s\S]*? return map\[type\] \|\| type;\n\}/m,
    `function getTypeLabel(type: string): string {
  var map: Record<string, string> = {
    payment: '待缴费', training: '培训', exam: '考核', renewal: '年审', review: '待审核', info: '通知'
  };
  return map[type] || type;
}`);

// 4. Rewrite getAuthLabel
txt = txt.replace(/function getAuthLabel[\s\S]*? return map\[status\] \|\| '未认证';\n\}/m,
    `function getAuthLabel(status: string): string {
  var map: Record<string, string> = {
    authenticated: '已认证', pending: '审核中', rejected: '已驳回', none: '未认证'
  };
  return map[status] || '未认证';
}`);

// 5. User role '消息动态' fixes
// replace: {currentRole !== 'user' && todos.length > 0 && (
txt = txt.replace(/\{currentRole !== 'user' && todos\.length > 0 && \(/g,
    `{todos.length > 0 && (`);

// replace: 待办事项
// This one appears in multiple places, need to be careful
txt = txt.replace(/<h2 className="yanyuan-home-section-title">\s*<span className="title-dot" \/>\s*待办事项\s*<\/h2>/,
    `<h2 className="yanyuan-home-section-title">
                <span className="title-dot" />
                {currentRole === 'user' ? '消息动态' : '待办事项'}
              </h2>`);

txt = txt.replace(/<span className="yanyuan-home-fullscreen-title">待办事项/,
    `<span className="yanyuan-home-fullscreen-title">{currentRole === 'user' ? '消息动态' : '待办事项'}`);

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('recover4 done');
