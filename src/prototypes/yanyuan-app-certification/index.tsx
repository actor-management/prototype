/**
 * @name 演艺人才平台 - 认证中心首页
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §4.3.1
 *
 * 角色差异化：
 * - Admin：标题"认证管理"，统计卡+待审核快速列表+管理入口（跳转至认证审核台）
 * - Actor：标题"认证中心"，认证状态卡+信息完整度+功能入口（个人信息填报/实名认证/认证进度/认证管理）
 * - User：标题"认证中心"，引导实名认证+精简入口（仅实名认证）
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
    ShieldCheck, ShieldX, Shield, ChevronRight, UserCheck, ScanFace,
    Clock, Home, Award, GraduationCap, User, ListChecks, BarChart3, Eye, Film, Settings
} from 'lucide-react';

import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_action_click', desc: '点击状态卡片操作按钮' },
    { name: 'on_entry_click', desc: '点击功能入口项' },
    { name: 'on_tab_change', desc: '切换底部Tab' }
];
var ACTION_LIST: Action[] = [{ name: 'refresh_data', desc: '刷新页面' }];
var VAR_LIST: KeyDesc[] = [{ name: 'current_tab', desc: '当前Tab索引' }];
var CONFIG_LIST: ConfigItem[] = [
    { type: 'select', attributeId: 'auth_status', displayName: '认证状态', initialValue: 'authenticated' },
    { type: 'inputNumber', attributeId: 'info_completeness', displayName: '信息完整度', initialValue: 78 },
    { type: 'input', attributeId: 'user_name', displayName: '用户姓名', initialValue: '张明远' }
];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

// 认证状态配置（对齐需规 §4.3.1 Actor/User 认证状态展示规则）
var STATUS_CONFIG: Record<string, any> = {
    none: { icon: Shield, title: '未认证', desc: '您还未完成个人认证，认证后可申领证书、参加培训考核', btnText: '去认证', btnAction: 'go_auth', color: 'none' },
    pending: { icon: Clock, title: '审核中', desc: '您的认证申请正在审核中，预计1-3个工作日内完成', btnText: '查看进度', btnAction: 'view_progress', color: 'pending' },
    authenticated: { icon: ShieldCheck, title: '已认证 ✓', desc: '您已通过个人认证，可以正常使用平台全部功能', btnText: '查看详情', btnAction: 'view_detail', color: 'authenticated' },
    rejected: { icon: ShieldX, title: '已驳回', desc: '驳回原因：提交的身份证照片不清晰，请重新拍摄上传', btnText: '重新提交', btnAction: 'resubmit', color: 'rejected' }
};

// 角色配置（对齐需规 §4.3.1 & §4.1 底部导航）
function getRoleConfig(role: string) {
    if (role === 'user') {
        return {
            pageTitle: '认证中心',
            showAdminStats: false,
            showStatusCard: true,
            showCompleteness: false,
            showAdminList: false,
            tabList: [
                { label: '首页', icon: Home }, { label: '短视频', icon: Film },
                { label: '实名', icon: ShieldCheck }, { label: '证书', icon: Award },
                { label: '学习', icon: GraduationCap }, { label: '我的', icon: User }
            ],
            tabRoutes: ['/prototypes/yanyuan-app-home', '', '/prototypes/yanyuan-app-certification', '/prototypes/yanyuan-app-certificate', '/prototypes/yanyuan-app-training', '/prototypes/yanyuan-app-profile'],
            activeTab: 2,
            // User 仅需实名认证流程，无需进入个人信息填报页（§4.3.1）
            entries: [
                { key: 'real_name', title: '实名认证', desc: '身份证验证 + 人脸活体检测', icon: ScanFace, iconClass: 'realname', route: '/prototypes/yanyuan-app-realname' }
            ]
        };
    }
    if (role === 'admin') {
        return {
            pageTitle: '认证管理',
            showAdminStats: true,
            showStatusCard: false,
            showCompleteness: false,
            showAdminList: true,
            tabList: [
                { label: '首页', icon: Home }, { label: '短视频', icon: Film },
                { label: '管理', icon: Settings }, { label: '证书', icon: Award },
                { label: '学习', icon: GraduationCap }, { label: '我的', icon: User }
            ],
            tabRoutes: ['/prototypes/yanyuan-app-home', '', '/prototypes/yanyuan-app-admin', '/prototypes/yanyuan-app-certificate', '/prototypes/yanyuan-app-training', '/prototypes/yanyuan-app-profile'],
            activeTab: 2,
            entries: [
                { key: 'cert_review', title: '认证审核台', desc: '查看认证队列、批量审批、统计数据', icon: ListChecks, iconClass: 'admin', route: '/prototypes/yanyuan-app-cert-admin', badge: 8 },
                { key: 'cert_stats', title: '认证数据总览', desc: '认证通过率、月度趋势、处理效率', icon: BarChart3, iconClass: 'stats', route: '' }
            ]
        };
    }
    // Actor（默认）
    return {
        pageTitle: '认证中心',
        showAdminStats: false,
        showStatusCard: true,
        showCompleteness: true,
        showAdminList: false,
        tabList: [
            { label: '首页', icon: Home }, { label: '短视频', icon: Film },
            { label: '认证', icon: ShieldCheck }, { label: '证书', icon: Award },
            { label: '学习', icon: GraduationCap }, { label: '我的', icon: User }
        ],
        tabRoutes: ['/prototypes/yanyuan-app-home', '', '/prototypes/yanyuan-app-certification', '/prototypes/yanyuan-app-certificate', '/prototypes/yanyuan-app-training', '/prototypes/yanyuan-app-profile'],
        activeTab: 2,
        // Actor 的功能入口（§4.3.1 功能入口按钮）
        entries: [
            { key: 'info_fill', title: '个人信息填报', desc: '基本信息、联系信息、从业信息、教育背景', icon: UserCheck, iconClass: 'info', route: '/prototypes/yanyuan-app-info-fill' },
            { key: 'real_name', title: '实名认证', desc: '身份证验证 + 人脸活体检测', icon: ScanFace, iconClass: 'realname', route: '/prototypes/yanyuan-app-realname' },
            { key: 'progress', title: '认证进度查看', desc: '查看认证审核进度和历史记录', icon: Clock, iconClass: 'progress', route: '/prototypes/yanyuan-app-auth-progress' }
        ]
    };
}

// Admin 待审核快速列表的模拟数据
var ADMIN_PENDING_LIST = [
    { name: '张艺凡', phone: '138****5678', time: '10分钟前', type: '演艺专项' },
    { name: '李大壮', phone: '139****1234', time: '2小时前', type: '普通实名' },
    { name: '王薇薇', phone: '136****7890', time: '3小时前', type: '演艺专项' }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanCertification(innerProps, ref) {
    var configSource = innerProps && innerProps.config ? innerProps.config : {};
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var role = 'actor';
    try { role = localStorage.getItem('yanyuan_role') || 'actor'; } catch (e) { /* */ }
    var config = getRoleConfig(role);

    var storedAuthStatus = 'none';
    try { storedAuthStatus = localStorage.getItem('yanyuan_auth_status') || 'none'; } catch (e) { /* */ }
    var authStatus = typeof configSource.auth_status === 'string' && configSource.auth_status ? configSource.auth_status : storedAuthStatus;
    var completeness = typeof configSource.info_completeness === 'number' ? configSource.info_completeness : 78;

    var statusCfg = STATUS_CONFIG[authStatus] || STATUS_CONFIG.none;
    var StatusIcon = statusCfg.icon;

    var radius = 28;
    var circumference = 2 * Math.PI * radius;
    var dashOffset = circumference - (completeness / 100) * circumference;

    var tabState = useState<number>(config.activeTab);
    var currentTab = tabState[0];
    var setCurrentTab = tabState[1];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { /* */ }
    }, [onEventHandler]);

    var handleTabChange = useCallback(function (i: number) {
        if (i === config.activeTab) return;
        emitEvent('on_tab_change', String(i));
        if (config.tabRoutes[i]) {
            navigateTo(config.tabRoutes[i]);
        }
    }, [emitEvent, config]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_tab' ? currentTab : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [currentTab]);

    return (
        <div className="yanyuan-cert-container">
            <div className="yanyuan-cert-scroll">
                <div className="yanyuan-cert-header">{config.pageTitle}</div>

                {/* Admin 统计卡片区（§4.3.5 统计卡片：待审核数/本月已通过/本月已驳回） */}
                {config.showAdminStats && (
                    <div className="yanyuan-cert-admin-stats">
                        <div className="yanyuan-cert-stat-card pending">
                            <div className="yanyuan-cert-stat-num">8</div>
                            <div className="yanyuan-cert-stat-label">待审核</div>
                        </div>
                        <div className="yanyuan-cert-stat-card approved">
                            <div className="yanyuan-cert-stat-num">45</div>
                            <div className="yanyuan-cert-stat-label">本月已通过</div>
                        </div>
                        <div className="yanyuan-cert-stat-card rejected">
                            <div className="yanyuan-cert-stat-num">3</div>
                            <div className="yanyuan-cert-stat-label">本月已驳回</div>
                        </div>
                    </div>
                )}

                {/* Actor/User 认证状态卡（§4.3.1 认证状态展示规则） */}
                {config.showStatusCard && (
                    <div className={'yanyuan-cert-status-card ' + authStatus}>
                        <div className="yanyuan-cert-status-icon"><StatusIcon size={24} color="#fff" /></div>
                        <div className="yanyuan-cert-status-label">认证状态</div>
                        <div className="yanyuan-cert-status-title">{statusCfg.title}</div>
                        <div className="yanyuan-cert-status-desc">{statusCfg.desc}</div>
                        <button className="yanyuan-cert-status-btn" onClick={function () {
                            emitEvent('on_action_click', statusCfg.btnAction);
                            if (statusCfg.btnAction === 'go_auth' || statusCfg.btnAction === 'resubmit') {
                                // User 直接跳转实名认证，Actor 跳转信息填报
                                navigateTo(role === 'user' ? '/prototypes/yanyuan-app-realname' : '/prototypes/yanyuan-app-info-fill');
                            }
                            else if (statusCfg.btnAction === 'view_progress') navigateTo('/prototypes/yanyuan-app-auth-progress');
                        }}>
                            {statusCfg.btnText}<ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {/* Actor 信息完整度（§4.3.1 信息完整度） */}
                {config.showCompleteness && (
                    <div className="yanyuan-cert-progress-section">
                        <div className="yanyuan-cert-ring-wrap">
                            <svg viewBox="0 0 64 64">
                                <defs>
                                    <linearGradient id="cert-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#E85D4A" />
                                        <stop offset="100%" stopColor="#F0C060" />
                                    </linearGradient>
                                </defs>
                                <circle className="yanyuan-cert-ring-bg" cx="32" cy="32" r={radius} />
                                <circle className="yanyuan-cert-ring-bar" cx="32" cy="32" r={radius} strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                            </svg>
                            <span className="yanyuan-cert-ring-text">{completeness}%</span>
                        </div>
                        <div className="yanyuan-cert-progress-info">
                            <div className="yanyuan-cert-progress-title">个人信息完整度</div>
                            <div className="yanyuan-cert-progress-desc">{completeness >= 90 ? '信息已基本完善，可随时提交审核' : '完善个人信息可提升审核通过率，建议达到90%以上'}</div>
                        </div>
                    </div>
                )}

                {/* 功能入口 */}
                <div className="yanyuan-cert-entries">
                    <div className="yanyuan-cert-entries-title">
                        <span className="title-dot" />
                        {role === 'admin' ? '管理功能' : '认证服务'}
                    </div>
                    {config.entries.map(function (entry: any) {
                        var Icon = entry.icon;
                        return (
                            <div key={entry.key} className={'yanyuan-cert-entry' + (entry.iconClass === 'admin' ? ' admin' : '')} onClick={function () { emitEvent('on_entry_click', entry.key); if (entry.route) navigateTo(entry.route); }}>
                                <div className={'yanyuan-cert-entry-icon ' + entry.iconClass}><Icon size={20} /></div>
                                <div className="yanyuan-cert-entry-content">
                                    <div className="yanyuan-cert-entry-title">{entry.title}</div>
                                    <div className="yanyuan-cert-entry-desc">{entry.desc}</div>
                                </div>
                                {entry.badge && <span className="yanyuan-cert-entry-badge todo">{entry.badge}</span>}
                                <ChevronRight size={16} className="yanyuan-cert-entry-arrow" />
                            </div>
                        );
                    })}
                </div>

                {/* Admin 待审核快速列表（§4.3.5 认证审核台简略预览） */}
                {config.showAdminList && (
                    <div className="yanyuan-cert-admin-list">
                        <div className="yanyuan-cert-entries-title">
                            <span className="title-dot pending" />
                            待审核申请
                        </div>
                        {ADMIN_PENDING_LIST.map(function (item, index) {
                            return (
                                <div key={index} className="yanyuan-cert-pending-item" onClick={function () { navigateTo('/prototypes/yanyuan-app-cert-admin'); }}>
                                    <div className="yanyuan-cert-pending-avatar">{item.name.charAt(0)}</div>
                                    <div className="yanyuan-cert-pending-info">
                                        <div className="yanyuan-cert-pending-name">{item.name}</div>
                                        <div className="yanyuan-cert-pending-meta">{item.type} · {item.phone} · {item.time}</div>
                                    </div>
                                    <button className="yanyuan-cert-pending-btn" onClick={function (e) { e.stopPropagation(); navigateTo('/prototypes/yanyuan-app-cert-admin'); }}>
                                        <Eye size={14} /> 审核
                                    </button>
                                </div>
                            );
                        })}
                        <div className="yanyuan-cert-pending-more" onClick={function () { navigateTo('/prototypes/yanyuan-app-cert-admin'); }}>
                            查看全部待审核 <ChevronRight size={14} />
                        </div>
                    </div>
                )}
            </div>

            {/* 底部Tab */}
            <div className="yanyuan-cert-tab-bar">
                {config.tabList.map(function (tab: any, index: number) {
                    var Icon = tab.icon;
                    return (
                        <div key={tab.label} className={'yanyuan-cert-tab-item' + (currentTab === index ? ' active' : '')} onClick={function () { handleTabChange(index); }}>
                            <div className="yanyuan-cert-tab-icon"><Icon size={22} /></div>
                            <div className="yanyuan-cert-tab-label">{tab.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default Component;
