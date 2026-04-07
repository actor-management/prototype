/**
 * @name 人才数字档案管理台
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md (4.6节)
 */

import './style.css';
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { AxureProps, AxureHandle, EventItem, Action, KeyDesc, ConfigItem, DataDesc } from '../../common/axure-types';
import {
    NAV_ITEMS, NAV_ROUTES, SUB_MENUS,
    AUTH_STATUS_MAP, CERT_STATUS_MAP, CERT_TYPE_MAP, ITEM_TYPE_MAP, PRIORITY_MAP, WORKBENCH_STATUS_MAP,
    MOCK_USERS, MOCK_CERTS, MOCK_WORK_ITEMS,
    PANORAMA_USER, PANORAMA_CERTS, PANORAMA_TRAININGS, PANORAMA_EXAMS, PANORAMA_HONORS, PANORAMA_BOARDS, PANORAMA_MENTAL,
} from './components/data';

// ===== SVG 图标 =====
const StarLogo = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.09 8.26L21 9.27L16 13.97L17.18 21L12 17.77L6.82 21L8 13.97L3 9.27L9.91 8.26L12 2Z" fill="#fff" /><circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.3)" /></svg>);
const BellIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>);
const SearchIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const RefreshIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>);
const CloseIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const ChevL = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>);
const ChevR = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>);
const ExportIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const ChevDown = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>);

// ===== Axure API =====
const EVENT_LIST: EventItem[] = [
    { name: 'onNavClick', desc: '导航菜单点击时触发' },
    { name: 'onViewArchive', desc: '查看人才档案时触发' },
    { name: 'onFreeze', desc: '冻结账号时触发' },
    { name: 'onUnfreeze', desc: '解冻账号时触发' },
    { name: 'onRevokeCert', desc: '吊销证书时触发' },
];
const ACTION_LIST: Action[] = [{ name: 'refreshData', desc: '刷新列表数据' }];
const VAR_LIST: KeyDesc[] = [];
const CONFIG_LIST: ConfigItem[] = [
    { type: 'input', attributeId: 'userName', displayName: '用户名', info: '当前登录用户名', initialValue: '管理员' },
];
const DATA_LIST: DataDesc[] = [];

// ===== 辅助函数 =====
const getProgressColor = (r: number) => r >= 80 ? '#30A46C' : r >= 50 ? '#F5A623' : '#3B7DD8';

