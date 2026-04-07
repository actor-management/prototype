/**
 * @name 演艺人才平台 - 个人信息填报
 * 参考：需求规格说明书 §4.3.2
 *
 * 页面说明：移动端演艺从业者个人详细信息填报。
 * 专为 Actor（演艺人员）认证设计，采用分区折叠面板优化移动端体验。
 * 包含：基本信息、联系信息、从业信息、教育背景、附件材料五个区域。
 */
import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, ChevronDown, User, Phone, Briefcase, GraduationCap, Paperclip } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_save_draft', desc: '保存草稿' },
    { name: 'on_submit', desc: '提交审核' },
    { name: 'on_back', desc: '返回上一页' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

// 字段类型定义
type InfoField = {
    key: string; label: string; required: boolean; value: string;
    placeholder?: string; type?: string; options?: string[]; hint?: string;
};

type InfoSection = {
    key: string; label: string; icon: any; iconClass: string; status: string;
    fields: InfoField[];
};

// 表单区域配置（对齐需规 §4.3.2 全量字段定义）
var SECTIONS: InfoSection[] = [
    {
        key: 'basic', label: '基本信息', icon: User, iconClass: 'basic', status: 'done',
        fields: [
            { key: 'name', label: '真实姓名', required: true, value: '张明远', placeholder: '请输入姓名', hint: '来自认证流程，不可修改' },
            { key: 'stage_name', label: '主要艺名', required: false, value: '明远', placeholder: '演员核心对外展示名称' },
            { key: 'former_name', label: '曾用名', required: false, value: '', placeholder: '请输入曾用名' },
            { key: 'gender', label: '性别', required: true, value: '男', type: 'select', options: ['男', '女'] },
            { key: 'birth', label: '出生日期', required: true, value: '1992-06-15', placeholder: '请选择', type: 'date' },
            { key: 'nation', label: '民族', required: true, value: '汉族', placeholder: '请选择', type: 'select' },
            { key: 'height', label: '身高(cm)', required: false, value: '178', placeholder: '50-250' },
            { key: 'weight', label: '体重(kg)', required: false, value: '72', placeholder: '20-200' },
            { key: 'nationality', label: '国籍', required: true, value: '中国', placeholder: '请输入' },
            { key: 'id_card', label: '身份证号', required: true, value: '110105****1234', placeholder: '与注册实名信息一致', hint: '不可修改，脱敏展示' },
            { key: 'photo', label: '个人照片', required: true, value: '', placeholder: '2寸证件照规格，≤5MB', type: 'file' },
            { key: 'bio', label: '个人简介', required: false, value: '', placeholder: '最多500字', type: 'textarea' }
        ]
    },
    {
        key: 'contact', label: '联系信息', icon: Phone, iconClass: 'contact', status: 'done',
        fields: [
            { key: 'phone', label: '手机号', required: true, value: '138****6789', placeholder: '与注册手机号一致', hint: '不可直接修改' },
            { key: 'phone_backup', label: '备用手机号', required: false, value: '', placeholder: '请输入备用手机号' },
            { key: 'email', label: '电子邮箱', required: false, value: 'zhangmy@example.com', placeholder: '请输入邮箱' },
            { key: 'address', label: '通讯地址', required: false, value: '北京市朝阳区建国路88号', placeholder: '省/市/区/详细地址' },
            { key: 'zip_code', label: '邮政编码', required: false, value: '', placeholder: '6位数字' }
        ]
    },
    {
        key: 'career', label: '从业信息', icon: Briefcase, iconClass: 'career', status: 'todo',
        fields: [
            { key: 'career_years', label: '从业年限', required: true, value: '', placeholder: '0-99' },
            { key: 'career_start_year', label: '从业起始年份', required: true, value: '', placeholder: '如 2015' },
            { key: 'organization', label: '所属单位/团体', required: false, value: '', placeholder: '当前任职单位' },
            { key: 'org_type', label: '单位性质', required: false, value: '', placeholder: '请选择', type: 'select', options: ['国有院团', '民营', '自由职业', '其他'] },
            { key: 'speciality', label: '专业方向', required: true, value: '', placeholder: '请选择（多选）', type: 'multiselect' },
            { key: 'talents', label: '演艺特长', required: false, value: '', placeholder: '如武术、戏曲、舞蹈等' },
            { key: 'agency', label: '经纪公司', required: false, value: '', placeholder: '请输入经纪公司名称' },
            { key: 'agent_name', label: '经纪人', required: false, value: '', placeholder: '请输入经纪人姓名' },
            { key: 'agent_phone', label: '经纪人联系方式', required: false, value: '', placeholder: '经纪人手机号' }
        ]
    },
    {
        key: 'edu', label: '教育背景', icon: GraduationCap, iconClass: 'edu', status: 'done',
        fields: [
            { key: 'degree', label: '最高学历', required: true, value: '本科', placeholder: '请选择', type: 'select', options: ['初中', '高中/中专', '大专', '本科', '硕士', '博士'] },
            { key: 'school', label: '院校名称', required: true, value: '中央戏剧学院', placeholder: '请输入院校' },
            { key: 'major', label: '专业', required: true, value: '表演', placeholder: '请输入专业' },
            { key: 'enroll_date', label: '入学时间', required: true, value: '2010-09', placeholder: '精确到月', type: 'date' },
            { key: 'graduate_date', label: '毕业时间', required: true, value: '2014-06', placeholder: '须晚于入学时间', type: 'date' },
            { key: 'is_art_school', label: '是否艺术类院校', required: true, value: '是', type: 'select', options: ['是', '否'] }
        ]
    },
    {
        key: 'attach', label: '附件材料', icon: Paperclip, iconClass: 'attach', status: 'todo',
        fields: [
            { key: 'diploma_file', label: '毕业证书扫描件', required: false, value: '', placeholder: '艺术类毕业生必须提供', type: 'file', hint: 'JPG/PNG/PDF ≤10MB' },
            { key: 'career_proof', label: '从业证明材料', required: false, value: '', placeholder: '非艺术类院校须提供', type: 'file', hint: '单位盖章证明，最多5个' },
            { key: 'work_photos', label: '个人作品照片', required: false, value: '', placeholder: '参演作品剧照等', type: 'file', hint: '最多10张，每张≤5MB' },
            { key: 'award_files', label: '获奖证书扫描件', required: false, value: '', placeholder: '可选上传', type: 'file', hint: '最多10个，每个≤10MB' },
            { key: 'other_files', label: '其他补充材料', required: false, value: '', placeholder: '可选上传', type: 'file', hint: '最多5个，每个≤10MB' }
        ]
    }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanInfoFill(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var expandState = useState<Record<string, boolean>>({ basic: true, contact: false, career: false, edu: false, attach: false });
    var expanded = expandState[0];
    var setExpanded = expandState[1];

    var completeness = 78;

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    var toggleSection = useCallback(function (key: string) {
        setExpanded(function (prev) {
            var next: Record<string, boolean> = {};
            for (var k in prev) { next[k] = prev[k]; }
            next[key] = !prev[key];
            return next;
        });
    }, []);

    useImperativeHandle(ref, function () {
        return {
            getVar: function () { return undefined; }, fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    return (
        <div className="yanyuan-infofill-container">
            <div className="yanyuan-infofill-scroll">
                <div className="yanyuan-infofill-nav">
                    <div className="yanyuan-infofill-nav-back" onClick={function () { emitEvent('on_back'); window.history.back(); }}>
                        <ArrowLeft size={20} color="#1A1A2E" />
                    </div>
                    <div className="yanyuan-infofill-nav-title">个人信息填报</div>
                </div>

                <div className="yanyuan-infofill-progress">
                    <div className="yanyuan-infofill-progress-bar-wrap">
                        <div className="yanyuan-infofill-progress-bar" style={{ width: completeness + '%' }} />
                    </div>
                    <span className="yanyuan-infofill-progress-text">{completeness}%</span>
                </div>

                {SECTIONS.map(function (section) {
                    var Icon = section.icon;
                    var isOpen = expanded[section.key];
                    return (
                        <div key={section.key} className="yanyuan-infofill-section">
                            <div className="yanyuan-infofill-section-header" onClick={function () { toggleSection(section.key); }}>
                                <div className="yanyuan-infofill-section-title">
                                    <div className={'yanyuan-infofill-section-icon ' + section.iconClass}><Icon size={15} /></div>
                                    {section.label}
                                </div>
                                <div className="yanyuan-infofill-section-status">
                                    <span className={'yanyuan-infofill-section-badge ' + section.status}>
                                        {section.status === 'done' ? '已填写' : '待完善'}
                                    </span>
                                    <ChevronDown size={16} className={'yanyuan-infofill-section-arrow' + (isOpen ? ' open' : '')} />
                                </div>
                            </div>
                            <div className={'yanyuan-infofill-section-body' + (isOpen ? ' open' : '')}>
                                {section.fields.map(function (field) {
                                    return (
                                        <div key={field.key} className="yanyuan-infofill-field">
                                            <div className="yanyuan-infofill-label">
                                                {field.required && <span className="required">*</span>}
                                                {field.label}
                                            </div>
                                            {field.type === 'file' ? (
                                                <div className="yanyuan-infofill-file-upload">
                                                    <div className="yanyuan-infofill-file-btn">📷 点击上传</div>
                                                    {field.hint && <div className="yanyuan-infofill-field-hint">{field.hint}</div>}
                                                </div>
                                            ) : field.type === 'textarea' ? (
                                                <textarea className="yanyuan-infofill-textarea"
                                                    defaultValue={field.value} placeholder={field.placeholder} readOnly />
                                            ) : (
                                                <div className="yanyuan-infofill-input-wrap">
                                                    <input className="yanyuan-infofill-input"
                                                        defaultValue={field.value} placeholder={field.placeholder} readOnly />
                                                    {field.hint && <div className="yanyuan-infofill-field-hint">{field.hint}</div>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="yanyuan-infofill-footer">
                <button className="yanyuan-infofill-btn draft" onClick={function () { emitEvent('on_save_draft'); }}>
                    保存草稿
                </button>
                <button className="yanyuan-infofill-btn submit" onClick={function () { emitEvent('on_submit'); }}>
                    提交审核
                </button>
            </div>
        </div>
    );
});

export default Component;
