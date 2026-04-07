/**
 * @name 演艺平台首页工作台
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/themes/antd-new/designToken.json (Ant Design 主题)
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md
 */

import './style.css';
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';
import type { AxureProps, AxureHandle, EventItem, Action, KeyDesc, ConfigItem, DataDesc } from '../../common/axure-types';

// ===== 图标组件（SVG 内联，避免额外依赖） =====

// 铃铛图标
const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

// 用户图标
const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// 设置图标
const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

// 退出图标
const LogOutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

// 趋势向上图标
const TrendUpIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

// 趋势向下图标
const TrendDownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
    </svg>
);

// 箭头右图标
const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

// ===== 指标图标 =====
const UsersAddIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
);

const CertIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h6" />
        <circle cx="17" cy="16" r="2" />
    </svg>
);

const TrainingIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const IncomeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

// ===== 快捷操作图标 =====
const FileCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
    </svg>
);

const GraduationCapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 3.33 4 6 4s6-2 6-4v-5" />
    </svg>
);

const ClipboardCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M9 14l2 2 4-4" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

// ===== 数据定义 =====
const NAV_ITEMS = [
    { key: 'home', label: '首页', active: true },
    { key: 'certification', label: '认证中心' },
    { key: 'certificate', label: '证书管理' },
    { key: 'evaluation', label: '职业能力评价' },
    { key: 'talent', label: '人才数字档案' },
    { key: 'org', label: '行业机构管理' },
    { key: 'finance', label: '财务管理' },
    { key: 'admin', label: '后台管理' },
];

const NAV_ROUTES: Record<string, string> = {
    home: '/prototypes/yanyuan-web-dashboard',
    certification: '/prototypes/yanyuan-web-cert-manage',
    certificate: '/prototypes/yanyuan-web-cert-service',
    evaluation: '/prototypes/yanyuan-web-training-manage',
    talent: '/prototypes/yanyuan-web-talent-archive',
    org: '',
    finance: '',
    admin: '',
};

// 二级菜单配置
const SUB_MENUS: Record<string, { key: string; label: string; route: string }[]> = {
    talent: [
        { key: 'basic', label: '基础信息管理', route: '/prototypes/yanyuan-web-talent-archive' },
        { key: 'cert', label: '资格证书管理', route: '/prototypes/yanyuan-web-talent-archive' },
        { key: 'panorama', label: '全景数字档案', route: '/prototypes/yanyuan-web-talent-archive' },
        { key: 'workbench', label: '审核工作台', route: '/prototypes/yanyuan-web-talent-archive' },
    ],
};

// 下拉箭头图标
const ChevDownIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const METRICS = [
    {
        title: '本月新增注册',
        value: 128,
        unit: '人',
        icon: 'users',
        IconComponent: UsersAddIcon,
        trend: 'up' as const,
        trendValue: '+12.5%',
        trendLabel: '较上月',
    },
    {
        title: '待审核证书',
        value: 36,
        unit: '份',
        icon: 'cert',
        IconComponent: CertIcon,
        trend: 'up' as const,
        trendValue: '+8',
        trendLabel: '较昨日',
    },
    {
        title: '在审培训',
        value: 5,
        unit: '期',
        icon: 'training',
        IconComponent: TrainingIcon,
        trend: 'down' as const,
        trendValue: '-2',
        trendLabel: '较上月',
    },
    {
        title: '本月收入',
        value: '¥186,400',
        unit: '',
        icon: 'income',
        IconComponent: IncomeIcon,
        trend: 'up' as const,
        trendValue: '+18.3%',
        trendLabel: '较上月',
    },
];

const TODO_ITEMS = [
    { id: '1', title: '张三的演员资格证申请待审核', type: 'cert', typeName: '证书审批', date: '2026-03-27', priority: 'urgent' as const },
    { id: '2', title: '李四的个人认证申请待审核', type: 'auth', typeName: '认证审批', date: '2026-03-27', priority: 'normal' as const },
    { id: '3', title: '王五的年审申请待处理', type: 'annual', typeName: '年审审批', date: '2026-03-26', priority: 'warning' as const },
    { id: '4', title: '赵六提交了专业技术资格证书申请', type: 'cert', typeName: '证书审批', date: '2026-03-26', priority: 'urgent' as const },
    { id: '5', title: '孙七的个人信息变更待审核', type: 'auth', typeName: '认证审批', date: '2026-03-25', priority: 'normal' as const },
    { id: '6', title: '周八的演员资格证年审材料已提交', type: 'annual', typeName: '年审审批', date: '2026-03-25', priority: 'warning' as const },
    { id: '7', title: '吴九的四级专业技术资格证书待签发', type: 'cert', typeName: '证书审批', date: '2026-03-24', priority: 'urgent' as const },
    { id: '8', title: '郑十的实名认证信息待核验', type: 'auth', typeName: '认证审批', date: '2026-03-24', priority: 'normal' as const },
];

