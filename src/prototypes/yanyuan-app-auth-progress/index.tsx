/**
 * @name 演艺人才平台 - 认证进度查看
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §4.3.4
 */

import './style.css';
import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Circle, AlertCircle, Edit, XCircle } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_action', desc: '操作按钮点击' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'auth_status', desc: '认证状态' }];
var CONFIG_LIST: ConfigItem[] = [
    { type: 'select', attributeId: 'status', displayName: '认证状态', info: '展示不同状态', initialValue: 'reviewing' }
];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var timelineItems = [
    { time: '2026-03-15 14:30', label: '提交认证申请', desc: '个人信息已提交，等待审核', status: 'done' as const },
    { time: '2026-03-15 14:31', label: '系统自动校验', desc: '身份信息校验通过', status: 'done' as const },
    { time: '2026-03-16 09:15', label: '管理员审核中', desc: '预计1-3个工作日', status: 'current' as const },
    { time: '', label: '审核完成', desc: '等待管理员审核', status: 'pending' as const }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppAuthProgress(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var configSource = innerProps && innerProps.config ? innerProps.config : {};
    var status = typeof configSource.status === 'string' ? configSource.status : 'reviewing';

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'auth_status' ? status : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [status]);

    return (
        <div className="yaap-container">
            <div className="yaap-scroll">
                <div className="yaap-header">
                    <button className="yaap-back" onClick={function () { navigateTo('/prototypes/yanyuan-app-certification'); }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="yaap-header-title">认证进度</h1>
                    <div style={{ width: 40 }} />
                </div>

                {/* 状态卡片 */}
                <div className={'yaap-status-card ' + status}>
                    {status === 'reviewing' && <Clock size={32} />}
                    {status === 'approved' && <CheckCircle2 size={32} />}
                    {status === 'rejected' && <XCircle size={32} />}
                    <div className="yaap-status-text">
                        {status === 'reviewing' && '审核中'}
                        {status === 'approved' && '认证已通过'}
                        {status === 'rejected' && '认证已驳回'}
                    </div>
                    {status === 'reviewing' && <div className="yaap-status-hint">预计1-3个工作日完成审核</div>}
                </div>

                {/* 驳回原因（§4.3.4 审核驳回信息字段：驳回原因分类 + 详细说明） */}
                {status === 'rejected' && (
                    <div className="yaap-reject-card">
                        <div className="yaap-reject-icon"><AlertCircle size={18} /></div>
                        <div className="yaap-reject-content">
                            <div className="yaap-reject-title">驳回原因</div>
                            <div className="yaap-reject-type">分类：材料不完整</div>
                            <div className="yaap-reject-reason">上传的毕业证照片模糊不清，请重新拍摄上传清晰的照片。</div>
                        </div>
                    </div>
                )}

                {/* 时间线 */}
                <div className="yaap-timeline-section">
                    <h2 className="yaap-section-title">审核进度</h2>
                    <div className="yaap-timeline">
                        {timelineItems.map(function (item, index) {
                            return (
                                <div key={index} className={'yaap-tl-item ' + item.status}>
                                    <div className="yaap-tl-dot-area">
                                        <div className={'yaap-tl-dot ' + item.status}>
                                            {item.status === 'done' ? <CheckCircle2 size={16} /> :
                                                item.status === 'current' ? <Clock size={16} /> :
                                                    <Circle size={16} />}
                                        </div>
                                        {index < timelineItems.length - 1 && <div className={'yaap-tl-line ' + item.status} />}
                                    </div>
                                    <div className="yaap-tl-content">
                                        <div className="yaap-tl-label">{item.label}</div>
                                        <div className="yaap-tl-desc">{item.desc}</div>
                                        {item.time && <div className="yaap-tl-time">{item.time}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 操作按钮 */}
                {status === 'rejected' && (
                    <div className="yaap-actions">
                        <button className="yaap-action-btn primary" onClick={function () { emitEvent('on_action', 'resubmit'); navigateTo('/prototypes/yanyuan-app-info-fill'); }}>
                            <Edit size={18} />
                            <span>修改并重新提交</span>
                        </button>
                    </div>
                )}
                {status === 'reviewing' && (
                    <div className="yaap-actions">
                        <button className="yaap-action-btn outline" onClick={function () { emitEvent('on_action', 'withdraw'); }}>
                            撤回申请
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default Component;
