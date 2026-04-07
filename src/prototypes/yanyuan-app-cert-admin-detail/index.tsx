/**
 * @name 演艺人才平台 - 认证申请详情
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §4.3.6
 *
 * §4.3.6 要求：
 * - 信息分区（可折叠）：基本信息/联系方式/从业信息/教育背景，只读展示，字段同 §4.3.2
 * - 驳回弹窗：原因分类(material_incomplete/material_invalid/info_mismatch/other) + 详细说明
 */

import './style.css';

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import {
    ChevronLeft, ChevronDown, ChevronUp, User, MapPin, Briefcase, GraduationCap,
    ShieldCheck, ShieldX, Clock, Image as ImageIcon, FileText, CheckCircle2, X
} from 'lucide-react';

import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_back', desc: '点击顶部返回' },
    { name: 'on_pass', desc: '通过审核' },
    { name: 'on_reject', desc: '驳回审核' }
];
var ACTION_LIST: Action[] = [{ name: 'refresh_data', desc: '刷新页面' }];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

// 状态映射
var STATUS_MAP: Record<string, any> = {
    pending: { label: '待审核', class: 'pending', icon: Clock },
    approved: { label: '已通过', class: 'approved', icon: ShieldCheck },
    rejected: { label: '已驳回', class: 'rejected', icon: ShieldX }
};

var dummyData = {
    id: '1', name: '张艺凡', status: 'pending', avatar: '张',
    baseInfo: [
        { label: '主要艺名', value: '艺凡宝宝' },
        { label: '性别', value: '女' },
        { label: '出生日期', value: '1998-05-12' },
        { label: '民族', value: '汉族' },
        { label: '国籍', value: '中国' },
        { label: '身高(cm)', value: '168' },
        { label: '体重(kg)', value: '52' },
        { label: '身份证号', value: '110105********xxxx' }
    ],
    contactInfo: [
        { label: '手机号', value: '138****5678' },
        { label: '备用手机号', value: '139****4321' },
        { label: '电子邮箱', value: 'zhangyifan@example.com' },
        { label: '通讯地址', value: '北京市朝阳区建国路88号院' },
        { label: '邮政编码', value: '100022' }
    ],
    jobInfo: [
        { label: '专业方向', value: '影视表演' },
        { label: '从业年限', value: '5年' },
        { label: '从业起始年份', value: '2021' },
        { label: '所属单位', value: '北京XX影视文化传媒有限公司' },
        { label: '单位性质', value: '民营' },
        { label: '演艺特长', value: '武术、舞蹈' },
        { label: '经纪公司', value: '开心娱乐传媒' },
        { label: '经纪人', value: '李经理' },
        { label: '经纪人联系方式', value: '137****0000' }
    ],
    eduInfo: [
        { label: '最高学历', value: '本科' },
        { label: '毕业院校', value: '北京电影学院' },
        { label: '所学专业', value: '表演系' },
        { label: '入学时间', value: '2016-09' },
        { label: '毕业时间', value: '2020-07' },
        { label: '是否艺术类院校', value: '是' }
    ],
    timeline: [
        { title: '提交申请', time: '2026-04-02 09:30:00', desc: '用户重新提交了认证材料' },
        { title: '审核驳回', time: '2026-04-01 15:20:00', desc: '原因：身份证反面照片模糊，无法看清有效期。' },
        { title: '提交申请', time: '2026-04-01 10:15:00', desc: '用户首次提交认证材料' }
    ]
};

// 驳回原因分类（§4.3.6 驳回弹窗字段定义）
var REJECT_REASON_TYPES = [
    { value: 'material_incomplete', label: '材料不完整' },
    { value: 'material_invalid', label: '材料无效' },
    { value: 'info_mismatch', label: '信息不一致' },
    { value: 'other', label: '其他' }
];

