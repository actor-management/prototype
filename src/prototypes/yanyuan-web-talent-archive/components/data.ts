/**
 * 人才数字档案管理台 - 示例数据与常量
 */

// ===== 导航菜单 =====
export const NAV_ITEMS = [
    { key: 'home', label: '首页' },
    { key: 'certification', label: '认证中心' },
    { key: 'certificate', label: '证书管理' },
    { key: 'evaluation', label: '职业能力评价' },
    { key: 'talent', label: '人才数字档案' },
    { key: 'org', label: '行业机构管理' },
    { key: 'finance', label: '财务管理' },
    { key: 'admin', label: '后台管理' },
];

export const NAV_ROUTES: Record<string, string> = {
    home: '/prototypes/yanyuan-web-dashboard',
    certification: '/prototypes/yanyuan-web-cert-manage',
    certificate: '/prototypes/yanyuan-web-cert-service',
    evaluation: '/prototypes/yanyuan-web-training-manage',
    talent: '/prototypes/yanyuan-web-talent-archive',
    org: '', finance: '', admin: '',
};

// ===== 二级菜单配置（全局共享） =====
export const SUB_MENUS: Record<string, { key: string; label: string }[]> = {
    talent: [
        { key: 'basic', label: '基础信息管理' },
        { key: 'cert', label: '资格证书管理' },
        { key: 'panorama', label: '全景数字档案' },
        { key: 'workbench', label: '审核工作台' },
    ],
};

// ===== 侧边菜单 =====
export const SIDEBAR_ITEMS = [
    { key: 'basic', label: '基础信息管理', icon: '👥' },
    { key: 'cert', label: '资格证书管理', icon: '📜' },
    { key: 'panorama', label: '全景数字档案', icon: '🔍' },
    { key: 'workbench', label: '审核工作台', icon: '📋' },
];

// ===== 状态映射 =====
export const AUTH_STATUS_MAP: Record<string, string> = {
    pending: '待审核', verified: '已认证', rejected: '已驳回', frozen: '已冻结',
};

export const CERT_STATUS_MAP: Record<string, string> = {
    valid: '有效', expiring: '即将到期', expired: '已过期', suspended: '暂停', revoked: '吊销',
};

export const CERT_TYPE_MAP: Record<string, string> = {
    actor_cert: '演员资格证', tech_cert: '专业技术资格证书',
};

export const ITEM_TYPE_MAP: Record<string, string> = {
    cert_verify: '证书验证', honor_review: '荣誉审核', appeal: '申诉处理', info_change: '信息变更',
};

export const PRIORITY_MAP: Record<string, string> = {
    high: '高', medium: '中', low: '低',
};

export const WORKBENCH_STATUS_MAP: Record<string, string> = {
    pending: '待审核', processing: '处理中', completed: '已完成', rejected: '已驳回',
};

// ===== 基础信息管理 - 人员列表 =====
export const MOCK_USERS = [
    { user_id: 'u1', photo: '', real_name: '张晓艺', gender: '女', phone: '138****1234', id_card: '110101****1234', user_type: 'actor', auth_status: 'verified', cert_count: 2, register_time: '2025-08-15 09:30', speciality: '电影' },
    { user_id: 'u2', photo: '', real_name: '李明辉', gender: '男', phone: '139****5678', id_card: '310101****5678', user_type: 'actor', auth_status: 'verified', cert_count: 1, register_time: '2025-09-20 14:00', speciality: '电视剧' },
    { user_id: 'u3', photo: '', real_name: '王舞台', gender: '男', phone: '137****9012', id_card: '440101****9012', user_type: 'actor', auth_status: 'pending', cert_count: 0, register_time: '2026-03-10 11:20', speciality: '舞台剧' },
    { user_id: 'u4', photo: '', real_name: '赵雅婷', gender: '女', phone: '136****3456', id_card: '330101****3456', user_type: 'actor', auth_status: 'verified', cert_count: 1, register_time: '2025-11-05 16:45', speciality: '综艺' },
    { user_id: 'u5', photo: '', real_name: '孙永刚', gender: '男', phone: '135****7890', id_card: '500101****7890', user_type: 'actor', auth_status: 'rejected', cert_count: 0, register_time: '2026-02-28 10:00', speciality: '配音' },
    { user_id: 'u6', photo: '', real_name: '刘佳慧', gender: '女', phone: '133****2345', id_card: '210101****2345', user_type: 'actor', auth_status: 'frozen', cert_count: 1, register_time: '2025-06-12 08:30', speciality: '电影' },
    { user_id: 'u7', photo: '', real_name: '陈思远', gender: '男', phone: '158****6789', id_card: '420101****6789', user_type: 'actor', auth_status: 'verified', cert_count: 3, register_time: '2025-07-01 09:00', speciality: '电视剧' },
    { user_id: 'u8', photo: '', real_name: '周丽华', gender: '女', phone: '166****0123', id_card: '350101****0123', user_type: 'actor', auth_status: 'pending', cert_count: 0, register_time: '2026-03-25 15:30', speciality: '舞台剧' },
];

