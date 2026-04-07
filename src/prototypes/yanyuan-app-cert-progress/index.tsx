/**
 * @name 演艺人才平台 - 证书申请进度
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.4.3
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, CreditCard, BookOpen, ClipboardCheck, Stamp, Gift, ChevronRight } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_step_action', desc: '点击步骤操作按钮' },
    { name: 'on_back', desc: '点击返回' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_step', desc: '当前步骤索引' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var STEPS = [
    { label: '提交申请', icon: FileText, desc: '2026-03-15 提交', status: 'done' as const },
    { label: '材料审核', icon: CheckCircle2, desc: '2026-03-17 审核通过', status: 'done' as const },
    { label: '缴费确认', icon: CreditCard, desc: '2026-03-18 已缴费 ¥2,000', status: 'done' as const },
    { label: '艺德培训', icon: BookOpen, desc: '已完成 8/12 课时', status: 'current' as const },
    { label: '考核评估', icon: ClipboardCheck, desc: '培训完成后可预约', status: 'pending' as const },
    { label: '管理员审签', icon: Stamp, desc: '等待考核通过', status: 'pending' as const },
    { label: '证书发放', icon: Gift, desc: '审签通过后发放', status: 'pending' as const }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppCertProgress(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_step' ? 3 : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    return (
        <div className="yacp-container">
            <div className="yacp-scroll">
                {/* 顶部导航 */}
                <div className="yacp-header">
                    <button className="yacp-back" onClick={function () { emitEvent('on_back'); navigateTo('/prototypes/yanyuan-app-certificate'); }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="yacp-header-title">申请进度</h1>
                    <div style={{ width: 40 }} />
                </div>

                {/* 申请信息卡片 */}
                <div className="yacp-info-card">
                    <div className="yacp-info-row">
                        <span className="yacp-info-label">申请编号</span>
                        <span className="yacp-info-value">AP-202603-00128</span>
                    </div>
                    <div className="yacp-info-row">
                        <span className="yacp-info-label">证书类型</span>
                        <span className="yacp-info-value">演员资格证（三级）</span>
                    </div>
                    <div className="yacp-info-row">
                        <span className="yacp-info-label">申请时间</span>
                        <span className="yacp-info-value">2026-03-15</span>
                    </div>
                </div>

                {/* 进度步骤条 */}
                <div className="yacp-steps">
                    {STEPS.map(function (step, index) {
                        var IconComp = step.icon;
                        return (
                            <div key={step.label} className={'yacp-step ' + step.status}>
                                <div className="yacp-step-line-area">
                                    <div className={'yacp-step-dot ' + step.status}>
                                        {step.status === 'done' ? <CheckCircle2 size={18} /> :
                                            step.status === 'current' ? <Clock size={18} /> :
                                                <Circle size={18} />}
                                    </div>
                                    {index < STEPS.length - 1 && <div className={'yacp-step-line ' + step.status} />}
                                </div>
                                <div className="yacp-step-content">
                                    <div className="yacp-step-label">{step.label}</div>
                                    <div className="yacp-step-desc">{step.desc}</div>
                                    {step.status === 'current' && (
                                        <button className="yacp-step-action" onClick={function () { emitEvent('on_step_action', 'training'); navigateTo('/prototypes/yanyuan-app-training'); }}>
                                            继续学习 <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default Component;
