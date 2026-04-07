/**
 * @name 培训管理台
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/themes/antd-new/designToken.json (Ant Design 主题)
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md (4.5.3节)
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
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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

// ===== 分类映射 =====
const CATEGORY_MAP: Record<string, string> = {
    ethics: '艺德修养',
    performance: '演技培训',
    law: '法律法规',
    psychology: '心理健康',
};

// ===== 状态映射 =====
const STATUS_MAP: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    offline: '已下架',
};

// ===== 示例数据 =====
const MOCK_DATA = [
    { course_id: '1', course_name: '演艺人员艺德修养（必修）', category: 'ethics', is_required: true, total_lessons: 12, total_duration: 720, enrolled_count: 186, completion_rate: 78.5, status: 'published', instructor_name: '张德艺', fee: 0, description: '本课程系统讲解演艺行业职业道德规范，涵盖艺德标准、行业自律、社会责任等核心内容。作为证书申领的必修课程，完成后可参加艺德考核。', created_at: '2026-02-15 09:00' },
    { course_id: '2', course_name: '表演艺术基础理论', category: 'performance', is_required: false, total_lessons: 18, total_duration: 1080, enrolled_count: 132, completion_rate: 62.3, status: 'published', instructor_name: '李舞台', fee: 580, description: '涵盖斯坦尼斯拉夫斯基体系、布莱希特体系等经典表演理论，结合当代表演方法论进行深入解读。', created_at: '2026-02-20 14:30' },
    { course_id: '3', course_name: '演艺行业法律法规（必修）', category: 'law', is_required: true, total_lessons: 8, total_duration: 480, enrolled_count: 174, completion_rate: 85.2, status: 'published', instructor_name: '王法律', fee: 0, description: '系统学习《演员证管理办法》、《著作权法》、演艺合同法律常识等行业相关法律法规。', created_at: '2026-03-01 10:00' },
    { course_id: '4', course_name: '演员心理健康与压力管理', category: 'psychology', is_required: false, total_lessons: 6, total_duration: 360, enrolled_count: 89, completion_rate: 54.8, status: 'published', instructor_name: '赵心理', fee: 380, description: '帮助演员正确应对职业压力、角色代入后的心理调适，建立健康的职业心态。', created_at: '2026-03-05 11:00' },
    { course_id: '5', course_name: '台词与声音训练进阶', category: 'performance', is_required: false, total_lessons: 15, total_duration: 900, enrolled_count: 67, completion_rate: 41.2, status: 'published', instructor_name: '陈声音', fee: 680, description: '从发声基础到情感表达，系统提升台词功底，包含气息控制、声音塑造、方言处理等模块。', created_at: '2026-03-10 09:30' },
    { course_id: '6', course_name: '影视表演实战技巧', category: 'performance', is_required: false, total_lessons: 20, total_duration: 1200, enrolled_count: 0, completion_rate: 0, status: 'draft', instructor_name: '孙影视', fee: 880, description: '针对镜头前表演的专项训练，涵盖微表情、眼神交流、走位配合、现场应变等实战技能。', created_at: '2026-03-20 16:00' },
    { course_id: '7', course_name: '艺德案例分析与研讨', category: 'ethics', is_required: false, total_lessons: 4, total_duration: 240, enrolled_count: 45, completion_rate: 92.1, status: 'offline', instructor_name: '周案例', fee: 0, description: '通过典型艺德案例的分析、讨论，深化对行业规范的理解。本课程已更新为2026年度版本。', created_at: '2025-12-01 08:00' },
    { course_id: '8', course_name: '演员职业规划与发展', category: 'psychology', is_required: false, total_lessons: 5, total_duration: 300, enrolled_count: 0, completion_rate: 0, status: 'draft', instructor_name: '吴规划', fee: 280, description: '帮助演员系统规划职业路径，包括个人品牌建设、角色定位、转型发展等专题。', created_at: '2026-03-22 14:00' },
];

// ===== 课程大纲示例 =====
const MOCK_OUTLINE: Record<string, Array<{ chapter: string; lessons: Array<{ title: string; type: string; duration: string }> }>> = {
    '1': [
        {
            chapter: '第一章 艺德概论', lessons: [
                { title: '1.1 什么是艺德', type: '📹', duration: '45分钟' },
                { title: '1.2 演艺行业道德规范', type: '📹', duration: '60分钟' },
                { title: '1.3 章节测验', type: '📝', duration: '30分钟' },
            ]
        },
        {
            chapter: '第二章 行业自律', lessons: [
                { title: '2.1 行业自律的意义', type: '📹', duration: '50分钟' },
                { title: '2.2 自律公约解读', type: '📄', duration: '40分钟' },
                { title: '2.3 典型案例分析', type: '📹', duration: '55分钟' },
            ]
        },
        {
            chapter: '第三章 社会责任', lessons: [
                { title: '3.1 演员的社会形象', type: '📹', duration: '45分钟' },
                { title: '3.2 公益参与与社会贡献', type: '📹', duration: '50分钟' },
                { title: '3.3 网络时代的艺人责任', type: '📹', duration: '55分钟' },
                { title: '3.4 综合测试', type: '📝', duration: '45分钟' },
            ]
        },
    ],
};

// ===== 学员进度示例 =====
const MOCK_STUDENTS = [
    { name: '张三', phone: '138****1234', enroll_time: '2026-03-15', completed: 10, total: 12, progress: 83, avg_score: 92, last_study: '2026-03-27 09:30' },
    { name: '李四', phone: '139****5678', enroll_time: '2026-03-16', completed: 8, total: 12, progress: 67, avg_score: 88, last_study: '2026-03-26 14:20' },
    { name: '王五', phone: '137****9012', enroll_time: '2026-03-17', completed: 12, total: 12, progress: 100, avg_score: 95, last_study: '2026-03-25 16:45' },
    { name: '赵六', phone: '136****3456', enroll_time: '2026-03-18', completed: 5, total: 12, progress: 42, avg_score: 78, last_study: '2026-03-27 11:00' },
    { name: '孙七', phone: '135****7890', enroll_time: '2026-03-20', completed: 3, total: 12, progress: 25, avg_score: 85, last_study: '2026-03-26 20:10' },
];

// ===== Axure API =====
const EVENT_LIST: EventItem[] = [
    { name: 'onNavClick', desc: '导航菜单点击时触发' },
    { name: 'onPublish', desc: '发布课程时触发' },
    { name: 'onOffline', desc: '下架课程时触发' },
];
const ACTION_LIST: Action[] = [{ name: 'refreshData', desc: '刷新列表数据' }];
const VAR_LIST: KeyDesc[] = [];
const CONFIG_LIST: ConfigItem[] = [
    { type: 'input', attributeId: 'userName', displayName: '用户名', info: '当前登录用户名', initialValue: '管理员' },
];
const DATA_LIST: DataDesc[] = [];

// ===== 主组件 =====
const Component = forwardRef<AxureHandle, AxureProps>(function TrainingManage(innerProps, ref) {
    const onEventHandler = typeof innerProps?.onEvent === 'function' ? innerProps.onEvent : () => undefined;
    const configSource = innerProps?.config || {};
    const userName = typeof configSource.userName === 'string' ? configSource.userName : '管理员';

    // 状态
    const [activeNav, setActiveNav] = useState('evaluation');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRequired, setFilterRequired] = useState('all');
    const [filterKeyword, setFilterKeyword] = useState('');
    const [currentPage] = useState(1);

    // 弹窗
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailTarget, setDetailTarget] = useState<typeof MOCK_DATA[0] | null>(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: string; target: typeof MOCK_DATA[0] | null }>({ type: '', target: null });

    const emitEvent = useCallback((eventName: string, payload?: any) => {
        try { onEventHandler(eventName, payload); } catch (e) { console.warn('事件触发失败:', e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, () => ({
        getVar: () => undefined,
        fireAction: (name: string) => {
            if (name === 'refreshData') { setFilterCategory('all'); setFilterKeyword(''); }
        },
        eventList: EVENT_LIST,
        actionList: ACTION_LIST,
        varList: VAR_LIST,
        configList: CONFIG_LIST,
        dataList: DATA_LIST,
    }), []);

    // 过滤数据
    const filteredData = MOCK_DATA.filter(item => {
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (filterRequired !== 'all') {
            if (filterRequired === 'yes' && !item.is_required) return false;
            if (filterRequired === 'no' && item.is_required) return false;
        }
        if (filterKeyword && !item.course_name.includes(filterKeyword)) return false;
        return true;
    });

    // 统计
    const publishedCount = MOCK_DATA.filter(i => i.status === 'published').length;
    const activeStudents = MOCK_DATA.reduce((sum, i) => sum + (i.status === 'published' ? i.enrolled_count : 0), 0);
    const avgCompletionRate = (() => {
        const published = MOCK_DATA.filter(i => i.status === 'published' && i.enrolled_count > 0);
        if (published.length === 0) return '0';
        return (published.reduce((sum, i) => sum + i.completion_rate, 0) / published.length).toFixed(1);
    })();

    // 进度条颜色
    const getProgressColor = (rate: number) => {
        if (rate >= 80) return '#30A46C';
        if (rate >= 50) return '#F5A623';
        return '#3B7DD8';
    };

    return (
        <div className="yanyuan-training-manage">
            {/* ===== 导航栏 ===== */}
            <nav className="ytm-navbar">
                <div className="ytm-navbar-brand">
                    <div className="ytm-navbar-logo"><StarLogoIcon /></div>
                    <div>
                        <div className="ytm-navbar-title">中国演艺人才管理与服务平台</div>
                        <div className="ytm-navbar-subtitle">TALENT MANAGEMENT</div>
                    </div>
                </div>
                <div className="ytm-navbar-menu">
                    {NAV_ITEMS.map(item => {
                        const subs = SUB_MENUS[item.key];
                        return (
                            <div key={item.key}
                                className={`ytm-navbar-menu-item${activeNav === item.key ? ' active' : ''}${subs ? ' has-sub' : ''}`}
                                onClick={() => { if (!subs) { setActiveNav(item.key); emitEvent('onNavClick', { key: item.key }); const route = NAV_ROUTES[item.key]; if (route && item.key !== activeNav) window.location.href = route; } }}
                            >
                                {item.label}{subs && <ChevDownIcon />}
                                {subs && (
                                    <div className="ytm-submenu">
                                        {subs.map(sub => (
                                            <div key={sub.key} className="ytm-submenu-item"
                                                onClick={(e: any) => { e.stopPropagation(); window.location.href = sub.route; }}
                                            >{sub.label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="ytm-navbar-actions">
                    <div className="ytm-navbar-notification">
                        <BellIcon />
                        <span className="ytm-navbar-badge">3</span>
                    </div>
                    <div className="ytm-navbar-divider" />
                    <div className="ytm-navbar-user">
                        <div className="ytm-navbar-avatar">{userName.charAt(0)}</div>
                        <span className="ytm-navbar-username">{userName}</span>
                    </div>
                </div>
            </nav>

            {/* ===== 内容区 ===== */}
            <div className="ytm-content">
                {/* 面包屑 */}
                <div className="ytm-breadcrumb">
                    <span className="ytm-breadcrumb-item" onClick={() => { window.location.href = NAV_ROUTES.home; }}>首页</span>
                    <span className="ytm-breadcrumb-sep">/</span>
                    <span className="ytm-breadcrumb-item">职业能力评价</span>
                    <span className="ytm-breadcrumb-sep">/</span>
                    <span className="ytm-breadcrumb-item current">培训管理台</span>
                </div>

                {/* 页面标题 */}
                <div className="ytm-page-header">
                    <div className="ytm-page-title">培训管理台</div>
                    <div className="ytm-page-desc">管理培训课程，跟踪学员学习进度</div>
                </div>

                {/* 统计卡片 */}
                <div className="ytm-stats-grid">
                    <div className="ytm-stat-card">
                        <div className="ytm-stat-label">已发布课程</div>
                        <div className="ytm-stat-value">{publishedCount}<span className="unit">门</span></div>
                        <div className="ytm-stat-footer">较上月 <span className="up">+1</span></div>
                    </div>
                    <div className="ytm-stat-card">
                        <div className="ytm-stat-label">活跃学员数</div>
                        <div className="ytm-stat-value">{activeStudents}<span className="unit">人</span></div>
                        <div className="ytm-stat-footer">较上月 <span className="up">+23%</span></div>
                    </div>
                    <div className="ytm-stat-card">
                        <div className="ytm-stat-label">平均完成率</div>
                        <div className="ytm-stat-value">{avgCompletionRate}%</div>
                        <div className="ytm-stat-footer">较上月 <span className="up">+4.2%</span></div>
                    </div>
                </div>

                {/* 筛选区 */}
                <div className="ytm-filter-card">
                    <div className="ytm-filter-grid">
                        <div className="ytm-filter-item">
                            <label className="ytm-filter-label">课程分类</label>
                            <select className="ytm-filter-select" value={filterCategory} onChange={(e: any) => setFilterCategory(e.target.value)}>
                                <option value="all">全部</option>
                                <option value="ethics">艺德修养</option>
                                <option value="performance">演技培训</option>
                                <option value="law">法律法规</option>
                                <option value="psychology">心理健康</option>
                            </select>
                        </div>
                        <div className="ytm-filter-item">
                            <label className="ytm-filter-label">课程状态</label>
                            <select className="ytm-filter-select" value={filterStatus} onChange={(e: any) => setFilterStatus(e.target.value)}>
                                <option value="all">全部</option>
                                <option value="draft">草稿</option>
                                <option value="published">已发布</option>
                                <option value="offline">已下架</option>
                            </select>
                        </div>
                        <div className="ytm-filter-item">
                            <label className="ytm-filter-label">是否必修</label>
                            <select className="ytm-filter-select" value={filterRequired} onChange={(e: any) => setFilterRequired(e.target.value)}>
                                <option value="all">全部</option>
                                <option value="yes">必修</option>
                                <option value="no">选修</option>
                            </select>
                        </div>
                        <div className="ytm-filter-item">
                            <label className="ytm-filter-label">关键词</label>
                            <input className="ytm-filter-input" placeholder="搜索课程名称" value={filterKeyword} onChange={(e: any) => setFilterKeyword(e.target.value)} />
                        </div>
                    </div>
                    <div className="ytm-filter-actions">
                        <button className="ytm-btn ytm-btn-default" onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setFilterRequired('all'); setFilterKeyword(''); }}>
                            <RefreshIcon /> 重置
                        </button>
                        <button className="ytm-btn ytm-btn-default">
                            <PlusIcon /> 新建课程
                        </button>
                        <button className="ytm-btn ytm-btn-primary">
                            <SearchIcon /> 搜索
                        </button>
                    </div>
                </div>

                {/* 数据表格 */}
                <div className="ytm-table-card">
                    <div className="ytm-table-header">
                        <div className="ytm-table-title">
                            课程列表
                            <span className="ytm-table-count">共 {filteredData.length} 门课程</span>
                        </div>
                    </div>
                    <div className="ytm-table-wrapper">
                        <table className="ytm-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>序号</th>
                                    <th style={{ width: 240 }}>课程名称</th>
                                    <th style={{ width: 100 }}>分类</th>
                                    <th style={{ width: 70 }}>必修</th>
                                    <th style={{ width: 80 }}>总课时</th>
                                    <th style={{ width: 90 }}>报名人数</th>
                                    <th style={{ width: 160 }}>完成率</th>
                                    <th style={{ width: 90 }}>状态</th>
                                    <th style={{ width: 140 }}>创建时间</th>
                                    <th style={{ width: 180 }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, idx) => (
                                    <tr key={row.course_id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#B8292F', cursor: 'pointer' }} onClick={() => { setDetailTarget(row); setShowDetailModal(true); }}>
                                                {row.course_name}
                                            </span>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>讲师：{row.instructor_name}</div>
                                        </td>
                                        <td><span className={`ytm-category-tag ${row.category}`}>{CATEGORY_MAP[row.category]}</span></td>
                                        <td><span className={`ytm-required-tag ${row.is_required ? 'yes' : 'no'}`}>{row.is_required ? '必修' : '选修'}</span></td>
                                        <td>{row.total_lessons} 课时</td>
                                        <td style={{ fontWeight: 600 }}>{row.enrolled_count}</td>
                                        <td>
                                            <div className="ytm-progress-bar">
                                                <div className="ytm-progress-track">
                                                    <div className="ytm-progress-fill" style={{ width: `${row.completion_rate}%`, background: getProgressColor(row.completion_rate) }} />
                                                </div>
                                                <span className="ytm-progress-text">{row.completion_rate}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`ytm-status-tag ${row.status}`}>
                                                <span className={`ytm-status-dot ${row.status}`} />
                                                {STATUS_MAP[row.status]}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12 }}>{row.created_at}</td>
                                        <td>
                                            <div className="ytm-table-actions">
                                                <button className="ytm-btn-text" onClick={() => { setDetailTarget(row); setShowDetailModal(true); }}>查看</button>
                                                {row.status === 'draft' && (
                                                    <button className="ytm-btn-text" style={{ color: '#30A46C' }} onClick={() => { setConfirmAction({ type: 'publish', target: row }); setShowConfirmModal(true); }}>发布</button>
                                                )}
                                                {row.status === 'published' && (
                                                    <>
                                                        <button className="ytm-btn-text" style={{ color: '#3B7DD8' }} onClick={() => { setDetailTarget(row); setShowStudentModal(true); }}>学员</button>
                                                        <button className="ytm-btn-text" style={{ color: '#D13438' }} onClick={() => { setConfirmAction({ type: 'offline', target: row }); setShowConfirmModal(true); }}>下架</button>
                                                    </>
                                                )}
                                                {row.status === 'draft' && row.enrolled_count === 0 && (
                                                    <button className="ytm-btn-text" style={{ color: '#D13438' }} onClick={() => { setConfirmAction({ type: 'delete', target: row }); setShowConfirmModal(true); }}>删除</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 分页 */}
                    <div className="ytm-pagination">
                        <div className="ytm-pagination-info">
                            共 {filteredData.length} 门课程，第 {currentPage} / 1 页
                        </div>
                        <div className="ytm-pagination-pages">
                            <button className="ytm-page-btn disabled"><ChevronLeftIcon /></button>
                            <button className="ytm-page-btn active">1</button>
                            <button className="ytm-page-btn disabled"><ChevronRightIcon /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== 课程详情弹窗 ===== */}
            {showDetailModal && detailTarget && (
                <div className="ytm-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="ytm-modal" style={{ width: 680 }} onClick={(e: any) => e.stopPropagation()}>
                        <div className="ytm-modal-header">
                            <div className="ytm-modal-title">课程详情</div>
                            <button className="ytm-modal-close" onClick={() => setShowDetailModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="ytm-modal-body">
                            {/* 基本信息 */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">课程名称</label>
                                    <div className="ytm-modal-form-value" style={{ fontWeight: 700 }}>{detailTarget.course_name}</div>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">讲师</label>
                                    <div className="ytm-modal-form-value">{detailTarget.instructor_name}</div>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">课程分类</label>
                                    <span className={`ytm-category-tag ${detailTarget.category}`}>{CATEGORY_MAP[detailTarget.category]}</span>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">是否必修</label>
                                    <span className={`ytm-required-tag ${detailTarget.is_required ? 'yes' : 'no'}`}>{detailTarget.is_required ? '必修' : '选修'}</span>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">总课时 / 时长</label>
                                    <div className="ytm-modal-form-value">{detailTarget.total_lessons} 课时 / {Math.round(detailTarget.total_duration / 60)} 小时</div>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">课程费用</label>
                                    <div className="ytm-modal-form-value" style={{ fontWeight: 700, color: detailTarget.fee === 0 ? '#30A46C' : '#B8292F' }}>
                                        {detailTarget.fee === 0 ? '免费（含在培训费中）' : `¥${detailTarget.fee}`}
                                    </div>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">已报名人数</label>
                                    <div className="ytm-modal-form-value" style={{ fontWeight: 600 }}>{detailTarget.enrolled_count} 人</div>
                                </div>
                                <div className="ytm-modal-form-group">
                                    <label className="ytm-modal-form-label">课程状态</label>
                                    <span className={`ytm-status-tag ${detailTarget.status}`}>
                                        <span className={`ytm-status-dot ${detailTarget.status}`} />
                                        {STATUS_MAP[detailTarget.status]}
                                    </span>
                                </div>
                            </div>

                            {/* 课程简介 */}
                            <div style={{ marginTop: 16, padding: 16, background: '#FDFBF9', borderRadius: 10, border: '1px solid #F0ECE8' }}>
                                <div className="ytm-modal-form-label" style={{ marginBottom: 8 }}>课程简介</div>
                                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{detailTarget.description}</div>
                            </div>

                            {/* 课程大纲 */}
                            {MOCK_OUTLINE[detailTarget.course_id] && (
                                <div style={{ marginTop: 16 }}>
                                    <div className="ytm-modal-form-label" style={{ marginBottom: 10 }}>课程大纲</div>
                                    <div className="ytm-outline-list">
                                        {MOCK_OUTLINE[detailTarget.course_id].map((ch, cidx) => (
                                            <div key={cidx}>
                                                <div className="ytm-outline-chapter">{ch.chapter}</div>
                                                {ch.lessons.map((ls, lidx) => (
                                                    <div className="ytm-outline-lesson" key={lidx}>
                                                        <span className="ytm-outline-lesson-icon">{ls.type}</span>
                                                        <span className="ytm-outline-lesson-title">{ls.title}</span>
                                                        <span className="ytm-outline-lesson-duration">{ls.duration}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ytm-modal-footer">
                            <button className="ytm-btn ytm-btn-default" onClick={() => setShowDetailModal(false)}>关闭</button>
                            {detailTarget.status === 'published' && (
                                <button className="ytm-btn ytm-btn-primary" onClick={() => { setShowDetailModal(false); setDetailTarget(detailTarget); setShowStudentModal(true); }}>查看学员</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 学员进度弹窗 ===== */}
            {showStudentModal && detailTarget && (
                <div className="ytm-modal-overlay" onClick={() => setShowStudentModal(false)}>
                    <div className="ytm-modal" style={{ width: 780 }} onClick={(e: any) => e.stopPropagation()}>
                        <div className="ytm-modal-header">
                            <div className="ytm-modal-title">学员学习进度 - {detailTarget.course_name}</div>
                            <button className="ytm-modal-close" onClick={() => setShowStudentModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="ytm-modal-body">
                            <table className="ytm-student-table">
                                <thead>
                                    <tr>
                                        <th>学员姓名</th>
                                        <th>手机号</th>
                                        <th>报名时间</th>
                                        <th>完成课时</th>
                                        <th style={{ width: 140 }}>学习进度</th>
                                        <th>习题均分</th>
                                        <th>最后学习</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_STUDENTS.map((s, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                                            <td>{s.phone}</td>
                                            <td>{s.enroll_time}</td>
                                            <td>{s.completed}/{s.total}</td>
                                            <td>
                                                <div className="ytm-progress-bar">
                                                    <div className="ytm-progress-track">
                                                        <div className="ytm-progress-fill" style={{ width: `${s.progress}%`, background: getProgressColor(s.progress) }} />
                                                    </div>
                                                    <span className="ytm-progress-text">{s.progress}%</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600, color: s.avg_score >= 90 ? '#30A46C' : s.avg_score >= 60 ? '#F5A623' : '#D13438' }}>{s.avg_score}</td>
                                            <td style={{ fontSize: 12 }}>{s.last_study}</td>
                                            <td><button className="ytm-btn-text" style={{ color: '#F5A623' }}>提醒</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="ytm-modal-footer">
                            <button className="ytm-btn ytm-btn-default" onClick={() => setShowStudentModal(false)}>关闭</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 确认操作弹窗 ===== */}
            {showConfirmModal && confirmAction.target && (
                <div className="ytm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="ytm-modal" style={{ width: 440 }} onClick={(e: any) => e.stopPropagation()}>
                        <div className="ytm-modal-header">
                            <div className="ytm-modal-title">
                                {confirmAction.type === 'publish' && '确认发布课程'}
                                {confirmAction.type === 'offline' && '确认下架课程'}
                                {confirmAction.type === 'delete' && '确认删除课程'}
                            </div>
                            <button className="ytm-modal-close" onClick={() => setShowConfirmModal(false)}><CloseIcon /></button>
                        </div>
                        <div className="ytm-modal-body">
                            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                                {confirmAction.type === 'publish' && `确认发布课程「${confirmAction.target.course_name}」？发布后学员即可查看和报名学习。`}
                                {confirmAction.type === 'offline' && `确认下架课程「${confirmAction.target.course_name}」？下架后新学员将无法报名，已报名学员可继续学习。`}
                                {confirmAction.type === 'delete' && `确认删除课程「${confirmAction.target.course_name}」？此操作不可撤销。`}
                            </p>
                        </div>
                        <div className="ytm-modal-footer">
                            <button className="ytm-btn ytm-btn-default" onClick={() => setShowConfirmModal(false)}>取消</button>
                            <button
                                className={`ytm-btn ${confirmAction.type === 'delete' ? 'ytm-btn-primary' : confirmAction.type === 'publish' ? 'ytm-btn-success' : 'ytm-btn-warning'}`}
                                onClick={() => {
                                    if (confirmAction.type === 'publish') emitEvent('onPublish', { course_id: confirmAction.target?.course_id });
                                    if (confirmAction.type === 'offline') emitEvent('onOffline', { course_id: confirmAction.target?.course_id });
                                    setShowConfirmModal(false);
                                }}
                            >
                                {confirmAction.type === 'publish' && '确认发布'}
                                {confirmAction.type === 'offline' && '确认下架'}
                                {confirmAction.type === 'delete' && '确认删除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 页脚 ===== */}
            <footer className="ytm-footer">
                <div className="ytm-footer-inner">
                    <div>
                        <span className="org-name">中国广播电视社会组织联合会演员委员会</span>
                        <br />© 2026 中国演艺人才管理与服务平台 版权所有
                    </div>
                    <div className="ytm-footer-right">
                        <span>客服电话：010-XXXX-XXXX</span>
                        <span>官方邮箱：service@yanyuan.org.cn</span>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default Component;
