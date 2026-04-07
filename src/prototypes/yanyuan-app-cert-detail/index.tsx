/**
 * @name 演艺人才平台 - 证书详情
 * 参考：需求规格说明书 §5.4.4
 */
import './style.css';
import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_save', desc: '保存证书' }, { name: 'on_share', desc: '分享' },
    { name: 'on_renew', desc: '申请年审' }, { name: 'on_back', desc: '返回' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

var certData = {
    name: '演员资格证', cert_no: 'AC-2026-003421', holder: '张明远', id_no: '1101**********6789',
    level: '演员资格', issue_org: '中国广播电视社会组织联合会演员委员会',
    issue_date: '2026-06-15', valid_until: '2029-06-15', status: 'valid'
};

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanCertDetail(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function () { return undefined; }, fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    return (
        <div className="yanyuan-certd-container">
            <div className="yanyuan-certd-scroll">
                <div className="yanyuan-certd-nav">
                    <div className="yanyuan-certd-nav-back" onClick={function () { emitEvent('on_back'); window.history.back(); }}>
                        <ArrowLeft size={20} color="#1A1A2E" />
                    </div>
                    <div className="yanyuan-certd-nav-title">证书详情</div>
                </div>

                {/* 证书预览卡片 */}
                <div className="yanyuan-certd-preview">
                    <div className="yanyuan-certd-preview-badge">中国演艺人才管理与服务平台</div>
                    <div className="yanyuan-certd-preview-title">{certData.name}</div>
                    <div className="yanyuan-certd-preview-name">持证人：{certData.holder}</div>
                    <div className="yanyuan-certd-preview-no">编号：{certData.cert_no}</div>
                    <div className="yanyuan-certd-preview-seal">
                        <span>已验证</span>
                    </div>
                </div>

                {/* 基本信息 */}
                <div className="yanyuan-certd-info">
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">证书编号</span>
                        <span className="yanyuan-certd-info-value">{certData.cert_no}</span>
                    </div>
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">证书类型</span>
                        <span className="yanyuan-certd-info-value">{certData.level}</span>
                    </div>
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">发证机构</span>
                        <span className="yanyuan-certd-info-value" style={{ fontSize: 12, maxWidth: '60%', textAlign: 'right' }}>
                            {certData.issue_org}
                        </span>
                    </div>
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">身份证号</span>
                        <span className="yanyuan-certd-info-value">{certData.id_no}</span>
                    </div>
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">发证日期</span>
                        <span className="yanyuan-certd-info-value">{certData.issue_date}</span>
                    </div>
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">有效期至</span>
                        <span className="yanyuan-certd-info-value">{certData.valid_until}</span>
                    </div>
                    <div className="yanyuan-certd-info-row">
                        <span className="yanyuan-certd-info-label">证书状态</span>
                        <span className={'yanyuan-certd-info-tag ' + certData.status}>
                            {certData.status === 'valid' ? '有效' : '即将到期'}
                        </span>
                    </div>
                </div>

                {/* 验证二维码 */}
                <div className="yanyuan-certd-qr">
                    <div className="yanyuan-certd-qr-title">证书验证二维码</div>
                    <div className="yanyuan-certd-qr-code">📱</div>
                    <div className="yanyuan-certd-qr-hint">他人扫描此二维码可验证证书真伪</div>
                </div>
            </div>

            {/* 底部操作 */}
            <div className="yanyuan-certd-footer">
                <button className="yanyuan-certd-btn save" onClick={function () { emitEvent('on_save'); }}>
                    <Download size={16} /> 保存
                </button>
                <button className="yanyuan-certd-btn share" onClick={function () { emitEvent('on_share'); }}>
                    <Share2 size={16} /> 分享
                </button>
                <button className="yanyuan-certd-btn renew" onClick={function () { emitEvent('on_renew'); }}>
                    <RefreshCw size={16} /> 年审
                </button>
            </div>
        </div>
    );
});

export default Component;
