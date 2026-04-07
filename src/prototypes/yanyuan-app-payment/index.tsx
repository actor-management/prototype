/**
 * @name 演艺人才平台 - 缴费中心
 * 参考：需求规格说明书 §5.4.6
 */
import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Clock, Check } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_pay', desc: '支付' }, { name: 'on_cancel', desc: '取消订单' },
    { name: 'on_invoice', desc: '申请发票' }, { name: 'on_back', desc: '返回' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

var pendingOrders = [
    {
        id: 'ord-1', name: '演员资格证申领费', fee_type: 'cert', type_label: '证书费', amount: 300,
        created: '2026-03-25 14:30', related: '证书申请: AC-2026-003422', remaining: '18:42:15'
    },
    {
        id: 'ord-2', name: '艺德修养培训费（第三期）', fee_type: 'train', type_label: '培训费', amount: 200,
        created: '2026-03-24 10:00', related: '培训报名: TR-2026-00089', remaining: '06:15:30'
    }
];

var paidRecords = [
    {
        id: 'rec-1', name: '演员资格证年审费', fee_type: 'renew', type_label: '年审费', amount: 100,
        pay_time: '2026-03-20 09:45', pay_method: '微信支付', status: 'paid', flow_no: 'WX20260320094500123'
    },
    {
        id: 'rec-2', name: '第一季度表演能力考试费', fee_type: 'exam', type_label: '考试费', amount: 120,
        pay_time: '2026-01-15 16:20', pay_method: '微信支付', status: 'paid', flow_no: 'WX20260115162000456'
    },
    {
        id: 'rec-3', name: '艺德修养培训费（第二期）', fee_type: 'train', type_label: '培训费', amount: 200,
        pay_time: '2025-12-01 11:30', pay_method: '微信支付', status: 'paid', flow_no: 'WX20251201113000789'
    }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanPayment(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var tabState = useState<number>(0);
    var payTab = tabState[0];
    var setPayTab = tabState[1];

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
        <div className="yanyuan-pay-container">
            <div className="yanyuan-pay-scroll">
                <div className="yanyuan-pay-nav">
                    <div className="yanyuan-pay-nav-back" onClick={function () { emitEvent('on_back'); window.history.back(); }}>
                        <ArrowLeft size={20} color="#1A1A2E" />
                    </div>
                    <div className="yanyuan-pay-nav-title">缴费中心</div>
                </div>

                <div className="yanyuan-pay-tabs">
                    <div className={'yanyuan-pay-tab' + (payTab === 0 ? ' active' : '')}
                        onClick={function () { setPayTab(0); }}>待缴费</div>
                    <div className={'yanyuan-pay-tab' + (payTab === 1 ? ' active' : '')}
                        onClick={function () { setPayTab(1); }}>缴费记录</div>
                </div>

                <div className="yanyuan-pay-list">
                    {payTab === 0 ? pendingOrders.map(function (order) {
                        return (
                            <div key={order.id} className="yanyuan-pay-card">
                                <div className="yanyuan-pay-card-header">
                                    <div className="yanyuan-pay-card-name">{order.name}</div>
                                    <span className={'yanyuan-pay-card-tag ' + order.fee_type}>{order.type_label}</span>
                                </div>
                                <div className="yanyuan-pay-card-amount">
                                    <span className="unit">¥</span>{order.amount.toFixed(2)}
                                </div>
                                <div className="yanyuan-pay-card-info">
                                    <div className="yanyuan-pay-card-info-row">创建时间: {order.created}</div>
                                    <div className="yanyuan-pay-card-info-row">关联业务: {order.related}</div>
                                </div>
                                <div className="yanyuan-pay-card-countdown">
                                    <Clock size={13} /> 距自动取消还剩 {order.remaining}
                                </div>
                                <div className="yanyuan-pay-card-actions">
                                    <button className="yanyuan-pay-card-btn cancel"
                                        onClick={function () { emitEvent('on_cancel', order.id); }}>取消</button>
                                    <button className="yanyuan-pay-card-btn detail"
                                        onClick={function () { emitEvent('on_pay', 'detail_' + order.id); }}>详情</button>
                                    <button className="yanyuan-pay-card-btn pay"
                                        onClick={function () { emitEvent('on_pay', order.id); }}>立即支付</button>
                                </div>
                            </div>
                        );
                    }) : paidRecords.map(function (record) {
                        return (
                            <div key={record.id} className="yanyuan-pay-card">
                                <div className="yanyuan-pay-card-header">
                                    <div className="yanyuan-pay-card-name">{record.name}</div>
                                    <span className={'yanyuan-pay-card-tag ' + record.fee_type}>{record.type_label}</span>
                                </div>
                                <div className="yanyuan-pay-card-amount">
                                    <span className="unit">¥</span>{record.amount.toFixed(2)}
                                </div>
                                <div className="yanyuan-pay-card-info">
                                    <div className="yanyuan-pay-card-info-row">支付方式: {record.pay_method}</div>
                                    <div className="yanyuan-pay-card-info-row">支付时间: {record.pay_time}</div>
                                    <div className="yanyuan-pay-card-info-row">流水号: {record.flow_no}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="yanyuan-pay-card-status paid">
                                        <Check size={14} /> 已支付
                                    </div>
                                    <div className="yanyuan-pay-card-actions">
                                        <button className="yanyuan-pay-card-btn detail">查看详情</button>
                                        <button className="yanyuan-pay-card-btn invoice"
                                            onClick={function () { emitEvent('on_invoice', record.id); }}>申请发票</button>
                                    </div>
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