// ===== 资格证书管理 =====
export const MOCK_CERTS = [
    { cert_id: 'c1', cert_no: 'AC-2026-000128', holder_name: '张晓艺', cert_type: 'actor_cert', cert_level: '', issue_date: '2026-01-15', expiry_date: '2029-01-15', remaining_days: 1022, status: 'valid' },
    { cert_id: 'c2', cert_no: 'TC-2025-000045', holder_name: '张晓艺', cert_type: 'tech_cert', cert_level: '三级', issue_date: '2025-06-20', expiry_date: '2028-06-20', remaining_days: 813, status: 'valid' },
    { cert_id: 'c3', cert_no: 'AC-2025-000089', holder_name: '李明辉', cert_type: 'actor_cert', cert_level: '', issue_date: '2025-09-10', expiry_date: '2028-09-10', remaining_days: 895, status: 'valid' },
    { cert_id: 'c4', cert_no: 'AC-2024-000012', holder_name: '赵雅婷', cert_type: 'actor_cert', cert_level: '', issue_date: '2024-03-05', expiry_date: '2026-05-05', remaining_days: 36, status: 'expiring' },
    { cert_id: 'c5', cert_no: 'TC-2023-000031', holder_name: '刘佳慧', cert_type: 'tech_cert', cert_level: '二级', issue_date: '2023-08-10', expiry_date: '2026-02-10', remaining_days: -48, status: 'expired' },
    { cert_id: 'c6', cert_no: 'AC-2025-000156', holder_name: '陈思远', cert_type: 'actor_cert', cert_level: '', issue_date: '2025-07-20', expiry_date: '2028-07-20', remaining_days: 843, status: 'valid' },
    { cert_id: 'c7', cert_no: 'TC-2025-000067', holder_name: '陈思远', cert_type: 'tech_cert', cert_level: '二级', issue_date: '2025-10-01', expiry_date: '2028-10-01', remaining_days: 916, status: 'suspended' },
    { cert_id: 'c8', cert_no: 'TC-2024-000089', holder_name: '陈思远', cert_type: 'tech_cert', cert_level: '三级', issue_date: '2024-05-15', expiry_date: '2027-05-15', remaining_days: 411, status: 'valid' },
];

// ===== 全景档案 - 示例人才 =====
export const PANORAMA_USER = {
    user_id: 'u1', real_name: '张晓艺', gender: '女', birth: '1995-06-15', phone: '138****1234',
    id_card: '110101****1234', auth_status: 'verified', speciality: '电影',
    work_years: 8, agency: '星光影业', bio: '毕业于中央戏剧学院表演系，先后参演多部影视作品。',
    health_score: 82,
    scores: { info: 95, cert: 85, training: 78, exam: 90, honor: 60, compliance: 100 },
};

export const PANORAMA_CERTS = [
    { cert_no: 'AC-2026-000128', cert_type: '演员资格证', issue_date: '2026-01-15', expiry_date: '2029-01-15', status: 'valid' },
    { cert_no: 'TC-2025-000045', cert_type: '专业技术资格证书(三级)', issue_date: '2025-06-20', expiry_date: '2028-06-20', status: 'valid' },
];

export const PANORAMA_TRAININGS = [
    { course: '演艺人员艺德修养（必修）', category: '艺德修养', enroll: '2026-02-01', status: '已完成', progress: 100, finish: '2026-03-10', avg_score: 92 },
    { course: '表演艺术基础理论', category: '演技培训', enroll: '2026-03-05', status: '进行中', progress: 67, finish: '—', avg_score: 88 },
    { course: '演艺行业法律法规（必修）', category: '法律法规', enroll: '2026-03-12', status: '进行中', progress: 45, finish: '—', avg_score: 85 },
];

export const PANORAMA_EXAMS = [
    { exam: '2026年度艺德考核(第一期)', type: '艺德考核', time: '2026-03-20', score: 88, passed: true, valid_until: '2027-03-20' },
    { exam: '2025年度表演能力考核', type: '表演能力', time: '2025-11-15', score: 92, passed: true, valid_until: '2026-11-15' },
];

export const PANORAMA_HONORS = [
    { name: '优秀青年演员', type: '称号', org: '中国演员委员会', time: '2025-12-20', status: 'approved' },
    { name: '最佳新人奖', type: '奖项', org: '金鸡百花电影节', time: '2025-09-10', status: 'approved' },
];

export const PANORAMA_BOARDS: any[] = [];

export const PANORAMA_MENTAL = [
    { name: '2026年度心理健康筛查', time: '2026-02-15', score: 85, level: '良好', suggestion: '建议保持良好心态，适当减压' },
];

// ===== 审核工作台 =====
export const MOCK_WORK_ITEMS = [
    { id: 'w1', item_type: 'honor_review', title: '荣誉审核：陈思远 - 优秀演艺工作者', submitter: '陈思远', submit_time: '2026-03-28 14:30', priority: 'medium', status: 'pending' },
    { id: 'w2', item_type: 'info_change', title: '信息变更：赵雅婷 - 联系方式更新', submitter: '赵雅婷', submit_time: '2026-03-28 10:15', priority: 'low', status: 'pending' },
    { id: 'w3', item_type: 'cert_verify', title: '证书验证：外部机构查询 TC-2025-000045', submitter: '北京影视公司', submit_time: '2026-03-27 16:00', priority: 'high', status: 'pending' },
    { id: 'w4', item_type: 'appeal', title: '申诉：李明辉 - 对驳回结果申诉', submitter: '李明辉', submit_time: '2026-03-27 09:30', priority: 'high', status: 'processing' },
    { id: 'w5', item_type: 'honor_review', title: '荣誉审核：张晓艺 - 最佳新人奖', submitter: '张晓艺', submit_time: '2026-03-26 11:00', priority: 'medium', status: 'completed' },
    { id: 'w6', item_type: 'cert_verify', title: '证书验证：外部机构查询 AC-2025-000089', submitter: '上海演艺集团', submit_time: '2026-03-25 15:20', priority: 'low', status: 'completed' },
    { id: 'w7', item_type: 'info_change', title: '信息变更：周丽华 - 从业信息补充', submitter: '周丽华', submit_time: '2026-03-29 08:45', priority: 'medium', status: 'pending' },
];
