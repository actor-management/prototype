/**
 * @name 公共底部导航栏组件
 *
 * 所有移动端页面共用的底部 Tab Bar，支持按角色动态配置。
 * 抽取此组件的目的：
 * 1. 消除各页面重复的 Tab Bar 代码和 lucide-react 图标导入
 * 2. 统一导航行为和样式，确保跨页面一致性
 * 3. 减少每个页面的模块依赖数量，加速 Vite dev 模式加载
 */

import React from 'react';
import {
    Home, Film, ShieldCheck, Award, GraduationCap, User, Settings
} from 'lucide-react';

// ===== 角色相关工具函数 =====

/** 从 localStorage 读取当前角色，默认 actor */
export function getCurrentRole(): string {
    try { return localStorage.getItem('yanyuan_role') || 'actor'; }
    catch (e) { return 'actor'; }
}

/** 角色显示名 */
export function getRoleName(role: string): string {
    var map: Record<string, string> = { admin: '李管理', actor: '张明远', user: '王观众' };
    return map[role] || '用户';
}

/** 角色标签 */
export function getRoleLabel(role: string): string {
    var map: Record<string, string> = { admin: '管理员', actor: '演员', user: '普通用户' };
    return map[role] || '用户';
}

// ===== 图标映射 =====

var ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
    home: Home,
    video: Film,
    shield: ShieldCheck,
    award: Award,
    book: GraduationCap,
    user: User,
    settings: Settings
};

// ===== Tab 配置（按角色） =====

export interface TabConfig {
    label: string;
    icon: string;
    path: string;
}

/** 默认的角色 Tab 配置列表 */
var TAB_CONFIGS: Record<string, TabConfig[]> = {
    admin: [
        { label: '首页', icon: 'home', path: '/prototypes/yanyuan-app-home' },
        { label: '短视频', icon: 'video', path: '' },
        { label: '管理', icon: 'settings', path: '/prototypes/yanyuan-app-admin' },
        { label: '证书', icon: 'award', path: '/prototypes/yanyuan-app-certificate' },
        { label: '学习', icon: 'book', path: '/prototypes/yanyuan-app-training' },
        { label: '我的', icon: 'user', path: '/prototypes/yanyuan-app-profile' }
    ],
    actor: [
        { label: '首页', icon: 'home', path: '/prototypes/yanyuan-app-home' },
        { label: '短视频', icon: 'video', path: '' },
        { label: '认证', icon: 'shield', path: '/prototypes/yanyuan-app-certification' },
        { label: '证书', icon: 'award', path: '/prototypes/yanyuan-app-certificate' },
        { label: '学习', icon: 'book', path: '/prototypes/yanyuan-app-training' },
        { label: '我的', icon: 'user', path: '/prototypes/yanyuan-app-profile' }
    ],
    user: [
        { label: '首页', icon: 'home', path: '/prototypes/yanyuan-app-home' },
        { label: '短视频', icon: 'video', path: '' },
        { label: '验证', icon: 'shield', path: '/prototypes/yanyuan-app-cert-verify' },
        { label: '学习', icon: 'book', path: '/prototypes/yanyuan-app-training' },
        { label: '我的', icon: 'user', path: '/prototypes/yanyuan-app-profile' }
    ]
};

/** 获取当前角色的 Tab 配置 */
export function getTabConfig(role?: string): TabConfig[] {
    var r = role || getCurrentRole();
    return TAB_CONFIGS[r] || TAB_CONFIGS.actor;
}

// ===== 导航函数 =====

export function navigateTo(path: string) {
    if (path) window.location.href = path;
}

// ===== 底部导航栏组件 =====

export interface AppTabBarProps {
    /** 当前激活的 Tab 索引 */
    activeIndex: number;
    /** Tab 配置列表（不传则使用角色默认配置） */
    tabs?: TabConfig[];
    /** Tab 切换回调 */
    onTabChange?: (index: number) => void;
    /** CSS 类名前缀，默认 'yanyuan-app'，用于生成 BEM 类名 */
    classPrefix?: string;
}

/**
 * 通用底部导航栏组件
 *
 * 使用示例：
 * ```tsx
 * <AppTabBar activeIndex={0} onTabChange={handleTabChange} />
 * ```
 */
export function AppTabBar(props: AppTabBarProps) {
    var prefix = props.classPrefix || 'yanyuan-app';
    var tabs = props.tabs || getTabConfig();

    return (
        <div className={prefix + '-tab-bar'}>
            {tabs.map(function (tab, index) {
                var IconComponent = ICON_MAP[tab.icon] || Home;
                var isActive = props.activeIndex === index;
                return (
                    <div
                        key={tab.label}
                        className={prefix + '-tab-item' + (isActive ? ' active' : '')}
                        onClick={function () {
                            if (props.onTabChange) {
                                props.onTabChange(index);
                            } else if (!isActive && tab.path) {
                                navigateTo(tab.path);
                            }
                        }}
                    >
                        <div className={prefix + '-tab-icon'}>
                            <IconComponent size={22} />
                        </div>
                        <div className={prefix + '-tab-label'}>{tab.label}</div>
                    </div>
                );
            })}
        </div>
    );
}