// ===== 雷达图 SVG =====
const RadarChart = ({ scores }: { scores: Record<string, number> }) => {
    const dims = ['信息完整度', '证书状态', '培训完成度', '考核成绩', '荣誉积累', '合规状态'];
    const keys = ['info', 'cert', 'training', 'exam', 'honor', 'compliance'];
    const cx = 140, cy = 130, R = 100;
    const angles = dims.map((_, i) => (Math.PI * 2 * i) / dims.length - Math.PI / 2);
    const poly = (r: number) => angles.map((a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ');
    const dataPoly = angles.map((a, i) => {
        const v = (scores[keys[i]] || 0) / 100 * R;
        return `${cx + v * Math.cos(a)},${cy + v * Math.sin(a)}`;
    }).join(' ');
    return (
        <svg width="280" height="270" viewBox="0 0 280 270">
            {[0.2, 0.4, 0.6, 0.8, 1].map(s => <polygon key={s} points={poly(R * s)} fill="none" stroke="#F0ECE8" strokeWidth="1" />)}
            {angles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="#F0ECE8" strokeWidth="1" />)}
            <polygon points={dataPoly} fill="rgba(184,41,47,0.15)" stroke="#B8292F" strokeWidth="2" />
            {angles.map((a, i) => {
                const lx = cx + (R + 18) * Math.cos(a), ly = cy + (R + 18) * Math.sin(a);
                return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#666">{dims[i]}</text>;
            })}
            {angles.map((a, i) => {
                const v = (scores[keys[i]] || 0) / 100 * R;
                return <circle key={`d${i}`} cx={cx + v * Math.cos(a)} cy={cy + v * Math.sin(a)} r="4" fill="#B8292F" stroke="#fff" strokeWidth="2" />;
            })}
        </svg>
    );
};

// ===== 主组件 =====
const Component = forwardRef<AxureHandle, AxureProps>(function TalentArchive(innerProps, ref) {
    const onEvent = typeof innerProps?.onEvent === 'function' ? innerProps.onEvent : () => undefined;
    const userName = typeof innerProps?.config?.userName === 'string' ? innerProps.config.userName : '管理员';
    const emit = useCallback((n: string, p?: any) => { try { onEvent(n, p); } catch { } }, [onEvent]);

    // 状态
    const [activeNav, setActiveNav] = useState('talent');
    const [activeModule, setActiveModule] = useState('basic');
    // 基础信息筛选
    const [fName, setFName] = useState('');
    const [fAuth, setFAuth] = useState('all');
    const [fSpec, setFSpec] = useState('all');
    // 证书筛选
    const [fCertType, setFCertType] = useState('all');
    const [fCertStatus, setFCertStatus] = useState('all');
    const [fHolder, setFHolder] = useState('');
    // 工作台
    const [wTab, setWTab] = useState('pending');
    const [wType, setWType] = useState('all');
    // 全景档案 Tab
    const [pTab, setPTab] = useState('info');
    // 弹窗
    const [showModal, setShowModal] = useState('');
    const [modalTarget, setModalTarget] = useState<any>(null);
    const [modalComment, setModalComment] = useState('');

    useImperativeHandle(ref, () => ({
        getVar: () => undefined,
        fireAction: (name: string) => { if (name === 'refreshData') { setFName(''); setFAuth('all'); setFSpec('all'); } },
        eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST,
    }), []);

    // 过滤数据
    const filteredUsers = MOCK_USERS.filter(u => {
        if (fName && !u.real_name.includes(fName)) return false;
        if (fAuth !== 'all' && u.auth_status !== fAuth) return false;
        if (fSpec !== 'all' && u.speciality !== fSpec) return false;
        return true;
    });
    const filteredCerts = MOCK_CERTS.filter(c => {
        if (fHolder && !c.holder_name.includes(fHolder)) return false;
        if (fCertType !== 'all' && c.cert_type !== fCertType) return false;
        if (fCertStatus !== 'all' && c.status !== fCertStatus) return false;
        return true;
    });
    const filteredItems = MOCK_WORK_ITEMS.filter(w => {
        if (wTab === 'pending' && w.status !== 'pending') return false;
        if (wTab === 'done' && !['completed', 'rejected'].includes(w.status)) return false;
        if (wType !== 'all' && w.item_type !== wType) return false;
        return true;
    });

    // 统计
    const totalUsers = MOCK_USERS.length;
    const newUsers = MOCK_USERS.filter(u => u.register_time >= '2026-03').length;
    const verifiedUsers = MOCK_USERS.filter(u => u.auth_status === 'verified').length;
    const validActor = MOCK_CERTS.filter(c => c.cert_type === 'actor_cert' && c.status === 'valid').length;
    const validTech = MOCK_CERTS.filter(c => c.cert_type === 'tech_cert' && c.status === 'valid').length;
    const expiringCerts = MOCK_CERTS.filter(c => c.status === 'expiring').length;
    const expiredCerts = MOCK_CERTS.filter(c => c.status === 'expired').length;

    // 模块名称映射
    const MODULE_LABELS: Record<string, string> = { basic: '基础信息管理', cert: '资格证书管理', panorama: '全景数字档案', workbench: '审核工作台' };
    const moduleLabel = MODULE_LABELS[activeModule] || '';

    // 二级菜单配置（从 data.ts 导入）

    // ===== 渲染导航栏 =====
    const renderNavbar = () => (
        <nav className="yta-navbar">
            <div className="yta-navbar-brand">
                <div className="yta-navbar-logo"><StarLogo /></div>
                <div><div className="yta-navbar-title">中国演艺人才管理与服务平台</div><div className="yta-navbar-subtitle">TALENT MANAGEMENT</div></div>
            </div>
            <div className="yta-navbar-menu">
                {NAV_ITEMS.map(item => {
                    const subs = SUB_MENUS[item.key];
                    return (
                        <div key={item.key} className={`yta-navbar-menu-item${activeNav === item.key ? ' active' : ''}${subs ? ' has-sub' : ''}`}
                            onClick={() => { if (!subs) { setActiveNav(item.key); emit('onNavClick', { key: item.key }); const r = NAV_ROUTES[item.key]; if (r && item.key !== activeNav) window.location.href = r; } }}>
                            {item.label}{subs && <ChevDown />}
                            {subs && (
                                <div className="yta-submenu">
                                    {subs.map(sub => (
                                        <div key={sub.key}
                                            className={`yta-submenu-item${activeModule === sub.key ? ' active' : ''}`}
                                            onClick={(e: any) => { e.stopPropagation(); setActiveModule(sub.key); setActiveNav(item.key); }}>
                                            {sub.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="yta-navbar-actions">
                <div className="yta-navbar-notification"><BellIcon /><span className="yta-navbar-badge">5</span></div>
                <div className="yta-navbar-divider" />
                <div className="yta-navbar-user"><div className="yta-navbar-avatar">{userName.charAt(0)}</div><span className="yta-navbar-username">{userName}</span></div>
            </div>
        </nav>
    );

    // ===== 基础信息管理模块 =====
    const renderBasic = () => (
        <>
            <div className="yta-stats-grid cols-3" style={{ marginTop: 0 }}>
                <div className="yta-stat-card"><div className="yta-stat-label">总注册人数</div><div className="yta-stat-value">{totalUsers}<span className="unit">人</span></div><div className="yta-stat-footer">较上月 <span className="up">+12%</span></div></div>
                <div className="yta-stat-card"><div className="yta-stat-label">本月新增</div><div className="yta-stat-value">{newUsers}<span className="unit">人</span></div><div className="yta-stat-footer">较上月 <span className="up">+3</span></div></div>
                <div className="yta-stat-card"><div className="yta-stat-label">已认证人数</div><div className="yta-stat-value">{verifiedUsers}<span className="unit">人</span></div><div className="yta-stat-footer">认证率 <span className="up">{((verifiedUsers / totalUsers) * 100).toFixed(0)}%</span></div></div>
            </div>
            <div className="yta-filter-card">
                <div className="yta-filter-grid">
                    <div className="yta-filter-item"><label className="yta-filter-label">姓名</label><input className="yta-filter-input" placeholder="搜索姓名" value={fName} onChange={(e: any) => setFName(e.target.value)} /></div>
                    <div className="yta-filter-item"><label className="yta-filter-label">认证状态</label><select className="yta-filter-select" value={fAuth} onChange={(e: any) => setFAuth(e.target.value)}><option value="all">全部</option><option value="pending">待审核</option><option value="verified">已认证</option><option value="rejected">已驳回</option><option value="frozen">已冻结</option></select></div>
                    <div className="yta-filter-item"><label className="yta-filter-label">专业方向</label><select className="yta-filter-select" value={fSpec} onChange={(e: any) => setFSpec(e.target.value)}><option value="all">全部</option><option value="电影">电影</option><option value="电视剧">电视剧</option><option value="舞台剧">舞台剧</option><option value="综艺">综艺</option><option value="配音">配音</option></select></div>
                    <div className="yta-filter-item" />
                </div>
                <div className="yta-filter-actions">
                    <button className="yta-btn yta-btn-default" onClick={() => { setFName(''); setFAuth('all'); setFSpec('all'); }}><RefreshIcon /> 重置</button>
                    <button className="yta-btn yta-btn-default"><ExportIcon /> 导出</button>
                    <button className="yta-btn yta-btn-primary"><SearchIcon /> 搜索</button>
                </div>
            </div>
            <div className="yta-table-card">
                <div className="yta-table-header"><div className="yta-table-title">人员列表<span className="yta-table-count">共 {filteredUsers.length} 人</span></div></div>
                <div className="yta-table-wrapper">
                    <table className="yta-table"><thead><tr>
                        <th style={{ width: 50 }}>序号</th><th style={{ width: 50 }}>头像</th><th style={{ width: 90 }}>姓名</th><th style={{ width: 50 }}>性别</th><th style={{ width: 110 }}>手机号</th><th style={{ width: 80 }}>用户类型</th><th style={{ width: 90 }}>认证状态</th><th style={{ width: 70 }}>证书数</th><th style={{ width: 140 }}>注册时间</th><th style={{ width: 170 }}>操作</th>
                    </tr></thead><tbody>
                            {filteredUsers.map((u, i) => (
                                <tr key={u.user_id}>
                                    <td>{i + 1}</td>
                                    <td><div className="yta-avatar-sm">{u.real_name.charAt(0)}</div></td>
                                    <td><span style={{ fontWeight: 600, color: '#B8292F', cursor: 'pointer' }} onClick={() => { setActiveModule('panorama'); }}>{u.real_name}</span></td>
                                    <td>{u.gender}</td><td>{u.phone}</td>
                                    <td><span className="yta-type-tag actor">演员</span></td>
                                    <td><span className={`yta-tag ${u.auth_status}`}><span className="yta-tag-dot" />{AUTH_STATUS_MAP[u.auth_status]}</span></td>
                                    <td style={{ fontWeight: 600 }}>{u.cert_count}</td>
                                    <td style={{ fontSize: 12 }}>{u.register_time}</td>
                                    <td><div className="yta-table-actions">
                                        <button className="yta-btn-text" onClick={() => { setActiveModule('panorama'); emit('onViewArchive', { user_id: u.user_id }); }}>档案</button>
                                        <button className="yta-btn-text" style={{ color: '#3B7DD8' }}>编辑</button>
                                        {u.auth_status === 'verified' && <button className="yta-btn-text" style={{ color: '#D13438' }} onClick={() => { setModalTarget(u); setShowModal('freeze'); }}>冻结</button>}
                                        {u.auth_status === 'frozen' && <button className="yta-btn-text" style={{ color: '#30A46C' }} onClick={() => { setModalTarget(u); setShowModal('unfreeze'); }}>解冻</button>}
                                    </div></td>
                                </tr>
                            ))}
                        </tbody></table>
                </div>
                <div className="yta-pagination"><div className="yta-pagination-info">共 {filteredUsers.length} 人，第 1 / 1 页</div><div className="yta-pagination-pages"><button className="yta-page-btn disabled"><ChevL /></button><button className="yta-page-btn active">1</button><button className="yta-page-btn disabled"><ChevR /></button></div></div>
            </div>
        </>
    );

    // ===== 资格证书管理模块 =====
    const renderCert = () => (
        <>
            <div className="yta-stats-grid cols-4">
                <div className="yta-stat-card"><div className="yta-stat-label">有效演员证</div><div className="yta-stat-value">{validActor}<span className="unit">张</span></div></div>
                <div className="yta-stat-card"><div className="yta-stat-label">有效专业资格证</div><div className="yta-stat-value">{validTech}<span className="unit">张</span></div></div>
                <div className="yta-stat-card"><div className="yta-stat-label">即将到期</div><div className="yta-stat-value" style={{ color: '#F5A623' }}>{expiringCerts}<span className="unit">张</span></div></div>
                <div className="yta-stat-card"><div className="yta-stat-label">已过期</div><div className="yta-stat-value" style={{ color: '#D13438' }}>{expiredCerts}<span className="unit">张</span></div></div>
            </div>
            <div className="yta-filter-card">
                <div className="yta-filter-grid">
                    <div className="yta-filter-item"><label className="yta-filter-label">持证人姓名</label><input className="yta-filter-input" placeholder="搜索姓名" value={fHolder} onChange={(e: any) => setFHolder(e.target.value)} /></div>
                    <div className="yta-filter-item"><label className="yta-filter-label">证书类型</label><select className="yta-filter-select" value={fCertType} onChange={(e: any) => setFCertType(e.target.value)}><option value="all">全部</option><option value="actor_cert">演员资格证</option><option value="tech_cert">专业技术资格证书</option></select></div>
                    <div className="yta-filter-item"><label className="yta-filter-label">证书状态</label><select className="yta-filter-select" value={fCertStatus} onChange={(e: any) => setFCertStatus(e.target.value)}><option value="all">全部</option><option value="valid">有效</option><option value="expiring">即将到期</option><option value="expired">已过期</option><option value="suspended">暂停</option><option value="revoked">吊销</option></select></div>
                    <div className="yta-filter-item" />
                </div>
                <div className="yta-filter-actions">
                    <button className="yta-btn yta-btn-default" onClick={() => { setFHolder(''); setFCertType('all'); setFCertStatus('all'); }}><RefreshIcon /> 重置</button>
                    <button className="yta-btn yta-btn-default"><ExportIcon /> 导出</button>
                    <button className="yta-btn yta-btn-primary"><SearchIcon /> 搜索</button>
                </div>
            </div>
            <div className="yta-table-card">
                <div className="yta-table-header"><div className="yta-table-title">证书列表<span className="yta-table-count">共 {filteredCerts.length} 条</span></div></div>
                <div className="yta-table-wrapper">
                    <table className="yta-table"><thead><tr>
                        <th style={{ width: 50 }}>序号</th><th style={{ width: 140 }}>证书编号</th><th style={{ width: 90 }}>持证人</th><th style={{ width: 120 }}>证书类型</th><th style={{ width: 60 }}>等级</th><th style={{ width: 100 }}>发证日期</th><th style={{ width: 100 }}>有效期至</th><th style={{ width: 80 }}>剩余天数</th><th style={{ width: 80 }}>状态</th><th style={{ width: 150 }}>操作</th>
                    </tr></thead><tbody>
                            {filteredCerts.map((c, i) => (
                                <tr key={c.cert_id}>
                                    <td>{i + 1}</td><td style={{ fontWeight: 600, fontSize: 12 }}>{c.cert_no}</td>
                                    <td><span style={{ color: '#B8292F', cursor: 'pointer', fontWeight: 600 }}>{c.holder_name}</span></td>
                                    <td><span className={`yta-type-tag ${c.cert_type}`}>{CERT_TYPE_MAP[c.cert_type]}</span></td>
                                    <td>{c.cert_level || '—'}</td><td style={{ fontSize: 12 }}>{c.issue_date}</td><td style={{ fontSize: 12 }}>{c.expiry_date}</td>
                                    <td style={{ fontWeight: 600, color: c.remaining_days <= 90 ? '#D13438' : c.remaining_days <= 180 ? '#F5A623' : 'inherit' }}>{c.remaining_days > 0 ? c.remaining_days : '已过期'}</td>
                                    <td><span className={`yta-tag ${c.status}`}><span className="yta-tag-dot" />{CERT_STATUS_MAP[c.status]}</span></td>
                                    <td><div className="yta-table-actions">
                                        <button className="yta-btn-text">详情</button>
                                        {c.status === 'valid' && <button className="yta-btn-text" style={{ color: '#F5A623' }}>暂停</button>}
                                        {c.status === 'suspended' && <button className="yta-btn-text" style={{ color: '#30A46C' }}>恢复</button>}
                                        {['valid', 'expiring'].includes(c.status) && <button className="yta-btn-text" style={{ color: '#D13438' }} onClick={() => { setModalTarget(c); setModalComment(''); setShowModal('revoke'); }}>吊销</button>}
                                    </div></td>
                                </tr>
                            ))}
                        </tbody></table>
                </div>
                <div className="yta-pagination"><div className="yta-pagination-info">共 {filteredCerts.length} 条，第 1 / 1 页</div><div className="yta-pagination-pages"><button className="yta-page-btn disabled"><ChevL /></button><button className="yta-page-btn active">1</button><button className="yta-page-btn disabled"><ChevR /></button></div></div>
            </div>
        </>
    );

    // ===== 全景数字档案模块 =====
    const u = PANORAMA_USER;
    const renderPanorama = () => (
        <>
            {/* 顶部概要 */}
            <div className="yta-profile-header">
                <div className="yta-profile-avatar">{u.real_name.charAt(0)}</div>
                <div className="yta-profile-info">
                    <div className="yta-profile-name">{u.real_name}<span className={`yta-tag ${u.auth_status}`}><span className="yta-tag-dot" />{AUTH_STATUS_MAP[u.auth_status]}</span></div>
                    <div className="yta-profile-meta"><span>性别：{u.gender}</span><span>出生：{u.birth}</span><span>专业：{u.speciality}</span><span>从业：{u.work_years}年</span><span>经纪：{u.agency}</span></div>
                </div>
                <div className="yta-profile-score">
                    <div className="yta-profile-score-ring"><svg width="72" height="72"><circle cx="36" cy="36" r="30" fill="none" stroke="#F0ECE8" strokeWidth="6" /><circle cx="36" cy="36" r="30" fill="none" stroke="#B8292F" strokeWidth="6" strokeDasharray={`${u.health_score / 100 * 188.5} 188.5`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px' }} /></svg><div className="yta-profile-score-value">{u.health_score}</div></div>
                    <div className="yta-profile-score-label">档案健康度</div>
                </div>
            </div>
            {/* 雷达图 + 优化建议 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="yta-radar-card"><div className="yta-radar-title">多维度评分</div><div className="yta-radar-container"><RadarChart scores={u.scores} /></div></div>
                <div className="yta-suggestion-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="yta-suggestion-title">💡 档案优化建议</div>
                    <div className="yta-suggestion-list" style={{ flex: 1 }}>
                        {u.scores.honor < 80 && <div>• 荣誉积累得分偏低（{u.scores.honor}分），建议积极参与公益活动或申报行业荣誉</div>}
                        {u.scores.training < 80 && <div>• 培训完成度有待提升（{u.scores.training}分），建议完成剩余必修课程</div>}
                        {u.scores.info < 100 && <div>• 个人信息尚未100%完善（{u.scores.info}分），建议补充完整从业信息</div>}
                        <div>• 合规状态良好，无违规记录</div>
                        <div>• 考核成绩优秀（{u.scores.exam}分），继续保持</div>
                    </div>
                </div>
            </div>
            {/* Tab 导航 */}
            <div className="yta-tab-bar">
                {[['info', '基本信息'], ['cert', '证书记录'], ['training', '培训记录'], ['exam', '考核记录'], ['honor', '荣誉记录'], ['board', '红黑榜'], ['mental', '心理健康']].map(([k, l]) => (
                    <div key={k} className={`yta-tab-item${pTab === k ? ' active' : ''}`} onClick={() => setPTab(k)}>{l}</div>
                ))}
            </div>
            {/* Tab 内容 */}
            {pTab === 'info' && <div className="yta-detail-grid">
                {[['姓名', u.real_name], ['性别', u.gender], ['出生日期', u.birth], ['手机号', u.phone], ['身份证号', u.id_card], ['专业方向', u.speciality], ['从业年限', `${u.work_years}年`], ['经纪公司', u.agency]].map(([l, v]) => (
                    <div key={l} className="yta-detail-group"><div className="yta-detail-label">{l}</div><div className="yta-detail-value">{v}</div></div>
                ))}
                <div className="yta-detail-group" style={{ gridColumn: 'span 2' }}><div className="yta-detail-label">个人简介</div><div className="yta-detail-value">{u.bio}</div></div>
            </div>}
            {pTab === 'cert' && <table className="yta-table"><thead><tr><th>证书编号</th><th>证书类型</th><th>发证日期</th><th>有效期至</th><th>状态</th></tr></thead><tbody>{PANORAMA_CERTS.map((c, i) => <tr key={i}><td style={{ fontWeight: 600 }}>{c.cert_no}</td><td>{c.cert_type}</td><td>{c.issue_date}</td><td>{c.expiry_date}</td><td><span className={`yta-tag ${c.status}`}><span className="yta-tag-dot" />{CERT_STATUS_MAP[c.status]}</span></td></tr>)}</tbody></table>}
            {pTab === 'training' && <table className="yta-table"><thead><tr><th>课程名称</th><th>分类</th><th>报名时间</th><th>状态</th><th style={{ width: 120 }}>进度</th><th>完成时间</th><th>均分</th></tr></thead><tbody>{PANORAMA_TRAININGS.map((t, i) => <tr key={i}><td style={{ fontWeight: 600 }}>{t.course}</td><td>{t.category}</td><td>{t.enroll}</td><td>{t.status}</td><td><div className="yta-progress-bar"><div className="yta-progress-track"><div className="yta-progress-fill" style={{ width: `${t.progress}%`, background: getProgressColor(t.progress) }} /></div><span className="yta-progress-text">{t.progress}%</span></div></td><td>{t.finish}</td><td style={{ fontWeight: 600 }}>{t.avg_score}</td></tr>)}</tbody></table>}
            {pTab === 'exam' && <table className="yta-table"><thead><tr><th>考核名称</th><th>类型</th><th>时间</th><th>得分</th><th>是否通过</th><th>有效期至</th></tr></thead><tbody>{PANORAMA_EXAMS.map((e, i) => <tr key={i}><td style={{ fontWeight: 600 }}>{e.exam}</td><td>{e.type}</td><td>{e.time}</td><td style={{ fontWeight: 700 }}>{e.score}</td><td>{e.passed ? '✅' : '❌'}</td><td>{e.valid_until}</td></tr>)}</tbody></table>}
            {pTab === 'honor' && <table className="yta-table"><thead><tr><th>荣誉名称</th><th>类型</th><th>颁发机构</th><th>获得时间</th><th>审核状态</th></tr></thead><tbody>{PANORAMA_HONORS.map((h, i) => <tr key={i}><td style={{ fontWeight: 600 }}>{h.name}</td><td>{h.type}</td><td>{h.org}</td><td>{h.time}</td><td><span className="yta-tag verified"><span className="yta-tag-dot" />已通过</span></td></tr>)}</tbody></table>}
            {pTab === 'board' && <div className="yta-empty">🎉 暂无红黑榜记录，合规状态良好</div>}
            {pTab === 'mental' && <table className="yta-table"><thead><tr><th>测评名称</th><th>时间</th><th>综合评分</th><th>等级</th><th>建议</th></tr></thead><tbody>{PANORAMA_MENTAL.map((m, i) => <tr key={i}><td style={{ fontWeight: 600 }}>{m.name}</td><td>{m.time}</td><td style={{ fontWeight: 700 }}>{m.score}</td><td><span className="yta-tag verified"><span className="yta-tag-dot" />{m.level}</span></td><td style={{ fontSize: 12 }}>{m.suggestion}</td></tr>)}</tbody></table>}
        </>
    );

    // ===== 审核工作台模块 =====
    const renderWorkbench = () => (
        <>
            <div className="yta-tab-bar">
                {[['pending', '待审核'], ['done', '已处理'], ['all', '全部']].map(([k, l]) => (
                    <div key={k} className={`yta-tab-item${wTab === k ? ' active' : ''}`} onClick={() => setWTab(k)}>{l}</div>
                ))}
            </div>
            <div className="yta-filter-card" style={{ borderRadius: 'var(--card-radius) var(--card-radius) 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label className="yta-filter-label" style={{ marginBottom: 0 }}>事项类型</label>
                    <select className="yta-filter-select" value={wType} onChange={(e: any) => setWType(e.target.value)} style={{ width: 200 }}><option value="all">全部</option><option value="cert_verify">证书验证</option><option value="honor_review">荣誉审核</option><option value="appeal">申诉处理</option><option value="info_change">信息变更</option></select>
                </div>
            </div>
            <div className="yta-table-card">
                <div className="yta-table-header"><div className="yta-table-title">审核事项<span className="yta-table-count">共 {filteredItems.length} 项</span></div></div>
                <div className="yta-table-wrapper">
                    <table className="yta-table"><thead><tr>
                        <th style={{ width: 50 }}>序号</th><th style={{ width: 90 }}>事项类型</th><th style={{ width: 260 }}>标题</th><th style={{ width: 80 }}>提交人</th><th style={{ width: 140 }}>提交时间</th><th style={{ width: 60 }}>优先级</th><th style={{ width: 80 }}>状态</th><th style={{ width: 120 }}>操作</th>
                    </tr></thead><tbody>
                            {filteredItems.map((w, i) => (
                                <tr key={w.id}>
                                    <td>{i + 1}</td>
                                    <td><span className={`yta-type-tag ${w.item_type === 'cert_verify' ? 'tech_cert' : w.item_type === 'honor_review' ? 'actor_cert' : 'actor'}`}>{ITEM_TYPE_MAP[w.item_type]}</span></td>
                                    <td style={{ fontWeight: 500 }}>{w.title}</td><td>{w.submitter}</td><td style={{ fontSize: 12 }}>{w.submit_time}</td>
                                    <td><span className={`yta-tag ${w.priority}`}>{PRIORITY_MAP[w.priority]}</span></td>
                                    <td><span className={`yta-tag ${w.status}`}><span className="yta-tag-dot" />{WORKBENCH_STATUS_MAP[w.status]}</span></td>
                                    <td><div className="yta-table-actions">
                                        {w.status === 'pending' && <button className="yta-btn-text" onClick={() => { setModalTarget(w); setModalComment(''); setShowModal('review'); }}>处理</button>}
                                        <button className="yta-btn-text" style={{ color: '#3B7DD8' }}>查看</button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody></table>
                </div>
                <div className="yta-pagination"><div className="yta-pagination-info">共 {filteredItems.length} 项</div><div className="yta-pagination-pages"><button className="yta-page-btn disabled"><ChevL /></button><button className="yta-page-btn active">1</button><button className="yta-page-btn disabled"><ChevR /></button></div></div>
            </div>
        </>
    );

    return (
        <div className="yta-root">
            {renderNavbar()}
            {/* 主内容区（无侧边栏） */}
            <div className="yta-content">
                <div className="yta-breadcrumb">
                    <span className="yta-breadcrumb-item" onClick={() => { window.location.href = NAV_ROUTES.home; }}>首页</span><span style={{ color: '#bfbfbf' }}>/</span>
                    <span className="yta-breadcrumb-item">人才数字档案</span><span style={{ color: '#bfbfbf' }}>/</span>
                    <span className="yta-breadcrumb-item current">{moduleLabel}</span>
                </div>
                <div className="yta-page-header">
                    <div className="yta-page-title">{moduleLabel}</div>
                    <div className="yta-page-desc">
                        {activeModule === 'basic' && '查看和管理平台所有注册人员基本信息'}
                        {activeModule === 'cert' && '查看所有注册人员证书持有情况汇总'}
                        {activeModule === 'panorama' && '整合人才全维度信息，形成360度全景画像'}
                        {activeModule === 'workbench' && '处理各类上报和审核事项'}
                    </div>
                </div>
                {activeModule === 'basic' && renderBasic()}
                {activeModule === 'cert' && renderCert()}
                {activeModule === 'panorama' && renderPanorama()}
                {activeModule === 'workbench' && renderWorkbench()}
            </div>
            {/* 页脚 */}
            <footer className="yta-footer"><div className="yta-footer-inner"><div><span className="org-name">中国广播电视社会组织联合会演员委员会</span><br />© 2026 中国演艺人才管理与服务平台 版权所有</div><div className="yta-footer-right"><span>客服电话：010-XXXX-XXXX</span><span>官方邮箱：service@yanyuan.org.cn</span></div></div></footer>

            {/* ===== 弹窗：冻结/解冻确认 ===== */}
            {(showModal === 'freeze' || showModal === 'unfreeze') && modalTarget && (
                <div className="yta-modal-overlay" onClick={() => setShowModal('')}><div className="yta-modal" onClick={(e: any) => e.stopPropagation()}>
                    <div className="yta-modal-header"><div className="yta-modal-title">{showModal === 'freeze' ? '确认冻结账号' : '确认解冻账号'}</div><button className="yta-modal-close" onClick={() => setShowModal('')}><CloseIcon /></button></div>
                    <div className="yta-modal-body"><p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{showModal === 'freeze' ? `确认冻结用户「${modalTarget.real_name}」的账号？冻结后该用户将无法登录平台。` : `确认解冻用户「${modalTarget.real_name}」的账号？解冻后该用户可正常使用平台。`}</p></div>
                    <div className="yta-modal-footer"><button className="yta-btn yta-btn-default" onClick={() => setShowModal('')}>取消</button><button className={`yta-btn ${showModal === 'freeze' ? 'yta-btn-danger' : 'yta-btn-success'}`} onClick={() => { emit(showModal === 'freeze' ? 'onFreeze' : 'onUnfreeze', { user_id: modalTarget.user_id }); setShowModal(''); }}>确认{showModal === 'freeze' ? '冻结' : '解冻'}</button></div>
                </div></div>
            )}
            {/* ===== 弹窗：吊销证书 ===== */}
            {showModal === 'revoke' && modalTarget && (
                <div className="yta-modal-overlay" onClick={() => setShowModal('')}><div className="yta-modal" onClick={(e: any) => e.stopPropagation()}>
                    <div className="yta-modal-header"><div className="yta-modal-title">吊销证书</div><button className="yta-modal-close" onClick={() => setShowModal('')}><CloseIcon /></button></div>
                    <div className="yta-modal-body">
                        <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>确认吊销证书「{modalTarget.cert_no}」？此操作不可撤销。</p>
                        <div className="yta-form-group"><label className="yta-form-label">吊销原因 <span style={{ color: '#D13438' }}>*</span></label><textarea className="yta-form-textarea" placeholder="请填写吊销原因" value={modalComment} onChange={(e: any) => setModalComment(e.target.value)} /></div>
                    </div>
                    <div className="yta-modal-footer"><button className="yta-btn yta-btn-default" onClick={() => setShowModal('')}>取消</button><button className="yta-btn yta-btn-danger" onClick={() => { emit('onRevokeCert', { cert_id: modalTarget.cert_id, reason: modalComment }); setShowModal(''); }}>确认吊销</button></div>
                </div></div>
            )}
            {/* ===== 弹窗：审核处理 ===== */}
            {showModal === 'review' && modalTarget && (
                <div className="yta-modal-overlay" onClick={() => setShowModal('')}><div className="yta-modal" style={{ width: 560 }} onClick={(e: any) => e.stopPropagation()}>
                    <div className="yta-modal-header"><div className="yta-modal-title">审核处理</div><button className="yta-modal-close" onClick={() => setShowModal('')}><CloseIcon /></button></div>
                    <div className="yta-modal-body">
                        <div style={{ padding: 14, background: '#FDFBF9', borderRadius: 10, border: '1px solid #F0ECE8', marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>事项标题</div>
                            <div style={{ fontWeight: 600 }}>{modalTarget.title}</div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: '#999' }}><span>提交人：{modalTarget.submitter}</span><span>时间：{modalTarget.submit_time}</span></div>
                        </div>
                        <div className="yta-form-group"><label className="yta-form-label">处理意见 <span style={{ color: '#D13438' }}>*</span></label><textarea className="yta-form-textarea" placeholder="请填写处理意见" value={modalComment} onChange={(e: any) => setModalComment(e.target.value)} /></div>
                    </div>
                    <div className="yta-modal-footer"><button className="yta-btn yta-btn-default" onClick={() => setShowModal('')}>返回</button><button className="yta-btn yta-btn-danger" onClick={() => setShowModal('')}>驳回</button><button className="yta-btn yta-btn-success" onClick={() => setShowModal('')}>通过</button></div>
                </div></div>
            )}
        </div>
    );
});

export default Component;
