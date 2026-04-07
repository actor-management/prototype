/**
 * @name 演艺人才平台 - 移动端首页
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.1 §5.2
 *
 * 角色差异化说明：
 * - Admin：显示审批管理相关快捷入口（审批中心、认证审核、数据统计、系统设置），
 *          底部Tab"管理"替代"认证"，待办为审核类待办
 * - Actor：显示证书/培训/考核相关快捷入口，底部标准6Tab，待办为缴费/培训/考核类
 * - User：显示浏览查询类快捷入口（证书验证、人才检索、学习中心、红黑榜），
 *          底部Tab精简为5个（移除认证），无待办模块。未认证时展示认证引导卡片。
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
  Home, Film, Settings, Award, BookOpen, User, Shield, ShieldCheck,
  FileText, ClipboardCheck, UserCheck, BarChart3, ChevronRight,
  Clock, Bell, Star, ArrowLeft, X, CheckCircle2, AlertCircle
} from 'lucide-react';

import type {
  KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle
} from '../../common/axure-types';

// ===== Axure API 定义 =====

var EVENT_LIST: EventItem[] = [
  { name: 'on_tab_change', desc: '底部Tab切换，返回Tab索引' },
  { name: 'on_todo_click', desc: '点击待办项，返回待办ID' },
  { name: 'on_notice_click', desc: '点击通知项，返回通知ID' }
];

var ACTION_LIST: Action[] = [
  { name: 'switch_role', desc: '切换演示角色，参数：admin/actor/user' }
];

var VAR_LIST: KeyDesc[] = [
  { name: 'current_role', desc: '当前角色' },
  { name: 'auth_status', desc: '认证状态' },
  { name: 'active_tab', desc: '当前激活Tab' }
];

var CONFIG_LIST: ConfigItem[] = [
  { type: 'input', attributeId: 'user_name', displayName: '用户名', info: '显示的用户姓名', initialValue: '张明远' },
  { type: 'input', attributeId: 'user_avatar', displayName: '用户头像', info: '用户头像URL', initialValue: '' },
  { type: 'select', attributeId: 'auth_status', displayName: '认证状态', info: '用户认证状态', initialValue: 'authenticated' }
];

var DATA_LIST: DataDesc[] = [
  {
    name: 'todo_item',
    desc: '待办事项',
    keys: [
      { name: 'id', desc: '待办ID' },
      { name: 'title', desc: '待办标题' },
      { name: 'type', desc: '类型：payment/training/exam/renewal/review' },
      { name: 'deadline', desc: '截止时间' },
      { name: 'action_url', desc: '跳转链接' }
    ]
  },
  {
    name: 'notice_item',
    desc: '通知公告',
    keys: [
      { name: 'id', desc: '通知ID' },
      { name: 'title', desc: '通知标题' },
      { name: 'category', desc: '分类' },
      { name: 'publish_time', desc: '发布时间' },
      { name: 'is_read', desc: '是否已读' }
    ]
  },
  {
    name: 'party_article',
    desc: '党建文章',
    keys: [
      { name: 'id', desc: '文章ID' },
      { name: 'title', desc: '标题' },
      { name: 'summary', desc: '摘要' },
      { name: 'cover_image', desc: '封面图' },
      { name: 'publish_time', desc: '发布时间' }
    ]
  }
];

// ===== 角色工具函数 =====

function getCurrentRole(): string {
  try { return localStorage.getItem('yanyuan_role') || 'actor'; }
  catch (e) { return 'actor'; }
}

function getRoleName(role: string): string {
  var map: Record<string, string> = { admin: '李管理', actor: '张明远', user: '王观众' };
  return map[role] || '用户';
}

function getRoleLabel(role: string): string {
  var map: Record<string, string> = { admin: '管理员', actor: '演员', user: '普通用户' };
  return map[role] || role;
}

// ===== 示例数据 =====

var todosByRole: Record<string, any[]> = {
  admin: [
    { id: 'atd-1', title: '3份演员认证申请待审核', type: 'review', deadline: '2026-03-31', action_url: '' },
    { id: 'atd-2', title: '证书申领缴费审核（5笔）', type: 'review', deadline: '2026-04-06', action_url: '' },
    { id: 'atd-3', title: '红榜推荐审批（2项）', type: 'review', deadline: '2026-04-10', action_url: '' },
    { id: 'atd-4', title: '舆情预警处理（1项）', type: 'review', deadline: '2026-03-30', action_url: '' }
  ],
  actor: [
    { id: 'td-1', title: '演员资格证申领费待缴纳（¥300.00）', type: 'payment', deadline: '2026-03-31', action_url: '' },
    { id: 'td-2', title: '艺德修养培训第三期即将开班', type: 'training', deadline: '2026-04-15', action_url: '' },
    { id: 'td-3', title: '二级演员资格证年审即将到期', type: 'renewal', deadline: '2026-05-01', action_url: '' },
    { id: 'td-4', title: '表演能力考核（第二季度）报名中', type: 'exam', deadline: '2026-04-20', action_url: '' }
  ],
  user: []
};

var defaultNotices = [
  { id: 'n-1', title: '关于开展2026年度演员资格认证年审工作的通知', category: '证书发放', publish_time: '2026-03-25', is_read: false },
  { id: 'n-2', title: '第十二届全国优秀演员评选活动报名正式启动', category: '政策公示', publish_time: '2026-03-23', is_read: false },
  { id: 'n-3', title: '2026年第二季度表演能力考核安排公告', category: '考试安排', publish_time: '2026-03-20', is_read: true },
  { id: 'n-4', title: '演员委员会关于加强艺德建设的指导意见', category: '政策公示', publish_time: '2026-03-18', is_read: true },
  { id: 'n-5', title: '2026年春季艺德修养培训班开课通知', category: '考试安排', publish_time: '2026-03-15', is_read: true }
];

var defaultPartyArticle = {
  id: 'article-1',
  title: '深入学习贯彻党的二十大精神，推动演艺事业高质量发展',
  summary: '演员委员会号召广大演艺工作者坚持以人民为中心的创作导向，践行社会主义核心价值观...',
  cover_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  publish_time: '2026-03-22'
};

// ===== 路由导航映射（按角色区分）=====

var TAB_ROUTES_BY_ROLE: Record<string, string[]> = {
  admin: [
    '/prototypes/yanyuan-app-home',
    '',
    '/prototypes/yanyuan-app-admin',
    '/prototypes/yanyuan-app-certificate',
    '/prototypes/yanyuan-app-training',
    '/prototypes/yanyuan-app-profile'
  ],
  actor: [
    '/prototypes/yanyuan-app-home',
    '',
    '/prototypes/yanyuan-app-certification',
    '/prototypes/yanyuan-app-certificate',
    '/prototypes/yanyuan-app-training',
    '/prototypes/yanyuan-app-profile'
  ],
  user: [
    '/prototypes/yanyuan-app-home',
    '',
    '/prototypes/yanyuan-app-certification',
    '/prototypes/yanyuan-app-certificate',
    '/prototypes/yanyuan-app-training',
    '/prototypes/yanyuan-app-profile'
  ]
};

// ===== 快捷操作按角色定义 =====

var QUICK_ACTIONS_BY_ROLE: Record<string, Array<{ key: string; label: string; icon: string; color: string; route: string }>> = {
  admin: [
    { key: 'review', label: '审批中心', icon: 'clipboard', color: 'cert', route: '/prototypes/yanyuan-app-cert-admin' },
    { key: 'auth_review', label: '认证审核', icon: 'usercheck', color: 'auth', route: '/prototypes/yanyuan-app-cert-admin' },
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

// ===== 底部Tab按角色定义 =====

var TAB_LIST_BY_ROLE: Record<string, Array<{ label: string; icon: string }>> = {
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
    { label: '实名', icon: 'shield' },
    { label: '证书', icon: 'award' },
    { label: '学习', icon: 'book' },
    { label: '我的', icon: 'user' }
  ]
};

function navigateTo(path: string) {
  window.location.href = path;
}

// ===== 工具函数 =====

function getTypeLabel(type: string): string {
  var map: Record<string, string> = {
    payment: '待缴费', training: '培训', exam: '考核', renewal: '年审', review: '待审核', info: '通知'
  };
  return map[type] || type;
}

function getAuthLabel(status: string): string {
  var map: Record<string, string> = {
    authenticated: '已认证', pending: '审核中', rejected: '已驳回', none: '未认证'
  };
  return map[status] || '未认证';
}

function getDaysRemaining(deadline: string): string {
  var d = new Date(deadline);
  var now = new Date();
  var diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '已过期';
  if (diff === 0) return '今天截止';
  if (diff <= 7) return '剩余 ' + diff + ' 天';
  return deadline.slice(5).replace('-', '/');
}

function isUrgent(deadline: string): boolean {
  var d = new Date(deadline);
  var now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 3;
}

// 快捷操作图标
function QuickIcon(props: { type: string; size?: number }) {
  var s = props.size || 24;
  switch (props.type) {
    case 'file': return <FileText size={s} />;
    case 'book': return <BookOpen size={s} />;
    case 'clipboard': return <ClipboardCheck size={s} />;
    case 'shield': return <ShieldCheck size={s} />;
    case 'usercheck': return <UserCheck size={s} />;
    case 'chart': return <BarChart3 size={s} />;
    case 'settings': return <Settings size={s} />;
    default: return <FileText size={s} />;
  }
}

// 待办项类型对应的图标
function TodoIcon(props: { type: string }) {
  var iconMap: Record<string, any> = {
    payment: <FileText size={20} />,
    training: <BookOpen size={20} />,
    exam: <ClipboardCheck size={20} />,
    renewal: <Clock size={20} />,
    review: <CheckCircle2 size={20} />,
    info: <Bell size={20} />
  };
  return iconMap[props.type] || <Bell size={20} />;
}

// 底部Tab图标
function TabIcon(props: { type: string; active: boolean }) {
  var s = props.active ? 22 : 20;
  var color = props.active ? '#C41A1A' : '#999';
  switch (props.type) {
    case 'home': return <Home size={s} color={color} />;
    case 'video': return <Film size={s} color={color} />;
    case 'settings': return <Settings size={s} color={color} />;
    case 'award': return <Award size={s} color={color} />;
    case 'book': return <BookOpen size={s} color={color} />;
    case 'user': return <User size={s} color={color} />;
    case 'shield': return <Shield size={s} color={color} />;
    default: return <Home size={s} color={color} />;
  }
}

// ===== 主组件 =====

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppHome(innerProps, ref) {
  var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

  // 角色
  var roleState = useState<string>(getCurrentRole);
  var currentRole = roleState[0];
  var setCurrentRole = roleState[1];

  // 认证状态（User 默认未认证，其他已认证）
  var authState = useState<string>(function () {
    return currentRole === 'user' ? 'none' : 'authenticated';
  });
  var authStatus = authState[0];
  var setAuthStatus = authState[1];

  // 用户名
  var userName = getRoleName(currentRole);

  // Tab 激活状态
  var tabState = useState<number>(0);
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  // 通知展开状态
  var noticeExpandState = useState<boolean>(false);
  var noticeExpand = noticeExpandState[0];
  var setNoticeExpand = noticeExpandState[1];

  // 认证引导弹窗状态（User 未认证时点击受限 Tab 触发）
  var authModalState = useState<boolean>(false);
  var showAuthModal = authModalState[0];
  var setShowAuthModal = authModalState[1];

  // 待办详情弹窗
  var todoDetailState = useState<any>(null);
  var selectedTodo = todoDetailState[0];
  var setSelectedTodo = todoDetailState[1];

  // 通知详情弹窗
  var noticeDetailState = useState<any>(null);
  var selectedNotice = noticeDetailState[0];
  var setSelectedNotice = noticeDetailState[1];

  // 党建详情弹窗
  var partyDetailState = useState<boolean>(false);
  var showPartyDetail = partyDetailState[0];
  var setShowPartyDetail = partyDetailState[1];

  // 待办全量列表弹窗
  var todoListState = useState<boolean>(false);
  var showTodoList = todoListState[0];
  var setShowTodoList = todoListState[1];

  // 通知全量列表弹窗
  var noticeListState = useState<boolean>(false);
  var showNoticeList = noticeListState[0];
  var setShowNoticeList = noticeListState[1];

  // 待办列表筛选
  var todoFilterState = useState<string>('all');
  var todoFilter = todoFilterState[0];
  var setTodoFilter = todoFilterState[1];

  // 通知列表筛选
  var noticeFilterState = useState<string>('all');
  var noticeFilter = noticeFilterState[0];
  var setNoticeFilter = noticeFilterState[1];

  // 事件发射
  var emitEvent = useCallback(function (eventName: string, payload?: string) {
    try { onEventHandler(eventName, payload); } catch (e) { /* 忽略 */ }
  }, [onEventHandler]);

  // Tab切换
  var handleTabChange = useCallback(function (idx: number) {
    var tabs = TAB_LIST_BY_ROLE[currentRole] || TAB_LIST_BY_ROLE.actor;
    // User/Actor 未认证时，仅允许首页(0)、短视频(1)、认证中心(2)，其他 Tab 弹出认证引导
    if (authStatus === 'none' && idx > 2) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(idx);
    emitEvent('on_tab_change', String(idx));
    // 跳转路由
    var routes = TAB_ROUTES_BY_ROLE[currentRole] || TAB_ROUTES_BY_ROLE.actor;
    if (routes[idx] && idx !== 0) {
      navigateTo(routes[idx]);
    }
  }, [currentRole, authStatus, emitEvent]);

  // 角色切换（跳转登录页）
  var handleSwitchRole = useCallback(function () {
    navigateTo('/prototypes/yanyuan-app-login');
  }, []);

  // 快捷操作动作
  var handleQuickAction = useCallback(function (route: string) {
    if (route) navigateTo(route);
  }, []);

  // 待办数据
  var todos = todosByRole[currentRole] || [];

  // 获取筛选的通知列表
  var filteredNotices = noticeFilter === 'all'
    ? defaultNotices
    : defaultNotices.filter(function (n) { return n.category === noticeFilter; });

  // Axure Handle
  useImperativeHandle(ref, function () {
    return {
      getVar: function (name: string) {
        var vars: Record<string, any> = {
          current_role: currentRole,
          auth_status: authStatus,
          active_tab: activeTab
        };
        return vars[name];
      },
      fireAction: function (name: string, params?: string) {
        if (name === 'switch_role' && params) {
          setCurrentRole(params);
          try { localStorage.setItem('yanyuan_role', params); } catch (e) { /* 忽略 */ }
        }
      },
      eventList: EVENT_LIST,
      actionList: ACTION_LIST,
      varList: VAR_LIST,
      configList: CONFIG_LIST,
      dataList: DATA_LIST
    };
  }, [currentRole, authStatus, activeTab]);

  // ===== 渲染 =====
  var quickActions = QUICK_ACTIONS_BY_ROLE[currentRole] || QUICK_ACTIONS_BY_ROLE.actor;
  var tabList = TAB_LIST_BY_ROLE[currentRole] || TAB_LIST_BY_ROLE.actor;

  return (
    <div className="yanyuan-home-container">
      {/* 可滚动内容区域 */}
      <div className="yanyuan-home-scroll">
        {/* ===== 顶部欢迎区 ===== */}
        <div className="yanyuan-home-hero">
          <div className="yanyuan-home-user-row">
            <div className="yanyuan-home-avatar">
              <div className="yanyuan-home-avatar-placeholder">
                {userName.charAt(0)}
              </div>
            </div>
            <div className="yanyuan-home-user-info">
              <h1 className="yanyuan-home-greeting">
                {userName}，欢迎回来
              </h1>
              <div className="yanyuan-home-user-tags">
                <span className={'yanyuan-home-auth-tag ' + authStatus}>
                  {getAuthLabel(authStatus)}
                </span>
                <span className="yanyuan-home-role-tag" onClick={handleSwitchRole}>
                  {getRoleLabel(currentRole)} ▾
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== User 未认证引导卡片 ===== */}
        {currentRole === 'user' && authStatus === 'none' && (
          <div className="yanyuan-home-auth-guide">
            <div className="yanyuan-home-auth-guide-inner">
              <div className="yanyuan-home-auth-guide-icon">
                <ShieldCheck size={24} color="#FF8C00" />
              </div>
              <div className="yanyuan-home-auth-guide-content">
                <div className="yanyuan-home-auth-guide-title">完成个人认证，解锁更多功能</div>
                <div className="yanyuan-home-auth-guide-desc">认证后可使用证书验证、在线学习、个人中心等全部功能</div>
              </div>
              <button className="yanyuan-home-auth-guide-btn" onClick={function () { navigateTo('/prototypes/yanyuan-app-info-fill'); }}>
                立即认证
              </button>
            </div>
          </div>
        )}

        {/* ===== 快捷操作宫格（按角色） ===== */}
        <div className="yanyuan-home-section">
          <div className="yanyuan-home-quick-grid">
            {quickActions.map(function (action) {
              return (
                <div key={action.key} className="yanyuan-home-quick-item" onClick={function () { handleQuickAction(action.route); }}>
                  <div className={'yanyuan-home-quick-icon ' + action.color}>
                    <QuickIcon type={action.icon} size={24} />
                  </div>
                  <span className="yanyuan-home-quick-label">{action.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 待办事项 - 仅 Admin / Actor ===== */}
        {currentRole !== 'user' && todos.length > 0 && (
          <div className="yanyuan-home-section">
            <div className="yanyuan-home-section-header">
              <h2 className="yanyuan-home-section-title">
                <span className="title-dot" />
                待办事项
              </h2>
              <span className="yanyuan-home-section-more" onClick={function () { setShowTodoList(true); }}>
                查看更多 <ChevronRight size={14} />
              </span>
            </div>
            <div className="yanyuan-home-todo-list">
              {todos.slice(0, 4).map(function (todo) {
                return (
                  <div key={todo.id} className="yanyuan-home-todo-card" onClick={function () { setSelectedTodo(todo); emitEvent('on_todo_click', todo.id); }}>
                    <div className={'yanyuan-home-todo-icon ' + todo.type}>
                      <TodoIcon type={todo.type} />
                    </div>
                    <div className="yanyuan-home-todo-content">
                      <div className="yanyuan-home-todo-title">{todo.title}</div>
                      <div className="yanyuan-home-todo-meta">
                        <span className="yanyuan-home-todo-type">{getTypeLabel(todo.type)}</span>
                        <span className={'yanyuan-home-todo-deadline' + (isUrgent(todo.deadline) ? ' urgent' : '')}>
                          <Clock size={12} />
                          {' '}{getDaysRemaining(todo.deadline)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="yanyuan-home-todo-arrow" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== 通知公告 ===== */}
        <div className="yanyuan-home-section">
          <div className="yanyuan-home-section-header">
            <h2 className="yanyuan-home-section-title">
              <span className="title-dot" />
              通知公告
            </h2>
            <span className="yanyuan-home-section-more" onClick={function () { setShowNoticeList(true); }}>
              查看更多 <ChevronRight size={14} />
            </span>
          </div>
          <div className="yanyuan-home-notice-list">
            {defaultNotices.slice(0, 5).map(function (notice) {
              return (
                <div key={notice.id} className="yanyuan-home-notice-item" onClick={function () { setSelectedNotice(notice); emitEvent('on_notice_click', notice.id); }}>
                  <div className="yanyuan-home-notice-dot-wrap">
                    {!notice.is_read && <span className="yanyuan-home-notice-dot" />}
                  </div>
                  <div className="yanyuan-home-notice-content">
                    <div className="yanyuan-home-notice-title">{notice.title}</div>
                    <div className="yanyuan-home-notice-meta">
                      <span className="yanyuan-home-notice-category">{notice.category}</span>
                      <span className="yanyuan-home-notice-time">{notice.publish_time}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="yanyuan-home-notice-arrow" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 党建专栏 ===== */}
        <div className="yanyuan-home-section">
          <div className="yanyuan-home-section-header">
            <h2 className="yanyuan-home-section-title">
              <span className="title-dot" />
              党建专栏
            </h2>
          </div>
          <div className="yanyuan-home-party-card" onClick={function () { setShowPartyDetail(true); }}>
            <img className="yanyuan-home-party-cover" src={defaultPartyArticle.cover_image} alt="党建文章封面" />
            <div className="yanyuan-home-party-info">
              <span className="yanyuan-home-party-tag">党建专栏</span>
              <h3 className="yanyuan-home-party-title">{defaultPartyArticle.title}</h3>
              <p className="yanyuan-home-party-summary">{defaultPartyArticle.summary}</p>
              <span className="yanyuan-home-party-time">{defaultPartyArticle.publish_time}</span>
            </div>
          </div>
        </div>

        {/* 底部留白（给Tab栏让位） */}
        <div style={{ height: 72 }} />
      </div>

      {/* ===== 底部导航栏 ===== */}
      <div className="yanyuan-home-tabbar">
        {tabList.map(function (tab, idx) {
          var isActive = activeTab === idx;
          return (
            <div key={tab.label} className={'yanyuan-home-tab-item' + (isActive ? ' active' : '')} onClick={function () { handleTabChange(idx); }}>
              <TabIcon type={tab.icon} active={isActive} />
              <span className={'yanyuan-home-tab-label' + (isActive ? ' active' : '')}>{tab.label}</span>
            </div>
          );
        })}
      </div>

      {/* ===== User 未认证引导弹窗 ===== */}
      {showAuthModal && (
        <div className="yanyuan-home-modal-overlay" onClick={function () { setShowAuthModal(false); }}>
          <div className="yanyuan-home-auth-modal" onClick={function (e) { e.stopPropagation(); }}>
            <div className="yanyuan-home-auth-modal-icon">
              <ShieldCheck size={48} color="#C41A1A" />
            </div>
            <div className="yanyuan-home-auth-modal-title">请先完成个人认证</div>
            <div className="yanyuan-home-auth-modal-desc">完成个人信息认证后，即可使用平台全部功能</div>
            <div className="yanyuan-home-auth-modal-buttons">
              <button className="yanyuan-home-auth-modal-btn primary" onClick={function () { navigateTo('/prototypes/yanyuan-app-info-fill'); }}>去认证</button>
              <button className="yanyuan-home-auth-modal-btn secondary" onClick={function () { setShowAuthModal(false); }}>稍后再说</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 待办详情弹窗（底部半屏） ===== */}
      {selectedTodo && (
        <div className="yanyuan-home-modal-overlay" onClick={function () { setSelectedTodo(null); }}>
          <div className="yanyuan-home-detail-sheet" onClick={function (e) { e.stopPropagation(); }}>
            <div className="yanyuan-home-detail-sheet-header">
              <span className="yanyuan-home-detail-sheet-title">待办详情</span>
              <span className="yanyuan-home-detail-sheet-close" onClick={function () { setSelectedTodo(null); }}>✕</span>
            </div>
            <div className="yanyuan-home-detail-sheet-body">
              <span className={'yanyuan-home-detail-type-tag ' + selectedTodo.type}>{getTypeLabel(selectedTodo.type)}</span>
              <h3 className="yanyuan-home-detail-title">{selectedTodo.title}</h3>
              <div className={'yanyuan-home-detail-deadline' + (isUrgent(selectedTodo.deadline) ? ' urgent' : '')}>
                <Clock size={14} />
                <span>截止时间：{selectedTodo.deadline}</span>
                <span className="yanyuan-home-detail-remaining">（{getDaysRemaining(selectedTodo.deadline)}）</span>
              </div>
              <p className="yanyuan-home-detail-desc">
                {selectedTodo.description || '请点击下方按钮前往处理该待办事项，逾期未处理可能影响您的相关业务进度。'}
              </p>
              <button className="yanyuan-home-detail-action-btn" onClick={function () { if (selectedTodo.action_url) navigateTo(selectedTodo.action_url); }}>
                {currentRole === 'admin' ? '去审批' : '去处理'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 通知详情弹窗（全屏） ===== */}
      {selectedNotice && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header">
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setSelectedNotice(null); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">通知详情</span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-body">
            <span className="yanyuan-home-notice-detail-category">{selectedNotice.category}</span>
            <h2 className="yanyuan-home-notice-detail-title">{selectedNotice.title}</h2>
            <div className="yanyuan-home-notice-detail-meta">
              <span>发布时间：{selectedNotice.publish_time}</span>
            </div>
            <div className="yanyuan-home-notice-detail-content">
              <p>{selectedNotice.title}。请相关人员及时关注并按要求完成相应事项。</p>
              <p>一、请各相关人员在规定时间内完成所需操作，逾期将按相关规定处理。</p>
              <p>二、如有疑问，请联系平台客服或相关管理部门。</p>
              <p>三、本通知自发布之日起生效。</p>
              <p style={{ marginTop: 24, color: '#8E8E93', fontSize: 13 }}>中国演艺人才管理与服务平台</p>
              <p style={{ color: '#8E8E93', fontSize: 13 }}>{selectedNotice.publish_time}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 党建文章详情弹窗（全屏） ===== */}
      {showPartyDetail && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header">
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setShowPartyDetail(false); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">党建专栏</span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-body">
            <img className="yanyuan-home-party-detail-cover" src={defaultPartyArticle.cover_image} alt="封面" />
            <span className="yanyuan-home-party-detail-tag">党建专栏</span>
            <h2 className="yanyuan-home-party-detail-title">{defaultPartyArticle.title}</h2>
            <div className="yanyuan-home-party-detail-time">{defaultPartyArticle.publish_time}</div>
            <div className="yanyuan-home-party-detail-content">
              <p>在新时代中国特色社会主义思想指引下，演艺行业积极践行社会主义核心价值观，大力弘扬民族优秀传统文化。本文深入解读新时代演艺人才培养的重要方针政策，为广大从业者提供学习指导。</p>
              <p>广大演艺工作者要始终坚持以人民为中心的创作导向，深入生活、扎根人民，创作出更多无愧于时代的优秀作品。</p>
              <p>演艺人才应自觉遵守法律法规，恪守职业道德，做到德艺双馨，为社会传递正能量。</p>
              <p>通过系统化的培训体系和科学的评价机制，不断提升演艺人才的专业素养和综合能力。</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 待办全量列表弹窗（全屏） ===== */}
      {showTodoList && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header">
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setShowTodoList(false); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">
              待办事项
              <span className="yanyuan-home-fullscreen-badge">{todos.length}</span>
            </span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-filter">
            {['all', 'pending', 'done'].map(function (f) {
              var labels: Record<string, string> = { all: '全部', pending: '待处理', done: '已处理' };
              return (
                <span key={f} className={'yanyuan-home-filter-tag' + (todoFilter === f ? ' active' : '')} onClick={function () { setTodoFilter(f); }}>
                  {labels[f]}
                </span>
              );
            })}
          </div>
          <div className="yanyuan-home-fullscreen-list">
            {todos.map(function (todo) {
              return (
                <div key={todo.id} className="yanyuan-home-todo-card" onClick={function () { setSelectedTodo(todo); setShowTodoList(false); }}>
                  <div className={'yanyuan-home-todo-icon ' + todo.type}>
                    <TodoIcon type={todo.type} />
                  </div>
                  <div className="yanyuan-home-todo-content">
                    <div className="yanyuan-home-todo-title">{todo.title}</div>
                    <div className="yanyuan-home-todo-meta">
                      <span className="yanyuan-home-todo-type">{getTypeLabel(todo.type)}</span>
                      <span className={'yanyuan-home-todo-deadline' + (isUrgent(todo.deadline) ? ' urgent' : '')}>
                        <Clock size={12} /> {getDaysRemaining(todo.deadline)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="yanyuan-home-todo-arrow" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 通知全量列表弹窗（全屏） ===== */}
      {showNoticeList && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header">
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setShowNoticeList(false); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">通知公告</span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-filter">
            {['all', '证书发放', '政策公示', '考试安排'].map(function (f) {
              return (
                <span key={f} className={'yanyuan-home-filter-tag' + (noticeFilter === f ? ' active' : '')} onClick={function () { setNoticeFilter(f); }}>
                  {f === 'all' ? '全部' : f}
                </span>
              );
            })}
          </div>
          <div className="yanyuan-home-fullscreen-list">
            {filteredNotices.map(function (notice) {
              return (
                <div key={notice.id} className="yanyuan-home-notice-item" onClick={function () { setSelectedNotice(notice); setShowNoticeList(false); }}>
                  <div className="yanyuan-home-notice-dot-wrap">
                    {!notice.is_read && <span className="yanyuan-home-notice-dot" />}
                  </div>
                  <div className="yanyuan-home-notice-content">
                    <div className="yanyuan-home-notice-title">{notice.title}</div>
                    <div className="yanyuan-home-notice-meta">
                      <span className="yanyuan-home-notice-category">{notice.category}</span>
                      <span className="yanyuan-home-notice-time">{notice.publish_time}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="yanyuan-home-notice-arrow" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default Component;
