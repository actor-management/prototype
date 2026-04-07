/**
 * @name 演艺人才平台 - 线下培训预约
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.5.11
 *
 * 功能说明：
 * - 展示线下培训班列表，包含时间/地点/名额/费用
 * - 点击"立即报名"弹出缴费确认弹窗
 * - 支持微信支付/支付宝支付选择
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Navigation, CheckCircle2, X, CreditCard, Wallet, ShieldCheck } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_register', desc: '报名培训' },
    { name: 'on_navigate', desc: '一键导航' },
    { name: 'on_pay', desc: '确认缴费' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var trainings = [
    {
        id: 'ot-1',
        title: '2026年春季艺德修养线下培训班（第一期）',
        time: '2026-04-10 09:00 - 17:00',
        location: '北京市朝阳区文化艺术中心3楼多功能厅',
        quota: '剩余 12 / 40 名额',
        price: 580,
        status: 'open' as const
    },
    {
        id: 'ot-2',
        title: '表演技巧提升工作坊',
        time: '2026-04-18 14:00 - 18:00',
        location: '上海市黄浦区演艺大厦B座5楼',
        quota: '剩余 5 / 30 名额',
        price: 380,
        status: 'open' as const
    },
    {
        id: 'ot-3',
        title: '演员安全意识培训',
        time: '2026-04-25 09:30 - 12:00',
        location: '广州市天河区文化产业园A区',
        quota: '报名已满',
        price: 0,
        status: 'full' as const
    },
    {
        id: 'ot-4',
        title: '戏曲表演专题研修班',
        time: '2026-05-08 09:00 - 2026-05-10 17:00',
        location: '成都市锦江区戏曲艺术研究院',
        quota: '剩余 25 / 50 名额',
        price: 1200,
        status: 'open' as const
    }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppTrainingOffline(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var registeredState = useState<Record<string, boolean>>({});
    var registered = registeredState[0];
    var setRegistered = registeredState[1];

    // 缴费弹窗状态
    var modalState = useState<{ visible: boolean; training: typeof trainings[0] | null }>({ visible: false, training: null });
    var modal = modalState[0];
    var setModal = modalState[1];

    // 支付方式
    var payMethodState = useState<'wechat' | 'alipay'>('wechat');
    var payMethod = payMethodState[0];
    var setPayMethod = payMethodState[1];

    // 支付结果
    var payResultState = useState<'idle' | 'paying' | 'success'>('idle');
    var payResult = payResultState[0];
    var setPayResult = payResultState[1];

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    // 点击报名 → 打开缴费弹窗
    var handleRegister = useCallback(function (t: typeof trainings[0]) {
        setPayResult('idle');
        setPayMethod('wechat');
        setModal({ visible: true, training: t });
    }, []);

    // 确认缴费
    var handleConfirmPay = useCallback(function () {
        if (!modal.training) return;
        setPayResult('paying');
        // 模拟支付过程
        setTimeout(function () {
            setPayResult('success');
            setRegistered(function (prev) { return Object.assign({}, prev, { [modal.training!.id]: true }); });
            emitEvent('on_pay', modal.training!.id);
        }, 1500);
    }, [modal.training, emitEvent]);

    // 关闭弹窗
    var handleCloseModal = useCallback(function () {
        setModal({ visible: false, training: null });
        setPayResult('idle');
    }, []);

    useImperativeHandle(ref, function () {
        return {
            getVar: function () { return undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    return (
        <div className="yato-container">
            <div className="yato-scroll">
                <div className="yato-header">
                    <button className="yato-back" onClick={function () { navigateTo('/prototypes/yanyuan-app-training'); }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="yato-header-title">线下培训预约</h1>
                    <div style={{ width: 40 }} />
                </div>

                <div className="yato-list">
                    {trainings.map(function (t) {
                        var isRegistered = !!registered[t.id];
                        return (
                            <div key={t.id} className="yato-card">
                                <div className="yato-card-top">
                                    <h3 className="yato-card-title">{t.title}</h3>
                                    {t.price > 0 && (
                                        <div className="yato-price">
                                            <span className="yato-price-symbol">¥</span>
                                            <span className="yato-price-num">{t.price.toFixed(2)}</span>
                                            <span className="yato-price-unit">/人</span>
                                        </div>
                                    )}
                                    {t.price === 0 && t.status !== 'full' && (
                                        <div className="yato-price free">
                                            <span className="yato-price-num">免费</span>
                                        </div>
                                    )}
                                </div>
                                <div className="yato-card-rows">
                                    <div className="yato-card-row">
                                        <Calendar size={14} />
                                        <span>{t.time}</span>
                                    </div>
                                    <div className="yato-card-row">
                                        <MapPin size={14} />
                                        <span>{t.location}</span>
                                    </div>
                                    <div className="yato-card-row">
                                        <Users size={14} />
                                        <span className={t.status === 'full' ? 'yato-full' : 'yato-available'}>{t.quota}</span>
                                    </div>
                                </div>
                                <div className="yato-card-actions">
                                    <button className="yato-nav-btn" onClick={function () { emitEvent('on_navigate', t.id); }}>
                                        <Navigation size={14} /> 导航
                                    </button>
                                    {isRegistered ? (
                                        <button className="yato-register-btn done" disabled>
                                            <CheckCircle2 size={16} /> 已报名
                                        </button>
                                    ) : t.status === 'full' ? (
                                        <button className="yato-register-btn full" disabled>报名已满</button>
                                    ) : (
                                        <button className="yato-register-btn" onClick={function () { handleRegister(t); }}>
                                            立即报名
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ===== 缴费弹窗 ===== */}
            {modal.visible && modal.training && (
                <div className="yato-modal-overlay" onClick={handleCloseModal}>
                    <div className="yato-modal" onClick={function (e) { e.stopPropagation(); }}>
                        {/* 支付成功状态 */}
                        {payResult === 'success' ? (
                            <div className="yato-pay-success">
                                <div className="yato-pay-success-icon">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 className="yato-pay-success-title">报名成功</h3>
                                <p className="yato-pay-success-desc">
                                    您已成功报名"{modal.training.title}"，请按时参加培训。
                                </p>
                                <button className="yato-pay-done-btn" onClick={handleCloseModal}>
                                    完成
                                </button>
                            </div>
                        ) : (
                            <React.Fragment>
                                {/* 弹窗标题 */}
                                <div className="yato-modal-header">
                                    <h2 className="yato-modal-title">确认报名</h2>
                                    <button className="yato-modal-close" onClick={handleCloseModal}>
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* 培训信息摘要 */}
                                <div className="yato-modal-info">
                                    <div className="yato-modal-info-title">{modal.training.title}</div>
                                    <div className="yato-modal-info-row">
                                        <Calendar size={13} /> {modal.training.time}
                                    </div>
                                    <div className="yato-modal-info-row">
                                        <MapPin size={13} /> {modal.training.location}
                                    </div>
                                </div>

                                {/* 费用明细 */}
                                <div className="yato-modal-fee">
                                    <div className="yato-fee-row">
                                        <span className="yato-fee-label">培训费用</span>
                                        <span className="yato-fee-value">
                                            {modal.training.price > 0 ? '¥' + modal.training.price.toFixed(2) : '免费'}
                                        </span>
                                    </div>
                                    <div className="yato-fee-row">
                                        <span className="yato-fee-label">报名人数</span>
                                        <span className="yato-fee-value">1人</span>
                                    </div>
                                    <div className="yato-fee-divider" />
                                    <div className="yato-fee-row total">
                                        <span className="yato-fee-label">应付金额</span>
                                        <span className="yato-fee-total">
                                            ¥{modal.training.price > 0 ? modal.training.price.toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                </div>

                                {/* 支付方式选择 */}
                                {modal.training.price > 0 && (
                                    <div className="yato-modal-pay-methods">
                                        <div className="yato-pay-method-title">选择支付方式</div>
                                        <div
                                            className={'yato-pay-method' + (payMethod === 'wechat' ? ' active' : '')}
                                            onClick={function () { setPayMethod('wechat'); }}
                                        >
                                            <div className="yato-pay-method-icon wechat">
                                                <Wallet size={20} />
                                            </div>
                                            <span className="yato-pay-method-name">微信支付</span>
                                            <div className={'yato-pay-radio' + (payMethod === 'wechat' ? ' checked' : '')} />
                                        </div>
                                        <div
                                            className={'yato-pay-method' + (payMethod === 'alipay' ? ' active' : '')}
                                            onClick={function () { setPayMethod('alipay'); }}
                                        >
                                            <div className="yato-pay-method-icon alipay">
                                                <CreditCard size={20} />
                                            </div>
                                            <span className="yato-pay-method-name">支付宝</span>
                                            <div className={'yato-pay-radio' + (payMethod === 'alipay' ? ' checked' : '')} />
                                        </div>
                                    </div>
                                )}

                                {/* 安全提示 */}
                                <div className="yato-pay-secure">
                                    <ShieldCheck size={12} />
                                    <span>支付環境安全，资金由平台担保</span>
                                </div>

                                {/* 确认按钮 */}
                                <button
                                    className={'yato-pay-btn' + (payResult === 'paying' ? ' loading' : '')}
                                    onClick={handleConfirmPay}
                                    disabled={payResult === 'paying'}
                                >
                                    {payResult === 'paying' ? '支付中...' :
                                        modal.training.price > 0 ? '确认支付 ¥' + modal.training.price.toFixed(2) :
                                            '确认报名（免费）'}
                                </button>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default Component;
