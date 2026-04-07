/**
 * @name 演艺人才平台 - 年审申请
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.4.12
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Award, Upload, CreditCard, CheckCircle2, ChevronRight, Camera, FileText } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_submit', desc: '提交年审申请' },
    { name: 'on_step_change', desc: '步骤切换' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_step', desc: '当前步骤' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var certs = [
    { id: 'cert-1', name: '演员资格证（三级）', expires: '2026-06-15', status: '即将到期' },
    { id: 'cert-2', name: '专业技术资格证书', expires: '2026-09-01', status: '有效' }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppCertRenewal(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var stepState = useState(0);
    var step = stepState[0];
    var setStep = stepState[1];
    var selectedState = useState('');
    var selected = selectedState[0];
    var setSelected = selectedState[1];
    var filesState = useState(0);
    var fileCount = filesState[0];
    var setFileCount = filesState[1];

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    var handleNext = useCallback(function () {
        if (step < 3) {
            setStep(function (s) { return s + 1; });
            emitEvent('on_step_change', String(step + 1));
        }
        if (step === 3) {
            emitEvent('on_submit');
        }
    }, [step, emitEvent]);

    var handlePrev = useCallback(function () {
        if (step > 0) setStep(function (s) { return s - 1; });
    }, [step]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_step' ? step : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [step]);

    var stepLabels = ['选择证书', '上传材料', '缴纳费用', '提交完成'];

    return (
        <div className="yacr-container">
            <div className="yacr-header">
                <button className="yacr-back" onClick={function () { navigateTo('/prototypes/yanyuan-app-certificate'); }}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="yacr-header-title">年审申请</h1>
                <div style={{ width: 40 }} />
            </div>

            {/* 步骤条 */}
            <div className="yacr-step-bar">
                {stepLabels.map(function (label, i) {
                    return (
                        <div key={label} className={'yacr-step-item' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}>
                            <div className="yacr-step-num">{i < step ? '✓' : String(i + 1)}</div>
                            <span className="yacr-step-text">{label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="yacr-scroll">
                {/* Step 0: 选择证书 */}
                {step === 0 && (
                    <div className="yacr-section">
                        <h2 className="yacr-section-title">选择需年审的证书</h2>
                        {certs.map(function (cert) {
                            return (
                                <div key={cert.id} className={'yacr-cert-card' + (selected === cert.id ? ' selected' : '')} onClick={function () { setSelected(cert.id); }}>
                                    <div className="yacr-cert-icon"><Award size={24} /></div>
                                    <div className="yacr-cert-info">
                                        <div className="yacr-cert-name">{cert.name}</div>
                                        <div className="yacr-cert-expires">有效期至 {cert.expires}</div>
                                    </div>
                                    <span className={'yacr-cert-status ' + (cert.status === '即将到期' ? 'warning' : 'normal')}>{cert.status}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Step 1: 上传材料 */}
                {step === 1 && (
                    <div className="yacr-section">
                        <h2 className="yacr-section-title">上传年审材料</h2>
                        <div className="yacr-upload-card" onClick={function () { setFileCount(function (c) { return c + 1; }); }}>
                            <Camera size={32} />
                            <span>继续教育学时证明</span>
                            <span className="yacr-upload-hint">{fileCount > 0 ? '已上传 ' + fileCount + ' 份' : '点击上传/拍摄'}</span>
                        </div>
                        <div className="yacr-upload-card" onClick={function () { setFileCount(function (c) { return c + 1; }); }}>
                            <FileText size={32} />
                            <span>近期从业记录</span>
                            <span className="yacr-upload-hint">点击上传/拍摄</span>
                        </div>
                    </div>
                )}

                {/* Step 2: 缴纳费用 */}
                {step === 2 && (
                    <div className="yacr-section">
                        <h2 className="yacr-section-title">缴纳年审费</h2>
                        <div className="yacr-fee-card">
                            <div className="yacr-fee-row"><span>年审费</span><span className="yacr-fee-amount">¥100.00</span></div>
                            <div className="yacr-fee-divider" />
                            <div className="yacr-fee-row total"><span>合计</span><span className="yacr-fee-total">¥100.00</span></div>
                            <div className="yacr-pay-method">
                                <CreditCard size={18} />
                                <span>微信支付</span>
                                <CheckCircle2 size={18} className="yacr-pay-check" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: 提交完成 */}
                {step === 3 && (
                    <div className="yacr-section yacr-done">
                        <div className="yacr-done-icon"><CheckCircle2 size={56} /></div>
                        <h2 className="yacr-done-title">年审申请已提交</h2>
                        <p className="yacr-done-desc">审核预计需要3-5个工作日，请关注消息通知。</p>
                        <button className="yacr-done-btn" onClick={function () { navigateTo('/prototypes/yanyuan-app-certificate'); }}>
                            返回证书服务 <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* 底部按钮 */}
            {step < 3 && (
                <div className="yacr-footer">
                    {step > 0 && <button className="yacr-btn-prev" onClick={handlePrev}>上一步</button>}
                    <button className={'yacr-btn-next' + (step === 0 && !selected ? ' disabled' : '')} onClick={handleNext}>
                        {step === 2 ? '确认支付' : '下一步'}
                    </button>
                </div>
            )}
        </div>
    );
});

export default Component;
