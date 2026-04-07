/**
 * @name 认证管理台
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/themes/antd-new/designToken.json (Ant Design 主题)
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md
 */

import './style.css';
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { AxureProps, AxureHandle, EventItem, Action, KeyDesc, ConfigItem, DataDesc } from '../../common/axure-types';

// ===== SVG 图标组件 =====

const StarLogoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.09 8.26L21 9.27L16 13.97L17.18 21L12 17.77L6.82 21L8 13.97L3 9.27L9.91 8.26L12 2Z" fill="#fff" />
        <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.3)" />
    </svg>
);

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const LogOutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const CheckIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MinusIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

// ===== 导航菜单项 =====
const NAV_ITEMS = [
    { key: 'home', label: '首页' },
    { key: 'certification', label: '认证中心' },
    { key: 'certificate', label: '证书管理' },
    { key: 'evaluation', label: '职业能力评价' },
    { key: 'talent', label: '人才数字档案' },
    { key: 'org', label: '行业机构管理' },
    { key: 'finance', label: '财务管理' },
    { key: 'admin', label: '后台管理' },
];

// 导航路由映射
const NAV_ROUTES: Record<string, string> = {
    home: '/prototypes/yanyuan-web-dashboard',
    certification: '/prototypes/yanyuan-web-cert-manage',
    certificate: '/prototypes/yanyuan-web-cert-service',
    evaluation: '/prototypes/yanyuan-web-training-manage',
    talent: '/prototypes/yanyuan-web-talent-archive',
    org: '',
    finance: '',
    admin: '',
};

// 二级菜单配置
const SUB_MENUS: Record<string, { key: string; label: string; route: string }[]> = {
    talent: [
        { key: 'basic', label: '基础信息管理', route: '/prototypes/yanyuan-web-talent-archive' },
        { key: 'cert', label: '资格证书管理', route: '/prototypes/yanyuan-web-talent-archive' },
        { key: 'panorama', label: '全景数字档案', route: '/prototypes/yanyuan-web-talent-archive' },
        { key: 'workbench', label: '审核工作台', route: '/prototypes/yanyuan-web-talent-archive' },
    ],
};

// 下拉箭头图标
const ChevDownIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// ===== 示例数据 =====
const MOCK_DATA = [
    { id: '1', real_name: '张三', user_type: 'actor', phone: '138****1234', id_card: '110101****1234', apply_time: '2026-03-27 09:30', status: 'pending', reviewer_name: '', review_time: '' },
    { id: '2', real_name: '李四', user_type: 'actor', phone: '139****5678', id_card: '310101****5678', apply_time: '2026-03-27 08:15', status: 'pending', reviewer_name: '', review_time: '' },
    { id: '3', real_name: '王五', user_type: 'actor', phone: '137****9012', id_card: '440101****9012', apply_time: '2026-03-26 16:42', status: 'approved', reviewer_name: '管理员A', review_time: '2026-03-27 10:00' },
    { id: '4', real_name: '赵六', user_type: 'actor', phone: '136****3456', id_card: '500101****3456', apply_time: '2026-03-26 14:20', status: 'rejected', reviewer_name: '管理员A', review_time: '2026-03-27 09:30' },
    { id: '5', real_name: '孙七', user_type: 'actor', phone: '135****7890', id_card: '330101****7890', apply_time: '2026-03-26 11:05', status: 'approved', reviewer_name: '管理员B', review_time: '2026-03-26 15:00' },
    { id: '6', real_name: '周八', user_type: 'actor', phone: '134****2345', id_card: '420101****2345', apply_time: '2026-03-25 17:30', status: 'pending', reviewer_name: '', review_time: '' },
    { id: '7', real_name: '吴九', user_type: 'actor', phone: '133****6789', id_card: '610101****6789', apply_time: '2026-03-25 10:15', status: 'approved', reviewer_name: '管理员A', review_time: '2026-03-25 14:30' },
    { id: '8', real_name: '郑十', user_type: 'actor', phone: '132****0123', id_card: '350101****0123', apply_time: '2026-03-25 09:00', status: 'rejected', reviewer_name: '管理员B', review_time: '2026-03-25 11:20' },
    { id: '9', real_name: '北京艺术经纪有限公司', user_type: 'org', phone: '131****4567', id_card: '——', apply_time: '2026-03-24 16:45', status: 'approved', reviewer_name: '管理员A', review_time: '2026-03-25 09:00' },
    { id: '10', real_name: '陈十一', user_type: 'actor', phone: '130****8901', id_card: '210101****8901', apply_time: '2026-03-24 14:10', status: 'pending', reviewer_name: '', review_time: '' },
];

