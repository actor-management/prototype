/**
 * @name 演艺人才平台 - 消息中心
 * 参考：需求规格说明书 §5.6.4
 */
import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Bell, AlertTriangle, Info } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_message_click', desc: '点击消息' },
    { name: 'on_mark_all_read', desc: '全部已读' },
    { name: 'on_back', desc: '返回' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

var defaultMessages = [
    { id: 'm1', type: 'warning', title: '证书年审提醒', summary: '您的「专业技术资格证书（二级）」将于2026-09-30到期，请尽快申请年审。', time: '2小时前', is_read: false },
    { id: 'm2', type: 'remind', title: '培训课程开课通知', summary: '您报名的「艺德修养培训（第三期）」将于明天09:00开课，请准时参加。', time: '5小时前', is_read: false },
    { id: 'm3', type: 'system', title: '认证审核通过', summary: '恭喜您！个人认证审核已通过，您现在可以使用平台全部功能。', time: '1天前', is_read: false },
    { id: 'm4', type: 'remind', title: '考核报名提醒', summary: '2026年第二季度表演能力考核即将截止报名（截止日期：2026-04-10）。', time: '2天前', is_read: true },
    { id: 'm5', type: 'system', title: '缴费成功通知', summary: '您的演员资格证申领费用¥300.00已支付成功，订单号：PAY-2026-003421。', time: '3天前', is_read: true },
    { id: 'm6', type: 'system', title: '系统维护公告', summary: '平台将于2026-03-28 02:00-06:00进行系统维护升级，届时部分功能暂不可用。', time: '5天前', is_read: true },
    { id: 'm7', type: 'remind', title: '课程学习进度提醒', summary: '您的「表演基础技巧提升课」学习进度为30%，距课程截止还有20天。', time: '1周前', is_read: true }
];

function MsgIcon(props: { type: string }) {
    switch (props.type) {
        case 'warning': return <AlertTriangle size={16} />;
        case 'remind': return <Bell size={16} />;
        default: return <Info size={16} />;
    }
}

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanMessages(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var tabState = useState<number>(0);
    var msgTab = tabState[0];
    var setMsgTab = tabState[1];

    var [messages, setMessages] = useState(defaultMessages);
    var [selectedMsg, setSelectedMsg] = useState<any>(null);

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    var visibleMessages = msgTab === 0 ? messages
        : messages.filter(function (m) { return !m.is_read; });

    var handleMarkAllRead = function () {
        setMessages(function (msgs) { return msgs.map(function (m) { return { ...m, is_read: true }; }); });
        emitEvent('on_mark_all_read');
    };

    var handleMessageClick = function (msg: any) {
        setMessages(function (msgs) { return msgs.map(function (m) { return m.id === msg.id ? { ...m, is_read: true } : m; }); });
        setSelectedMsg(msg);
        emitEvent('on_message_click', msg.id);
    };

    useImperativeHandle(ref, function () {
        return {
            getVar: function () { return undefined; }, fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    return (
        <div className="yanyuan-msg-container">
            <div className="yanyuan-msg-scroll">
                <div className="yanyuan-msg-nav">
                    <div className="yanyuan-msg-nav-back" onClick={function () { emitEvent('on_back'); window.history.back(); }}>
                        <ArrowLeft size={20} color="#1A1A2E" />
                    </div>
                    <div className="yanyuan-msg-nav-title">消息中心</div>
                    <div className="yanyuan-msg-nav-action" onClick={handleMarkAllRead}>
                        全部已读
                    </div>
                </div>

                <div className="yanyuan-msg-tabs">
                    <div className={'yanyuan-msg-tab' + (msgTab === 0 ? ' active' : '')}
                        onClick={function () { setMsgTab(0); }}>全部</div>
                    <div className={'yanyuan-msg-tab' + (msgTab === 1 ? ' active' : '')}
                        onClick={function () { setMsgTab(1); }}>未读</div>
                </div>

                <div className="yanyuan-msg-list">
                    {visibleMessages.length > 0 ? visibleMessages.map(function (msg) {
                        return (
                            <div key={msg.id}
                                className={'yanyuan-msg-item' + (!msg.is_read ? ' unread' : '')}
                                onClick={function () { handleMessageClick(msg); }}>
                                <div className={'yanyuan-msg-icon ' + msg.type}>
                                    <MsgIcon type={msg.type} />
                                </div>
                                <div className="yanyuan-msg-content">
                                    <div className="yanyuan-msg-title-row">
                                        {!msg.is_read && <span className="yanyuan-msg-unread-dot" />}
                                        <span className="yanyuan-msg-title">{msg.title}</span>
                                    </div>
                                    <div className="yanyuan-msg-summary">{msg.summary}</div>
                                    <div className="yanyuan-msg-time">{msg.time}</div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="yanyuan-msg-empty">
                            <div className="yanyuan-msg-empty-icon">📭</div>
                            <div className="yanyuan-msg-empty-text">暂无未读消息</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 消息详情弹窗 */}
            {selectedMsg && (
                <div className="yanyuan-msg-detail-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
                    <div className="yanyuan-msg-nav" style={{ flexShrink: 0 }}>
                        <div className="yanyuan-msg-nav-back" onClick={function () { setSelectedMsg(null); }}>
                            <ArrowLeft size={20} color="#1A1A2E" />
                        </div>
                        <div className="yanyuan-msg-nav-title">消息详情</div>
                        <div className="yanyuan-msg-nav-action"></div>
                    </div>
                    <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div className={'yanyuan-msg-icon ' + selectedMsg.type}>
                                <MsgIcon type={selectedMsg.type} />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1A1A2E' }}>{selectedMsg.title}</h2>
                        </div>
                        <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #F0F0F0' }}>
                            {selectedMsg.time}
                        </div>
                        <div style={{ fontSize: 15, color: '#333', lineHeight: 1.6 }}>
                            {selectedMsg.summary}
                            <p style={{ marginTop: 24, fontSize: 14 }}>请及时处理相关事项，感谢您对中国演艺人才管理与服务平台的支持。</p>
                            <p style={{ marginTop: 40, color: '#8E8E93', fontSize: 13 }}>系统通知</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Component;
