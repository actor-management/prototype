/**
 * @name 演艺人才平台 - 个人中心
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.6.1
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
    Home, ShieldCheck, Award, GraduationCap, User,
    ChevronRight, UserCircle, FileText, Trophy, Bell,
    Lock, Info, LogOut, Film, Settings
} from 'lucide-react';

import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_menu_click', desc: '点击菜单项' },
    { name: 'on_stat_click', desc: '点击统计项' },
    { name: 'on_tab_change', desc: '切换底部Tab' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_tab', desc: '当前Tab' }];
var CONFIG_LIST: ConfigItem[] = [
    { type: 'input', attributeId: 'user_name', displayName: '用户姓名', initialValue: '张明远' },
    { type: 'select', attributeId: 'auth_status', displayName: '认证状态', initialValue: 'authenticated' }
];
var DATA_LIST: DataDesc[] = [];

// 菜单配置
var MENU_ITEMS = [
    { key: 'info', label: '个人信息', icon: UserCircle, iconClass: 'info' },
    { key: 'certs', label: '证书资产库', icon: FileText, iconClass: 'certs' },
    { key: 'honors', label: '荣誉管理', icon: Trophy, iconClass: 'honors' },
    { key: 'messages', label: '消息中心', icon: Bell, iconClass: 'messages', badge: 3 },
    { key: 'account', label: '账号安全', icon: Lock, iconClass: 'account' },
    { key: 'about', label: '关于平台', icon: Info, iconClass: 'about' }
];

var TAB_LIST_BY_ROLE: Record<string, Array<{ label: string; icon: any }>> = {
    admin: [{ label: '首页', icon: Home }, { label: '短视频', icon: Film }, { label: '管理', icon: Settings }, { label: '证书', icon: Award }, { label: '学习', icon: GraduationCap }, { label: '我的', icon: User }],
    actor: [{ label: '首页', icon: Home }, { label: '短视频', icon: Film }, { label: '认证', icon: ShieldCheck }, { label: '证书', icon: Award }, { label: '学习', icon: GraduationCap }, { label: '我的', icon: User }],
    user: [{ label: '首页', icon: Home }, { label: '短视频', icon: Film }, { label: '实名', icon: ShieldCheck }, { label: '证书', icon: Award }, { label: '学习', icon: GraduationCap }, { label: '我的', icon: User }]
};

var TAB_ROUTES_BY_ROLE: Record<string, string[]> = {
    admin: ['/prototypes/yanyuan-app-home', '', '/prototypes/yanyuan-app-admin', '/prototypes/yanyuan-app-certificate', '/prototypes/yanyuan-app-training', '/prototypes/yanyuan-app-profile'],
    actor: ['/prototypes/yanyuan-app-home', '', '/prototypes/yanyuan-app-certification', '/prototypes/yanyuan-app-certificate', '/prototypes/yanyuan-app-training', '/prototypes/yanyuan-app-profile'],
    user: ['/prototypes/yanyuan-app-home', '', '/prototypes/yanyuan-app-certification', '/prototypes/yanyuan-app-certificate', '/prototypes/yanyuan-app-training', '/prototypes/yanyuan-app-profile']
};

var MENU_ROUTES: Record<string, string> = {
    info: '/prototypes/yanyuan-app-info-fill',
    certs: '/prototypes/yanyuan-app-certificate',
    messages: '/prototypes/yanyuan-app-messages'
};

function navigateTo(path: string) {
    window.location.href = path;
}

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanProfile(innerProps, ref) {
    var configSource = innerProps && innerProps.config ? innerProps.config : {};
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var userName = typeof configSource.user_name === 'string' && configSource.user_name ? configSource.user_name : '张明远';
    var authStatus = typeof configSource.auth_status === 'string' && configSource.auth_status ? configSource.auth_status : 'authenticated';

    var tabState = useState<number>(5);
    var currentTab = tabState[0];
    var setCurrentTab = tabState[1];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    var role = 'actor';
    try { role = localStorage.getItem('yanyuan_role') || 'actor'; } catch (e) { /* */ }

    var handleTabChange = useCallback(function (i: number) {
        if (i === 5) return;
        emitEvent('on_tab_change', String(i));
        var rList = TAB_ROUTES_BY_ROLE[role] || TAB_ROUTES_BY_ROLE.actor;
        if (rList[i]) navigateTo(rList[i]);
        else setCurrentTab(i);
    }, [emitEvent, role]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_tab' ? currentTab : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [currentTab]);

    var authLabel = authStatus === 'authenticated' ? '已认证 ✓' : authStatus === 'pending' ? '审核中' : '未认证';

    return (
        <div className="yanyuan-profile-container">
            <div className="yanyuan-profile-scroll">
                {/* 用户信息头部 */}
                <div className="yanyuan-profile-hero">
                    <div className="yanyuan-profile-avatar">
                        {userName.charAt(0)}
                    </div>
                    <div className="yanyuan-profile-name">{userName}</div>
                    <span className="yanyuan-profile-auth-badge">
                        <ShieldCheck size={13} /> {authLabel}
                    </span>
                </div>

                {/* 统计面板 */}
                <div className="yanyuan-profile-stats">
                    <div className="yanyuan-profile-stat" onClick={function () { emitEvent('on_stat_click', 'certs'); }}>
                        <div className="yanyuan-profile-stat-value">2</div>
                        <div className="yanyuan-profile-stat-label">持有证书</div>
                    </div>
                    <div className="yanyuan-profile-stat" onClick={function () { emitEvent('on_stat_click', 'courses'); }}>
                        <div className="yanyuan-profile-stat-value">3</div>
                        <div className="yanyuan-profile-stat-label">在学课程</div>
                    </div>
                    <div className="yanyuan-profile-stat" onClick={function () { emitEvent('on_stat_click', 'honors'); }}>
                        <div className="yanyuan-profile-stat-value">5</div>
                        <div className="yanyuan-profile-stat-label">荣誉记录</div>
                    </div>
                </div>

                {/* 功能列表 - 主要功能 */}
                <div className="yanyuan-profile-menu-group">
                    {MENU_ITEMS.map(function (item) {
                        var Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="yanyuan-profile-menu-item"
                                onClick={function () { emitEvent('on_menu_click', item.key); var r = MENU_ROUTES[item.key]; if (r) navigateTo(r); }}
                            >
                                <div className={'yanyuan-profile-menu-icon ' + item.iconClass}>
                                    <Icon size={18} />
                                </div>
                                <div className="yanyuan-profile-menu-content">
                                    <div className="yanyuan-profile-menu-title">{item.label}</div>
                                </div>
                                {item.badge ? (
                                    <span className="yanyuan-profile-menu-badge">{item.badge}</span>
                                ) : null}
                                <ChevronRight size={16} className="yanyuan-profile-menu-arrow" />
                            </div>
                        );
                    })}
                </div>

                {/* 退出登录 */}
                <div className="yanyuan-profile-menu-group">
                    <div
                        className="yanyuan-profile-menu-item logout"
                        onClick={function () { emitEvent('on_menu_click', 'logout'); }}
                    >
                        <div className="yanyuan-profile-menu-icon logout">
                            <LogOut size={18} />
                        </div>
                        <div className="yanyuan-profile-menu-content">
                            <div className="yanyuan-profile-menu-title">退出登录</div>
                        </div>
                        <ChevronRight size={16} className="yanyuan-profile-menu-arrow" />
                    </div>
                </div>

                <div className="yanyuan-profile-version">
                    中国演艺人才管理与服务平台 v1.0.0
                </div>
            </div>

            <div className="yanyuan-profile-tab-bar">
                {(TAB_LIST_BY_ROLE[role] || TAB_LIST_BY_ROLE.actor).map(function (tab, index) {
                    var Icon = tab.icon;
                    return (
                        <div key={tab.label}
                            className={'yanyuan-profile-tab-item' + (currentTab === index ? ' active' : '')}
                            onClick={function () { handleTabChange(index); }}>
                            <div className="yanyuan-profile-tab-icon"><Icon size={22} /></div>
                            <div className="yanyuan-profile-tab-label">{tab.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default Component;
