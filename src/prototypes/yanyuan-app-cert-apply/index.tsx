/**
 * @name 演艺人才平台 - 证书申领
 * 参考：需求规格说明书 §5.4.2
 */
import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Award, Check } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_step_change', desc: '步骤切换' },
    { name: 'on_submit', desc: '提交申请' },
    { name: 'on_back', desc: '返回' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_step', desc: '当前步骤' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

var STEP_LABELS = ['选择类型', '确认信息', '上传材料', '费用确认', '申请完成'];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanCertApply(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var stepState = useState<number>(0);
    var currentStep = stepState[0];
    var setCurrentStep = stepState[1];

    var typeState = useState<string>('actor');
    var selectedType = typeState[0];
    var setSelectedType = typeState[1];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    var nextStep = useCallback(function () {
        setCurrentStep(function (s) { var n = Math.min(s + 1, 4); emitEvent('on_step_change', String(n)); return n; });
    }, [emitEvent]);

    var prevStep = useCallback(function () {
        setCurrentStep(function (s) { var n = Math.max(s - 1, 0); emitEvent('on_step_change', String(n)); return n; });
    }, [emitEvent]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_step' ? currentStep : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [currentStep]);

    return (
        <div className="yanyuan-apply-container">
            <div className="yanyuan-apply-scroll">
                <div className="yanyuan-apply-nav">
                    <div className="yanyuan-apply-nav-back" onClick={function () { emitEvent('on_back'); window.history.back(); }}>
                        <ArrowLeft size={20} color="#1A1A2E" />
                    </div>
                    <div className="yanyuan-apply-nav-title">证书申领</div>
                </div>

                {/* 步骤条 */}
                <div className="yanyuan-apply-steps">
                    {STEP_LABELS.map(function (_, i) {
                        var status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
                        return (
                            <div key={i} className="yanyuan-apply-step">
                                <div className={'yanyuan-apply-step-circle ' + status}>
                                    {status === 'done' ? <Check size={14} /> : i + 1}
                                </div>
                                {i < STEP_LABELS.length - 1 && (
                                    <div className={'yanyuan-apply-step-line ' + (i < currentStep ? 'done' : 'pending')} />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="yanyuan-apply-step-labels">
                    {STEP_LABELS.map(function (label, i) {
                        return <div key={i} className={'yanyuan-apply-step-label' + (i === currentStep ? ' active' : '')}>{label}</div>;
                    })}
                </div>

                <div className="yanyuan-apply-content">
                    {/* Step 1: 选择证书类型 */}
                    {currentStep === 0 && (
                        <React.Fragment>
                            <div className={'yanyuan-apply-type-card' + (selectedType === 'actor' ? ' selected' : '')}
                                onClick={function () { setSelectedType('actor'); }}>
                                <div className="yanyuan-apply-type-icon actor"><Award size={26} /></div>
                                <div className="yanyuan-apply-type-info">
                                    <div className="yanyuan-apply-type-name">演员资格证</div>
                                    <div className="yanyuan-apply-type-desc">从事演员职业的基本资格证明</div>
                                </div>
                                <div className={'yanyuan-apply-type-check' + (selectedType === 'actor' ? ' selected' : '')}>
                                    {selectedType === 'actor' && <Check size={14} />}
                                </div>
                            </div>
                            <div className={'yanyuan-apply-type-card' + (selectedType === 'tech' ? ' selected' : '')}
                                onClick={function () { setSelectedType('tech'); }}>
                                <div className="yanyuan-apply-type-icon tech"><Award size={26} /></div>
                                <div className="yanyuan-apply-type-info">
                                    <div className="yanyuan-apply-type-name">专业技术资格证书</div>
                                    <div className="yanyuan-apply-type-desc">需先持有演员资格证，通过专业考核</div>
                                </div>
                                <div className={'yanyuan-apply-type-check' + (selectedType === 'tech' ? ' selected' : '')}>
                                    {selectedType === 'tech' && <Check size={14} />}
                                </div>
                            </div>
                        </React.Fragment>
                    )}

                    {/* Step 2: 确认信息 */}
                    {currentStep === 1 && (
                        <div className="yanyuan-apply-info-card">
                            {[
                                ['姓名', '张明远'], ['性别', '男'], ['出生日期', '1992-06-15'],
                                ['手机号', '138****6789'], ['所属单位', '北京某演艺公司'],
                                ['最高学历', '本科'], ['毕业院校', '中央戏剧学院'],
                                ['认证状态', '已认证']
                            ].map(function (row) {
                                return (
                                    <div key={row[0]} className="yanyuan-apply-info-row">
                                        <span className="yanyuan-apply-info-label">{row[0]}</span>
                                        <span className="yanyuan-apply-info-value">{row[1]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Step 3: 上传材料 */}
                    {currentStep === 2 && (
                        <div className="yanyuan-apply-info-card">
                            <div style={{ textAlign: 'center', padding: '24px 0', color: '#8E8E93' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                                <div style={{ fontSize: 14, marginBottom: 8 }}>请上传以下材料</div>
                                <div style={{ fontSize: 13, lineHeight: 1.8, textAlign: 'left' }}>
                                    1. 近期免冠二寸照片<br />
                                    2. 身份证正反面照片<br />
                                    3. 最高学历证书扫描件<br />
                                    4. 从业证明材料<br />
                                    {selectedType === 'tech' && '5. 专业能力相关作品/证明'}
                                </div>
                                <div style={{ marginTop: 16, padding: '10px 20px', background: '#FBE9E7', borderRadius: 8, color: '#D84315', fontSize: 12 }}>
                                    支持 JPG/PNG/PDF 格式，单个文件不超过 10MB
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: 费用确认 */}
                    {currentStep === 3 && (
                        <React.Fragment>
                            <div className="yanyuan-apply-fee-card">
                                <div className="yanyuan-apply-fee-row">
                                    <span className="yanyuan-apply-info-label">受理费</span>
                                    <span className="yanyuan-apply-info-value">¥100.00</span>
                                </div>
                                <div className="yanyuan-apply-fee-row">
                                    <span className="yanyuan-apply-info-label">证书工本费</span>
                                    <span className="yanyuan-apply-info-value">¥50.00</span>
                                </div>
                                <div className="yanyuan-apply-fee-row">
                                    <span className="yanyuan-apply-info-label">培训考核费</span>
                                    <span className="yanyuan-apply-info-value">¥150.00</span>
                                </div>
                                <div className="yanyuan-apply-fee-total">
                                    <span>合计</span>
                                    <span className="amount">¥300.00</span>
                                </div>
                            </div>
                            <div className="yanyuan-apply-payment">
                                <span className="yanyuan-apply-payment-icon">💳</span>
                                <span className="yanyuan-apply-payment-name">微信支付</span>
                                <span className="yanyuan-apply-payment-check"><Check size={12} /></span>
                            </div>
                        </React.Fragment>
                    )}

                    {/* Step 5: 完成 */}
                    {currentStep === 4 && (
                        <div className="yanyuan-apply-done">
                            <div className="yanyuan-apply-done-icon"><Check size={32} color="#fff" /></div>
                            <div className="yanyuan-apply-done-title">申请已提交</div>
                            <div className="yanyuan-apply-done-desc">您的证书申领申请已提交成功，审核结果将通过消息通知您</div>
                            <div className="yanyuan-apply-done-no">申请编号：AC-2026-003422</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 底部按钮 */}
            {currentStep < 4 && (
                <div className="yanyuan-apply-footer">
                    {currentStep > 0 && (
                        <button className="yanyuan-apply-btn prev" onClick={prevStep}>上一步</button>
                    )}
                    <button
                        className={'yanyuan-apply-btn ' + (currentStep === 3 ? 'pay' : 'next')}
                        onClick={nextStep}
                    >
                        {currentStep === 3 ? '确认支付 ¥300.00' : '下一步'}
                    </button>
                </div>
            )}
        </div>
    );
});

export default Component;
