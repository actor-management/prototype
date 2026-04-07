/**
 * @name 演艺人才平台 - 登录/授权页
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.0
 *
 * 功能说明：
 * - 微信一键手机号登录（生产主入口）
 * - 演示角色快捷登录（Admin/Actor/User），登录后 localStorage 存储角色
 * - 勾选用户协议后方可登录
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
    Smartphone, Shield, User, Star, ChevronRight, Check, Eye
} from 'lucide-react';

import type {
    KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle
} from '../../common/axure-types';

// ===== Axure API 定义 =====

var EVENT_LIST: EventItem[] = [
    { name: 'on_login', desc: '登录成功时触发，返回角色类型' },
    { name: 'on_agreement_toggle', desc: '协议勾选状态变化' }
];

var ACTION_LIST: Action[] = [
    { name: 'login_as', desc: '以指定角色登录，参数：admin/actor/user' }
];

var VAR_LIST: KeyDesc[] = [
    { name: 'agreed', desc: '是否已同意协议' },
    { name: 'current_role', desc: '当前登录角色' }
];

var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

// 路由
function navigateTo(path: string) {
    window.location.href = path;
}

// ===== 主组件 =====

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppLogin(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var agreedState = useState<boolean>(false);
    var agreed = agreedState[0];
    var setAgreed = agreedState[1];

    var shakeState = useState<boolean>(false);
    var shake = shakeState[0];
    var setShake = shakeState[1];

    var emitEvent = useCallback(function (eventName: string, payload?: string) {
        try { onEventHandler(eventName, payload); } catch (e) { /* 忽略 */ }
    }, [onEventHandler]);

    // 登录处理：存储角色到 localStorage，跳转首页
    var handleLogin = useCallback(function (rawRole: string) {
        if (!agreed) {
            setShake(true);
            setTimeout(function () { setShake(false); }, 600);
            return;
        }
        // 解析角色及附带状态
        var role = rawRole === 'wechat_user' ? 'user' : rawRole;
        var authStatus = 'none';
        if (rawRole === 'wechat_user' || rawRole === 'admin') {
            authStatus = 'none';
        } else if (rawRole === 'actor' || rawRole === 'user') {
            authStatus = 'authenticated';
        }

        // 持久化角色信息
        try {
            localStorage.setItem('yanyuan_role', role);
            localStorage.setItem('yanyuan_auth_status', authStatus);
            localStorage.setItem('yanyuan_user', JSON.stringify({
                role: role,
                name: role === 'admin' ? '李管理' : role === 'actor' ? '张明远' : '王观众',
                loginTime: new Date().toISOString()
            }));
        } catch (e) { /* 忽略 */ }
        emitEvent('on_login', role);
        navigateTo('/prototypes/yanyuan-app-home');
    }, [agreed, emitEvent]);

    var handleToggleAgreement = useCallback(function () {
        setAgreed(function (prev) {
            emitEvent('on_agreement_toggle', String(!prev));
            return !prev;
        });
    }, [emitEvent]);

    // Axure Handle
    useImperativeHandle(ref, function () {
        return {
            getVar: function (name: string) {
                var vars: Record<string, any> = { agreed: agreed, current_role: '' };
                return vars[name];
            },
            fireAction: function (name: string, params?: string) {
                if (name === 'login_as' && params) { handleLogin(params); }
            },
            eventList: EVENT_LIST,
            actionList: ACTION_LIST,
            varList: VAR_LIST,
            configList: CONFIG_LIST,
            dataList: DATA_LIST
        };
    }, [agreed, handleLogin]);

    return (
        <div className="yal-container">
            {/* 品牌区 */}
            <div className="yal-brand">
                <div className="yal-brand-glow" />
                <div className="yal-logo">
                    <div className="yal-logo-inner">
                        <Star size={28} strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="yal-title">中国演艺人才管理与服务平台</h1>
                <p className="yal-subtitle">China Performing Arts Talent Platform</p>
            </div>

            {/* 操作区 */}
            <div className="yal-action-area">
                <div className="yal-action-card">
                    {/* 微信登录 */}
                    <button
                        className={'yal-wechat-btn' + (agreed ? '' : ' disabled')}
                        onClick={function () { handleLogin('wechat_user'); }}
                    >
                        <Smartphone size={18} />
                        <span>微信一键登录</span>
                    </button>

                    {/* 分隔线 */}
                    <div className="yal-divider">
                        <span className="yal-divider-line" />
                        <span className="yal-divider-text">演示账号快捷登录</span>
                        <span className="yal-divider-line" />
                    </div>

                    {/* 三角色演示登录 */}
                    <div className="yal-demo-grid">
                        <button
                            className={'yal-demo-btn admin' + (agreed ? '' : ' disabled')}
                            onClick={function () { handleLogin('admin'); }}
                        >
                            <div className="yal-demo-icon admin">
                                <Shield size={18} />
                            </div>
                            <div className="yal-demo-info">
                                <span className="yal-demo-role">管理员</span>
                                <span className="yal-demo-desc">审批管理全权限</span>
                            </div>
                            <ChevronRight size={16} className="yal-demo-arrow" />
                        </button>

                        <button
                            className={'yal-demo-btn actor' + (agreed ? '' : ' disabled')}
                            onClick={function () { handleLogin('actor'); }}
                        >
                            <div className="yal-demo-icon actor">
                                <User size={18} />
                            </div>
                            <div className="yal-demo-info">
                                <span className="yal-demo-role">演员</span>
                                <span className="yal-demo-desc">证书培训考核</span>
                            </div>
                            <ChevronRight size={16} className="yal-demo-arrow" />
                        </button>

                        <button
                            className={'yal-demo-btn user' + (agreed ? '' : ' disabled')}
                            onClick={function () { handleLogin('user'); }}
                        >
                            <div className="yal-demo-icon user">
                                <Eye size={18} />
                            </div>
                            <div className="yal-demo-info">
                                <span className="yal-demo-role">普通用户</span>
                                <span className="yal-demo-desc">浏览查询功能</span>
                            </div>
                            <ChevronRight size={16} className="yal-demo-arrow" />
                        </button>
                    </div>

                    {/* 用户协议 - 紧凑行 */}
                    <div className={'yal-agreement' + (shake ? ' shake' : '')}>
                        <div
                            className={'yal-checkbox' + (agreed ? ' checked' : '')}
                            onClick={handleToggleAgreement}
                        >
                            {agreed && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className="yal-agreement-text" onClick={handleToggleAgreement}>
                            我已阅读并同意
                            <a className="yal-agreement-link" onClick={function (e) { e.stopPropagation(); }}>《用户协议》</a>
                            和
                            <a className="yal-agreement-link" onClick={function (e) { e.stopPropagation(); }}>《隐私政策》</a>
                        </span>
                    </div>
                </div>
            </div>

            {/* 底部版权 */}
            <div className="yal-footer">
                <span className="yal-footer-text">© 2026 中国演员委员会 版权所有</span>
            </div>
        </div>
    );
});

export default Component;