const SHORTCUT_ITEMS = [
    { key: 'cert-manage', label: '证书管理台', icon: FileCheckIcon, color: '#B8292F', bg: 'linear-gradient(135deg, #FFF2F0, #FFD6D1)' },
    { key: 'training-manage', label: '培训管理台', icon: GraduationCapIcon, color: '#2E6BE6', bg: 'linear-gradient(135deg, #F0F5FF, #D6E8FF)' },
    { key: 'exam-manage', label: '考核管理台', icon: ClipboardCheckIcon, color: '#D4553A', bg: 'linear-gradient(135deg, #FFF2E8, #FFE0CC)' },
    { key: 'auth-manage', label: '认证管理台', icon: ShieldCheckIcon, color: '#7B5EA7', bg: 'linear-gradient(135deg, #F5F0FA, #E6DBEF)' },
    { key: 'talent-archive', label: '人才档案', icon: UsersIcon, color: '#C5963A', bg: 'linear-gradient(135deg, #FBF5EB, #F3E4C8)' },
];

const NOTICE_ITEMS = [
    { id: '1', title: '关于2026年第二季度艺德考核安排的通知', type: 'exam', typeName: '考试安排', date: '2026-03-27', isTop: true },
    { id: '2', title: '2026年3月批次演员资格证书发放通知', type: 'cert', typeName: '证书发放', date: '2026-03-26', isTop: false },
    { id: '3', title: '关于调整2026年度培训费用标准的公告', type: 'policy', typeName: '政策公示', date: '2026-03-25', isTop: false },
    { id: '4', title: '平台系统维护通知（3月30日 22:00-次日02:00）', type: 'system', typeName: '系统通知', date: '2026-03-24', isTop: false },
    { id: '5', title: '关于开展2026年度心理健康测评工作的通知', type: 'exam', typeName: '考试安排', date: '2026-03-23', isTop: false },
];

const NOTICE_TABS = [
    { key: 'all', label: '全部' },
    { key: 'exam', label: '考试安排' },
    { key: 'cert', label: '证书发放' },
    { key: 'policy', label: '政策公示' },
    { key: 'system', label: '系统通知' },
];

// ===== 图表组件 =====

// 审批效率环形图
const ApprovalRingChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            tooltip: { trigger: 'item' },
            legend: { bottom: 0, left: 'center', icon: 'circle', textStyle: { fontSize: 12, color: '#999' } },
            series: [{
                name: '审批状态',
                type: 'pie',
                radius: ['45%', '72%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
                label: {
                    show: true, position: 'center', fontSize: 24, fontWeight: 700, color: '#2C2C2C',
                    formatter: () => '92%',
                },
                emphasis: { label: { show: true, fontSize: 16, fontWeight: 600 } },
                data: [
                    { value: 86, name: '已处理', itemStyle: { color: '#6BAF5E' } },
                    { value: 36, name: '待审核', itemStyle: { color: '#B8292F' } },
                    { value: 12, name: '审核中', itemStyle: { color: '#C5963A' } },
                ]
            }]
        };

        chartInstance.current.setOption(option);
        const resizeObserver = new ResizeObserver(() => chartInstance.current?.resize());
        resizeObserver.observe(chartRef.current);
        return () => { resizeObserver.disconnect(); chartInstance.current?.dispose(); };
    }, []);

    return <div ref={chartRef} className="yy-chart-container" />;
};

