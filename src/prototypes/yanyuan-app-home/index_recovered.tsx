?/**
 * @name 演艺人才平台 - 移动端首�?
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/docs/中国演艺人才����与服务平台需求规格说明书.md §5.2
 *
 * 角色差异化说明：
 * - Admin：显示审批管理相关快捷入口（审批中心、认证审核、数据统计、系统设置）�?
 *          底部Tab�?����"替代"֤��"，待办为审核类待�?
 * - Actor：显示证�?��ѵ/����相关快捷入口，底部标�?Tab，待办为缴费/��ѵ/�����?
 * - User：显示浏览查询类快捷入口（证书验证、人才检�?��学习中心、红黑榜），
 *          底部Tab隐藏"��֤"Tab，待办较�?
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
  FileText, BookOpen, ClipboardCheck,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp,
  Clock, Home, Award, GraduationCap, User, Star,
  CreditCard, Repeat, AlertCircle, Settings, BarChart3,
  UserCheck, Eye, ListChecks, TrendingUp, Shield, Film,
  ArrowLeft, CheckCircle
} from 'lucide-react';

import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

// ===== Axure API 定义 =====

var EVENT_LIST: EventItem[] = [
  { name: 'on_quick_action', desc: '点击快捷操作图标时触发，返回操作类型标识' },
  { name: 'on_todo_click', desc: '点击待办卡片时触发，返回待办ID' },
  { name: 'on_notice_click', desc: '点击֪ͨ标题时触发，返回֪ͨID' },
  { name: 'on_article_click', desc: '点击党建文章时触发，返回文章ID' },
  { name: 'on_tab_change', desc: '切换底部Tab时触发，返回Tab索引' }
];

var ACTION_LIST: Action[] = [
  { name: 'refresh_data', desc: '刷新首页全部数据' }
];

var VAR_LIST: KeyDesc[] = [
  { name: 'current_tab', desc: 'tab' },
  { name: 'todo_count', desc: 'count' },
  { name: 'current_role', desc: 'role' }
];



var CONFIG_LIST: ConfigItem[] = [
  { type: 'input', attributeId: 'user_name', displayName: '用户�?', info: '显示的用户姓�?', initialValue: '张明�?' },
  { type: 'input', attributeId: 'user_avatar', displayName: '用户头像', info: '用户头像URL', initialValue: '' },
  { type: 'select', attributeId: 'auth_status', displayName: '��֤状�?', info: '用户��֤状�?', initialValue: 'authenticated' }
];

var DATA_LIST: DataDesc[] = [
  {
    name: 'todos',
    desc: '待办事项列表',
    keys: [
      { name: 'id', desc: '待办ID' },
      { name: 'title', desc: '待办标题' },
      { name: 'type', desc: '类型：payment/training/exam/renewal/review' },
      { name: 'deadline', desc: '截止时间' },
      { name: 'action_url', desc: '跳转链接' }
    ]
  },
  {
    name: 'notices',
    desc: '֪ͨ公告列表',
    keys: [
      { name: 'id', desc: '֪ͨID' },
      { name: 'title', desc: '标题' },
      { name: 'category', desc: '分类' },
      { name: 'publish_time', desc: '发布时间' }
    ]
  },
  {
    name: 'party_article',
    desc: '党建文章',
    keys: [
      { name: 'id', desc: '文章ID' },
      { name: 'title', desc: '标题' },
      { name: 'summary', desc: '摘要' },
      { name: 'cover_image', desc: '封面�?' },
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
  var map: Record<string, string> = { admin: '李管�?', actor: '张明�?', user: '王观�?' };
  return map[role] || '用户';
}

function getRoleLabel(role: string): string {
  var map: Record<string, string> = { admin: '�����?', actor: '演员', user: '普通用�?' };
  return map[role] || '用户';
}

// ===== 按角色区分的默认数据 =====

var todosByRole: Record<string, any[]> = {
  admin: [
    { id: 'atd-1', title: '3份演员认证申请待审核', type: 'review', deadline: '2026-03-31', action_url: '' },
    { id: 'atd-2', title: '֤��申领缴费审核�?笔）', type: 'review', deadline: '2026-04-05', action_url: '' },
    { id: 'atd-3', title: '红榜推荐审批�?项）', type: 'review', deadline: '2026-04-10', action_url: '' },
    { id: 'atd-4', title: '舆情预警处理�?项）', type: 'review', deadline: '2026-03-30', action_url: '' }
  ],
  actor: [
    { id: 'td-1', title: '演员资格证申领费待缴纳（¥300.00�?', type: 'payment', deadline: '2026-03-31', action_url: '' },
    { id: 'td-2', title: '艺德修养��ѵ第三期即将开�?', type: 'training', deadline: '2026-04-15', action_url: '' },
    { id: 'td-3', title: '二级演员资格证年审即将到�?', type: 'renewal', deadline: '2026-05-01', action_url: '' },
    { id: 'td-4', title: '表演能力����（第二季度）报名�?', type: 'exam', deadline: '2026-04-20', action_url: '' }
  ],
  user: [
    { id: 'utd-1', title: '您关注的演员 "张明�? 通过资格��֤', type: 'info', deadline: '2026-04-01', action_url: '' },
    { id: 'utd-2', title: '2026年第二季度红黑榜公示发布', type: 'info', deadline: '2026-04-15', action_url: '' }
  ]
};

var defaultNotices = [
  { id: 'n-1', title: '关于开�?026年度演员资格֤������工作的通知', category: '֤��发放', publish_time: '2026-03-25', is_read: false },
  { id: 'n-2', title: '第十二届全国优秀演员评选活动报名正式启�?', category: '政策公示', publish_time: '2026-03-23', is_read: false },
  { id: 'n-3', title: '2026年第二季度表演能力考核安排公告', category: '考试安排', publish_time: '2026-03-20', is_read: true },
  { id: 'n-4', title: '演员委员会关于加强艺德建设的指导意见', category: '政策公示', publish_time: '2026-03-18', is_read: true },
  { id: 'n-5', title: '2026年春季艺德修养培训班开课通知', category: '考试安排', publish_time: '2026-03-15', is_read: true }
];

var defaultPartyArticle = {
  id: 'article-1',
  title: '深入ѧϰ贯彻党的二十大精神，推动演艺事业高质量发�?',
  summary: '演员委员会号召广大演艺工作者坚持以人民为中心的创作导向，践行社会主义核心价值观...',
  cover_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  publish_time: '2026-03-22'
};

// ===== 路由导航映射（按角色区分�?=====

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
    '/prototypes/yanyuan-app-cert-verify',
    '/prototypes/yanyuan-app-training',
    '/prototypes/yanyuan-app-profile'
  ]
};

// ===== 快捷操作按角色定�?=====

var QUICK_ACTIONS_BY_ROLE: Record<string, Array<{ key: string; label: string; icon: string; color: string; route: string }>> = {
  admin: [
    { key: 'review', label: '审批中心', icon: 'clipboard', color: 'cert', route: '/prototypes/yanyuan-app-certification' },
    { key: 'auth_review', label: '��֤审核', icon: 'usercheck', color: 'auth', route: '/prototypes/yanyuan-app-certification' },
    { key: 'stats', label: '数据统计', icon: 'chart', color: 'train', route: '/prototypes/yanyuan-app-profile' },
    { key: 'settings', label: '系统设置', icon: 'settings', color: 'exam', route: '/prototypes/yanyuan-app-profile' }
  ],
  actor: [
    { key: 'cert_apply', label: '֤��申领', icon: 'file', color: 'cert', route: '/prototypes/yanyuan-app-cert-apply' },
    { key: 'training', label: '在线��ѵ', icon: 'book', color: 'train', route: '/prototypes/yanyuan-app-training' },
    { key: 'exam', label: '����预约', icon: 'clipboard', color: 'exam', route: '/prototypes/yanyuan-app-exam-list' },
    { key: 'auth', label: '个人��֤', icon: 'shield', color: 'auth', route: '/prototypes/yanyuan-app-certification' }
  ],
  user: [
    { key: 'cert_verify', label: '֤����֤', icon: 'shield', color: 'cert', route: '/prototypes/yanyuan-app-cert-verify' },
    { key: 'talent_search', label: '人才检�?', icon: 'usercheck', color: 'train', route: '/prototypes/yanyuan-app-profile' },
    { key: 'learning', label: 'ѧϰ中心', icon: 'book', color: 'exam', route: '/prototypes/yanyuan-app-training' },
    { key: 'honor', label: '红黑�?', icon: 'chart', color: 'auth', route: '/prototypes/yanyuan-app-profile' }
  ]
};

// ===== 底部Tab按角色定�?=====

var TAB_LIST_BY_ROLE: Record<string, Array<{ label: string; icon: string }>> = {
  admin: [
    { label: '首页', icon: 'home' },
    { label: '����Ƶ', icon: 'video' },
    { label: '����', icon: 'settings' },
    { label: '֤��', icon: 'award' },
    { label: 'ѧϰ', icon: 'book' },
    { label: '�ҵ�', icon: 'user' }
  ],
  actor: [
    { label: '首页', icon: 'home' },
    { label: '����Ƶ', icon: 'video' },
    { label: '��֤', icon: 'shield' },
    { label: '֤��', icon: 'award' },
    { label: 'ѧϰ', icon: 'book' },
    { label: '�ҵ�', icon: 'user' }
  ],
  user: [
    { label: '首页', icon: 'home' },
    { label: '����Ƶ', icon: 'video' },
    { label: '��֤', icon: 'shield' },
    { label: 'ѧϰ', icon: 'book' },
    { label: '�ҵ�', icon: 'user' }
  ]
};

function navigateTo(path: string) {
  window.location.href = path;
}

// ===== 工具函数 =====

function getTypeLabel(type: string): string {
  var map: Record<string, string> = {
    payment: '���ɷ�', training: '��ѵ', exam: '����', renewal: '����', review: '�����', info: '֪ͨ'
  };
  return map[type] || type;
}

function getAuthLabel(status: string): string {
  var map: Record<string, string> = {
    authenticated: '����֤', pending: '�����', rejected: '�Ѳ���', none: 'δ��֤'
  };
  return map[status] || 'δ��֤';
}

function getDaysRemaining(deadline: string): string {
  var d = new Date(deadline);
  var now = new Date();
  var diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '已过�?';
  if (diff === 0) return '今天截止';
  if (diff <= 7) return '剩余 ' + diff + ' �?';
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
  var size = 18;
  switch (props.type) {
    case 'payment': return <CreditCard size={size} />;
    case 'training': return <BookOpen size={size} />;
    case 'exam': return <ClipboardCheck size={size} />;
    case 'renewal': return <Repeat size={size} />;
    case 'review': return <ListChecks size={size} />;
    case 'info': return <Eye size={size} />;
    default: return <AlertCircle size={size} />;
  }
}

// Tab 图标组件
function TabIcon(props: { type: string; size?: number }) {
  var s = props.size || 22;
  switch (props.type) {
    case 'home': return <Home size={s} />;
    case 'video': return <Film size={s} />;
    case 'shield': return <ShieldCheck size={s} />;
    case 'award': return <Award size={s} />;
    case 'book': return <GraduationCap size={s} />;
    case 'user': return <User size={s} />;
    case 'settings': return <Settings size={s} />;
    default: return <Home size={s} />;
  }
}

// 默认展示֪ͨ条数
var NOTICE_DEFAULT_COUNT = 3;

// ===== 主组�?=====

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppHome(innerProps, ref) {
  var dataSource = innerProps && innerProps.data ? innerProps.data : {};
  var configSource = innerProps && innerProps.config ? innerProps.config : {};
  var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

  // 读取当前角色
  var currentRole = getCurrentRole();
  var tabList = TAB_LIST_BY_ROLE[currentRole] || TAB_LIST_BY_ROLE.actor;
  var tabRoutes = TAB_ROUTES_BY_ROLE[currentRole] || TAB_ROUTES_BY_ROLE.actor;
  var quickActions = QUICK_ACTIONS_BY_ROLE[currentRole] || QUICK_ACTIONS_BY_ROLE.actor;

  // 配置
  var userName = typeof configSource.user_name === 'string' && configSource.user_name ? configSource.user_name : getRoleName(currentRole);
  var authStatus = typeof configSource.auth_status === 'string' && configSource.auth_status ? configSource.auth_status : (currentRole === 'user' ? 'none' : 'authenticated');

  // User 未认证判�?
  var isUserNotVerified = currentRole === 'user' && authStatus !== 'authenticated';

  // 数据
  var todos = Array.isArray(dataSource.todos) ? dataSource.todos : (todosByRole[currentRole] || todosByRole.actor);
  var notices = Array.isArray(dataSource.notices) ? dataSource.notices : defaultNotices;
  var partyArticle = dataSource.party_article ? dataSource.party_article : defaultPartyArticle;

  // 状�?
  var tabState = useState<number>(0);
  var currentTab = tabState[0];
  var setCurrentTab = tabState[1];

  // ֪ͨ展开状�?
  var expandState = useState<boolean>(false);
  var noticeExpanded = expandState[0];
  var setNoticeExpanded = expandState[1];

  // ��֤引导弹窗状态（User 未认证时点击受限 Tab 触发�?
  var authModalState = useState<boolean>(false);
  var showAuthModal = authModalState[0];
  var setShowAuthModal = authModalState[1];

  // 待办详情弹窗
  var todoDetailState = useState<any>(null);
  var selectedTodo = todoDetailState[0];
  var setSelectedTodo = todoDetailState[1];

  // ֪ͨ详情弹窗
  var noticeDetailState = useState<any>(null);
  var selectedNotice = noticeDetailState[0];
  var setSelectedNotice = noticeDetailState[1];

  // 党建文章详情弹窗
  var partyDetailState = useState<boolean>(false);
  var showPartyDetail = partyDetailState[0];
  var setShowPartyDetail = partyDetailState[1];

  // 控制֪ͨ展示数量
  var visibleNotices = noticeExpanded ? notices : notices.slice(0, NOTICE_DEFAULT_COUNT);
  var hasMoreNotices = notices.length > NOTICE_DEFAULT_COUNT;

  // 待办全量列表弹窗
  var todoListState = useState<boolean>(false);
  var showTodoList = todoListState[0];
  var setShowTodoList = todoListState[1];

  // ֪ͨ全量列表弹窗
  var noticeListState = useState<boolean>(false);
  var showNoticeList = noticeListState[0];
  var setShowNoticeList = noticeListState[1];

  // 事件触发
  var emitEvent = useCallback(function (eventName: string, payload?: string) {
    try {
      onEventHandler(eventName, payload);
    } catch (error) {
      console.warn('事件触发失败:', error);
    }
  }, [onEventHandler]);

  var handleQuickAction = useCallback(function (actionKey: string, route: string) {
    emitEvent('on_quick_action', actionKey);
    navigateTo(route);
  }, [emitEvent]);

  var handleTodoClick = useCallback(function (todo: any) {
    emitEvent('on_todo_click', todo.id);
    setSelectedTodo(todo);
  }, [emitEvent]);

  var handleNoticeClick = useCallback(function (notice: any) {
    emitEvent('on_notice_click', notice.id);
    setSelectedNotice(notice);
  }, [emitEvent]);

  var handleArticleClick = useCallback(function (articleId: string) {
    emitEvent('on_article_click', articleId);
    setShowPartyDetail(true);
  }, [emitEvent]);

  var handleTabChange = useCallback(function (index: number) {
    if (index === 0) return; // 当前就是首页
    // User 未认证时，仅允许首页(0)和短视频(1)，其�?Tab 弹出��֤引导
    if (isUserNotVerified && index > 1) {
      setShowAuthModal(true);
      return;
    }
    emitEvent('on_tab_change', String(index));
    if (tabRoutes[index]) {
      navigateTo(tabRoutes[index]);
    }
  }, [emitEvent, tabRoutes, isUserNotVerified]);

  var handleToggleNotices = useCallback(function () {
    setNoticeExpanded(function (prev) { return !prev; });
  }, []);

  var handleOpenTodoList = useCallback(function () {
    setShowTodoList(true);
  }, []);

  var handleOpenNoticeList = useCallback(function () {
    setShowNoticeList(true);
  }, []);

  // 切换角色（方便演示）
  var handleSwitchRole = useCallback(function () {
    navigateTo('/prototypes/yanyuan-app-login');
  }, []);

  // 动作处理
  var fireActionHandler = useCallback(function (name: string) {
    switch (name) {
      case 'refresh_data':
        console.log('刷新首页数据...');
        break;
      default:
        console.warn('未知的动�?', name);
    }
  }, []);

  // 暴露 Axure Handle
  useImperativeHandle(ref, function () {
    return {
      getVar: function (name: string) {
        var vars: Record<string, any> = {
          current_tab: currentTab,
          todo_count: todos.length,
          current_role: currentRole
        };
        return vars[name];
      },
      fireAction: fireActionHandler,
      eventList: EVENT_LIST,
      actionList: ACTION_LIST,
      varList: VAR_LIST,
      configList: CONFIG_LIST,
      dataList: DATA_LIST
    };
  }, [currentTab, todos.length, fireActionHandler, currentRole]);

  // ===== 渲染 =====
  return (
    <div className="yanyuan-home-container">
      <div className="yanyuan-home-scroll">

        {/* ===== 顶部区域（朱红渐变） ===== */}
        <div className="yanyuan-home-hero">
          <div className="yanyuan-home-user-row">
            <div className="yanyuan-home-avatar">
              <div className="yanyuan-home-avatar-placeholder">
                {userName.charAt(0)}
              </div>
            </div>
            <div className="yanyuan-home-user-info">
              <h1 className="yanyuan-home-greeting">
                {userName}，欢迎回�?
              </h1>
              <div className="yanyuan-home-user-tags">
                <span className={'yanyuan-home-auth-tag ' + authStatus}>
                  {getAuthLabel(authStatus)}
                </span>
                <span className="yanyuan-home-role-tag" onClick={handleSwitchRole}>
                  {getRoleLabel(currentRole)} �?
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== User 未认证引导卡�?===== */}
        {isUserNotVerified && (
          <div className="yanyuan-home-auth-guide">
            <div className="yanyuan-home-auth-guide-content">
              <div className="yanyuan-home-auth-guide-icon">
                <ShieldCheck size={28} />
              </div>
              <div className="yanyuan-home-auth-guide-text">
                <div className="yanyuan-home-auth-guide-title">完成个人��֤，解锁更多功�?</div>
                <div className="yanyuan-home-auth-guide-desc">��֤后可使用֤����֤、在线学习、个人中心等全部功能</div>
              </div>
            </div>
            <button className="yanyuan-home-auth-guide-btn" onClick={function () { navigateTo('/prototypes/yanyuan-app-info-fill'); }}>
              立即��֤
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ===== 快捷操作宫格（按角色�?===== */}
        <div className="yanyuan-home-quick-section">
          <div className="yanyuan-home-quick-grid">
            {quickActions.map(function (action) {
              return (
                <div
                  key={action.key}
                  className="yanyuan-home-quick-item"
                  onClick={function () { handleQuickAction(action.key, action.route); }}
                >
                  <div className={'yanyuan-home-quick-icon ' + action.color}>
                    <QuickIcon type={action.icon} />
                  </div>
                  <span className="yanyuan-home-quick-label">{action.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 待办事项 - 纵向列表（按角色�?===== */}
        {currentRole !== 'user' && todos.length > 0 && (
          <div className="yanyuan-home-section">
            <div className="yanyuan-home-section-header">
              <h2 className="yanyuan-home-section-title">
                <span className="title-dot" />
                待办事项
              </h2>
              <span className="yanyuan-home-section-more" onClick={handleOpenTodoList}>
                查看更多 <ChevronRight size={14} />
              </span>
            </div>

            <div className="yanyuan-home-todo-list">
              {todos.map(function (todo: any) {
                return (
                  <div
                    key={todo.id}
                    className={'yanyuan-home-todo-item ' + todo.type}
                    onClick={function () { handleTodoClick(todo); }}
                  >
                    <div className={'yanyuan-home-todo-icon ' + todo.type}>
                      <TodoIcon type={todo.type} />
                    </div>
                    <div className="yanyuan-home-todo-content">
                      <div className="yanyuan-home-todo-title">{todo.title}</div>
                      <div className="yanyuan-home-todo-meta">
                        <span className="yanyuan-home-todo-type-tag">{getTypeLabel(todo.type)}</span>
                        <span className={'yanyuan-home-todo-deadline' + (isUrgent(todo.deadline) ? ' urgent' : '')}>
                          <Clock size={11} />
                          {getDaysRemaining(todo.deadline)}
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

        {/* ===== ֪ͨ公告 - 默认展示3条，可展开 ===== */}
        <div className="yanyuan-home-section">
          <div className="yanyuan-home-section-header">
            <h2 className="yanyuan-home-section-title">
              <span className="title-dot" />
              ֪ͨ公告
            </h2>
            <span className="yanyuan-home-section-more" onClick={handleOpenNoticeList}>
              查看更多 <ChevronRight size={14} />
            </span>
          </div>

          <div className="yanyuan-home-notice-list">
            {visibleNotices.map(function (notice: any) {
              return (
                <div
                  key={notice.id}
                  className="yanyuan-home-notice-item"
                  onClick={function () { handleNoticeClick(notice); }}
                >
                  <span className={'yanyuan-home-notice-dot' + (notice.is_read ? ' read' : '')} />
                  <div className="yanyuan-home-notice-content">
                    <div className="yanyuan-home-notice-title">{notice.title}</div>
                    <div className="yanyuan-home-notice-meta">
                      <span className="yanyuan-home-notice-category">{notice.category}</span>
                      <span>{notice.publish_time}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="yanyuan-home-notice-arrow" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== 党建专栏 - 横向紧凑布局 ===== */}
        <div className="yanyuan-home-section" style={{ paddingBottom: 20 }}>
          <div className="yanyuan-home-section-header">
            <h2 className="yanyuan-home-section-title">
              <span className="title-dot" />
              党建专栏
            </h2>
          </div>

          <div
            className="yanyuan-home-party-card"
            onClick={function () { handleArticleClick(partyArticle.id); }}
          >
            <img
              src={partyArticle.cover_image}
              alt={partyArticle.title}
              className="yanyuan-home-party-cover"
            />
            <div className="yanyuan-home-party-info">
              <span className="yanyuan-home-party-tag">
                <Star size={11} />
                党建专栏
              </span>
              <div className="yanyuan-home-party-title">{partyArticle.title}</div>
              <div className="yanyuan-home-party-summary">{partyArticle.summary}</div>
              <div className="yanyuan-home-party-time">{partyArticle.publish_time}</div>
            </div>
          </div>
        </div>

      </div>

      {/* ===== 底部导航栏（按角色） ===== */}
      <div className="yanyuan-home-tab-bar">
        {tabList.map(function (tab, index) {
          return (
            <div
              key={tab.label}
              className={'yanyuan-home-tab-item' + (currentTab === index ? ' active' : '')}
              onClick={function () { handleTabChange(index); }}
            >
              <div className="yanyuan-home-tab-icon">
                <TabIcon type={tab.icon} />
              </div>
              <div className="yanyuan-home-tab-label">{tab.label}</div>
            </div>
          );
        })}
      </div>

      {/* ===== User 未认证引导弹�?===== */}
      {showAuthModal && (
        <React.Fragment>
          <div className="yanyuan-home-auth-overlay" onClick={function () { setShowAuthModal(false); }} />
          <div className="yanyuan-home-auth-modal">
            <div className="yanyuan-home-auth-modal-icon">
              <ShieldCheck size={36} />
            </div>
            <div className="yanyuan-home-auth-modal-title">请先完成个人��֤</div>
            <div className="yanyuan-home-auth-modal-desc">完成个人信息��֤后，即可使用平台全部功能</div>
            <div className="yanyuan-home-auth-modal-actions">
              <button className="yanyuan-home-auth-modal-btn secondary" onClick={function () { setShowAuthModal(false); }}>稍后再说</button>
              <button className="yanyuan-home-auth-modal-btn primary" onClick={function () { navigateTo('/prototypes/yanyuan-app-info-fill'); }}>去认�?</button>
            </div>
          </div>
        </React.Fragment>
      )}

      {/* ===== 待办详情弹窗（底部半屏） ===== */}
      {selectedTodo && (
        <React.Fragment>
          <div className="yanyuan-home-auth-overlay" onClick={function () { setSelectedTodo(null); }} />
          <div className="yanyuan-home-detail-sheet">
            <div className="yanyuan-home-detail-sheet-header">
              <span className="yanyuan-home-detail-sheet-title">待办详情</span>
              <span className="yanyuan-home-detail-sheet-close" onClick={function () { setSelectedTodo(null); }}>�?</span>
            </div>
            <div className="yanyuan-home-detail-sheet-body">
              <span className={'yanyuan-home-detail-type-tag ' + selectedTodo.type}>{getTypeLabel(selectedTodo.type)}</span>
              <div className="yanyuan-home-detail-title">{selectedTodo.title}</div>
              <div className="yanyuan-home-detail-meta">
                <Clock size={13} />
                <span className={isUrgent(selectedTodo.deadline) ? 'urgent' : ''}>{getDaysRemaining(selectedTodo.deadline)}</span>
              </div>
              <div className="yanyuan-home-detail-desc">
                {selectedTodo.description || '请点击下方按钮前往处理该待办事项，逾期未处理可能影响您的相关业务进度�?'}
              </div>
            </div>
            <div className="yanyuan-home-detail-sheet-actions">
              <button className="yanyuan-home-auth-modal-btn secondary" onClick={function () { setSelectedTodo(null); }}>关闭</button>
              <button className="yanyuan-home-auth-modal-btn primary" onClick={function () { setSelectedTodo(null); }}>
                {currentRole === 'admin' ? '去审�?' : currentRole === 'user' ? '查看详情' : '去处�?'}
              </button>
            </div>
          </div>
        </React.Fragment>
      )}

      {/* ===== ֪ͨ详情弹窗（全屏） ===== */}
      {selectedNotice && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header">
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setSelectedNotice(null); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">֪ͨ详情</span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-body">
            <span className="yanyuan-home-detail-type-tag notice">{selectedNotice.category}</span>
            <h2 className="yanyuan-home-fullscreen-article-title">{selectedNotice.title}</h2>
            <div className="yanyuan-home-fullscreen-meta">
              <span>{selectedNotice.publish_time}</span>
              <span>浏览 {Math.floor(Math.random() * 500 + 100)}</span>
            </div>
            <div className="yanyuan-home-fullscreen-content">
              <p>尊敬的平台用户：</p>
              <p>{selectedNotice.title}。请相关人员及时关注并按要求完成相应事项�?</p>
              <p>根据相关规定和工作安排，现就本通知事项做如下说明：</p>
              <p>一、请各相关人员在规定时间内完成所需操作，逾期将按相关规定处理�?</p>
              <p>二、如有疑问，请联系平台客服或相关����部门�?</p>
              <p>三、本֪ͨ自发布之日起生效�?</p>
              <p style={{ marginTop: 24, color: '#8E8E93', fontSize: 13 }}>中国演艺人才����与服务平�?</p>
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
            {partyArticle.cover_image && (
              <img src={partyArticle.cover_image} alt={partyArticle.title} className="yanyuan-home-fullscreen-cover" />
            )}
            <span className="yanyuan-home-party-tag" style={{ marginTop: 16 }}>
              <Star size={11} />
              党建专栏
            </span>
            <h2 className="yanyuan-home-fullscreen-article-title">{partyArticle.title}</h2>
            <div className="yanyuan-home-fullscreen-meta">
              <span>{partyArticle.publish_time}</span>
            </div>
            <div className="yanyuan-home-fullscreen-content">
              <p>{partyArticle.summary}</p>
              <p>在新时代中国特色社会主义思想指引下，演艺行业积极践行社会主义核心价值观，大力弘扬民族优秀传统文化。本文深入解读新时代演艺人才培养的重要方针政策，为广大从业者提供学习指导�?</p>
              <p>一、坚持正确的政治方向，牢牢把握意识形态工作主导权</p>
              <p>广大演艺工作者要始终坚持以人民为中心的创作导向，深入生活、扎根人民，创作出更多无愧于时代的优秀作品�?</p>
              <p>二、加强职业道德建设，树立良好行业形象</p>
              <p>演艺人才应自觉遵守法律法规，恪守职业道德，做到德艺双馨，为社会传递正能量�?</p>
              <p>三、推动行业高质量发展，培育新时代优秀人才</p>
              <p>通过系统化的��ѵ体系和科学的评价机制，不断提升演艺人才的专业素养和综合能力�?</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 待办全量列表弹窗（全屏） ===== */}
      {showTodoList && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header" style={{ borderBottom: '1px solid #E5E5E5' }}>
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setShowTodoList(false); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">待办事项 <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: 'normal' }}>({todos.length})</span></span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-body" style={{ background: '#F5F5F7', padding: '16px 20px', minHeight: '100%' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 'bold', color: '#D32F2F', borderBottom: '2px solid #D32F2F', paddingBottom: 4, whiteSpace: 'nowrap' }}>全部</span>
              <span style={{ fontSize: 14, color: '#8E8E93', paddingBottom: 4, whiteSpace: 'nowrap' }}>待处�?</span>
              <span style={{ fontSize: 14, color: '#8E8E93', paddingBottom: 4, whiteSpace: 'nowrap' }}>已处�?</span>
            </div>
            {todos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8E8E93' }}>暂无待办事项</div>
            ) : (
              <div className="yanyuan-home-todo-list">
                {todos.map(function (todo: any) {
                  return (
                    <div
                      key={todo.id}
                      className={'yanyuan-home-todo-item ' + todo.type}
                      onClick={function () { setShowTodoList(false); handleTodoClick(todo); }}
                    >
                      <div className={'yanyuan-home-todo-icon ' + todo.type}>
                        <TodoIcon type={todo.type} />
                      </div>
                      <div className="yanyuan-home-todo-content">
                        <div className="yanyuan-home-todo-title">{todo.title}</div>
                        <div className="yanyuan-home-todo-meta">
                          <span className="yanyuan-home-todo-type-tag">{getTypeLabel(todo.type)}</span>
                          <span className={'yanyuan-home-todo-deadline' + (isUrgent(todo.deadline) ? ' urgent' : '')}>
                            <Clock size={11} />
                            {getDaysRemaining(todo.deadline)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="yanyuan-home-todo-arrow" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ֪ͨ全量列表弹窗（全屏） ===== */}
      {showNoticeList && (
        <div className="yanyuan-home-fullscreen-modal">
          <div className="yanyuan-home-fullscreen-header" style={{ borderBottom: '1px solid #E5E5E5' }}>
            <span className="yanyuan-home-fullscreen-back" onClick={function () { setShowNoticeList(false); }}>
              <ArrowLeft size={20} />
            </span>
            <span className="yanyuan-home-fullscreen-title">֪ͨ公告</span>
            <span style={{ width: 20 }} />
          </div>
          <div className="yanyuan-home-fullscreen-body" style={{ background: '#F5F5F7', padding: '16px 20px', minHeight: '100%' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 'bold', color: '#D32F2F', borderBottom: '2px solid #D32F2F', paddingBottom: 4, whiteSpace: 'nowrap' }}>全部</span>
              <span style={{ fontSize: 14, color: '#8E8E93', paddingBottom: 4, whiteSpace: 'nowrap' }}>֤��发放</span>
              <span style={{ fontSize: 14, color: '#8E8E93', paddingBottom: 4, whiteSpace: 'nowrap' }}>政策公示</span>
              <span style={{ fontSize: 14, color: '#8E8E93', paddingBottom: 4, whiteSpace: 'nowrap' }}>考试安排</span>
            </div>
            {notices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8E8E93' }}>暂无֪ͨ公告</div>
            ) : (
              <div className="yanyuan-home-notice-list" style={{ background: '#FFF', borderRadius: 12, padding: '0 16px' }}>
                {notices.map(function (notice: any) {
                  return (
                    <div
                      key={notice.id}
                      className="yanyuan-home-notice-item"
                      onClick={function () { setShowNoticeList(false); handleNoticeClick(notice); }}
                      style={{ borderBottom: '1px solid #F2F2F7' }}
                    >
                      <span className={'yanyuan-home-notice-dot' + (notice.is_read ? ' read' : '')} />
                      <div className="yanyuan-home-notice-content">
                        <div className="yanyuan-home-notice-title">{notice.title}</div>
                        <div className="yanyuan-home-notice-meta">
                          <span className="yanyuan-home-notice-category">{notice.category}</span>
                          <span>{notice.publish_time}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="yanyuan-home-notice-arrow" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default Component;

