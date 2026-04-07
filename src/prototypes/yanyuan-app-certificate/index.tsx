/**
 * @name 演艺人才平台 - 证书服务首页
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.4.1
 *
 * 角色差异化说明：
 * - Admin：页面标题"证书管理"，保留我的证书+原有4入口+新增管理入口（审批台/年审管理/数据总览）+管理统计卡
 * - Actor：页面标题"证书服务"，我的证书+4入口（申领/进度/验证/缴费）+年审提醒
 * - User：页面标题"证书验证"，无我的证书区，仅证书验证/人才检索入口+最新发证公告，4Tab底部导航
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
    Award, FileText, ClipboardList, ScanLine, CreditCard,
    ChevronRight, AlertTriangle, Home, ShieldCheck,
    GraduationCap, User, Search, BarChart3, RefreshCw,
    ListChecks, Users, Megaphone, Film, Settings
} from 'lucide-react';

import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_cert_click', desc: '点击证书卡片' },
    { name: 'on_entry_click', desc: '点击功能入口' },
    { name: 'on_tab_change', desc: '切换底部Tab' }
];
var ACTION_LIST: Action[] = [{ name: 'refresh_data', desc: '刷新数据' }];
var VAR_LIST: KeyDesc[] = [{ name: 'current_tab', desc: '当前Tab' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [
    {
        name: 'certificates', desc: '证书列表', keys: [
            { name: 'id', desc: '证书ID' }, { name: 'name', desc: '证书名称' },
            { name: 'cert_no', desc: '编号' }, { name: 'type', desc: '类型' },
            { name: 'status', desc: '状态' }, { name: 'valid_until', desc: '有效期' }
        ]
    }
];

// 默认证书数据（Admin/Actor可见）
var defaultCerts = [
    {
        id: 'cert-1', name: '演员资格证', cert_no: 'AC-2026-003421',
        type: 'actor', level: '', status: 'valid', valid_until: '2029-06-15',
        issue_date: '2026-06-15'
    },
    {
        id: 'cert-2', name: '专业技术资格证书（二级）', cert_no: 'TC-2025-001287',
        type: 'tech', level: '二级', status: 'expiring', valid_until: '2026-09-30',
        issue_date: '2023-09-30'
    }
];

function getStatusLabel(status: string): string {
    var m: Record<string, string> = { valid: '有效', expiring: '即将到期', expired: '已过期' };
    return m[status] || status;
}

function navigateTo(path: string) { window.location.href = path; }

// 角色相关配置
function getRoleConfig(role: string) {
    if (role === 'admin') {
        return {
            pageTitle: '证书管理',
            showCerts: true,
            showRenewalWarn: true,
            showAdminStats: true,
            showUserNotices: false,
            tabList: [
                { label: '首页', icon: Home },
                { label: '短视频', icon: Film },
                { label: '管理', icon: Settings },
                { label: '证书', icon: Award },
                { label: '学习', icon: GraduationCap },
                { label: '我的', icon: User }
            ],
            tabRoutes: [
                '/prototypes/yanyuan-app-home',
                '',
                '/prototypes/yanyuan-app-admin',
                '/prototypes/yanyuan-app-certificate',
                '/prototypes/yanyuan-app-training',
                '/prototypes/yanyuan-app-profile'
            ],
            activeTab: 3,
            entries: [
                { key: 'apply', title: '证书申领', desc: '申领演员资格证或专业技术资格证书', icon: 'apply', route: '/prototypes/yanyuan-app-cert-apply' },
                { key: 'progress', title: '申请进度', desc: '查看证书申请的审核进度', icon: 'progress', badge: '1 进行中', route: '' },
                { key: 'verify', title: '证书验证', desc: '扫码或输入编号验证证书真伪', icon: 'verify', route: '/prototypes/yanyuan-app-cert-verify' },
                { key: 'payment', title: '在线缴费', desc: '查看待缴费订单和缴费记录', icon: 'payment', badge: '2 待缴', route: '/prototypes/yanyuan-app-payment' }
            ],
            adminEntries: [
                { key: 'admin_cert', title: '证书审批台', desc: '待审核/审核中/已通过/已驳回', icon: 'admin', badge: '3 待审', route: '' },
                { key: 'admin_renewal', title: '年审管理', desc: '年审申请列表+逾期预警', icon: 'renewal', route: '' },
                { key: 'admin_stats', title: '数据总览', desc: '证书数量分布+发证趋势', icon: 'stats', route: '' }
            ]
        };
    }
    if (role === 'user') {
        return {
            pageTitle: '证书验证',
            showCerts: false,
            showRenewalWarn: false,
            showAdminStats: false,
            showUserNotices: true,
            tabList: [
                { label: '首页', icon: Home },
                { label: '短视频', icon: Film },
                { label: '实名', icon: ShieldCheck },
                { label: '证书', icon: Award },
                { label: '学习', icon: GraduationCap },
                { label: '我的', icon: User }
            ],
            tabRoutes: [
                '/prototypes/yanyuan-app-home',
                '',
                '/prototypes/yanyuan-app-certification',
                '/prototypes/yanyuan-app-certificate',
                '/prototypes/yanyuan-app-training',
                '/prototypes/yanyuan-app-profile'
            ],
            activeTab: 3,
            entries: [
                { key: 'verify', title: '证书验证', desc: '扫码或输入编号验证证书真伪', icon: 'verify', route: '/prototypes/yanyuan-app-cert-verify' },
                { key: 'search', title: '人才检索', desc: '查询已认证演员的公开信息', icon: 'search', route: '' }
            ],
            adminEntries: [] as any[]
        };
    }
    // actor (默认)
    return {
        pageTitle: '证书服务',
        showCerts: true,
        showRenewalWarn: true,
        showAdminStats: false,
        showUserNotices: false,
        tabList: [
            { label: '首页', icon: Home },
            { label: '短视频', icon: Film },
            { label: '认证', icon: ShieldCheck },
            { label: '证书', icon: Award },
            { label: '学习', icon: GraduationCap },
            { label: '我的', icon: User }
        ],
        tabRoutes: [
            '/prototypes/yanyuan-app-home',
            '',
            '/prototypes/yanyuan-app-certification',
            '/prototypes/yanyuan-app-certificate',
            '/prototypes/yanyuan-app-training',
            '/prototypes/yanyuan-app-profile'
        ],
        activeTab: 3,
        entries: [
            { key: 'apply', title: '证书申领', desc: '申领演员资格证或专业技术资格证书', icon: 'apply', route: '/prototypes/yanyuan-app-cert-apply' },
            { key: 'progress', title: '申请进度', desc: '查看证书申请的审核进度', icon: 'progress', badge: '1 进行中', route: '' },
            { key: 'verify', title: '证书验证', desc: '扫码或输入编号验证证书真伪', icon: 'verify', route: '/prototypes/yanyuan-app-cert-verify' },
            { key: 'payment', title: '在线缴费', desc: '查看待缴费订单和缴费记录', icon: 'payment', badge: '2 待缴', route: '/prototypes/yanyuan-app-payment' }
        ],
        adminEntries: [] as any[]
    };
}

// 入口图标映射
function getEntryIcon(key: string) {
    var m: Record<string, any> = {
        apply: FileText, progress: ClipboardList, verify: ScanLine,
        payment: CreditCard, admin: ListChecks, renewal: RefreshCw,
        stats: BarChart3, search: Users
    };
    return m[key] || FileText;
}

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanCertificate(innerProps, ref) {
    var dataSource = innerProps && innerProps.data ? innerProps.data : {};
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    // 读取角色
    var role = 'actor';
    try { role = localStorage.getItem('yanyuan_role') || 'actor'; } catch (e) { /* */ }
    var config = getRoleConfig(role);

    var certificates = config.showCerts ? (Array.isArray(dataSource.certificates) ? dataSource.certificates : defaultCerts) : [];

    var tabState = useState<number>(config.activeTab);
    var currentTab = tabState[0];
    var setCurrentTab = tabState[1];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { /* */ }
    }, [onEventHandler]);

    var handleTabChange = useCallback(function (i: number) {
        if (i !== config.activeTab) {
            emitEvent('on_tab_change', String(i));
            navigateTo(config.tabRoutes[i]);
            return;
        }
        setCurrentTab(i);
        emitEvent('on_tab_change', String(i));
    }, [emitEvent, config]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_tab' ? currentTab : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [currentTab]);

    var expiringCert = certificates.find(function (c: any) { return c.status === 'expiring'; });

    // User最新发证公告
    var notices = [
        { id: 'n1', title: '关于2026年度演员资格证书年审工作的通知', time: '2026-03-25', tag: '证书发放' },
        { id: 'n2', title: '第十二届全国优秀演员评选活动报名正式启动', time: '2026-03-23', tag: '政策公示' },
        { id: 'n3', title: '2026年第二季度表演能力考核安排公告', time: '2026-03-20', tag: '考试安排' }
    ];

    return (
        <div className="yanyuan-certserv-container">
            <div className="yanyuan-certserv-scroll">
                <div className="yanyuan-certserv-header">{config.pageTitle}</div>

                {/* Admin管理统计卡 */}
                {config.showAdminStats && (
                    <div className="yanyuan-certserv-admin-stats">
                        <div className="yanyuan-certserv-stat-card pending">
                            <div className="yanyuan-certserv-stat-num">3</div>
                            <div className="yanyuan-certserv-stat-label">待审核</div>
                        </div>
                        <div className="yanyuan-certserv-stat-card issued">
                            <div className="yanyuan-certserv-stat-num">12</div>
                            <div className="yanyuan-certserv-stat-label">本月发证</div>
                        </div>
                        <div className="yanyuan-certserv-stat-card expiring">
                            <div className="yanyuan-certserv-stat-num">5</div>
                            <div className="yanyuan-certserv-stat-label">即将到期</div>
                        </div>
                    </div>
                )}

                {/* 我的证书（Admin/Actor可见） */}
                {config.showCerts && (
                    <div className="yanyuan-certserv-section">
                        <h2 className="yanyuan-certserv-section-title">
                            <span className="title-dot" />
                            我的证书
                        </h2>
                        {certificates.length > 0 ? (
                            <div className="yanyuan-certserv-cert-list">
                                {certificates.map(function (cert: any) {
                                    return (
                                        <div
                                            key={cert.id}
                                            className="yanyuan-certserv-cert-card"
                                            onClick={function () { emitEvent('on_cert_click', cert.id); navigateTo('/prototypes/yanyuan-app-cert-detail'); }}
                                        >
                                            <div className={'yanyuan-certserv-cert-icon ' + cert.type}>
                                                <Award size={26} />
                                            </div>
                                            <div className="yanyuan-certserv-cert-info">
                                                <div className="yanyuan-certserv-cert-name">{cert.name}</div>
                                                <div className="yanyuan-certserv-cert-no">{cert.cert_no}</div>
                                                <div className="yanyuan-certserv-cert-meta">
                                                    <span className={'yanyuan-certserv-cert-tag ' + cert.status}>
                                                        {getStatusLabel(cert.status)}
                                                    </span>
                                                    <span className="yanyuan-certserv-cert-date">
                                                        有效期至 {cert.valid_until}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="yanyuan-certserv-cert-arrow" />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="yanyuan-certserv-empty">
                                <div className="yanyuan-certserv-empty-icon">📜</div>
                                <div className="yanyuan-certserv-empty-text">您还没有证书，立即申领</div>
                                <button
                                    className="yanyuan-certserv-empty-btn"
                                    onClick={function () { emitEvent('on_entry_click', 'apply'); navigateTo('/prototypes/yanyuan-app-cert-apply'); }}
                                >
                                    <FileText size={16} /> 去申领
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 功能入口 */}
                <div className="yanyuan-certserv-section">
                    <h2 className="yanyuan-certserv-section-title">
                        <span className="title-dot" />
                        {role === 'user' ? '查询服务' : '证书服务'}
                    </h2>
                    <div className="yanyuan-certserv-entries">
                        {config.entries.map(function (entry: any) {
                            var Icon = getEntryIcon(entry.icon);
                            return (
                                <div key={entry.key} className="yanyuan-certserv-entry" onClick={function () { emitEvent('on_entry_click', entry.key); if (entry.route) navigateTo(entry.route); }}>
                                    <div className={'yanyuan-certserv-entry-icon ' + entry.icon}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="yanyuan-certserv-entry-content">
                                        <div className="yanyuan-certserv-entry-title">{entry.title}</div>
                                        <div className="yanyuan-certserv-entry-desc">{entry.desc}</div>
                                    </div>
                                    {entry.badge && <span className="yanyuan-certserv-entry-count">{entry.badge}</span>}
                                    <ChevronRight size={16} className="yanyuan-certserv-entry-arrow" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Admin管理入口 */}
                {config.adminEntries.length > 0 && (
                    <div className="yanyuan-certserv-section">
                        <h2 className="yanyuan-certserv-section-title">
                            <span className="title-dot admin" />
                            管理功能
                        </h2>
                        <div className="yanyuan-certserv-entries">
                            {config.adminEntries.map(function (entry: any) {
                                var Icon = getEntryIcon(entry.icon);
                                return (
                                    <div key={entry.key} className="yanyuan-certserv-entry admin" onClick={function () { emitEvent('on_entry_click', entry.key); if (entry.route) navigateTo(entry.route); }}>
                                        <div className={'yanyuan-certserv-entry-icon ' + entry.icon}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="yanyuan-certserv-entry-content">
                                            <div className="yanyuan-certserv-entry-title">{entry.title}</div>
                                            <div className="yanyuan-certserv-entry-desc">{entry.desc}</div>
                                        </div>
                                        {entry.badge && <span className="yanyuan-certserv-entry-count admin">{entry.badge}</span>}
                                        <ChevronRight size={16} className="yanyuan-certserv-entry-arrow" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 年审提醒（Admin/Actor） */}
                {config.showRenewalWarn && expiringCert && (
                    <div className="yanyuan-certserv-renewal">
                        <div className="yanyuan-certserv-renewal-icon">
                            <AlertTriangle size={18} />
                        </div>
                        <div className="yanyuan-certserv-renewal-content">
                            <div className="yanyuan-certserv-renewal-title">年审提醒</div>
                            <div className="yanyuan-certserv-renewal-desc">
                                您的「{expiringCert.name}」将于 {expiringCert.valid_until} 到期，请尽快申请年审以免影响证书有效性。
                            </div>
                            <button
                                className="yanyuan-certserv-renewal-btn"
                                onClick={function () { emitEvent('on_entry_click', 'renewal_' + expiringCert.id); navigateTo('/prototypes/yanyuan-app-cert-renewal'); }}
                            >
                                申请年审
                            </button>
                        </div>
                    </div>
                )}

                {/* User最新发证公告 */}
                {config.showUserNotices && (
                    <div className="yanyuan-certserv-section">
                        <h2 className="yanyuan-certserv-section-title">
                            <span className="title-dot" />
                            最新公告
                        </h2>
                        <div className="yanyuan-certserv-notices">
                            {notices.map(function (n) {
                                return (
                                    <div key={n.id} className="yanyuan-certserv-notice-item" onClick={function () { emitEvent('on_entry_click', 'notice_' + n.id); }}>
                                        <div className="yanyuan-certserv-notice-dot" />
                                        <div className="yanyuan-certserv-notice-content">
                                            <div className="yanyuan-certserv-notice-title">{n.title}</div>
                                            <div className="yanyuan-certserv-notice-meta">
                                                <span className="yanyuan-certserv-notice-tag">{n.tag}</span>
                                                <span className="yanyuan-certserv-notice-time">{n.time}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="yanyuan-certserv-notice-arrow" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* 底部Tab */}
            <div className="yanyuan-certserv-tab-bar">
                {config.tabList.map(function (tab: any, index: number) {
                    var Icon = tab.icon;
                    return (
                        <div
                            key={tab.label}
                            className={'yanyuan-certserv-tab-item' + (currentTab === index ? ' active' : '')}
                            onClick={function () { handleTabChange(index); }}
                        >
                            <div className="yanyuan-certserv-tab-icon"><Icon size={22} /></div>
                            <div className="yanyuan-certserv-tab-label">{tab.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default Component;