// 月度趋势折线图
const MonthlyTrendChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        chartInstance.current = echarts.init(chartRef.current);

        const option = {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: 10, right: 10, bottom: 0, top: 30, containLabel: true },
            xAxis: {
                type: 'category',
                data: ['1月', '2月', '3月'],
                axisLine: { show: false }, axisTick: { show: false },
                axisLabel: { color: '#8c8c8c', fontSize: 12 }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
                axisLabel: { color: '#8c8c8c', fontSize: 11 }
            },
            series: [
                {
                    name: '新增注册', type: 'bar', barWidth: 14, itemStyle: { color: '#D4553A', borderRadius: [4, 4, 0, 0] },
                    data: [95, 112, 128]
                },
                {
                    name: '证书签发', type: 'bar', barWidth: 14, itemStyle: { color: '#B8292F', borderRadius: [4, 4, 0, 0] },
                    data: [42, 56, 68]
                },
                {
                    name: '培训完成', type: 'line', smooth: true, showSymbol: false,
                    itemStyle: { color: '#C5963A' }, lineStyle: { width: 2.5 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(197, 150, 58, 0.15)' },
                            { offset: 1, color: 'rgba(197, 150, 58, 0)' }
                        ])
                    },
                    data: [180, 210, 245]
                }
            ]
        };

        chartInstance.current.setOption(option);
        const resizeObserver = new ResizeObserver(() => chartInstance.current?.resize());
        resizeObserver.observe(chartRef.current);
        return () => { resizeObserver.disconnect(); chartInstance.current?.dispose(); };
    }, []);

    return <div ref={chartRef} className="yy-chart-container" />;
};

// ===== Axure API 定义 =====
const EVENT_LIST: EventItem[] = [
    { name: 'onNavClick', desc: '导航菜单项点击时触发' },
    { name: 'onTodoClick', desc: '待办事项点击时触发' },
    { name: 'onShortcutClick', desc: '快捷操作按钮点击时触发' },
];

const ACTION_LIST: Action[] = [
    { name: 'refreshData', desc: '刷新仪表板数据' },
];

const VAR_LIST: KeyDesc[] = [
    { name: 'activeNav', desc: '当前激活的导航项' },
];

const CONFIG_LIST: ConfigItem[] = [
    { type: 'input', attributeId: 'userName', displayName: '用户名', info: '当前登录用户名', initialValue: '管理员' },
];

const DATA_LIST: DataDesc[] = [];

