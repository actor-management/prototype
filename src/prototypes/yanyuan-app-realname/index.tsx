/**
 * @name 演艺人才平台 - 实名认证 (全程沉浸优化版)
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §4.3.3
 *
 * §4.3.3 沉浸式核验交互步骤：
 * Step 1：身份预采集 - 输入真实姓名与身份证号
 * Step 2：拍摄人像面 - 身份证正面验证
 * Step 3：拍摄国徽面 - 身份证背面验证
 * Step 4：人脸活体检测 - 生物识别(正对手机/左摇头/眨眼/检测通过)
 * Step 5：实名通关 - 状态结算与数据同步回流
 */

import './style.css';
import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Camera, ShieldCheck, CheckCircle2, ChevronRight, User } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_step_change', desc: '步骤切换' },
    { name: 'on_complete', desc: '认证完成' }
];

var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_step', desc: '当前步骤' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppRealname(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var stepState = useState<number>(0);
    var step = stepState[0];
    var setStep = stepState[1];

    var nameState = useState('');
    var name = nameState[0];
    var setName = nameState[1];

    var idState = useState('');
    var idNo = idState[0];
    var setIdNo = idState[1];

    var upFrontState = useState(false);
    var uf = upFrontState[0];
    var setUf = upFrontState[1];

    var upBackState = useState(false);
    var ub = upBackState[0];
    var setUb = upBackState[1];

    // 人脸识别动效状态 
    var faceHintState = useState('请正对您的手机');
    var faceHint = faceHintState[0];
    var setFaceHint = faceHintState[1];

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_step' ? step : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [step]);

    // 人脸检测模拟流程（§4.3.3 活体检测交互时间锁序列：正对手机2s/左摇奃3s/眨眼2s/检测通过1s）
    useEffect(() => {
        if (step === 3) {
            var timers = [
                setTimeout(() => setFaceHint('请缓慢向左摇头'), 2000),
                setTimeout(() => setFaceHint('请眨眨眼'), 5000),
                setTimeout(() => setFaceHint('活体检测通过，信息比对中...'), 7000),
                setTimeout(() => {
                    setStep(4);
                    emitEvent('on_complete');
                    // 直接将用户认证状态设为已认证，这样从结果页回去就变绿了
                    try { localStorage.setItem('yanyuan_auth_status', 'authenticated'); } catch (e) { }
                }, 8000)
            ];
            return () => { timers.forEach(clearTimeout); };
        }
    }, [step, emitEvent]);

    var isDark = step === 3;

    // Step 5：实名通关结果页（§4.3.3 Step 5 状态结算）
    if (step === 4) {
        // 读取角色，Actor 可见“继续完善信息”按钮
        var currentRole = 'actor';
        try { currentRole = localStorage.getItem('yanyuan_role') || 'actor'; } catch (e) { /* */ }
        return (
            <div className="yarn-container yarn-result">
                <div className="yarn-result-icon success"><CheckCircle2 size={56} /></div>
                <div className="yarn-result-title">实名认证成功</div>
                <div className="yarn-result-desc">您的身份验证已通过，各项功能权限已解锁，快去体验吧。</div>
                <button className="yarn-btn-primary" style={{ maxWidth: 280 }} onClick={() => navigateTo('/prototypes/yanyuan-app-certification')}>
                    返回认证中心
                </button>
                {/* §4.3.3 Step 5：“继续完善信息”仅 Actor 可见 */}
                {currentRole === 'actor' && (
                    <button className="yarn-btn-secondary" style={{ maxWidth: 280, marginTop: 12 }} onClick={() => navigateTo('/prototypes/yanyuan-app-info-fill')}>
                        继续完善个人信息
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`yarn-container ${isDark ? 'yarn-face-dark' : ''}`}>
            {/* Header */}
            <div className={`yarn-header ${isDark ? 'yarn-header-dark' : ''}`}>
                <button className="yarn-back" onClick={() => navigateTo('/prototypes/yanyuan-app-certification')}>
                    <ArrowLeft size={24} color={isDark ? '#fff' : '#1A1A2E'} />
                </button>
                <div className="yarn-header-title">{isDark ? '' : '实名认证'}</div>
                <div style={{ width: 40 }} />
            </div>

            {/* Content */}
            <div className="yarn-scroll">
                {step === 0 && (
                    <div className="yarn-step-card">
                        <div className="yarn-title-main">身份预采集</div>
                        <div className="yarn-title-sub">请输入您本人的真实姓名和身份证号码</div>

                        <div className="yarn-form-group">
                            <label className="yarn-form-label">真实姓名</label>
                            <input className="yarn-form-input" placeholder="输入姓名，例：张三" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="yarn-form-group">
                            <label className="yarn-form-label">身份证号码</label>
                            <input className="yarn-form-input" placeholder="输入18位有效数字或字母" maxLength={18} value={idNo} onChange={e => setIdNo(e.target.value)} />
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="yarn-step-card">
                        <div className="yarn-title-main">拍摄人像面</div>
                        <div className="yarn-title-sub">请将身份证【人像面】置于框内并拍摄</div>
                        <div className={`yarn-idcard-box ${uf ? 'done' : ''}`} onClick={() => setUf(true)}>
                            <div className="yarn-idcard-edge tl" />
                            <div className="yarn-idcard-edge tr" />
                            <div className="yarn-idcard-edge bl" />
                            <div className="yarn-idcard-edge br" />
                            <User className="yarn-idcard-bg-icon" size={100} />
                            <div className="yarn-idcard-content">
                                {uf ? (
                                    <>
                                        <div className="yarn-idcard-btn"><CheckCircle2 size={32} /></div>
                                        <div className="yarn-idcard-desc">识别成功</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="yarn-idcard-btn"><Camera size={28} /></div>
                                        <div className="yarn-idcard-desc">点击拍摄正面</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="yarn-step-card">
                        <div className="yarn-title-main">拍摄国徽面</div>
                        <div className="yarn-title-sub">请将身份证【国徽面】置于框内并拍摄</div>
                        <div className={`yarn-idcard-box ${ub ? 'done' : ''}`} onClick={() => setUb(true)}>
                            <div className="yarn-idcard-edge tl" />
                            <div className="yarn-idcard-edge tr" />
                            <div className="yarn-idcard-edge bl" />
                            <div className="yarn-idcard-edge br" />
                            <ShieldCheck className="yarn-idcard-bg-icon" size={100} />
                            <div className="yarn-idcard-content">
                                {ub ? (
                                    <>
                                        <div className="yarn-idcard-btn"><CheckCircle2 size={32} /></div>
                                        <div className="yarn-idcard-desc">识别成功</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="yarn-idcard-btn"><Camera size={28} /></div>
                                        <div className="yarn-idcard-desc">点击拍摄反面</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="yarn-step-card yarn-face-container">
                        <div className="yarn-face-radar scanning">
                            <User className="yarn-face-avatar" size={160} />
                            <div className="yarn-face-scanbox">
                                <div className="yarn-face-scanline" />
                            </div>
                        </div>
                        <div className="yarn-face-hint">{faceHint}</div>
                        <div className="yarn-face-subhint">生物活体识别采集中</div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {step < 3 && (
                <div className="yarn-footer">
                    <button
                        className="yarn-btn-primary"
                        disabled={(step === 0 && (!name || !idNo)) || (step === 1 && !uf) || (step === 2 && !ub)}
                        onClick={() => {
                            setStep(s => s + 1);
                            emitEvent('on_step_change', String(step + 1));
                        }}
                    >
                        下一步 <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
});

export default Component;
