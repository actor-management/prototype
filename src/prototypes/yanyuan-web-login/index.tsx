/**
 * @name 登录/注册中心
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/themes/antd-new/designToken.json (Ant Design 主题)
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md
 */

import './style.css';
import React, { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { AxureProps, AxureHandle, EventItem, Action, KeyDesc, ConfigItem, DataDesc } from '../../common/axure-types';

// ===== SVG 图标组件 =====

// 星形 Logo 图标
const StarLogoIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.09 8.26L21 9.27L16 13.97L17.18 21L12 17.77L6.82 21L8 13.97L3 9.27L9.91 8.26L12 2Z" fill="#fff" />
        <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.3)" />
    </svg>
);

// 手机图标
const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
);

// 二维码图标
const QrCodeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="4" height="4" rx="0.5" />
        <path d="M22 14h-4v4" />
        <path d="M22 22h-8v-4" />
    </svg>
);

// 锁图标
const LockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// 眼睛图标（显示密码）
const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// 眼睛关闭图标（隐藏密码）
const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

// 上传图标
const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

// 刷新图标
const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

// 勾选图标
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// 演员图标
const ActorIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// 机构图标
const OrgIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
);

// 证书图标（特色功能）
const CertFeatureIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h6" />
        <circle cx="17" cy="16" r="2" />
    </svg>
);

// 培训图标（特色功能）
const TrainFeatureIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

// 档案图标（特色功能）
const ArchiveFeatureIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

// ===== 生成二维码点阵数据 =====
const generateQrDots = (): boolean[] => {
    const dots: boolean[] = [];
    // 生成 16x16 的模拟二维码点阵
    for (let i = 0; i < 256; i++) {
        const row = Math.floor(i / 16);
        const col = i % 16;
        // 三个定位角
        if ((row < 4 && col < 4) || (row < 4 && col > 11) || (row > 11 && col < 4)) {
            dots.push(true);
        } else if ((row === 4 && (col < 5 || col > 10)) || (col === 4 && (row < 5 || row > 10)) ||
            (row === 4 && col === 4) || (row === 11 && col < 5) || (col === 4 && row === 11)) {
            dots.push(false);
        } else {
            // 随机填充（但保持一定密度感）
            dots.push(Math.random() > 0.45);
        }
    }
    return dots;
};

// ===== 密码强度计算 =====
const getPasswordStrength = (pwd: string): { level: number; text: string; key: string } => {
    if (!pwd) return { level: 0, text: '', key: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: 1, text: '弱', key: 'weak' };
    if (score <= 3) return { level: 2, text: '中', key: 'medium' };
    return { level: 3, text: '强', key: 'strong' };
};

// ===== Axure API 定义 =====
const EVENT_LIST: EventItem[] = [
    { name: 'onLogin', desc: '登录按钮点击时触发' },
    { name: 'onRegister', desc: '注册提交时触发' },
    { name: 'onResetPassword', desc: '密码重置时触发' },
    { name: 'onPageSwitch', desc: '登录/注册/重置页面切换时触发' },
];

const ACTION_LIST: Action[] = [
    { name: 'switchToLogin', desc: '切换到登录页' },
    { name: 'switchToRegister', desc: '切换到注册页' },
    { name: 'switchToReset', desc: '切换到密码重置页' },
];

const VAR_LIST: KeyDesc[] = [
    { name: 'currentPage', desc: '当前页面：login/register/reset' },
    { name: 'loginTab', desc: '登录 Tab：phone/qrcode' },
    { name: 'registerStep', desc: '注册步骤：1/2/3' },
];

const CONFIG_LIST: ConfigItem[] = [];
const DATA_LIST: DataDesc[] = [];