// ===== 主组件 =====
const Component = forwardRef<AxureHandle, AxureProps>(function YanYuanDashboard(innerProps, ref) {
    const onEventHandler = typeof innerProps?.onEvent === 'function' ? innerProps.onEvent : () => undefined;
    const configSource = innerProps?.config || {};

    const userName = typeof configSource.userName === 'string' ? configSource.userName : '管理员';
    const [activeNav, setActiveNav] = useState('home');
    const [activeNoticeTab, setActiveNoticeTab] = useState('all');
    const [showNotification, setShowNotification] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<typeof TODO_ITEMS[0] | null>(null);

    // 过滤通知列表
    const filteredNotices = activeNoticeTab === 'all'
        ? NOTICE_ITEMS
        : NOTICE_ITEMS.filter(n => n.type === activeNoticeTab);

    const emitEvent = useCallback((eventName: string, payload?: any) => {
        try { onEventHandler(eventName, payload); } catch (e) { console.warn('事件触发失败:', e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, () => ({
        getVar: (name: string) => {
            const vars: Record<string, any> = { activeNav };
            return vars[name];
        },
        fireAction: (name: string) => {
            if (name === 'refreshData') console.log('刷新数据...');
        },
        eventList: EVENT_LIST,
        actionList: ACTION_LIST,
        varList: VAR_LIST,
        configList: CONFIG_LIST,
        dataList: DATA_LIST,
    }), [activeNav]);

    // 当前日期格式化
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 ${'日一二三四五六'[today.getDay()]}`;

    return (
        <div className="yanyuan-web-dashboard">
            {/* ===== 顶部导航栏 ===== */}
            <nav className="yy-navbar">
                <div className="yy-navbar-brand" onClick={() => { setActiveNav('home'); emitEvent('onNavClick', { key: 'home' }); }}>
                    <div className="yy-navbar-logo">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L14.09 8.26L21 9.27L16 13.97L17.18 21L12 17.77L6.82 21L8 13.97L3 9.27L9.91 8.26L12 2Z" fill="#fff" />
                            <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.3)" />
                        </svg>
                    </div>
                    <div>
                        <div className="yy-navbar-title">中国演艺人才管理与服务平台</div>
                        <div className="yy-navbar-subtitle">TALENT MANAGEMENT</div>
                    </div>
                </div>

                <div className="yy-navbar-menu">
                    {NAV_ITEMS.map(item => {
                        const subs = SUB_MENUS[item.key];
                        return (
                            <div key={item.key}
                                className={`yy-navbar-menu-item${activeNav === item.key ? ' active' : ''}${subs ? ' has-sub' : ''}`}
                                onClick={() => {
                                    if (!subs) {
                                        setActiveNav(item.key);
                                        emitEvent('onNavClick', { key: item.key });
                                        const route = NAV_ROUTES[item.key];
                                        if (route && item.key !== 'home') window.location.href = route;
                                    }
                                }}
                            >
                                {item.label}{subs && <ChevDownIcon />}
                                {subs && (
                                    <div className="yy-submenu">
                                        {subs.map(sub => (
                                            <div key={sub.key}
                                                className="yy-submenu-item"
                                                onClick={(e: any) => { e.stopPropagation(); window.location.href = sub.route; }}
                                            >
                                                {sub.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="yy-navbar-actions">
                    <div className="yy-navbar-notification" onClick={() => setShowNotification(!showNotification)}>
                        <BellIcon />
                        <span className="yy-navbar-badge">6</span>
                        {showNotification && (
                            <div className="yy-notification-panel" onClick={e => e.stopPropagation()}>
                                <div className="yy-notification-header">
                                    <span className="yy-notification-title">消息通知</span>
                                    <span className="yy-notification-mark">全部已读</span>
                                </div>
                                <div className="yy-notification-list">
                                    {TODO_ITEMS.slice(0, 5).map(item => (
                                        <div key={item.id} className="yy-notification-item">
                                            <span className={`yy-todo-dot ${item.priority}`} />
                                            <div className="yy-notification-content">
                                                <div className="yy-notification-text">{item.title}</div>
                                                <div className="yy-notification-time">{item.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="yy-notification-footer">查看全部消息</div>
                            </div>
                        )}
                    </div>
                    <div className="yy-navbar-divider" />
                    <div className="yy-navbar-user">
                        <div className="yy-navbar-avatar">{userName.charAt(0)}</div>
                        <span className="yy-navbar-username">{userName}</span>
                        <div className="yy-user-dropdown">
                            <div className="yy-user-dropdown-item"><UserIcon /> 个人中心</div>
                            <div className="yy-user-dropdown-item"><SettingsIcon /> 账号设置</div>
                            <div className="yy-user-dropdown-divider" />
                            <div className="yy-user-dropdown-item danger"><LogOutIcon /> 退出登录</div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ===== 主内容区 ===== */}
            <div className="yy-content">
                {/* 欢迎横幅 */}
                <div className="yy-welcome-banner">
                    <div className="yy-welcome-info">
                        <h2>欢迎回来，{userName}</h2>
                        <p>中国演艺人才管理与服务平台 · 管理工作台</p>
                        <div className="yy-welcome-date">📅 {dateStr}</div>
                    </div>
                </div>

                {/* 数据概览卡片 */}
                <div className="yy-metrics-grid">
                    {METRICS.map((metric, index) => (
                        <div className="yy-metric-card" key={index}>
                            <div className="yy-metric-header">
                                <span className="yy-metric-title">{metric.title}</span>
                                <div className={`yy-metric-icon ${metric.icon}`}>
                                    <metric.IconComponent />
                                </div>
                            </div>
                            <div className="yy-metric-value">
                                {metric.value}
                                {metric.unit && <span className="unit">{metric.unit}</span>}
                            </div>
                            <div className="yy-metric-footer">
                                <span className="label">{metric.trendLabel}</span>
                                <span className={metric.trend === 'up' ? 'up' : 'down'}>
                                    {metric.trendValue}
                                </span>
                                {metric.trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 快捷操作区 - 置于上方 */}
                <div className="yy-shortcuts-grid">
                    {SHORTCUT_ITEMS.map(item => (
                        <div
                            key={item.key}
                            className="yy-shortcut-card"
                            onClick={() => emitEvent('onShortcutClick', { key: item.key })}
                        >
                            <div className="yy-shortcut-icon" style={{ background: item.bg, color: item.color }}>
                                <item.icon />
                            </div>
                            <span className="yy-shortcut-label">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* 待办事项 + 通知公告 并排 */}
                <div className="yy-main-row">
                    {/* 待办事项 */}
                    <div className="yy-card">
                        <div className="yy-card-header">
                            <span className="yy-card-title">待办事项</span>
                            <span className="yy-card-extra" onClick={() => emitEvent('onTodoClick', { action: 'viewAll' })}>
                                查看全部 <ChevronRightIcon />
                            </span>
                        </div>
                        <div className="yy-card-body">
                            <ul className="yy-todo-list">
                                {TODO_ITEMS.slice(0, 5).map(item => (
                                    <li
                                        key={item.id}
                                        className="yy-todo-item"
                                        onClick={() => { setSelectedTodo(item); emitEvent('onTodoClick', { id: item.id, type: item.type }); }}
                                    >
                                        <span className={`yy-todo-dot ${item.priority}`} />
                                        <div className="yy-todo-content">
                                            <div className="yy-todo-title">{item.title}</div>
                                            <div className="yy-todo-meta">{item.date}</div>
                                        </div>
                                        <span className={`yy-todo-tag ${item.type}`}>{item.typeName}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 通知公告 */}
                    <div className="yy-card">
                        <div className="yy-card-header">
                            <span className="yy-card-title">通知公告</span>
                            <span className="yy-card-extra">
                                查看更多 <ChevronRightIcon />
                            </span>
                        </div>
                        <div className="yy-card-body">
                            <div className="yy-notice-tabs">
                                {NOTICE_TABS.map(tab => (
                                    <span
                                        key={tab.key}
                                        className={`yy-notice-tab${activeNoticeTab === tab.key ? ' active' : ''}`}
                                        onClick={() => setActiveNoticeTab(tab.key)}
                                    >
                                        {tab.label}
                                    </span>
                                ))}
                            </div>
                            <ul className="yy-notice-list">
                                {filteredNotices.map(notice => (
                                    <li key={notice.id} className="yy-notice-item">
                                        <span className={`yy-notice-type-tag ${notice.type}`}>{notice.typeName}</span>
                                        {notice.isTop && <span className="yy-notice-top">置顶</span>}
                                        <span className="yy-notice-title">{notice.title}</span>
                                        <span className="yy-notice-date">{notice.date}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 效率看板 - 单独一行全宽 */}
                <div className="yy-card" style={{ marginBottom: 28 }}>
                    <div className="yy-card-header">
                        <span className="yy-card-title">工作效率</span>
                        <span className="yy-card-extra">本月</span>
                    </div>
                    <div className="yy-card-body">
                        <div className="yy-efficiency-grid">
                            <div>
                                <div className="yy-efficiency-label">审批处理效率</div>
                                <ApprovalRingChart />
                            </div>
                            <div>
                                <div className="yy-efficiency-label">月度数据趋势</div>
                                <MonthlyTrendChart />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== 待办详情弹窗 ===== */}
            {selectedTodo && (
                <div className="yy-modal-overlay" onClick={() => setSelectedTodo(null)}>
                    <div className="yy-modal" onClick={e => e.stopPropagation()}>
                        <div className="yy-modal-header">
                            <span className="yy-modal-title">待办详情</span>
                            <button className="yy-modal-close" onClick={() => setSelectedTodo(null)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div className="yy-modal-body">
                            <div className="yy-modal-info-row">
                                <span className="yy-modal-info-label">待办类型</span>
                                <span className={`yy-todo-tag ${selectedTodo.type}`}>{selectedTodo.typeName}</span>
                            </div>
                            <div className="yy-modal-info-row">
                                <span className="yy-modal-info-label">待办内容</span>
                                <span>{selectedTodo.title}</span>
                            </div>
                            <div className="yy-modal-info-row">
                                <span className="yy-modal-info-label">创建日期</span>
                                <span>{selectedTodo.date}</span>
                            </div>
                            <div className="yy-modal-info-row">
                                <span className="yy-modal-info-label">优先级</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className={`yy-todo-dot ${selectedTodo.priority}`} />
                                    {selectedTodo.priority === 'urgent' ? '紧急' : selectedTodo.priority === 'warning' ? '警告' : '普通'}
                                </span>
                            </div>
                            <div className="yy-modal-info-row">
                                <span className="yy-modal-info-label">当前状态</span>
                                <span style={{ color: '#E8A735', fontWeight: 600 }}>待处理</span>
                            </div>
                        </div>
                        <div className="yy-modal-footer">
                            <button className="yy-modal-btn secondary" onClick={() => setSelectedTodo(null)}>关闭</button>
                            <button className="yy-modal-btn primary" onClick={() => { emitEvent('onTodoClick', { id: selectedTodo.id, action: 'process' }); setSelectedTodo(null); }}>去处理</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 全局页脚 ===== */}
            <footer className="yy-footer">
                <div className="yy-footer-inner">
                    <div className="yy-footer-left">
                        <span className="org-name">中国广播电视社会组织联合会演员委员会</span>
                        <br />© 2026 中国演艺人才管理与服务平台 版权所有
                    </div>
                    <div className="yy-footer-center">
                        <a href="#">京ICP备XXXXXXXX号-1</a>
                    </div>
                    <div className="yy-footer-right">
                        <span>客服电话：010-XXXX-XXXX</span>
                        <span>官方邮箱：service@yanyuan.org.cn</span>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default Component;
