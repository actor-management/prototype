/**
 * @name 管理后台-认证管理SPA
 *
 * 参考资料：需求规格说明书 §4.3.5 认证审核台（Admin）
 * 采用全局统一平台UI（红色顶栏/橘黄色大字/品牌色短竖线标题/大圆角白卡/一致的TabBar）
 *
 * §4.3.5 要求：
 * - 统计卡片：3个数值卡（待审核数/本月已通过/本月已驳回）
 * - Tab 分类：全部/待审核/手动审核/已驳回/已通过
 * - 申请卡片元素：申请人头像+姓名、手机号（脱敏）、提交时间、状态标签、操作按钮
 * - 快速驳回弹窗：驳回原因分类 + 详细说明
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
    ChevronLeft, Search, Filter, Clock, ShieldCheck, ShieldX,
    User, Briefcase, FileText, Image as ImageIcon,
    CheckCircle, XCircle, Home, Film, Settings, Award, BookOpen, User as UserIcon, ChevronRight
} from 'lucide-react';

import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

const EVENT_LIST: EventItem[] = [
    { name: 'on_item_click', desc: '点击申请卡片' },
    { name: 'on_action_reject', desc: '驳回操作完成' },
    { name: 'on_action_pass', desc: '通过操作完成' },
    { name: 'on_back', desc: '点击顶部返回' }
];

const ACTION_LIST: Action[] = [{ name: 'refresh_data', desc: '刷新页面数据' }];
const VAR_LIST: KeyDesc[] = [];
const CONFIG_LIST: ConfigItem[] = [];

const DATA_LIST: DataDesc[] = [
    {
        name: 'list', desc: '审核列表', keys: [
            { name: 'id', desc: '申请ID' }, { name: 'name', desc: '真实姓名' },
            { name: 'applicant_type', desc: '身份类型 actor/user' },
            { name: 'status', desc: 'pending/approved/rejected' },
            { name: 'time', desc: '时间' }
        ]
    }
];

const mockData = [
    {
        id: 'A1001', name: '张艺凡', applicant_type: 'actor', status: 'pending', time: '10分钟前',
        phone: '138****5678', idCard: '110105********1234',
        actorInfo: {
            stage_name: '艺凡宝宝', specialty: '影视演员', career_years: 5,
            organization: '开心娱乐传媒',
            education: [{ school: '北京电影学院', major: '表演系', degree: '本科' }]
        },
        materials: ['身份证正面', '身份证反面', '活体截图', '北京电影学院毕业证', '参演剧照1']
    },
    {
        id: 'U2002', name: '李大壮', applicant_type: 'user', status: 'pending', time: '2小时前',
        phone: '139****1234', idCard: '330102********5678',
        actorInfo: null,
        materials: ['身份证正面', '身份证反面', '活体检测结果100%匹配']
    },
    {
        id: 'A1003', name: '林子烨', applicant_type: 'actor', status: 'approved', time: '昨天',
        phone: '135****3344', idCard: '350101********334X',
        actorInfo: { stage_name: '子烨', specialty: '配音', career_years: 3, organization: '自由编单' },
        materials: ['身份证...', '录音作品.pdf']
    },
    {
        id: 'A1004', name: '陈浩呆', applicant_type: 'actor', status: 'rejected', time: '2天前',
        phone: '137****8899', idCard: '310115********8899',
        actorInfo: { stage_name: '浩呆', specialty: '舞台剧', career_years: 8, organization: '市民话剧团' },
        reject_reason: '所提交剧照过于模糊，请重新提交高质量材料复审。',
        materials: ['身份证正反', '活体OK', '糊糊的剧照.jpg']
    }
];

// 对齐平台通用的状态卡片定义
const STATUS_MAP: any = {
    pending: { label: '待审核', class: 'bg-orange-50 text-orange-600', iconClass: 'bg-orange-500 text-white', icon: Clock },
    approved: { label: '审批通过', class: 'bg-green-50 text-green-600', iconClass: 'bg-green-500 text-white', icon: ShieldCheck },
    rejected: { label: '已驳回', class: 'bg-red-50 text-red-600', iconClass: 'bg-red-500 text-white', icon: ShieldX }
};

// Tab 分类对齐需规 §4.3.5：全部/待审核/手动审核/已驳回/已通过
const NAV_TABS = [
    { label: '全部', value: 'all' },
    { label: '待审核', value: 'pending' },
    { label: '手动审核', value: 'manual' },
    { label: '已驳回', value: 'rejected' },
    { label: '已通过', value: 'approved' }
];

// 驳回原因分类（§4.3.6 驳回弹窗字段定义）
const REJECT_REASON_TYPES = [
    { value: 'material_incomplete', label: '材料不完整' },
    { value: 'material_invalid', label: '材料无效' },
    { value: 'info_mismatch', label: '信息不一致' },
    { value: 'other', label: '其他' }
];

const Component = forwardRef<AxureHandle, AxureProps>((innerProps, ref) => {
    const listData = innerProps?.data?.list || mockData;
    const [localList, setLocalList] = useState<any[]>(listData);

    const [view, setView] = useState<'list' | 'detail'>('list');
    const [activeTab, setActiveTab] = useState('pending');

    const [currentId, setCurrentId] = useState('');

    // 驳回弹窗
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectReasonType, setRejectReasonType] = useState('');

    const currentItem = localList.find(i => i.id === currentId);

    const onEvent = useCallback((name: string, payload?: string) => {
        if (innerProps && typeof innerProps.onEvent === 'function') {
            innerProps.onEvent(name, payload);
        }
    }, [innerProps]);

    useImperativeHandle(ref, () => ({
        getVar: () => undefined,
        fireAction: () => { },
        eventList: EVENT_LIST,
        actionList: ACTION_LIST,
        varList: VAR_LIST,
        configList: CONFIG_LIST,
        dataList: DATA_LIST
    }));

    const handleBackToApp = () => {
        onEvent('on_back');
        window.location.href = '/prototypes/yanyuan-app-admin';
    };

    const handleGoDetail = (id: string) => {
        setCurrentId(id);
        setView('detail');
        onEvent('on_item_click', id);
    };

    const handleBackToList = () => {
        setView('list');
        setCurrentId('');
    };

    const handlePass = () => {
        if (!currentItem) return;
        setLocalList(prev => prev.map(i => i.id === currentId ? { ...i, status: 'approved' } : i));
        onEvent('on_action_pass', currentId);
        handleBackToList();
    };

    const handleReject = () => {
        if (!rejectReason.trim() || !rejectReasonType) return;
        setLocalList(prev => prev.map(i => i.id === currentId ? { ...i, status: 'rejected', reject_reason: rejectReason, reject_reason_type: rejectReasonType } : i));
        onEvent('on_action_reject', JSON.stringify({ id: currentId, reason: rejectReason, reason_type: rejectReasonType }));
        setShowRejectModal(false);
        setRejectReason('');
        setRejectReasonType('');
        handleBackToList();
    };

    // 平台统一的主标题组件
    const SectionTitle = ({ title }: { title: string }) => (
        <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-[#D32F2F] to-[#E57373] rounded-full"></div>
            <span className="font-bold text-[#333] text-[16px]">{title}</span>
        </div>
    );

    const renderList = () => {
        const displayList = localList.filter(i => {
            if (activeTab === 'all') return true;
            if (activeTab === 'manual') return i.status === 'manual_review';
            return i.status === activeTab;
        });
        const toProcessCount = localList.filter(i => i.status === 'pending').length;
        const approvedCount = localList.filter(i => i.status === 'approved').length;
        const rejectedCount = localList.filter(i => i.status === 'rejected').length;

        return (
            <div className="flex flex-col h-full bg-[#f5f6f8]">
                {/* 平台级经典红顶栏 */}
                <div className="flex items-center px-4 h-14 bg-[#D32F2F] text-white z-10 sticky top-0 shrink-0 shadow-sm relative overflow-hidden">
                    <div className="absolute right-[-40px] top-[-40px] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                    {/* 返回按钮已按需移除 */}
                    <div className="flex-1 text-center text-[18px] font-bold tracking-wide absolute left-0 right-0 pointer-events-none z-10">
                        认证审核
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* ===== 统计卡片区（§4.3.5：3个数值卡：待审核数/本月已通过/本月已驳回） ===== */}
                    <div className="p-4 grid grid-cols-3 gap-3 pb-2 pt-5">
                        <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                            <div className="text-3xl font-bold text-[#FF9800]">{toProcessCount}</div>
                            <div className="text-[12px] text-gray-500 mt-1">待审核</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                            <div className="text-3xl font-bold text-[#4CAF50]">45</div>
                            <div className="text-[12px] text-gray-500 mt-1">本月已通过</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                            <div className="text-3xl font-bold text-[#E53935]">3</div>
                            <div className="text-[12px] text-gray-500 mt-1">本月已驳回</div>
                        </div>
                    </div>

                    {/* ===== 申请列表 ===== */}
                    <div className="p-4 pb-safe pt-2">
                        <SectionTitle title="申请记录" />

                        {/* 筛选 Tabs */}
                        <div className="flex bg-gray-100 rounded-xl p-1 mb-4 select-none">
                            {NAV_TABS.map(t => (
                                <div
                                    key={t.value}
                                    onClick={() => setActiveTab(t.value)}
                                    className={`flex-1 text-center py-2 text-[13px] rounded-lg transition-all cursor-pointer font-medium
                                        ${activeTab === t.value ? 'bg-white text-[#D32F2F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                    `}
                                >
                                    {t.label}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {displayList.map(item => {
                                const st = STATUS_MAP[item.status];
                                const isActor = item.applicant_type === 'actor';

                                return (
                                    <div key={item.id} onClick={() => handleGoDetail(item.id)} className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                                        <div className="flex items-start gap-3">
                                            {/* 图标与色彩映射 */}
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                                                ${item.status === 'pending' ? 'bg-[#FF9800] text-white' :
                                                    item.status === 'approved' ? 'bg-[#4CAF50] text-white' :
                                                        'bg-[#E53935] text-white'}`}
                                            >
                                                <st.icon size={22} />
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="font-bold text-[15px] text-[#333] truncate">
                                                        {item.name} 的认证申请
                                                    </div>
                                                    <div className={`text-[11px] px-2 py-0.5 rounded ${st.class} whitespace-nowrap`}>
                                                        {item.status === 'pending' ? '待审核' : st.label}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1.5">
                                                    <span className={`px-1.5 py-px rounded border ${isActor ? 'border-orange-200 text-orange-600 bg-orange-50' : 'border-blue-200 text-blue-600 bg-blue-50'} text-[10px]`}>
                                                        {isActor ? '演艺专项认证' : '普通用户认证'}
                                                    </span>
                                                    <span>{item.phone}</span>
                                                </div>
                                                <div className="text-[11px] text-gray-400 flex items-center justify-between">
                                                    <span>提交时间：{item.time}</span>
                                                    <ChevronRight size={14} className="text-gray-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {displayList.length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <FileText size={24} className="text-gray-300" />
                                    </div>
                                    <span className="text-[14px]">没有相关的申请记录</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== 平台全局底部导航 TabBar ===== */}
                <div className="flex bg-white h-[56px] pb-safe shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] border-t border-gray-100">
                    {[
                        { label: '首页', icon: Home, route: '/prototypes/yanyuan-app-home' },
                        { label: '短视频', icon: Film, route: '' },
                        { label: '管理', icon: Settings, route: '/prototypes/yanyuan-app-admin', active: true },
                        { label: '证书', icon: Award, route: '/prototypes/yanyuan-app-certificate' },
                        { label: '学习', icon: BookOpen, route: '/prototypes/yanyuan-app-training' },
                        { label: '我的', icon: UserIcon, route: '/prototypes/yanyuan-app-profile' }
                    ].map(t => {
                        const Icon = t.icon;
                        return (
                            <div key={t.label}
                                className={`flex-1 flex flex-col items-center justify-center relative cursor-pointer
                                     ${t.active ? 'text-[#D32F2F]' : 'text-gray-500 hover:text-gray-900'}
                                 `}
                                onClick={() => { if (t.route) window.location.href = t.route }}>
                                {/* 顶部高亮红线 */}
                                {t.active && <div className="absolute top-0 w-6 h-[3px] bg-[#D32F2F] rounded-b-md"></div>}
                                <Icon size={22} className={`mb-1 mt-1 ${t.active ? '' : 'stroke-[1.5]'}`} />
                                <span className="text-[10px] font-medium">{t.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    const renderDetail = () => {
        if (!currentItem) return null;
        const isActor = currentItem.applicant_type === 'actor';
        const st = STATUS_MAP[currentItem.status];

        // 使用平台特征的区块卡片设计
        const Block = ({ title, children }: any) => (
            <div className="mb-4 bg-white rounded-2xl mx-4 p-4 shadow-sm">
                <SectionTitle title={title} />
                <div className="mt-3 space-y-3">
                    {children}
                </div>
            </div>
        );

        const Row = ({ label, value }: any) => (
            <div className="flex items-start text-[14px]">
                <span className="text-gray-500 w-20 shrink-0">{label}</span>
                <span className="text-[#333] flex-1 break-all">{value || '-'}</span>
            </div>
        );

        return (
            <div className="flex flex-col h-full bg-[#f5f6f8]">
                {/* Header */}
                <div className="flex items-center px-4 h-14 bg-[#D32F2F] text-white z-10 sticky top-0 shrink-0 shadow-sm relative overflow-hidden">
                    <div className="absolute right-[-40px] top-[-40px] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                    <div className="p-2 -ml-2 rounded-full cursor-pointer active:bg-white/10 relative z-10" onClick={handleBackToList}>
                        <ChevronLeft size={24} />
                    </div>
                    <div className="flex-1 text-center font-bold text-[18px] tracking-wide absolute left-0 right-0 pointer-events-none z-10">
                        申请核查详情
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-28 pt-4">
                    <Block title="申报人信息">
                        <Row label="申请身份" value={
                            <span className={`inline-block px-2 py-0.5 rounded text-[12px] ${isActor ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {isActor ? '演艺人员' : '普通用户'}
                            </span>
                        } />
                        <Row label="真实姓名" value={<span className="font-bold text-[15px]">{currentItem.name}</span>} />
                        <Row label="联系手机" value={currentItem.phone} />
                        <Row label="证件号码" value={currentItem.idCard} />
                        <div className="mt-3 p-3 bg-green-50 rounded-xl text-green-700 text-[12px] flex items-start gap-2 border border-green-100">
                            <CheckCircle size={16} className="mt-0.5 shrink-0" />
                            <span>活体人脸校验通过，身份证件信息对应一致，匹配度极高。</span>
                        </div>
                    </Block>

                    {isActor && currentItem.actorInfo && (
                        <Block title="演艺职业信息">
                            <Row label="常用艺名" value={<span className="font-bold text-[#E53935]">{currentItem.actorInfo.stage_name}</span>} />
                            <Row label="从业方向" value={currentItem.actorInfo.specialty} />
                            <Row label="从业年限" value={`${currentItem.actorInfo.career_years} 年`} />
                            <Row label="所属单位" value={currentItem.actorInfo.organization} />
                            <div className="h-[1px] bg-gray-100 my-3"></div>
                            {currentItem.actorInfo.education.map((edu: any, idx: number) => (
                                <Row key={idx} label="教育背景" value={<div className="flex flex-col"><span className="font-medium text-gray-800">{edu.school}</span><span className="text-[12px] text-gray-500">{edu.major} · {edu.degree}</span></div>} />
                            ))}
                        </Block>
                    )}

                    <Block title="举证附件（请核对）">
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {currentItem.materials.map((mat: string, idx: number) => (
                                <div key={idx} className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 border-dashed text-[11px] text-gray-400 p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                                    材料 {idx + 1}
                                </div>
                            ))}
                        </div>
                    </Block>

                    {currentItem.status === 'rejected' && currentItem.reject_reason && (
                        <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 flex items-start gap-2">
                            <XCircle size={18} className="shrink-0 mt-0.5" />
                            <div className="leading-relaxed"><span className="font-bold">驳回缘由：</span>{currentItem.reject_reason}</div>
                        </div>
                    )}
                </div>

                {currentItem.status === 'pending' && (
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 py-3 bg-white border-t border-gray-100 pb-safe z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex gap-4">
                        <button
                            className="flex-1 py-3 rounded-full font-bold text-[15px] bg-gray-100 text-gray-600 active:bg-gray-200 transition-colors"
                            onClick={() => setShowRejectModal(true)}
                        >
                            驳回重填
                        </button>
                        <button
                            className="flex-[2] py-3 rounded-full font-bold text-[15px] bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white shadow-md active:opacity-90 transition-opacity"
                            onClick={handlePass}
                        >
                            同意身份审核
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="yanyuan-certadmin-container w-full h-full relative font-sans mx-auto max-w-[430px] overflow-hidden flex flex-col shadow-xl bg-white">
            {view === 'list' ? renderList() : renderDetail()}

            {/* 底部驳回表单 Sheet */}
            {/* 驳回弹窗（§4.3.6 驳回弹窗：驳回原因分类 + 详细说明） */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end left-1/2 -translate-x-1/2 w-full max-w-[430px]">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)}></div>
                    <div className="relative bg-white rounded-t-3xl p-5 pb-safe animate-slide-up w-full">
                        <h3 className="text-[18px] font-bold text-[#333] mb-4 flex items-center justify-between">
                            填写驳回理由
                            <div className="p-1 rounded-full bg-gray-100 text-gray-500 active:bg-gray-200 cursor-pointer" onClick={() => setShowRejectModal(false)}>
                                <XCircle size={20} className="text-gray-400" />
                            </div>
                        </h3>
                        {/* 驳回原因分类（必选） */}
                        <div className="mb-3">
                            <div className="text-[13px] text-gray-500 mb-2">驳回原因分类 <span className="text-red-500">*</span></div>
                            <div className="flex flex-wrap gap-2">
                                {REJECT_REASON_TYPES.map(rt => (
                                    <div
                                        key={rt.value}
                                        onClick={() => setRejectReasonType(rt.value)}
                                        className={`px-3 py-2 rounded-xl text-[13px] cursor-pointer border transition-all
                                            ${rejectReasonType === rt.value
                                                ? 'bg-red-50 border-[#D32F2F] text-[#D32F2F] font-medium'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        {rt.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* 驳回详细说明（必填） */}
                        <div className="text-[13px] text-gray-500 mb-2">驳回详细说明 <span className="text-red-500">*</span></div>
                        <textarea
                            className="w-full bg-[#f5f6f8] rounded-2xl p-4 h-32 resize-none text-[14px] text-gray-800 outline-none border border-transparent focus:border-[#D32F2F] focus:bg-white transition-all font-sans placeholder-gray-400"
                            placeholder="请对申报者存在的材料遗漏或违规填写问题进行批注..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <button
                            className={`w-full mt-5 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-md ${rejectReason.trim() && rejectReasonType ? 'bg-[#D32F2F] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                            onClick={handleReject}
                        >
                            确认驳回
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Component;
