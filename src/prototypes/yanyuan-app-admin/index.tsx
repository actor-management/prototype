/**
 * @name 演艺人才平台 - 管理中心导航页 (Admin 专用)
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.1
 *
 * 说明：
 * Admin 底部导航「管理」Tab 的落地页，汇聚所有后台管理功能入口。
 * 包含：认证管理、证书管理、培训管理、考核管理、档案管理、财务管理、舆情监控、红黑榜管理、后台设置
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
    ShieldCheck, Award, BookOpen, ClipboardCheck, FolderOpen, Wallet,
    Eye, Star, Settings, ChevronRight, Home, Film, GraduationCap, User,
    Bell, AlertTriangle
} from 'lucide-react';

import type {
    KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle
} from '../../common/axure-types';

// ===== Axure API 定义 =====

var EVENT_LIST: EventItem[] = [
    { name: 'on_entry_click', desc: '点击功能入口，返回入口 key' },
    { name: 'on_tab_change', desc: '切换底部 Tab' }
];

var ACTION_LIST: Action[] = [
    { name: 'refresh_data', desc: '刷新页面数据' }
];

var VAR_LIST: KeyDesc[] = [
    { name: 'current_tab', desc: '当前高亮 Tab 索引' }
];

var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

// ===== 功能入口配置 =====

var ADMIN_ENTRIES = [
    {
        key: 'certification',
        label: '认证管理',
        desc: '审核',
        icon: ShieldCheck,
        iconClass: 'cert',
        route: '/prototypes/yanyuan-app-cert-admin',
        badge: 8
    },
    {
        key: 'certificate',
        label: '证书管理',
        desc: '申领/发证',
        icon: Award,
        iconClass: 'certificate',
        route: '/prototypes/yanyuan-app-certificate',
        badge: 0
    },
    {
        key: 'training',
        label: '培训管理',
        desc: '课程',
        icon: BookOpen,
        iconClass: 'training',
        route: '/prototypes/yanyuan-app-training-admin',
        badge: 0
    },
    {
        key: 'exam',
        label: '考核管理',
        desc: '考试/批阅',
        icon: ClipboardCheck,
        iconClass: 'exam',
        route: '/prototypes/yanyuan-app-exam-list',
        badge: 15
    },
    {
        key: 'archive',
        label: '档案管理',
        desc: '演员档案',
        icon: FolderOpen,
        iconClass: 'archive',
        route: '',
        badge: 0
    },
    {
        key: 'finance',
        label: '财务管理',
        desc: '费用缴纳',
        icon: Wallet,
        iconClass: 'finance',
        route: '/prototypes/yanyuan-app-payment',
        badge: 0
    },
    {
        key: 'opinion',
        label: '舆情监控',
        desc: '预警处理',
        icon: Eye,
        iconClass: 'opinion',
        route: '',
        badge: 1
    },
    {
        key: 'honor',
        label: '红黑榜',
        desc: '榜单维护',
        icon: Star,
        iconClass: 'honor',
        route: '',
        badge: 0
    },
    {
        key: 'settings',
        label: '后台设置',
        desc: '系统参数',
        icon: Settings,
        iconClass: 'settings',
        route: '',
        badge: 0
    }
];

// ===== 底部 Tab 配置（Admin 6 Tab） =====

var TAB_LIST = [
    { label: '首页', icon: Home },
    { label: '短视频', icon: Film },
    { label: '管理', icon: Settings },
    { label: '证书', icon: Award },
    { label: '学习', icon: GraduationCap },
    { label: '我的', icon: User }
];

var TAB_ROUTES = [
    '/prototypes/yanyuan-app-home',
    '',
    '/prototypes/yanyuan-app-admin',
    '/prototypes/yanyuan-app-certificate',
    '/prototypes/yanyuan-app-training',
    '/prototypes/yanyuan-app-profile'
];

// 当前页面在 Tab 中的索引
var ACTIVE_TAB = 2;

function navigateTo(path: string) {
    if (path) window.location.href = path;
}

// ===== 快捷待办 =====

var SHORTCUT_LIST = [
    {
        key: 'pending_cert',
        icon: AlertTriangle,
        iconClass: 'pending',
        title: '8 份认证申请待审核',
        desc: '最早提交于 2 小时前',
        route: '/prototypes/yanyuan-app-cert-admin'
    },
    {
        key: 'pending_opinion',
        icon: Bell,
        iconClass: 'alert',
        title: '1 条舆情预警待处理',
        desc: '涉及演员「王XX」负面舆情',
        route: ''
    }
];

// ===== 主组件 =====

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppAdmin(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var tabState = useState<number>(ACTIVE_TAB);
    var currentTab = tabState[0];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { /* 忽略 */ }
    }, [onEventHandler]);

    var handleEntryClick = useCallback(function (entry: typeof ADMIN_ENTRIES[0]) {
        emitEvent('on_entry_click', entry.key);
        if (entry.route) navigateTo(entry.route);
    }, [emitEvent]);

    var handleTabChange = useCallback(function (index: number) {
        if (index === ACTIVE_TAB) return; // 当前就是管理页
        emitEvent('on_tab_change', String(index));
        if (TAB_ROUTES[index]) {
            navigateTo(TAB_ROUTES[index]);
        }
    }, [emitEvent]);

    // 暴露 Axure Handle
    useImperativeHandle(ref, function () {
        return {
            getVar: function (name: string) {
                if (name === 'current_tab') return currentTab;
                return undefined;
            },
            fireAction: function () { },
            eventList: EVENT_LIST,
            actionList: ACTION_LIST,
            varList: VAR_LIST,
            configList: CONFIG_LIST,
            dataList: DATA_LIST
        };
    }, [currentTab]);

    // ===== 渲染 =====
    return (
        <div className="yanyuan-admin-container">
            {/* ===== 顶部标题栏 ===== */}
            <div className="yanyuan-admin-header">
                <div className="yanyuan-admin-header-inner">
                    <div>
                        <div className="yanyuan-admin-title">管理中心</div>
                        <div className="yanyuan-admin-subtitle">后台管理功能总览</div>
                    </div>
                    <div className="yanyuan-admin-header-right" onClick={() => navigateTo('/prototypes/yanyuan-app-messages')} style={{ cursor: 'pointer' }}>
                        <Bell size={20} />
                    </div>
                </div>
            </div>

            {/* ===== 滚动内容区 ===== */}
            <div className="yanyuan-admin-scroll">

                {/* 数据概览 */}
                <div className="yanyuan-admin-overview">
                    <div className="yanyuan-admin-overview-card">
                        <div className="yanyuan-admin-overview-num pending">8</div>
                        <div className="yanyuan-admin-overview-label">待审核</div>
                    </div>
                    <div className="yanyuan-admin-overview-card">
                        <div className="yanyuan-admin-overview-num today">3</div>
                        <div className="yanyuan-admin-overview-label">今日新增</div>
                    </div>
                    <div className="yanyuan-admin-overview-card">
                        <div className="yanyuan-admin-overview-num">156</div>
                        <div className="yanyuan-admin-overview-label">已认证总数</div>
                    </div>
                </div>

                {/* 功能入口宫格 */}
                <div className="yanyuan-admin-section">
                    <div className="yanyuan-admin-section-title">
                        <span className="title-dot" />
                        管理功能
                    </div>
                    <div className="yanyuan-admin-grid">
                        {ADMIN_ENTRIES.map(function (entry) {
                            var Icon = entry.icon;
                            return (
                                <div
                                    key={entry.key}
                                    className="yanyuan-admin-grid-item"
                                    onClick={function () { handleEntryClick(entry); }}
                                >
                                    {entry.badge > 0 && (
                                        <span className="yanyuan-admin-grid-badge">{entry.badge}</span>
                                    )}
                                    <div className={'yanyuan-admin-grid-icon ' + entry.iconClass}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="yanyuan-admin-grid-label">{entry.label}</div>
                                    <div className="yanyuan-admin-grid-desc">{entry.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 快捷待办 */}
                <div className="yanyuan-admin-shortcuts">
                    <div className="yanyuan-admin-section-title">
                        <span className="title-dot" />
                        待处理事项
                    </div>
                    <div className="yanyuan-admin-shortcut-list">
                        {SHORTCUT_LIST.map(function (item) {
                            var Icon = item.icon;
                            return (
                                <div
                                    key={item.key}
                                    className="yanyuan-admin-shortcut-item"
                                    onClick={function () {
                                        emitEvent('on_entry_click', item.key);
                                        if (item.route) navigateTo(item.route);
                                    }}
                                >
                                    <div className={'yanyuan-admin-shortcut-icon ' + item.iconClass}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="yanyuan-admin-shortcut-content">
                                        <div className="yanyuan-admin-shortcut-title">{item.title}</div>
                                        <div className="yanyuan-admin-shortcut-desc">{item.desc}</div>
                                    </div>
                                    <ChevronRight size={16} className="yanyuan-admin-shortcut-arrow" />
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* ===== 底部导航栏（Admin 6 Tab，管理高亮） ===== */}
            <div className="yanyuan-admin-tab-bar">
                {TAB_LIST.map(function (tab, index) {
                    var Icon = tab.icon;
                    return (
                        <div
                            key={tab.label}
                            className={'yanyuan-admin-tab-item' + (currentTab === index ? ' active' : '')}
                            onClick={function () { handleTabChange(index); }}
                        >
                            <div className="yanyuan-admin-tab-icon">
                                <Icon size={22} />
                            </div>
                            <div className="yanyuan-admin-tab-label">{tab.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default Component;
