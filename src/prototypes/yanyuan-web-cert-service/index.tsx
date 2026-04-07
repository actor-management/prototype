/**
 * @name 证书申请管理台
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/themes/antd-new/designToken.json (Ant Design 主题)
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md (4.4.2节)
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

const CheckCircleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
);

// ===== 导航菜单 =====
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

// ===== Tab 定义 =====
const TABS = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'reviewing', label: '审核中' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已驳回' },
];

// ===== 状态映射 =====
const STATUS_MAP: Record<string, { label: string }> = {
    pending: { label: '待审核' },
    reviewing: { label: '审核中' },
    approved: { label: '已通过' },
    rejected: { label: '已驳回' },
    supplement: { label: '需补充材料' },
};

// ===== 阶段映射 =====
const STAGE_MAP: Record<string, string> = {
    material_review: '材料审核',
    payment: '待缴费',
    training: '培训中',
    exam: '考核中',
    org_review: '机构审核',
    issuing: '待签发',
    completed: '已完成',
};

// ===== 认定方式映射 =====
const PROOF_MAP: Record<string, string> = {
    art_school: '艺术院校毕业',
    professional_group: '专业团体从业',
    association_exam: '协会技能考评',
};

// ===== 示例数据 =====
const MOCK_DATA = [
    { id: '1', apply_no: 'AP-202603-00012', applicant_name: '张明华', cert_type: 'actor_cert', cert_level: '', ability_proof_type: 'art_school', apply_time: '2026-03-27 10:30', current_stage: 'material_review', status: 'pending', reviewer: '', review_time: '' },
    { id: '2', apply_no: 'AP-202603-00011', applicant_name: '李艺萱', cert_type: 'tech_cert', cert_level: 'level_4', ability_proof_type: 'art_school', apply_time: '2026-03-27 09:15', current_stage: 'material_review', status: 'pending', reviewer: '', review_time: '' },
    { id: '3', apply_no: 'AP-202603-00010', applicant_name: '王舞台', cert_type: 'actor_cert', cert_level: '', ability_proof_type: 'professional_group', apply_time: '2026-03-26 16:20', current_stage: 'training', status: 'approved', reviewer: '管理员A', review_time: '2026-03-27 08:00' },
    { id: '4', apply_no: 'AP-202603-00009', applicant_name: '陈演技', cert_type: 'actor_cert', cert_level: '', ability_proof_type: 'association_exam', apply_time: '2026-03-26 14:00', current_stage: 'exam', status: 'approved', reviewer: '管理员A', review_time: '2026-03-26 18:00' },
    { id: '5', apply_no: 'AP-202603-00008', applicant_name: '赵文艺', cert_type: 'tech_cert', cert_level: 'level_3', ability_proof_type: 'art_school', apply_time: '2026-03-26 11:30', current_stage: 'material_review', status: 'rejected', reviewer: '管理员B', review_time: '2026-03-26 16:00' },
    { id: '6', apply_no: 'AP-202603-00007', applicant_name: '孙影星', cert_type: 'actor_cert', cert_level: '', ability_proof_type: 'art_school', apply_time: '2026-03-25 15:45', current_stage: 'issuing', status: 'approved', reviewer: '管理员A', review_time: '2026-03-25 17:00' },
    { id: '7', apply_no: 'AP-202603-00006', applicant_name: '周琴声', cert_type: 'tech_cert', cert_level: 'level_2', ability_proof_type: 'professional_group', apply_time: '2026-03-25 10:00', current_stage: 'completed', status: 'approved', reviewer: '管理员A', review_time: '2026-03-25 14:00' },
    { id: '8', apply_no: 'AP-202603-00005', applicant_name: '吴剧本', cert_type: 'actor_cert', cert_level: '', ability_proof_type: 'association_exam', apply_time: '2026-03-24 16:30', current_stage: 'material_review', status: 'supplement', reviewer: '管理员B', review_time: '2026-03-25 09:00' },
    { id: '9', apply_no: 'AP-202603-00004', applicant_name: '郑导演', cert_type: 'tech_cert', cert_level: 'level_1', ability_proof_type: 'professional_group', apply_time: '2026-03-24 09:20', current_stage: 'payment', status: 'approved', reviewer: '管理员A', review_time: '2026-03-24 11:00' },
    { id: '10', apply_no: 'AP-202603-00003', applicant_name: '冯台词', cert_type: 'actor_cert', cert_level: '', ability_proof_type: 'art_school', apply_time: '2026-03-23 14:50', current_stage: 'material_review', status: 'reviewing', reviewer: '', review_time: '' },
];

// ===== Axure API =====
const EVENT_LIST: EventItem[] = [
    { name: 'onReview', desc: '审核操作提交时触发' },
    { name: 'onIssue', desc: '签发确认时触发' },
    { name: 'onNavClick', desc: '导航菜单点击时触发' },
];
const ACTION_LIST: Action[] = [{ name: 'refreshData', desc: '刷新列表数据' }];
const VAR_LIST: KeyDesc[] = [];
const CONFIG_LIST: ConfigItem[] = [
    { type: 'input', attributeId: 'userName', displayName: '用户名', info: '当前登录用户名', initialValue: '管理员' },
];
const DATA_LIST: DataDesc[] = [];

// ===== 证书等级显示文字 =====
const LEVEL_TEXT: Record<string, string> = {
    level_1: '一级', level_2: '二级', level_3: '三级', level_4: '四级',
};

// ===== 主组件 =====
const Component = forwardRef<AxureHandle, AxureProps>(function CertService(innerProps, ref) {
    const onEventHandler = typeof innerProps?.onEvent === 'function' ? innerProps.onEvent : () => undefined;
    const configSource = innerProps?.config || {};
    const userName = typeof configSource.userName === 'string' ? configSource.userName : '管理员';

    // 状态
    const [activeNav, setActiveNav] = useState('certificate');
    const [activeTab, setActiveTab] = useState('all');
    const [filterCertType, setFilterCertType] = useState('all');
    const [filterName, setFilterName] = useState('');
    const [filterApplyNo, setFilterApplyNo] = useState('');
    const [currentPage] = useState(1);

    // 弹窗
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTarget, setDetailTarget] = useState<typeof MOCK_DATA[0] | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<typeof MOCK_DATA[0] | null>(null);
    const [reviewDecision, setReviewDecision] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [showIssueConfirm, setShowIssueConfirm] = useState(false);
    const [issueTarget, setIssueTarget] = useState<string | null>(null);

    const emitEvent = useCallback((eventName: string, payload?: any) => {
        try { onEventHandler(eventName, payload); } catch (e) { console.warn('事件触发失败:', e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, () => ({
        getVar: () => undefined,
        fireAction: (name: string) => {
            if (name === 'refreshData') { setActiveTab('all'); setFilterName(''); }
        },
        eventList: EVENT_LIST,
        actionList: ACTION_LIST,
        varList: VAR_LIST,
        configList: CONFIG_LIST,
        dataList: DATA_LIST,
    }), []);

    // 过滤数据
    const filteredData = MOCK_DATA.filter(item => {
        if (activeTab !== 'all' && item.status !== activeTab) return false;
        if (filterCertType !== 'all' && item.cert_type !== filterCertType) return false;
        if (filterName && !item.applicant_name.includes(filterName)) return false;
        if (filterApplyNo && !item.apply_no.includes(filterApplyNo)) return false;
        return true;
    });

    // Tab 数量统计
    const tabCounts: Record<string, number> = {
        all: MOCK_DATA.length,
        pending: MOCK_DATA.filter(i => i.status === 'pending').length,
        reviewing: MOCK_DATA.filter(i => i.status === 'reviewing').length,
        approved: MOCK_DATA.filter(i => i.status === 'approved').length,
        rejected: MOCK_DATA.filter(i => i.status === 'rejected').length,
    };

    // 统计
    const pendingCount = tabCounts.pending;
    const monthlyApply = MOCK_DATA.length;

    return (
        <div className="yanyuan-cert-service">
            {/* ===== 导航栏 ===== */}
            <nav className="ycs-navbar">
                <div className="ycs-navbar-brand">
                    <div className="ycs-navbar-logo"><StarLogoIcon /></div>
                    <div>
                        <div className="ycs-navbar-title">中国演艺人才管理与服务平台</div>
                        <div className="ycs-navbar-subtitle">TALENT MANAGEMENT</div>
                    </div>
                </div>
                <div className="ycs-navbar-menu">
                    {NAV_ITEMS.map(item => {
                        const subs = SUB_MENUS[item.key];
                        return (
                            <div key={item.key}
                                className={`ycs-navbar-menu-item${activeNav === item.key ? ' active' : ''}${subs ? ' has-sub' : ''}`}
                                onClick={() => { if (!subs) { setActiveNav(item.key); emitEvent('onNavClick', { key: item.key }); const route = NAV_ROUTES[item.key]; if (route && item.key !== activeNav) window.location.href = route; } }}
                            >
                                {item.label}{subs && <ChevDownIcon />}
                                {subs && (
                                    <div className="ycs-submenu">
                                        {subs.map(sub => (
                                            <div key={sub.key} className="ycs-submenu-item"
                                                onClick={(e: any) => { e.stopPropagation(); window.location.href = sub.route; }}
                                            >{sub.label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="ycs-navbar-actions">
                    <div className="ycs-navbar-notification">
                        <BellIcon />
                        <span className="ycs-navbar-badge">3</span>
                    </div>
                    <div className="ycs-navbar-divider" />
                    <div className="ycs-navbar-user">
                        <div className="ycs-navbar-avatar">{userName.charAt(0)}</div>
                        <span className="ycs-navbar-username">{userName}</span>
                    </div>
                </div>
            </nav>

            {/* ===== 内容区 ===== */}
            <div className="ycs-content">
                {/* 面包屑 */}
                <div className="ycs-breadcrumb">
                    <span className="ycs-breadcrumb-item" onClick={() => { window.location.href = NAV_ROUTES.home; }}>首页</span>
                    <span className="ycs-breadcrumb-sep">/</span>
                    <span className="ycs-breadcrumb-item">证书管理</span>
                    <span className="ycs-breadcrumb-sep">/</span>
                    <span className="ycs-breadcrumb-item current">证书申请管理台</span>
                </div>

                {/* 页面标题 */}
                <div className="ycs-page-header">
                    <div>
                        <div className="ycs-page-title">证书申请管理台</div>
                        <div className="ycs-page-desc">管理和审核证书申请，跟踪申请进度</div>
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className="ycs-stats-grid">
                    <div className="ycs-stat-card">
                        <div className="ycs-stat-label">待审核</div>
                        <div className="ycs-stat-value">{pendingCount}<span className="unit">条</span></div>
                        <div className="ycs-stat-footer">较昨日 <span className="up">+2</span></div>
                    </div>
                    <div className="ycs-stat-card">
                        <div className="ycs-stat-label">本月申请</div>
                        <div className="ycs-stat-value">{monthlyApply}<span className="unit">条</span></div>
                        <div className="ycs-stat-footer">较上月 <span className="up">+18%</span></div>
                    </div>
                    <div className="ycs-stat-card">
                        <div className="ycs-stat-label">通过率</div>
                        <div className="ycs-stat-value">82.5%</div>
                        <div className="ycs-stat-footer">较上月 <span className="up">+3.1%</span></div>
                    </div>
                    <div className="ycs-stat-card">
                        <div className="ycs-stat-label">平均处理时长</div>
                        <div className="ycs-stat-value">1.8h</div>
                        <div className="ycs-stat-footer">较上月 <span className="down">-0.3h</span></div>
                    </div>
                </div>

                {/* Tab 栏 */}
                <div className="ycs-tabs">
                    {TABS.map(tab => (
                        <div
                            key={tab.key}
                            className={`ycs-tab${activeTab === tab.key ? ' active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            <span className="tab-count">{tabCounts[tab.key]}</span>
                        </div>
                    ))}
                </div>

                {/* 筛选区 */}
                <div className="ycs-filter-card">
                    <div className="ycs-filter-grid">
                        <div className="ycs-filter-item">
                            <label className="ycs-filter-label">证书类型</label>
                            <select className="ycs-filter-select" value={filterCertType} onChange={(e: any) => setFilterCertType(e.target.value)}>
                                <option value="all">全部</option>
                                <option value="actor_cert">演员资格证</option>
                                <option value="tech_cert">专业技术资格证书</option>
                            </select>
                        </div>
                        <div className="ycs-filter-item">
                            <label className="ycs-filter-label">申请人姓名</label>
                            <input className="ycs-filter-input" placeholder="请输入姓名搜索" value={filterName} onChange={(e: any) => setFilterName(e.target.value)} />
                        </div>
                        <div className="ycs-filter-item">
                            <label className="ycs-filter-label">申请编号</label>
                            <input className="ycs-filter-input" placeholder="请输入申请编号" value={filterApplyNo} onChange={(e: any) => setFilterApplyNo(e.target.value)} />
                        </div>
                        <div className="ycs-filter-item">
                            <label className="ycs-filter-label">证书等级</label>
                            <select className="ycs-filter-select">
                                <option value="all">全部</option>
                                <option value="level_1">一级</option>
                                <option value="level_2">二级</option>
                                <option value="level_3">三级</option>
                                <option value="level_4">四级</option>
                            </select>
                        </div>
                        <div className="ycs-filter-item">
                            <label className="ycs-filter-label">申请时间</label>
                            <input className="ycs-filter-input" type="date" />
                        </div>
                        <div className="ycs-filter-item">
                            <label className="ycs-filter-label">认定方式</label>
                            <select className="ycs-filter-select">
                                <option value="all">全部</option>
                                <option value="art_school">艺术院校毕业</option>
                                <option value="professional_group">专业团体从业</option>
                                <option value="association_exam">协会技能考评</option>
                            </select>
                        </div>
                    </div>
                    <div className="ycs-filter-actions">
                        <button className="ycs-btn ycs-btn-default" onClick={() => { setFilterCertType('all'); setFilterName(''); setFilterApplyNo(''); }}>
                            <RefreshIcon /> 重置
                        </button>
                        <button className="ycs-btn ycs-btn-default">
                            <DownloadIcon /> 导出
                        </button>
                        <button className="ycs-btn ycs-btn-primary">
                            <SearchIcon /> 搜索
                        </button>
                    </div>
                </div>

                {/* 数据表格 */}
                <div className="ycs-table-card">
                    <div className="ycs-table-header">
                        <div className="ycs-table-title">
                            证书申请列表
                            <span className="ycs-table-count">共 {filteredData.length} 条记录</span>
                        </div>
                    </div>
                    <div className="ycs-table-wrapper">
                        <table className="ycs-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>序号</th>
                                    <th style={{ width: 150 }}>申请编号</th>
                                    <th>申请人姓名</th>
                                    <th style={{ width: 130 }}>证书类型</th>
                                    <th style={{ width: 80 }}>等级</th>
                                    <th style={{ width: 120 }}>认定方式</th>
                                    <th style={{ width: 140 }}>申请时间</th>
                                    <th style={{ width: 100 }}>当前阶段</th>
                                    <th style={{ width: 110 }}>审核状态</th>
                                    <th style={{ width: 160 }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, idx) => (
                                    <tr key={row.id}>
                                        <td>{idx + 1}</td>
                                        <td style={{ fontWeight: 600, color: '#B8292F', cursor: 'pointer' }} onClick={() => { setDetailTarget(row); setShowDetailModal(true); }}>{row.apply_no}</td>
                                        <td style={{ fontWeight: 500 }}>{row.applicant_name}</td>
                                        <td>
                                            <span className={`ycs-cert-type-tag ${row.cert_type}`}>
                                                {row.cert_type === 'actor_cert' ? '演员资格证' : '专业技术资格证书'}
                                            </span>
                                        </td>
                                        <td>
                                            {row.cert_level ? <span className="ycs-level-tag">{LEVEL_TEXT[row.cert_level]}</span> : '—'}
                                        </td>
                                        <td>{PROOF_MAP[row.ability_proof_type] || '—'}</td>
                                        <td style={{ fontSize: 12 }}>{row.apply_time}</td>
                                        <td>
                                            <span className={`ycs-stage-tag ${row.current_stage}`}>
                                                {STAGE_MAP[row.current_stage]}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`ycs-status-tag ${row.status}`}>
                                                <span className={`ycs-status-dot ${row.status}`} />
                                                {STATUS_MAP[row.status]?.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ycs-table-actions">
                                                <button className="ycs-btn-text" onClick={() => { setDetailTarget(row); setShowDetailModal(true); }}>查看</button>
                                                {row.status === 'pending' && (
                                                    <button className="ycs-btn-text" style={{ color: '#3B7DD8' }} onClick={() => { setReviewTarget(row); setReviewDecision(''); setReviewComment(''); setShowReviewModal(true); }}>审核</button>
                                                )}
                                                {row.current_stage === 'issuing' && (
                                                    <button className="ycs-btn-text" style={{ color: '#30A46C' }} onClick={() => { setIssueTarget(row.id); setShowIssueConfirm(true); }}>签发</button>
                                                )}
                                                {(row.current_stage === 'training' || row.current_stage === 'exam') && (
                                                    <button className="ycs-btn-text" style={{ color: '#F5A623' }}>催办</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    <div className="ycs-pagination">
                        <div className="ycs-pagination-info">
                            共 {filteredData.length} 条记录，第 {currentPage} / 1 页
                        </div>
                        <div className="ycs-pagination-pages">
                            <button className="ycs-page-btn disabled"><ChevronLeftIcon /></button>
                            <button className="ycs-page-btn active">1</button>
                            <button className="ycs-page-btn disabled"><ChevronRightIcon /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== 查看详情弹窗 ===== */}
            {
                showDetailModal && detailTarget && (
                    <div className="ycs-modal-overlay" onClick={() => setShowDetailModal(false)}>
                        <div className="ycs-modal" style={{ width: 640 }} onClick={(e: any) => e.stopPropagation()}>
                            <div className="ycs-modal-header">
                                <div className="ycs-modal-title">证书申请详情</div>
                                <button className="ycs-modal-close" onClick={() => setShowDetailModal(false)}><CloseIcon /></button>
                            </div>
                            <div className="ycs-modal-body">
                                {/* 申请概要 */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">申请编号</label>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#B8292F' }}>{detailTarget.apply_no}</div>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">申请人姓名</label>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{detailTarget.applicant_name}</div>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">证书类型</label>
                                        <span className={`ycs-cert-type-tag ${detailTarget.cert_type}`}>
                                            {detailTarget.cert_type === 'actor_cert' ? '演员资格证' : '专业技术资格证书'}
                                        </span>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">证书等级</label>
                                        <div style={{ fontSize: 14 }}>{detailTarget.cert_level ? LEVEL_TEXT[detailTarget.cert_level] : '不适用'}</div>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">认定方式</label>
                                        <div style={{ fontSize: 14 }}>{PROOF_MAP[detailTarget.ability_proof_type]}</div>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">申请时间</label>
                                        <div style={{ fontSize: 14 }}>{detailTarget.apply_time}</div>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">当前阶段</label>
                                        <span className={`ycs-stage-tag ${detailTarget.current_stage}`}>{STAGE_MAP[detailTarget.current_stage]}</span>
                                    </div>
                                    <div className="ycs-modal-form-group">
                                        <label className="ycs-modal-form-label">审核状态</label>
                                        <span className={`ycs-status-tag ${detailTarget.status}`}>
                                            <span className={`ycs-status-dot ${detailTarget.status}`} />
                                            {STATUS_MAP[detailTarget.status]?.label}
                                        </span>
                                    </div>
                                </div>

                                {/* 认定材料区 */}
                                <div style={{ marginTop: 16, padding: 16, background: '#FDFBF9', borderRadius: 10, border: '1px solid #F0ECE8' }}>
                                    <div className="ycs-modal-form-label" style={{ marginBottom: 10 }}>认定材料</div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {['毕业证书', '学位证书', '补充材料'].map(t => (
                                            <div key={t} style={{ flex: 1, height: 70, background: '#F0ECE8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>{t}</div>
                                        ))}
                                    </div>
                                </div>

                                {/* 审核记录时间线 */}
                                <div style={{ marginTop: 16 }}>
                                    <div className="ycs-modal-form-label" style={{ marginBottom: 10 }}>审核记录</div>
                                    <div className="ycs-timeline">
                                        <div className="ycs-timeline-item">
                                            <div className="ycs-timeline-dot info">1</div>
                                            <div className="ycs-timeline-content">
                                                <div className="ycs-timeline-title">提交申请</div>
                                                <div className="ycs-timeline-desc">{detailTarget.apply_time} · {detailTarget.applicant_name} 提交了证书申请</div>
                                            </div>
                                        </div>
                                        {detailTarget.reviewer && (
                                            <div className="ycs-timeline-item">
                                                <div className={`ycs-timeline-dot ${detailTarget.status === 'rejected' ? 'error' : 'success'}`}>2</div>
                                                <div className="ycs-timeline-content">
                                                    <div className="ycs-timeline-title">{detailTarget.status === 'rejected' ? '审核驳回' : '审核通过'}</div>
                                                    <div className="ycs-timeline-desc">{detailTarget.review_time} · {detailTarget.reviewer} 完成审核</div>
                                                </div>
                                            </div>
                                        )}
                                        {!detailTarget.reviewer && (
                                            <div className="ycs-timeline-item">
                                                <div className="ycs-timeline-dot warning">2</div>
                                                <div className="ycs-timeline-content">
                                                    <div className="ycs-timeline-title">等待审核</div>
                                                    <div className="ycs-timeline-desc">材料已提交，等待管理员审核...</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="ycs-modal-footer">
                                <button className="ycs-btn ycs-btn-default" onClick={() => setShowDetailModal(false)}>关闭</button>
                                {detailTarget.status === 'pending' && (
                                    <button className="ycs-btn ycs-btn-primary" onClick={() => { setShowDetailModal(false); setReviewTarget(detailTarget); setReviewDecision(''); setReviewComment(''); setShowReviewModal(true); }}>审核</button>
                                )}
                                {detailTarget.current_stage === 'issuing' && (
                                    <button className="ycs-btn ycs-btn-success" onClick={() => { setShowDetailModal(false); setIssueTarget(detailTarget.id); setShowIssueConfirm(true); }}>签发证书</button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== 审核操作弹窗 ===== */}
            {
                showReviewModal && reviewTarget && (
                    <div className="ycs-modal-overlay" onClick={() => setShowReviewModal(false)}>
                        <div className="ycs-modal" onClick={(e: any) => e.stopPropagation()}>
                            <div className="ycs-modal-header">
                                <div className="ycs-modal-title">审核 - {reviewTarget.apply_no}</div>
                                <button className="ycs-modal-close" onClick={() => setShowReviewModal(false)}><CloseIcon /></button>
                            </div>
                            <div className="ycs-modal-body">
                                <div className="ycs-modal-form-group">
                                    <label className="ycs-modal-form-label">审核结论 <span style={{ color: '#B8292F' }}>*</span></label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {[
                                            { key: 'approved', label: '通过', color: '#6BAF5E' },
                                            { key: 'rejected', label: '驳回', color: '#E8684A' },
                                            { key: 'supplement', label: '需补充材料', color: '#7B61DC' },
                                        ].map(opt => (
                                            <div
                                                key={opt.key}
                                                onClick={() => setReviewDecision(opt.key)}
                                                style={{
                                                    flex: 1, padding: '12px 16px', borderRadius: 10,
                                                    border: `2px solid ${reviewDecision === opt.key ? opt.color : '#E8E2DC'}`,
                                                    background: reviewDecision === opt.key ? `${opt.color}08` : '#fff',
                                                    cursor: 'pointer', textAlign: 'center', fontWeight: 600, fontSize: 14,
                                                    color: reviewDecision === opt.key ? opt.color : '#666666',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {reviewDecision === opt.key && <CheckCircleIcon />} {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="ycs-modal-form-group">
                                    <label className="ycs-modal-form-label">审核意见 {reviewDecision !== 'approved' && <span style={{ color: '#B8292F' }}>*</span>}</label>
                                    <textarea
                                        className="ycs-modal-textarea"
                                        placeholder="请输入审核意见..."
                                        value={reviewComment}
                                        onChange={(e: any) => setReviewComment(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="ycs-modal-footer">
                                <button className="ycs-btn ycs-btn-default" onClick={() => setShowReviewModal(false)}>取消</button>
                                <button
                                    className="ycs-btn ycs-btn-primary"
                                    onClick={() => {
                                        emitEvent('onReview', { id: reviewTarget.id, decision: reviewDecision, comment: reviewComment });
                                        setShowReviewModal(false);
                                    }}
                                >
                                    确认提交
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== 签发确认弹窗 ===== */}
            {
                showIssueConfirm && (
                    <div className="ycs-modal-overlay" onClick={() => setShowIssueConfirm(false)}>
                        <div className="ycs-modal" style={{ width: 440 }} onClick={(e: any) => e.stopPropagation()}>
                            <div className="ycs-modal-header">
                                <div className="ycs-modal-title">确认签发证书</div>
                                <button className="ycs-modal-close" onClick={() => setShowIssueConfirm(false)}><CloseIcon /></button>
                            </div>
                            <div className="ycs-modal-body">
                                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                    确认签发该证书？签发后将自动生成证书编号，并通知申请人领取电子证书。此操作不可撤销。
                                </p>
                            </div>
                            <div className="ycs-modal-footer">
                                <button className="ycs-btn ycs-btn-default" onClick={() => setShowIssueConfirm(false)}>取消</button>
                                <button className="ycs-btn ycs-btn-success" onClick={() => {
                                    emitEvent('onIssue', { id: issueTarget });
                                    setShowIssueConfirm(false);
                                    setIssueTarget(null);
                                }}>确认签发</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== 页脚 ===== */}
            <footer className="ycs-footer">
                <div className="ycs-footer-inner">
                    <div>
                        <span className="org-name">中国广播电视社会组织联合会演员委员会</span>
                        <br />© 2026 中国演艺人才管理与服务平台 版权所有
                    </div>
                    <div className="ycs-footer-right">
                        <span>客服电话：010-XXXX-XXXX</span>
                        <span>官方邮箱：service@yanyuan.org.cn</span>
                    </div>
                </div>
            </footer>
        </div >
    );
});

export default Component;
