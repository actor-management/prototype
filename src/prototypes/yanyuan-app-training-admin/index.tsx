/**
 * @name 演艺人才平台 - 培训考核管理台 (Admin专用)
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.5
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
    ChevronLeft, BookOpen, FileCheck2, UserCheck, X, ArrowDownToLine, Users, CheckCircle2,
    Eye, MoreHorizontal, Search, Settings, ChevronRight
} from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_back', desc: '点击返回' },
    { name: 'on_course_action', desc: '课程上下架操作' },
    { name: 'on_review_open', desc: '打开试卷批阅' },
    { name: 'on_review_submit', desc: '提交批阅成绩' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_tab', desc: '当前Tab页签' }, { name: 'drawer_open', desc: '是否打开抽屉' }];

// 测试数据
var coursesData = [
    { id: 'c1', title: '艺德修养培训（第三期）', status: 'published', students: 125, date: '2026-03-01' },
    { id: 'c2', title: '影视行业法律法规解读', status: 'published', students: 89, date: '2026-02-15' },
    { id: 'c3', title: '2026行业准则草案宣贯', status: 'draft', students: 0, date: '2026-04-05' },
    { id: 'c4', title: '表演基础技巧（第一期）', status: 'offline', students: 210, date: '2025-11-01' }
];

var examsData = [
    { id: 'e1', title: '艺德结业考核', course: '艺德修养培训（第三期）', pendingReview: 15, attended: 120, total: 125, status: 'ongoing' },
    { id: 'e2', title: '法规通识统考', course: '影视行业法律法规解读', pendingReview: 0, attended: 89, total: 89, status: 'ended' },
    { id: 'e3', title: '普法随堂测验', course: '知识产权普及课', pendingReview: 2, attended: 45, total: 50, status: 'ongoing' }
];

// 学生列表数据
var studentsData = [
    { id: 's1', name: '李明', time: '12.5h', score: 95, progress: 100 },
    { id: 's2', name: '王华', time: '8.0h', score: 80, progress: 85 },
    { id: 's3', name: '赵强', time: '3.5h', score: null, progress: 20 },
    { id: 's4', name: '张伟', time: '0h', score: null, progress: 0 }
];

function navigateTo(path: string) { window.location.href = path; }

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanTrainingAdmin(innerProps: AxureProps, ref: React.Ref<AxureHandle>) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var tabState = useState<number>(0);
    var currentTab = tabState[0];
    var setCurrentTab = tabState[1];

    var sheetState = useState<{ type: 'none' | 'students' | 'review', targetId: string | null }>({ type: 'none', targetId: null });
    var sheetData = sheetState[0];
    var setSheetData = sheetState[1];

    var reviewScoreState = useState<string>('');
    var setReviewScore = reviewScoreState[1];

    var toastState = useState<{ show: boolean, msg: string }>({ show: false, msg: '' });
    var toast = toastState[0];
    var setToast = toastState[1];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { /* */ }
    }, [onEventHandler]);

    var handleBack = useCallback(() => {
        emitEvent('on_back');
        window.history.back();
    }, [emitEvent]);

    var showToast = (msg: string) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 2000);
    };

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) {
                if (n === 'current_tab') return currentTab;
                if (n === 'drawer_open') return sheetData.type !== 'none';
                return undefined;
            },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: [], dataList: []
        };
    }, [currentTab, sheetData.type]);

    var renderCourseCard = (course: any) => {
        return (
            <div key={course.id} className="yanyuan-ta-card">
                <div className="yanyuan-ta-card-body">
                    <div className="yanyuan-ta-card-title">{course.title}</div>
                    <div className="yanyuan-ta-card-meta">
                        <div className="ta-meta-item"><Users size={14} /> 报名学员 {course.students} 人</div>
                    </div>
                </div>
                <div className="yanyuan-ta-card-footer">
                    <div className={`ta-status-tag ${course.status}`}>
                        {course.status === 'published' ? '上架中' : (course.status === 'draft' ? '草稿' : '已下架')}
                    </div>
                    <div className="ta-actions">
                        <button className="ta-btn text" onClick={() => setSheetData({ type: 'students', targetId: course.id })}>学员进度</button>
                        <button className="ta-btn primary" onClick={() => {
                            var statusMap: any = { published: '下架', draft: '发布', offline: '重新上架' };
                            emitEvent('on_course_action', course.id);
                            showToast(`已${statusMap[course.status]}`);
                        }}>{course.status === 'published' ? '强制下架' : '发布上架'}</button>
                    </div>
                </div>
            </div>
        );
    };

    var renderExamCard = (exam: any) => {
        return (
            <div key={exam.id} className="yanyuan-ta-card">
                <div className="yanyuan-ta-card-body">
                    <div className="yanyuan-ta-card-title">{exam.title}</div>
                    <div className="yanyuan-ta-card-meta">
                        <div className="ta-meta-item"><BookOpen size={14} /> 关联：{exam.course}</div>
                        <div className="ta-meta-item"><Users size={14} /> 参考：{exam.attended} / {exam.total} 人</div>
                    </div>
                </div>
                <div className="yanyuan-ta-card-footer">
                    <div className={`ta-status-tag ${exam.status}`}>
                        {exam.status === 'ongoing' ? '进行中' : '已结束'}
                    </div>
                    <div className="ta-actions">
                        {exam.pendingReview > 0 ? (
                            <button className="ta-btn danger" onClick={() => {
                                setReviewScore('');
                                setSheetData({ type: 'review', targetId: exam.id });
                                emitEvent('on_review_open', exam.id);
                            }}>
                                {exam.pendingReview} 份待批阅
                            </button>
                        ) : (
                            <button className="ta-btn disabled">已批完</button>
                        )}
                        <button className="ta-btn text">成绩单</button>
                    </div>
                </div>
            </div>
        );
    };

    var renderStudentsSheet = () => {
        return (
            <div className="yanyuan-ta-sheet-wrap">
                <div className="yanyuan-ta-sheet-header">
                    <div className="ta-sheet-title">学员进度详情</div>
                    <X className="ta-sheet-close" size={24} onClick={() => setSheetData({ type: 'none', targetId: null })} />
                </div>
                <div className="yanyuan-ta-sheet-content">
                    <div className="ta-search-bar"><Search size={16} /> <input type="text" placeholder="搜索学员姓名/编号" /></div>
                    <div className="ta-student-list">
                        {studentsData.map(s => (
                            <div key={s.id} className="ta-student-item">
                                <div className="ta-student-info">
                                    <div className="ta-student-name">{s.name}</div>
                                    <div className="ta-student-time">累计学习: {s.time}</div>
                                </div>
                                <div className="ta-student-score">
                                    <div className="ta-progress"><div className="ta-progress-bar" style={{ width: s.progress + '%' }}></div></div>
                                    <div className="ta-score-txt">{s.score !== null ? `${s.score}分` : (s.progress >= 100 ? '待考' : '未学完')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    var renderReviewSheet = () => {
        return (
            <div className="yanyuan-ta-sheet-wrap review">
                <div className="yanyuan-ta-sheet-header">
                    <div className="ta-sheet-title">主观题人工批阅</div>
                    <X className="ta-sheet-close" size={24} onClick={() => setSheetData({ type: 'none', targetId: null })} />
                </div>
                <div className="yanyuan-ta-sheet-content">
                    <div className="ta-review-candidate">
                        当前考生: <strong>王二晓</strong> (进度: 1/15)
                    </div>
                    <div className="ta-review-question">
                        <strong>题目5. (论述题, 15分)</strong><br />
                        请结合实际工作，论述影视从业人员应如何抵制“阴阳合同”、“天价片酬”等不良行业现象？
                    </div>
                    <div className="ta-review-answer">
                        【考生作答区】<br /><br />
                        首先，作为从业人员我们要树立正确的规范底线，不能触碰法律红线。其次要学习相关的税务法律法规，抵制劣迹艺人的行为模式。在签约前仔细审核合同内容，发现存在阴阳合同风险要主动拒绝...
                    </div>

                    <div className="ta-review-score-panel">
                        <div className="ta-score-control">
                            <label>本题打分 (满分15)：</label>
                            <input type="number" placeholder="输入分数" onChange={(e) => setReviewScore(e.target.value)} />
                        </div>
                        <div className="ta-score-control">
                            <label>评语 (选填)：</label>
                            <textarea placeholder="输入扣分原因或鼓励话语..." rows={2}></textarea>
                        </div>
                    </div>

                    <div className="ta-review-buttons">
                        <button className="ta-btn text">跳过本题</button>
                        <button className="ta-btn primary flex-1" onClick={() => {
                            showToast('批阅成功，加载下一题');
                            emitEvent('on_review_submit');
                            setTimeout(() => setSheetData({ type: 'none', targetId: null }), 600);
                        }}>提交打分并下一份</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="yanyuan-ta-container">
            {/* Header */}
            <div className="yanyuan-ta-header">
                <div className="yanyuan-ta-nav">
                    <div className="yanyuan-ta-back" onClick={handleBack}><ChevronLeft size={24} /></div>
                    <div className="yanyuan-ta-title">培训考务管理</div>
                    <div className="yanyuan-ta-right"><Search size={20} /></div>
                </div>
                <div className="yanyuan-ta-tabs">
                    <div className={`yanyuan-ta-tab ${currentTab === 0 ? 'active' : ''}`} onClick={() => setCurrentTab(0)}>
                        <BookOpen size={16} /> 课程管理
                    </div>
                    <div className={`yanyuan-ta-tab ${currentTab === 1 ? 'active' : ''}`} onClick={() => setCurrentTab(1)}>
                        <FileCheck2 size={16} /> 考核与批阅 <span className="ta-badge">15</span>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="yanyuan-ta-scroll">
                <div className="yanyuan-ta-list">
                    {currentTab === 0 ? coursesData.map(renderCourseCard) : examsData.map(renderExamCard)}
                </div>
            </div>

            {/* Bottom Sheet */}
            <div className={`yanyuan-ta-overlay ${sheetData.type !== 'none' ? 'show' : ''}`} onClick={() => setSheetData({ type: 'none', targetId: null })}></div>
            <div className={`yanyuan-ta-sheet ${sheetData.type !== 'none' ? 'show' : ''}`}>
                {sheetData.type === 'students' && renderStudentsSheet()}
                {sheetData.type === 'review' && renderReviewSheet()}
            </div>

            {/* Toast */}
            {toast.show && <div className="yanyuan-ta-toast">{toast.msg}</div>}
        </div>
    );
});

export default Component;