const STATUS_MAP: Record<string, { label: string; key: string }> = {
    pending: { label: '待审核', key: 'pending' },
    approved: { label: '已通过', key: 'approved' },
    rejected: { label: '已驳回', key: 'rejected' },
};

const REJECT_REASONS = [
    '材料不完整',
    '材料无效',
    '信息不一致',
    '照片不清晰',
    '其他',
];

// ===== Axure API =====
const EVENT_LIST: EventItem[] = [
    { name: 'onApprove', desc: '审核通过时触发' },
    { name: 'onReject', desc: '审核驳回时触发' },
    { name: 'onBatchApprove', desc: '批量通过时触发' },
    { name: 'onBatchReject', desc: '批量驳回时触发' },
    { name: 'onExport', desc: '导出时触发' },
    { name: 'onNavClick', desc: '导航菜单点击时触发' },
];
const ACTION_LIST: Action[] = [{ name: 'refreshData', desc: '刷新列表数据' }];
const VAR_LIST: KeyDesc[] = [{ name: 'selectedCount', desc: '当前选中行数' }];
const CONFIG_LIST: ConfigItem[] = [
    { type: 'input', attributeId: 'userName', displayName: '用户名', info: '当前登录用户名', initialValue: '管理员' },
];
const DATA_LIST: DataDesc[] = [];

