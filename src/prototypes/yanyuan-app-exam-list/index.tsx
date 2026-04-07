/**
 * @name 演艺人才平台 - 考核列表
 * 参考：需求规格说明书 §5.5.3
 */
import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Search, Filter } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_exam_click', desc: '点击考核' },
    { name: 'on_enroll', desc: '报名' },
    { name: 'on_back', desc: '返回' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

// 可参加的考核
var availableExams = [
    {
        id: 'ex-1', name: '2026年第二季度表演能力考核', type: 'perform', typeLabel: '表演能力',
        time_window: '2026-04-15 ~ 2026-04-20', location: '线上考试', status: 'open',
        enroll_deadline: '2026-04-10', duration: '120分钟'
    },
    {
        id: 'ex-2', name: '2026年度艺德修养考评', type: 'yide', typeLabel: '艺德考评',
        time_window: '2026-05-10 ~ 2026-05-12', location: '线上考试', status: 'enrolled',
        enroll_deadline: '2026-05-05', duration: '90分钟'
    },
    {
        id: 'ex-3', name: '2026年第一季度心理健康测评', type: 'psych', typeLabel: '心理测评',
        time_window: '2026-04-01 ~ 2026-04-05', location: '线上测评', status: 'open',
        enroll_deadline: '2026-03-30', duration: '45分钟'
    }
];

// 我的考核记录
var myRecords = [
    {
        id: 'ex-r1', name: '2026年第一季度表演能力考核', type: 'perform', typeLabel: '表演能力',
        exam_date: '2026-01-20', score: 86, pass: true, status: 'completed'
    },
    {
        id: 'ex-r2', name: '2025年度艺德修养考评', type: 'yide', typeLabel: '艺德考评',
        exam_date: '2025-12-15', score: 92, pass: true, status: 'completed'
    },
    {
        id: 'ex-r3', name: '2025年心理健康测评（第四季度）', type: 'psych', typeLabel: '心理测评',
        exam_date: '2025-11-20', score: 78, pass: true, status: 'completed'
    }
];

function getStatusLabel(status: string): string {
    var m: Record<string, string> = { open: '可报名', enrolled: '已报名', completed: '已完成' };
    return m[status] || status;
}

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanExamList(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var tabState = useState<number>(0);
    var examTab = tabState[0];
    var setExamTab = tabState[1];

    var categoryState = useState<string>('全部');
    var activeCategory = categoryState[0];
    var setActiveCategory = categoryState[1];

    var CATEGORIES = ['全部', '表演能力', '艺德考评', '心理测评'];

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function () { return undefined; }, fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, []);

    var currentList = examTab === 0 ? availableExams : myRecords;

    // 二级分类筛选
    if (activeCategory !== '全部') {
        currentList = currentList.filter(function (ex) {
            return ex.typeLabel === activeCategory;
        });
    }

    return (
        <div className="yanyuan-exam-container">
            <div className="yanyuan-exam-scroll">
                <div className="yanyuan-exam-nav">
                    <div className="yanyuan-exam-nav-back" onClick={function () { emitEvent('on_back'); window.history.back(); }}>
                        <ArrowLeft size={20} color="#1A1A2E" />
                    </div>
                    <div className="yanyuan-exam-nav-title">考核中心</div>
                </div>

                <div className="yanyuan-exam-tabs">
                    <div className={'yanyuan-exam-tab' + (examTab === 0 ? ' active' : '')}
                        onClick={function () { setExamTab(0); setActiveCategory('全部'); }}>可参加</div>
                    <div className={'yanyuan-exam-tab' + (examTab === 1 ? ' active' : '')}
                        onClick={function () { setExamTab(1); setActiveCategory('全部'); }}>我的记录</div>
                </div>

                {/* 搜索与高级过滤 */}
                <div className="yanyuan-exam-toolbar">
                    <div className="yanyuan-exam-search">
                        <Search size={16} />
                        <input type="text" placeholder="搜索考核名称" />
                    </div>
                    <div className="yanyuan-exam-filter-btn">
                        <Filter size={16} /> 筛选
                    </div>
                </div>

                {/* 二级菜单：分类滚动列表 */}
                <div className="yanyuan-exam-category-scroll">
                    <div className="yanyuan-exam-category-wrapper">
                        {CATEGORIES.map(function (cat) {
                            var isActive = activeCategory === cat;
                            return (
                                <div
                                    key={cat}
                                    className={'yanyuan-exam-category-pill' + (isActive ? ' active' : '')}
                                    onClick={function () { setActiveCategory(cat); }}
                                >
                                    {cat}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="yanyuan-exam-list">
                    {currentList.length > 0 ? currentList.map(function (exam: any) {
                        return (
                            <div key={exam.id} className="yanyuan-exam-card"
                                onClick={function () { emitEvent('on_exam_click', exam.id); }}>
                                <div className="yanyuan-exam-card-header">
                                    <div className="yanyuan-exam-card-name">{exam.name}</div>
                                    <span className={'yanyuan-exam-card-status ' + exam.status}>
                                        {getStatusLabel(exam.status)}
                                    </span>
                                </div>

                                <div className="yanyuan-exam-card-tags">
                                    <span className={'yanyuan-exam-card-tag ' + exam.type}>{exam.typeLabel}</span>
                                </div>

                                {/* 可参加列表显示时间和地点 */}
                                {examTab === 0 && (
                                    <div className="yanyuan-exam-card-info">
                                        <div className="yanyuan-exam-card-info-row">
                                            <Calendar size={13} /> {exam.time_window}
                                        </div>
                                        <div className="yanyuan-exam-card-info-row">
                                            <Clock size={13} /> 时长 {exam.duration}
                                        </div>
                                        <div className="yanyuan-exam-card-info-row">
                                            <MapPin size={13} /> {exam.location}
                                        </div>
                                    </div>
                                )}

                                {/* 记录列表显示成绩 */}
                                {examTab === 1 && (
                                    <React.Fragment>
                                        <div className="yanyuan-exam-score">
                                            <span className={'yanyuan-exam-score-value ' + (exam.pass ? 'pass' : 'fail')}>
                                                {exam.score}分
                                            </span>
                                            <span className={'yanyuan-exam-score-tag ' + (exam.pass ? 'pass' : 'fail')}>
                                                {exam.pass ? '合格' : '不合格'}
                                            </span>
                                        </div>
                                        <div className="yanyuan-exam-card-info">
                                            <div className="yanyuan-exam-card-info-row">
                                                <Calendar size={13} /> 考核日期 {exam.exam_date}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )}

                                <div className="yanyuan-exam-card-footer">
                                    {exam.status === 'open' && (
                                        <button className="yanyuan-exam-card-btn enroll"
                                            onClick={function (e) { e.stopPropagation(); emitEvent('on_enroll', exam.id); }}>
                                            立即报名
                                        </button>
                                    )}
                                    {exam.status === 'enrolled' && (
                                        <button className="yanyuan-exam-card-btn start">开始考试</button>
                                    )}
                                    {exam.status === 'completed' && (
                                        <button className="yanyuan-exam-card-btn result">查看成绩</button>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="yanyuan-exam-empty">
                            <div className="yanyuan-exam-empty-icon">📝</div>
                            <div className="yanyuan-exam-empty-text">暂无相关考核记录</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default Component;