// ===== 主组件 =====
const Component = forwardRef<AxureHandle, AxureProps>(function YanYuanLogin(innerProps, ref) {
    const onEventHandler = typeof innerProps?.onEvent === 'function' ? innerProps.onEvent : () => undefined;

    // 页面状态：login / register / reset
    const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'reset'>('login');
    // 登录 Tab
    const [loginTab, setLoginTab] = useState<'phone' | 'qrcode'>('phone');
    // 注册步骤
    const [registerStep, setRegisterStep] = useState(1);
    // 表单数据
    const [phone, setPhone] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [userType, setUserType] = useState<'actor' | 'org'>('actor');
    const [realName, setRealName] = useState('');
    const [idCard, setIdCard] = useState('');
    // UI 状态
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [rememberLogin, setRememberLogin] = useState(true);
    // 二维码点阵
    const [qrDots] = useState(() => generateQrDots());

    // 验证码倒计时
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(v => v - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const emitEvent = useCallback((eventName: string, payload?: any) => {
        try { onEventHandler(eventName, payload); } catch (e) { console.warn('事件触发失败:', e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, () => ({
        getVar: (name: string) => {
            const vars: Record<string, any> = { currentPage, loginTab, registerStep };
            return vars[name];
        },
        fireAction: (name: string) => {
            if (name === 'switchToLogin') switchPage('login');
            if (name === 'switchToRegister') switchPage('register');
            if (name === 'switchToReset') switchPage('reset');
        },
        eventList: EVENT_LIST,
        actionList: ACTION_LIST,
        varList: VAR_LIST,
        configList: CONFIG_LIST,
        dataList: DATA_LIST,
    }), [currentPage, loginTab, registerStep]);

    // 页面切换
    const switchPage = (page: 'login' | 'register' | 'reset') => {
        setCurrentPage(page);
        setPhone('');
        setSmsCode('');
        setPassword('');
        setPasswordConfirm('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setRegisterStep(1);
        emitEvent('onPageSwitch', { page });
    };

    // 发送验证码
    const handleSendCode = () => {
        if (countdown > 0 || !phone) return;
        setCountdown(60);
    };

    // 密码强度
    const pwdStrength = getPasswordStrength(password);
    const newPwdStrength = getPasswordStrength(newPassword);

    // ===== 渲染登录表单 =====
    const renderLoginForm = () => (
        <>
            <div className="yy-login-card-header">
                <div className="yy-login-card-title">欢迎登录</div>
                <div className="yy-login-card-desc">中国演艺人才管理与服务平台</div>
            </div>

            <div className="yy-login-tabs">
                <button
                    className={`yy-login-tab${loginTab === 'phone' ? ' active' : ''}`}
                    onClick={() => setLoginTab('phone')}
                >
                    <PhoneIcon /> 手机号登录
                </button>
                <button
                    className={`yy-login-tab${loginTab === 'qrcode' ? ' active' : ''}`}
                    onClick={() => setLoginTab('qrcode')}
                >
                    <QrCodeIcon /> 扫码登录
                </button>
            </div>

            {loginTab === 'phone' ? (
                <>
                    <div className="yy-form-group">
                        <label className="yy-form-label">手机号 <span className="required">*</span></label>
                        <input
                            className="yy-form-input"
                            type="tel"
                            placeholder="请输入11位手机号"
                            maxLength={11}
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    <div className="yy-form-group">
                        <label className="yy-form-label">验证码 <span className="required">*</span></label>
                        <div className="yy-form-code-row">
                            <input
                                className="yy-form-input"
                                type="text"
                                placeholder="请输入6位验证码"
                                maxLength={6}
                                value={smsCode}
                                onChange={e => setSmsCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <button
                                className={`yy-form-code-btn${countdown > 0 ? ' disabled' : ''}`}
                                onClick={handleSendCode}
                                disabled={countdown > 0}
                            >
                                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                            </button>
                        </div>
                    </div>
                    <div className="yy-checkbox-row">
                        <label className="yy-checkbox-label" onClick={() => setRememberLogin(!rememberLogin)}>
                            <span className={`yy-checkbox${rememberLogin ? ' checked' : ''}`}>
                                {rememberLogin && <CheckIcon />}
                            </span>
                            记住登录状态
                        </label>
                        <button className="yy-form-link" onClick={() => switchPage('reset')}>
                            忘记密码？
                        </button>
                    </div>
                    <button
                        className="yy-form-submit-btn"
                        onClick={() => emitEvent('onLogin', { phone, smsCode })}
                    >
                        登 录
                    </button>
                    <div className="yy-agreement">
                        登录即表示同意 <span className="yy-agreement-link">《用户服务协议》</span> 和 <span className="yy-agreement-link">《隐私政策》</span>
                    </div>
                </>
            ) : (
                <div className="yy-qr-wrapper">
                    <div className="yy-qr-code">
                        <div className="yy-qr-pattern">
                            {qrDots.map((filled, i) => (
                                <div key={i} className={`yy-qr-dot ${filled ? 'filled' : 'empty'}`} />
                            ))}
                        </div>
                        <div className="yy-qr-center-logo">
                            <StarLogoIcon size={18} />
                        </div>
                    </div>
                    <div className="yy-qr-status">
                        <span className="yy-qr-status-dot" />
                        等待扫码…
                    </div>
                    <div className="yy-qr-hint">请使用微信或小程序扫描二维码登录</div>
                    <button className="yy-qr-refresh">
                        <RefreshIcon /> 刷新二维码
                    </button>
                </div>
            )}

            <div className="yy-form-footer">
                还没有账号？ <button className="yy-form-link" onClick={() => switchPage('register')}>立即注册</button>
            </div>
        </>
    );

    // ===== 渲染注册表单 =====
    const renderRegisterForm = () => (
        <>
            <div className="yy-login-card-header">
                <div className="yy-login-card-title">用户注册</div>
                <div className="yy-login-card-desc">创建您的平台账号</div>
            </div>

            {/* 步骤条 */}
            <div className="yy-steps">
                {[
                    { num: 1, label: '手机验证' },
                    { num: 2, label: '基本信息' },
                    { num: 3, label: '实名认证' },
                ].map(step => (
                    <div
                        key={step.num}
                        className={`yy-step-item${registerStep === step.num ? ' active' : ''}${registerStep > step.num ? ' done' : ''}`}
                    >
                        <span className="yy-step-number">
                            {registerStep > step.num ? <CheckIcon /> : step.num}
                        </span>
                        <span className="yy-step-label">{step.label}</span>
                    </div>
                ))}
            </div>

            {/* 步骤 1：手机号验证 */}
            {registerStep === 1 && (
                <>
                    <div className="yy-form-group">
                        <label className="yy-form-label">手机号 <span className="required">*</span></label>
                        <input
                            className="yy-form-input"
                            type="tel"
                            placeholder="请输入11位手机号"
                            maxLength={11}
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    <div className="yy-form-group">
                        <label className="yy-form-label">短信验证码 <span className="required">*</span></label>
                        <div className="yy-form-code-row">
                            <input
                                className="yy-form-input"
                                type="text"
                                placeholder="请输入6位验证码"
                                maxLength={6}
                                value={smsCode}
                                onChange={e => setSmsCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <button
                                className={`yy-form-code-btn${countdown > 0 ? ' disabled' : ''}`}
                                onClick={handleSendCode}
                                disabled={countdown > 0}
                            >
                                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                            </button>
                        </div>
                    </div>
                    <button
                        className="yy-form-submit-btn"
                        onClick={() => setRegisterStep(2)}
                    >
                        下一步
                    </button>
                </>
            )}

            {/* 步骤 2：基本信息 */}
            {registerStep === 2 && (
                <>
                    <div className="yy-form-group">
                        <label className="yy-form-label">用户类型 <span className="required">*</span></label>
                        <div className="yy-type-select">
                            <div
                                className={`yy-type-option${userType === 'actor' ? ' selected' : ''}`}
                                onClick={() => setUserType('actor')}
                            >
                                <div className="yy-type-option-icon">
                                    <ActorIcon />
                                </div>
                                <div className="yy-type-option-label">演员</div>
                                <div className="yy-type-option-desc">演艺行业从业者</div>
                            </div>
                            <div
                                className={`yy-type-option${userType === 'org' ? ' selected' : ''}`}
                                onClick={() => setUserType('org')}
                            >
                                <div className="yy-type-option-icon">
                                    <OrgIcon />
                                </div>
                                <div className="yy-type-option-label">行业机构</div>
                                <div className="yy-type-option-desc">经纪公司/院校等</div>
                            </div>
                        </div>
                    </div>
                    <div className="yy-form-group">
                        <label className="yy-form-label">登录密码 <span className="required">*</span></label>
                        <div className="yy-form-input-wrap">
                            <input
                                className="yy-form-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="8-20位，须包含大小写字母和数字"
                                maxLength={20}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        {password && (
                            <div className="yy-password-strength">
                                <div className={`yy-password-bar${pwdStrength.level >= 1 ? ` ${pwdStrength.key}` : ''}`} />
                                <div className={`yy-password-bar${pwdStrength.level >= 2 ? ` ${pwdStrength.key}` : ''}`} />
                                <div className={`yy-password-bar${pwdStrength.level >= 3 ? ` ${pwdStrength.key}` : ''}`} />
                                <span className={`yy-password-text ${pwdStrength.key}`}>{pwdStrength.text}</span>
                            </div>
                        )}
                    </div>
                    <div className="yy-form-group">
                        <label className="yy-form-label">确认密码 <span className="required">*</span></label>
                        <input
                            className="yy-form-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="请再次输入密码"
                            maxLength={20}
                            value={passwordConfirm}
                            onChange={e => setPasswordConfirm(e.target.value)}
                        />
                    </div>
                    <div className="yy-btn-row">
                        <button className="yy-form-secondary-btn" onClick={() => setRegisterStep(1)}>
                            上一步
                        </button>
                        <button className="yy-form-submit-btn" onClick={() => setRegisterStep(3)}>
                            下一步
                        </button>
                    </div>
                </>
            )}

            {/* 步骤 3：实名认证 */}
            {registerStep === 3 && (
                <>
                    <div className="yy-form-group">
                        <label className="yy-form-label">真实姓名 <span className="required">*</span></label>
                        <input
                            className="yy-form-input"
                            type="text"
                            placeholder="请输入真实姓名（2-20个中文字符）"
                            maxLength={20}
                            value={realName}
                            onChange={e => setRealName(e.target.value)}
                        />
                    </div>
                    <div className="yy-form-group">
                        <label className="yy-form-label">身份证号 <span className="required">*</span></label>
                        <input
                            className="yy-form-input"
                            type="text"
                            placeholder="请输入18位身份证号码"
                            maxLength={18}
                            value={idCard}
                            onChange={e => setIdCard(e.target.value)}
                        />
                    </div>
                    <div className="yy-form-group">
                        <label className="yy-form-label">上传身份证照片 <span className="required">*</span></label>
                        <div className="yy-upload-group">
                            <div className="yy-upload-item">
                                <div className="yy-upload-icon"><UploadIcon /></div>
                                <div className="yy-upload-text">身份证<br />人像面</div>
                            </div>
                            <div className="yy-upload-item">
                                <div className="yy-upload-icon"><UploadIcon /></div>
                                <div className="yy-upload-text">身份证<br />国徽面</div>
                            </div>
                            <div className="yy-upload-item">
                                <div className="yy-upload-icon"><UploadIcon /></div>
                                <div className="yy-upload-text">手持<br />身份证</div>
                            </div>
                        </div>
                    </div>
                    <div className="yy-btn-row">
                        <button className="yy-form-secondary-btn" onClick={() => setRegisterStep(2)}>
                            上一步
                        </button>
                        <button
                            className="yy-form-submit-btn"
                            onClick={() => emitEvent('onRegister', { phone, userType, realName, idCard })}
                        >
                            提交注册
                        </button>
                    </div>
                </>
            )}

            <div className="yy-form-footer">
                已有账号？ <button className="yy-form-link" onClick={() => switchPage('login')}>去登录</button>
            </div>
        </>
    );

    // ===== 渲染密码重置表单 =====
    const renderResetForm = () => (
        <>
            <div className="yy-login-card-header">
                <div className="yy-login-card-title">重置密码</div>
                <div className="yy-login-card-desc">通过手机号验证后设置新密码</div>
            </div>

            <div className="yy-form-group">
                <label className="yy-form-label">手机号 <span className="required">*</span></label>
                <input
                    className="yy-form-input"
                    type="tel"
                    placeholder="请输入注册时使用的手机号"
                    maxLength={11}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
            </div>
            <div className="yy-form-group">
                <label className="yy-form-label">短信验证码 <span className="required">*</span></label>
                <div className="yy-form-code-row">
                    <input
                        className="yy-form-input"
                        type="text"
                        placeholder="请输入6位验证码"
                        maxLength={6}
                        value={smsCode}
                        onChange={e => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    />
                    <button
                        className={`yy-form-code-btn${countdown > 0 ? ' disabled' : ''}`}
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                    >
                        {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                    </button>
                </div>
            </div>
            <div className="yy-form-group">
                <label className="yy-form-label">新密码 <span className="required">*</span></label>
                <div className="yy-form-input-wrap">
                    <input
                        className="yy-form-input"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="8-20位，须包含大小写字母和数字"
                        maxLength={20}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                </div>
                {newPassword && (
                    <div className="yy-password-strength">
                        <div className={`yy-password-bar${newPwdStrength.level >= 1 ? ` ${newPwdStrength.key}` : ''}`} />
                        <div className={`yy-password-bar${newPwdStrength.level >= 2 ? ` ${newPwdStrength.key}` : ''}`} />
                        <div className={`yy-password-bar${newPwdStrength.level >= 3 ? ` ${newPwdStrength.key}` : ''}`} />
                        <span className={`yy-password-text ${newPwdStrength.key}`}>{newPwdStrength.text}</span>
                    </div>
                )}
            </div>
            <div className="yy-form-group">
                <label className="yy-form-label">确认新密码 <span className="required">*</span></label>
                <input
                    className="yy-form-input"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="请再次输入新密码"
                    maxLength={20}
                    value={newPasswordConfirm}
                    onChange={e => setNewPasswordConfirm(e.target.value)}
                />
            </div>
            <button
                className="yy-form-submit-btn"
                onClick={() => emitEvent('onResetPassword', { phone, smsCode, newPassword })}
            >
                确认重置
            </button>
            <div className="yy-form-footer">
                <button className="yy-form-link" onClick={() => switchPage('login')}>返回登录</button>
            </div>
        </>
    );

    return (
        <div className="yanyuan-login-page">
            {/* ===== 左侧品牌区 ===== */}
            <div className="yy-login-brand">
                <div className="yy-login-brand-content">
                    <div className="yy-login-brand-logo">
                        <StarLogoIcon size={36} />
                    </div>
                    <div className="yy-login-brand-title">中国演艺人才管理<br />与服务平台</div>
                    <div className="yy-login-brand-subtitle">TALENT MANAGEMENT PLATFORM</div>
                    <div className="yy-login-brand-desc">
                        由中国广播电视社会组织联合会演员委员会主办<br />
                        致力于演艺人才的数字化管理与全方位服务
                    </div>
                    <div className="yy-login-brand-slogan">
                        汇聚行业力量 · 助力人才成长
                    </div>
                    <div className="yy-login-features">
                        <div className="yy-login-feature-item">
                            <div className="yy-login-feature-icon"><CertFeatureIcon /></div>
                            <span className="yy-login-feature-text">证书管理</span>
                        </div>
                        <div className="yy-login-feature-item">
                            <div className="yy-login-feature-icon"><TrainFeatureIcon /></div>
                            <span className="yy-login-feature-text">培训考核</span>
                        </div>
                        <div className="yy-login-feature-item">
                            <div className="yy-login-feature-icon"><ArchiveFeatureIcon /></div>
                            <span className="yy-login-feature-text">人才档案</span>
                        </div>
                    </div>
                </div>
                <div className="yy-login-brand-bottom-line" />
            </div>

            {/* ===== 右侧表单区 ===== */}
            <div className="yy-login-form-area">
                <div className="yy-login-form-wrapper">
                    <div className="yy-login-card">
                        {currentPage === 'login' && renderLoginForm()}
                        {currentPage === 'register' && renderRegisterForm()}
                        {currentPage === 'reset' && renderResetForm()}
                    </div>
                    <div className="yy-login-copyright">
                        © 2026 中国广播电视社会组织联合会演员委员会<br />
                        中国演艺人才管理与服务平台 版权所有
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Component;
