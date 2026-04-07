/**
 * @name 演艺人才平台 - 证书验证
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.4.5
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, ScanLine, Search, CheckCircle2, XCircle, AlertTriangle, Shield, User, Award } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_scan', desc: '点击扫码验证' },
    { name: 'on_search', desc: '点击手动查询' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'verify_result', desc: '验证结果' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppCertVerify(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var certNoState = useState('');
    var certNo = certNoState[0];
    var setCertNo = certNoState[1];
    var resultState = useState<'none' | 'valid' | 'invalid' | 'expired'>('none');
    var result = resultState[0];
    var setResult = resultState[1];

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    var handleSearch = useCallback(function () {
        if (!certNo.trim()) return;
        emitEvent('on_search', certNo);
        // 演示：根据输入模拟不同结果
        if (certNo.includes('AC-')) { setResult('valid'); }
        else if (certNo.includes('EX-')) { setResult('expired'); }
        else { setResult('invalid'); }
    }, [certNo, emitEvent]);

    var handleScan = useCallback(function () {
        emitEvent('on_scan');
        setResult('valid');
    }, [emitEvent]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'verify_result' ? result : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [result]);

    return (
        <div className="yacv-container">
            <div className="yacv-scroll">
                <div className="yacv-header">
                    <button className="yacv-back" onClick={function () { navigateTo('/prototypes/yanyuan-app-certificate'); }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="yacv-header-title">证书验证</h1>
                    <div style={{ width: 40 }} />
                </div>

                {/* 扫码区 */}
                <div className="yacv-scan-area">
                    <div className="yacv-scan-icon-wrap" onClick={handleScan}>
                        <ScanLine size={48} strokeWidth={1.5} />
                    </div>
                    <p className="yacv-scan-hint">点击扫描证书二维码验证真伪</p>
                </div>

                {/* 分隔线 */}
                <div className="yacv-divider">
                    <span className="yacv-divider-line" />
                    <span className="yacv-divider-text">或手动输入证书编号</span>
                    <span className="yacv-divider-line" />
                </div>

                {/* 手动输入 */}
                <div className="yacv-input-area">
                    <div className="yacv-input-wrap">
                        <Search size={18} className="yacv-input-icon" />
                        <input
                            type="text"
                            placeholder="输入证书编号，如 AC-2026-000001"
                            value={certNo}
                            onChange={function (e) { setCertNo(e.target.value); }}
                            className="yacv-input"
                        />
                    </div>
                    <button className="yacv-search-btn" onClick={handleSearch}>查询</button>
                </div>

                {/* 验证结果 */}
                {result !== 'none' && (
                    <div className={'yacv-result ' + result}>
                        <div className="yacv-result-icon-wrap">
                            {result === 'valid' && <CheckCircle2 size={48} />}
                            {result === 'invalid' && <XCircle size={48} />}
                            {result === 'expired' && <AlertTriangle size={48} />}
                        </div>
                        <div className="yacv-result-status">
                            {result === 'valid' && '证书有效 ✓'}
                            {result === 'invalid' && '证书无效 ✗'}
                            {result === 'expired' && '证书已过期'}
                        </div>
                        {result === 'valid' && (
                            <div className="yacv-result-info">
                                <div className="yacv-result-row">
                                    <User size={14} />
                                    <span className="yacv-result-label">持证人</span>
                                    <span className="yacv-result-value">张**</span>
                                </div>
                                <div className="yacv-result-row">
                                    <Award size={14} />
                                    <span className="yacv-result-label">证书类型</span>
                                    <span className="yacv-result-value">演员资格证（三级）</span>
                                </div>
                                <div className="yacv-result-row">
                                    <Shield size={14} />
                                    <span className="yacv-result-label">有效期</span>
                                    <span className="yacv-result-value">2026-03-20 至 2029-03-20</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

export default Component;