function navigateTo(path: string) { window.location.href = path; }

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanCertAdminDetail(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var [data, setData] = useState(dummyData);
    var [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        base: true, contact: false, job: false, edu: false
    });

    var [previewImage, setPreviewImage] = useState<string | null>(null);
    var [showRejectModal, setShowRejectModal] = useState(false);
    var [rejectReason, setRejectReason] = useState('');
    var [rejectReasonType, setRejectReasonType] = useState('');

    var toggleSection = function (key: string) {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { /* */ }
    }, [onEventHandler]);

    var handleBack = function () {
        emitEvent('on_back');
        navigateTo('/prototypes/yanyuan-app-cert-admin');
    };

    var handlePass = function () {
        setData({ ...data, status: 'approved' });
        emitEvent('on_pass');
        setTimeout(() => handleBack(), 800);
    };

    var submitReject = function () {
        if (!rejectReason.trim() || !rejectReasonType) return;
        setData({ ...data, status: 'rejected' });
        setShowRejectModal(false);
        setRejectReasonType('');
        setRejectReason('');
        emitEvent('on_reject', JSON.stringify({ reason: rejectReason, reason_type: rejectReasonType }));
        setTimeout(() => handleBack(), 800);
    };

    useImperativeHandle(ref, function () {
        return {
            getVar: function () { return undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    var st = STATUS_MAP[data.status] || STATUS_MAP.pending;
    var StatusIcon = st.icon;

    var renderSection = (key: string, title: string, icon: any, infoData: any[]) => {
        var isExpanded = expandedSections[key];
        var Icon = icon;
        return (
            <div className="yanyuan-certdetail-card">
                <div className="yanyuan-certdetail-card-header" onClick={() => toggleSection(key)}>
                    <div className="yanyuan-certdetail-card-title">
                        <Icon size={18} className="yanyuan-certdetail-section-icon" />
                        {title}
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="#8E8E93" /> : <ChevronDown size={20} color="#8E8E93" />}
                </div>
                {isExpanded && (
                    <div className="yanyuan-certdetail-card-body">
                        {infoData.map((item, idx) => (
                            <div key={idx} className="yanyuan-certdetail-info-row">
                                <div className="yanyuan-certdetail-info-label">{item.label}</div>
                                <div className="yanyuan-certdetail-info-value">{item.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="yanyuan-certdetail-container">
            {/* 顶部 Header栏 */}
            <div className="yanyuan-certdetail-header-bar">
                <div className="yanyuan-certdetail-back" onClick={handleBack}><ChevronLeft size={24} /></div>
                <div className="yanyuan-certdetail-title">审核详情</div>
                <div className="yanyuan-certdetail-tools"></div>
            </div>

            <div className="yanyuan-certdetail-scroll">
                {/* 顶部摘要 */}
                <div className="yanyuan-certdetail-summary-bg">
                    <div className="yanyuan-certdetail-summary">
                        <div className="yanyuan-certdetail-avatar-large">{data.avatar}</div>
                        <div className="yanyuan-certdetail-s-info">
                            <div className="yanyuan-certdetail-s-name">{data.name}</div>
                            <div className="yanyuan-certdetail-s-desc">演艺人才认证申请</div>
                        </div>
                        <div className={'yanyuan-certadmin-status ' + st.class + ' detail-badge'}>
                            <StatusIcon size={14} /> {st.label}
                        </div>
                    </div>
                </div>

                <div className="yanyuan-certdetail-content-wrap">
                    {/* 证照快览 */}
                    <div className="yanyuan-certdetail-card">
                        <div className="yanyuan-certdetail-card-header no-border">
                            <div className="yanyuan-certdetail-card-title">
                                <ImageIcon size={18} className="yanyuan-certdetail-section-icon blue" />
                                身份材料
                            </div>
                        </div>
                        <div className="yanyuan-certdetail-idcard-grid">
                            <div className="yanyuan-certdetail-idcard-box" onClick={() => setPreviewImage('ID_FRONT')}>
                                <div className="yanyuan-certdetail-idcard-placeholder">
                                    <User size={24} color="#BDBDBD" />
                                    <span>点击查看人像面</span>
                                </div>
                            </div>
                            <div className="yanyuan-certdetail-idcard-box" onClick={() => setPreviewImage('ID_BACK')}>
                                <div className="yanyuan-certdetail-idcard-placeholder">
                                    <FileText size={24} color="#BDBDBD" />
                                    <span>点击查看国徽面</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 信息折叠面板 */}
                    {renderSection('base', '基本信息', User, data.baseInfo)}
                    {renderSection('contact', '联系方式', MapPin, data.contactInfo)}
                    {renderSection('job', '从业信息', Briefcase, data.jobInfo)}
                    {renderSection('edu', '教育背景', GraduationCap, data.eduInfo)}

                    {/* 附件清单 */}
                    <div className="yanyuan-certdetail-card">
                        <div className="yanyuan-certdetail-card-header">
                            <div className="yanyuan-certdetail-card-title">
                                <FileText size={18} className="yanyuan-certdetail-section-icon orange" />
                                附件材料
                            </div>
                        </div>
                        <div className="yanyuan-certdetail-card-body">
                            <div className="yanyuan-certdetail-attachment">
                                <div className="yanyuan-certdetail-att-icon"><FileText size={16} /></div>
                                <div className="yanyuan-certdetail-att-name">演艺工作者自律承诺书.pdf</div>
                                <div className="yanyuan-certdetail-att-action">预览</div>
                            </div>
                        </div>
                    </div>

                    {/* 审核历史 */}
                    <div className="yanyuan-certdetail-card">
                        <div className="yanyuan-certdetail-card-header">
                            <div className="yanyuan-certdetail-card-title">
                                <Clock size={18} className="yanyuan-certdetail-section-icon gray" />
                                审核历史
                            </div>
                        </div>
                        <div className="yanyuan-certdetail-timeline">
                            {data.timeline.map((item, idx) => (
                                <div key={idx} className="yanyuan-certdetail-timeline-item">
                                    <div className={'yanyuan-certdetail-timeline-dot ' + (idx === 0 ? 'active' : '')}>
                                        {idx === 0 ? <CheckCircle2 size={16} color="#fff" /> : null}
                                    </div>
                                    <div className="yanyuan-certdetail-timeline-content">
                                        <div className="yanyuan-certdetail-tl-title">
                                            {item.title} <span className="yanyuan-certdetail-tl-time">{item.time}</span>
                                        </div>
                                        <div className="yanyuan-certdetail-tl-desc">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 底部操作栏 (仅待审核状态显示) */}
            {data.status === 'pending' && (
                <div className="yanyuan-certdetail-bottom-bar">
                    <button className="yanyuan-certdetail-action-btn reject" onClick={() => setShowRejectModal(true)}>驳 回</button>
                    <button className="yanyuan-certdetail-action-btn pass" onClick={handlePass}>通 过</button>
                </div>
            )}

            {/* 图片预览器 */}
            {previewImage && (
                <div className="yanyuan-certdetail-image-previewer" onClick={() => setPreviewImage(null)}>
                    <div className="yanyuan-certdetail-preview-close"><X size={24} color="#fff" /></div>
                    <div className="yanyuan-certdetail-preview-img-box">
                        <div className="yanyuan-certdetail-preview-mock">
                            {previewImage === 'ID_FRONT' ? '身份证人像面放大图' : '身份证国徽面放大图'}
                        </div>
                    </div>
                </div>
            )}

            {/* 驳回弹窗 */}
            {/* 驳回弹窗（§4.3.6 驳回弹窗：原因分类 + 详细说明） */}
            {showRejectModal && (
                <div className="yanyuan-certadmin-modal-mask">
                    <div className="yanyuan-certadmin-modal-sheet">
                        <div className="yanyuan-certadmin-modal-header">
                            <div className="yanyuan-certadmin-modal-title">驳回认证申请</div>
                            <div className="yanyuan-certadmin-modal-close" onClick={() => { setShowRejectModal(false); setRejectReasonType(''); }}><X size={20} /></div>
                        </div>
                        <div className="yanyuan-certadmin-modal-body">
                            {/* 驳回原因分类（必选） */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>驳回原因分类 <span style={{ color: '#E53935' }}>*</span></div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {REJECT_REASON_TYPES.map(function (rt) {
                                        return (
                                            <div key={rt.value}
                                                onClick={function () { setRejectReasonType(rt.value); }}
                                                style={{
                                                    padding: '6px 14px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
                                                    border: rejectReasonType === rt.value ? '1.5px solid #D32F2F' : '1px solid #E0E0E0',
                                                    background: rejectReasonType === rt.value ? '#FFF5F4' : '#F5F5F5',
                                                    color: rejectReasonType === rt.value ? '#D32F2F' : '#666',
                                                    fontWeight: rejectReasonType === rt.value ? 600 : 400
                                                }}
                                            >{rt.label}</div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* 驳回详细说明（必填） */}
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>驳回详细说明 <span style={{ color: '#E53935' }}>*</span></div>
                            <textarea
                                className="yanyuan-certadmin-textarea"
                                placeholder="请输入驳回原因，必填选项 (例如：身份证照片不清晰)..."
                                value={rejectReason}
                                onChange={function (e) { setRejectReason(e.target.value); }}
                            />
                        </div>
                        <div className="yanyuan-certadmin-modal-footer">
                            <button className="yanyuan-certadmin-btn-cancel" onClick={function () { setShowRejectModal(false); setRejectReasonType(''); }}>取消</button>
                            <button className={'yanyuan-certadmin-btn-confirm' + (rejectReason.trim() && rejectReasonType ? '' : ' disabled')} onClick={submitReject}>确定驳回</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Component;