// ===== 主组件 =====
const Component = forwardRef<AxureHandle, AxureProps>(function CertManage(innerProps, ref) {
    const onEventHandler = typeof innerProps?.onEvent === 'function' ? innerProps.onEvent : () => undefined;
    const configSource = innerProps?.config || {};
    const userName = typeof configSource.userName === 'string' ? configSource.userName : '管理员';

    // 状态
    const [activeNav, setActiveNav] = useState('certification');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterName, setFilterName] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    // 弹窗
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectReasonType, setRejectReasonType] = useState('');
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [approveTarget, setApproveTarget] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTarget, setDetailTarget] = useState<typeof MOCK_DATA[0] | null>(null);

    const emitEvent = useCallback((eventName: string, payload?: any) => {
        try { onEventHandler(eventName, payload); } catch (e) { console.warn('事件触发失败:', e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, () => ({
        getVar: (name: string) => {
            if (name === 'selectedCount') return selectedIds.length;
            return undefined;
        },
        fireAction: (name: string) => {
            if (name === 'refreshData') { setFilterStatus('all'); setFilterName(''); }
        },
        eventList: EVENT_LIST,
        actionList: ACTION_LIST,
        varList: VAR_LIST,
        configList: CONFIG_LIST,
        dataList: DATA_LIST,
    }), [selectedIds]);

    // 过滤数据
    const filteredData = MOCK_DATA.filter(item => {
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (filterType !== 'all' && item.user_type !== filterType) return false;
        if (filterName && !item.real_name.includes(filterName)) return false;
        return true;
    });

    // 统计
    const pendingCount = MOCK_DATA.filter(i => i.status === 'pending').length;
    const approvedToday = 12;
    const approvalRate = '87.5%';
    const avgTime = '2.4h';

    // 选择操作
    const isAllSelected = filteredData.length > 0 && filteredData.every(d => selectedIds.includes(d.id));
    const isPartialSelected = selectedIds.length > 0 && !isAllSelected;
    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedIds([]);
        else setSelectedIds(filteredData.map(d => d.id));
    };
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // 审核操作
    const handleApprove = (id: string) => {
        setApproveTarget(id);
        setShowApproveConfirm(true);
    };
    const confirmApprove = () => {
        emitEvent('onApprove', { id: approveTarget });
        setShowApproveConfirm(false);
        setApproveTarget(null);
    };
    const handleReject = (id: string) => {
        setRejectTarget(id);
        setRejectReason('');
        setRejectReasonType('');
        setShowRejectModal(true);
    };
    const confirmReject = () => {
        emitEvent('onReject', { id: rejectTarget, reason: rejectReason, reasonType: rejectReasonType });
        setShowRejectModal(false);
        setRejectTarget(null);
    };

    return (
        <div className="yanyuan-cert-manage">
            {/* ===== 导航栏 ===== */}
            <nav className="ycm-navbar">
                <div className="ycm-navbar-brand">
                    <div className="ycm-navbar-logo"><StarLogoIcon /></div>
                    <div>
                        <div className="ycm-navbar-title">中国演艺人才管理与服务平台</div>
                        <div className="ycm-navbar-subtitle">TALENT MANAGEMENT</div>
                    </div>
                </div>
                <div className="ycm-navbar-menu">
                    {NAV_ITEMS.map(item => {
                        const subs = SUB_MENUS[item.key];
                        return (
                            <div key={item.key}
                                className={`ycm-navbar-menu-item${activeNav === item.key ? ' active' : ''}${subs ? ' has-sub' : ''}`}
                                onClick={() => { if (!subs) { setActiveNav(item.key); emitEvent('onNavClick', { key: item.key }); const route = NAV_ROUTES[item.key]; if (route && item.key !== activeNav) window.location.href = route; } }}
                            >
                                {item.label}{subs && <ChevDownIcon />}
                                {subs && (
                                    <div className="ycm-submenu">
                                        {subs.map(sub => (
                                            <div key={sub.key} className="ycm-submenu-item"
                                                onClick={(e: any) => { e.stopPropagation(); window.location.href = sub.route; }}
                                            >{sub.label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="ycm-navbar-actions">
                    <div className="ycm-navbar-notification">
                        <BellIcon />
                        <span className="ycm-navbar-badge">4</span>
                    </div>
                    <div className="ycm-navbar-divider" />
                    <div className="ycm-navbar-user">
                        <div className="ycm-navbar-avatar">{userName.charAt(0)}</div>
                        <span className="ycm-navbar-username">{userName}</span>
                        <div className="ycm-user-dropdown">
                            <div className="ycm-user-dropdown-item"><UserIcon /> 个人中心</div>
                            <div className="ycm-user-dropdown-item"><SettingsIcon /> 账号设置</div>
                            <div className="ycm-user-dropdown-divider" />
                            <div className="ycm-user-dropdown-item danger"><LogOutIcon /> 退出登录</div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ===== 内容区 ===== */}
            <div className="ycm-content">
                {/* 面包屑 */}
                <div className="ycm-breadcrumb">
                    <span className="ycm-breadcrumb-item">首页</span>
                    <span className="ycm-breadcrumb-sep">/</span>
                    <span className="ycm-breadcrumb-item">认证中心</span>
                    <span className="ycm-breadcrumb-sep">/</span>
                    <span className="ycm-breadcrumb-item current">认证管理台</span>
                </div>

                {/* 页面标题 */}
                <div className="ycm-page-header">
                    <div>
                        <div className="ycm-page-title">认证管理台</div>
                        <div className="ycm-page-desc">审核和管理用户认证申请</div>
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className="ycm-stats-grid">
                    <div className="ycm-stat-card">
                        <div className="ycm-stat-label">待审核</div>
                        <div className="ycm-stat-value">{pendingCount}<span className="unit">条</span></div>
                        <div className="ycm-stat-footer">较昨日 <span className="up">+3</span></div>
                    </div>
                    <div className="ycm-stat-card">
                        <div className="ycm-stat-label">今日已处理</div>
                        <div className="ycm-stat-value">{approvedToday}<span className="unit">条</span></div>
                        <div className="ycm-stat-footer">处理效率 <span className="down">↑ 15%</span></div>
                    </div>
                    <div className="ycm-stat-card">
                        <div className="ycm-stat-label">本月通过率</div>
                        <div className="ycm-stat-value">{approvalRate}</div>
                        <div className="ycm-stat-footer">较上月 <span className="up">+2.3%</span></div>
                    </div>
                    <div className="ycm-stat-card">
                        <div className="ycm-stat-label">平均处理时长</div>
                        <div className="ycm-stat-value">{avgTime}</div>
                        <div className="ycm-stat-footer">较上月 <span className="down">-0.5h</span></div>
                    </div>
                </div>

                {/* 筛选区 */}
                <div className="ycm-filter-card">
                    <div className="ycm-filter-grid">
                        <div className="ycm-filter-item">
                            <label className="ycm-filter-label">审核状态</label>
                            <select className="ycm-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="all">全部</option>
                                <option value="pending">待审核</option>
                                <option value="approved">已通过</option>
                                <option value="rejected">已驳回</option>
                            </select>
                        </div>
                        <div className="ycm-filter-item">
                            <label className="ycm-filter-label">用户类型</label>
                            <select className="ycm-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="all">全部</option>
                                <option value="actor">演员</option>
                                <option value="org">行业机构</option>
                            </select>
                        </div>
                        <div className="ycm-filter-item">
                            <label className="ycm-filter-label">申请人姓名</label>
                            <input className="ycm-filter-input" placeholder="请输入姓名搜索" value={filterName} onChange={e => setFilterName(e.target.value)} />
                        </div>
                        <div className="ycm-filter-item">
                            <label className="ycm-filter-label">手机号</label>
                            <input className="ycm-filter-input" placeholder="请输入手机号" />
                        </div>
                        <div className="ycm-filter-item">
                            <label className="ycm-filter-label">身份证号</label>
                            <input className="ycm-filter-input" placeholder="请输入身份证号" />
                        </div>
                        <div className="ycm-filter-item">
                            <label className="ycm-filter-label">申请时间</label>
                            <input className="ycm-filter-input" type="date" />
                        </div>
                    </div>
                    <div className="ycm-filter-actions">
                        <button className="ycm-btn ycm-btn-default" onClick={() => { setFilterStatus('all'); setFilterType('all'); setFilterName(''); }}>
                            <RefreshIcon /> 重置
                        </button>
                        <button className="ycm-btn ycm-btn-default" onClick={() => emitEvent('onExport')}>
                            <DownloadIcon /> 导出
                        </button>
                        <button className="ycm-btn ycm-btn-primary">
                            <SearchIcon /> 搜索
                        </button>
                    </div>
                </div>

                {/* 表格 */}
                <div className="ycm-table-card">
                    <div className="ycm-table-header">
                        <div className="ycm-table-title">
                            认证申请列表
                            <span className="ycm-table-count">共 {filteredData.length} 条记录</span>
                        </div>
                    </div>
                    <div className="ycm-table-wrapper">
                        <table className="ycm-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 48 }}>
                                        <span
                                            className={`ycm-checkbox${isAllSelected ? ' checked' : ''}${isPartialSelected ? ' indeterminate' : ''}`}
                                            onClick={toggleSelectAll}
                                        >
                                            {isAllSelected && <CheckIcon />}
                                            {isPartialSelected && !isAllSelected && <MinusIcon />}
                                        </span>
                                    </th>
                                    <th style={{ width: 60 }}>序号</th>
                                    <th>申请人姓名</th>
                                    <th style={{ width: 80 }}>用户类型</th>
                                    <th>手机号</th>
                                    <th>身份证号</th>
                                    <th>申请时间</th>
                                    <th style={{ width: 100 }}>审核状态</th>
                                    <th>审核人</th>
                                    <th>审核时间</th>
                                    <th style={{ width: 180 }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, idx) => (
                                    <tr key={row.id} className={selectedIds.includes(row.id) ? 'selected' : ''}>
                                        <td>
                                            <span
                                                className={`ycm-checkbox${selectedIds.includes(row.id) ? ' checked' : ''}`}
                                                onClick={() => toggleSelect(row.id)}
                                            >
                                                {selectedIds.includes(row.id) && <CheckIcon />}
                                            </span>
                                        </td>
                                        <td>{idx + 1}</td>
                                        <td style={{ fontWeight: 500 }}>{row.real_name}</td>
                                        <td>
                                            <span className={`ycm-type-tag ${row.user_type}`}>
                                                {row.user_type === 'actor' ? '演员' : '机构'}
                                            </span>
                                        </td>
                                        <td>{row.phone}</td>
                                        <td>{row.id_card}</td>
                                        <td>{row.apply_time}</td>
                                        <td>
                                            <span className={`ycm-status-tag ${row.status}`}>
                                                <span className={`ycm-status-dot ${row.status}`} />
                                                {STATUS_MAP[row.status]?.label}
                                            </span>
                                        </td>
                                        <td>{row.reviewer_name || '—'}</td>
                                        <td>{row.review_time || '—'}</td>
                                        <td>
                                            <div className="ycm-table-actions">
                                                <button className="ycm-btn-text" onClick={() => { setDetailTarget(row); setShowDetailModal(true); }}>查看</button>
                                                {row.status === 'pending' && (
                                                    <>
                                                        <button className="ycm-btn-text" style={{ color: '#6BAF5E' }} onClick={() => handleApprove(row.id)}>通过</button>
                                                        <button className="ycm-btn-text" style={{ color: '#E8684A' }} onClick={() => handleReject(row.id)}>驳回</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    <div className="ycm-pagination">
                        <div className="ycm-pagination-info">
                            共 {filteredData.length} 条记录，第 {currentPage} / 1 页
                        </div>
                        <div className="ycm-pagination-pages">
                            <button className="ycm-page-btn disabled"><ChevronLeftIcon /></button>
                            <button className="ycm-page-btn active">1</button>
                            <button className="ycm-page-btn disabled"><ChevronRightIcon /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== 批量操作栏 ===== */}
            <div className={`ycm-batch-bar${selectedIds.length > 0 ? ' visible' : ''}`}>
                <div className="ycm-batch-info">
                    已选中 <strong>{selectedIds.length}</strong> 条记录
                    <button className="ycm-btn-text" onClick={() => setSelectedIds([])} style={{ marginLeft: 12 }}>取消全选</button>
                </div>
                <div className="ycm-batch-actions">
                    <button className="ycm-btn ycm-btn-success" onClick={() => emitEvent('onBatchApprove', { ids: selectedIds })}>
                        批量通过
                    </button>
                    <button className="ycm-btn ycm-btn-danger" onClick={() => { setRejectTarget(null); setShowRejectModal(true); }}>
                        批量驳回
                    </button>
                </div>
            </div>

            {/* ===== 审核通过确认弹窗 ===== */}
            {showApproveConfirm && (
                <div className="ycm-modal-overlay" onClick={() => setShowApproveConfirm(false)}>
                    <div className="ycm-modal" onClick={e => e.stopPropagation()}>
                        <div className="ycm-modal-header">
                            <div className="ycm-modal-title">确认审核通过</div>
                            <button className="ycm-modal-close" onClick={() => setShowApproveConfirm(false)}><CloseIcon /></button>
                        </div>
                        <div className="ycm-modal-body">
                            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                                确认将该认证申请标记为审核通过？通过后用户账号将被激活。
                            </p>
                        </div>
                        <div className="ycm-modal-footer">
                            <button className="ycm-btn ycm-btn-default" onClick={() => setShowApproveConfirm(false)}>取消</button>
                            <button className="ycm-btn ycm-btn-success" onClick={confirmApprove}>确认通过</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 驳回弹窗 ===== */}
            {showRejectModal && (
                <div className="ycm-modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="ycm-modal" onClick={e => e.stopPropagation()}>
                        <div className="ycm-modal-header">
                            <div className="ycm-modal-title">{rejectTarget ? '审核驳回' : '批量驳回'}</div>
                            <button className="ycm-modal-close" onClick={() => setShowRejectModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="ycm-modal-body">
                            <div className="ycm-modal-form-group">
                                <label className="ycm-modal-form-label">驳回原因分类 <span style={{ color: '#B8292F' }}>*</span></label>
                                <div className="ycm-reject-reasons">
                                    {REJECT_REASONS.map(r => (
                                        <span
                                            key={r}
                                            className={`ycm-reject-reason-tag${rejectReasonType === r ? ' selected' : ''}`}
                                            onClick={() => setRejectReasonType(r)}
                                        >
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="ycm-modal-form-group">
                                <label className="ycm-modal-form-label">审核意见 <span style={{ color: '#B8292F' }}>*</span></label>
                                <textarea
                                    className="ycm-modal-textarea"
                                    placeholder="请输入驳回原因和审核意见..."
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="ycm-modal-footer">
                            <button className="ycm-btn ycm-btn-default" onClick={() => setShowRejectModal(false)}>取消</button>
                            <button className="ycm-btn ycm-btn-danger" onClick={confirmReject}>确认驳回</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 查看详情弹窗 ===== */}
            {showDetailModal && detailTarget && (
                <div className="ycm-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="ycm-modal" style={{ width: 600 }} onClick={e => e.stopPropagation()}>
                        <div className="ycm-modal-header">
                            <div className="ycm-modal-title">认证申请详情</div>
                            <button className="ycm-modal-close" onClick={() => setShowDetailModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="ycm-modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                                <div className="ycm-modal-form-group">
                                    <label className="ycm-modal-form-label">申请人姓名</label>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{detailTarget.real_name}</div>
                                </div>
                                <div className="ycm-modal-form-group">
                                    <label className="ycm-modal-form-label">用户类型</label>
                                    <span className={`ycm-type-tag ${detailTarget.user_type}`}>
                                        {detailTarget.user_type === 'actor' ? '演员' : '行业机构'}
                                    </span>
                                </div>
                                <div className="ycm-modal-form-group">
                                    <label className="ycm-modal-form-label">手机号</label>
                                    <div style={{ fontSize: 14 }}>{detailTarget.phone}</div>
                                </div>
                                <div className="ycm-modal-form-group">
                                    <label className="ycm-modal-form-label">身份证号</label>
                                    <div style={{ fontSize: 14 }}>{detailTarget.id_card}</div>
                                </div>
                                <div className="ycm-modal-form-group">
                                    <label className="ycm-modal-form-label">申请时间</label>
                                    <div style={{ fontSize: 14 }}>{detailTarget.apply_time}</div>
                                </div>
                                <div className="ycm-modal-form-group">
                                    <label className="ycm-modal-form-label">审核状态</label>
                                    <span className={`ycm-status-tag ${detailTarget.status}`}>
                                        <span className={`ycm-status-dot ${detailTarget.status}`} />
                                        {STATUS_MAP[detailTarget.status]?.label}
                                    </span>
                                </div>
                                {detailTarget.reviewer_name && (
                                    <>
                                        <div className="ycm-modal-form-group">
                                            <label className="ycm-modal-form-label">审核人</label>
                                            <div style={{ fontSize: 14 }}>{detailTarget.reviewer_name}</div>
                                        </div>
                                        <div className="ycm-modal-form-group">
                                            <label className="ycm-modal-form-label">审核时间</label>
                                            <div style={{ fontSize: 14 }}>{detailTarget.review_time}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{ marginTop: 16, padding: '16px', background: '#FDFBF9', borderRadius: 10, border: '1px solid #F0ECE8' }}>
                                <div className="ycm-modal-form-label" style={{ marginBottom: 10 }}>身份证照片</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {['人像面', '国徽面', '手持证件'].map(t => (
                                        <div key={t} style={{ flex: 1, height: 80, background: '#F0ECE8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>{t}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="ycm-modal-footer">
                            <button className="ycm-btn ycm-btn-default" onClick={() => setShowDetailModal(false)}>关闭</button>
                            {detailTarget.status === 'pending' && (
                                <>
                                    <button className="ycm-btn ycm-btn-danger" onClick={() => { setShowDetailModal(false); handleReject(detailTarget.id); }}>驳回</button>
                                    <button className="ycm-btn ycm-btn-success" onClick={() => { setShowDetailModal(false); handleApprove(detailTarget.id); }}>通过</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 页脚 ===== */}
            <footer className="ycm-footer">
                <div className="ycm-footer-inner">
                    <div className="ycm-footer-left">
                        <span className="org-name">中国广播电视社会组织联合会演员委员会</span>
                        <br />© 2026 中国演艺人才管理与服务平台 版权所有
                    </div>
                    <div className="ycm-footer-right">
                        <span>客服电话：010-XXXX-XXXX</span>
                        <span>官方邮箱：service@yanyuan.org.cn</span>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default Component;
