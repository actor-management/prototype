/**
 * @name 演艺人才平台 - 学习中心
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.5.1
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
    Home, ShieldCheck, Award, GraduationCap, User, Search, Filter,
    ClipboardCheck, Settings, Lock, ChevronRight, BookOpen, FileCheck2, LayoutList, CheckCircle2, Film
} from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var CATEGORIES = ['全部', '艺德培训', '表演技能', '法规政策', '声乐培训', '形体训练', '心理健康'];

var EVENT_LIST: EventItem[] = [
    { name: 'on_course_click', desc: '点击课程' },
    { name: 'on_tab_change', desc: '切换底部Tab' },
    { name: 'on_auth_guide_click', desc: '点击去认证引导' },
    { name: 'on_admin_entry_click', desc: '点击Admin管理入口' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'current_tab', desc: '当前Tab' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

// 示例课程数据
var myCourses = [
    { id: 'c1', title: '艺德修养培训（第三期）', category: '艺德培训', cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', progress: 65, total_lessons: 12, completed_lessons: 8, is_required: true, enrolled: true },
    { id: 'c2', title: '表演基础技巧提升课', category: '表演技能', cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&q=80', progress: 30, total_lessons: 8, completed_lessons: 2, is_required: true, enrolled: true },
    { id: 'c3', title: '影视行业法律法规解读', category: '法规政策', cover: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&q=80', progress: 100, total_lessons: 6, completed_lessons: 6, is_required: false, enrolled: true }
];

var allCourses = [
    { id: 'c4', title: '声乐基础与发声训练', category: '声乐培训', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80', progress: 0, total_lessons: 10, completed_lessons: 0, is_required: false, enrolled: false, is_public: true },
    { id: 'c5', title: '舞台形体与肢体表达', category: '形体训练', cover: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&q=80', progress: 0, total_lessons: 8, completed_lessons: 0, is_required: false, enrolled: false, is_public: false },
    { id: 'c6', title: '行业规范与自律准则普及', category: '法规政策', cover: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=300&q=80', progress: 0, total_lessons: 5, completed_lessons: 0, is_required: false, enrolled: false, is_public: true }
];

// Admin待办卡
var adminTodos = [
    { id: 't1', title: '发现 15 份考卷等待人工批阅', time: '10分钟前' },
    { id: 't2', title: '《艺德修养第三期》新增 20 人报名', time: '1小时前' }
];

function navigateTo(path: string) { window.location.href = path; }

function getRoleConfig(role: string) {
    if (role === 'admin') {
        return {
            pageTitle: '培训考核管理', activeTab: 4,
            tabs: [
                { label: '首页', icon: Home, path: '/prototypes/yanyuan-app-home' },
                { label: '短视频', icon: Film, path: '' },
                { label: '管理', icon: Settings, path: '/prototypes/yanyuan-app-admin' },
                { label: '证书', icon: Award, path: '/prototypes/yanyuan-app-certificate' },
                { label: '学习', icon: GraduationCap, path: '/prototypes/yanyuan-app-training' },
                { label: '我的', icon: User, path: '/prototypes/yanyuan-app-profile' }
            ]
        };
    } else if (role === 'user') {
        return {
            pageTitle: '学习大厅', activeTab: 4,
            tabs: [
                { label: '首页', icon: Home, path: '/prototypes/yanyuan-app-home' },
                { label: '短视频', icon: Film, path: '' },
                { label: '实名', icon: ShieldCheck, path: '/prototypes/yanyuan-app-certification' },
                { label: '证书', icon: Award, path: '/prototypes/yanyuan-app-certificate' },
                { label: '学习', icon: GraduationCap, path: '/prototypes/yanyuan-app-training' },
                { label: '我的', icon: User, path: '/prototypes/yanyuan-app-profile' }
            ]
        };
    }
    // actor
    return {
        pageTitle: '学习中心', activeTab: 4,
        tabs: [
            { label: '首页', icon: Home, path: '/prototypes/yanyuan-app-home' },
            { label: '短视频', icon: Film, path: '' },
            { label: '认证', icon: ShieldCheck, path: '/prototypes/yanyuan-app-certification' },
            { label: '证书', icon: Award, path: '/prototypes/yanyuan-app-certificate' },
            { label: '学习', icon: GraduationCap, path: '/prototypes/yanyuan-app-training' },
            { label: '我的', icon: User, path: '/prototypes/yanyuan-app-profile' }
        ]
    };
}

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanTraining(innerProps: AxureProps, ref: React.Ref<AxureHandle>) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    var role = 'actor';
    try { role = localStorage.getItem('yanyuan_role') || 'actor'; } catch (e) { /* */ }
    var config = getRoleConfig(role);

    var tabState = useState<number>(config.activeTab);
    var currentTab = tabState[0];
    var setCurrentTab = tabState[1];

    var courseTabState = useState<number>(0);
    var courseTab = courseTabState[0];
    var setCourseTab = courseTabState[1];

    var categoryState = useState<string>('全部');
    var activeCategory = categoryState[0];
    var setActiveCategory = categoryState[1];

    // 学情统计(Actor)
    var completedCount = myCourses.filter(function (c) { return c.progress >= 100; }).length;
    var totalCount = myCourses.length;
    var overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    var radius = 29, circumference = 2 * Math.PI * radius, dashOffset = circumference - (overallProgress / 100) * circumference;

    var emitEvent = useCallback(function (name: string, payload?: string) {
        try { onEventHandler(name, payload); } catch (e) { console.warn(e); }
    }, [onEventHandler]);

    var handleTabChange = useCallback(function (i: number, path: string) {
        if (i !== config.activeTab && path) {
            emitEvent('on_tab_change', String(i));
            navigateTo(path);
            return;
        }
        setCurrentTab(i);
    }, [emitEvent, config.activeTab]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'current_tab' ? currentTab : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST,
            configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [currentTab]);

    // 渲染课程卡片
    var renderCourseCard = function (course: any) {
        return (
            <div key={course.id} className="yanyuan-train-course" onClick={function () { emitEvent('on_course_click', course.id); }}>
                <img src={course.cover} alt={course.title} className="yanyuan-train-course-thumb" />
                <div className="yanyuan-train-course-info">
                    <div className="yanyuan-train-course-name">{course.title}</div>
                    <div className="yanyuan-train-course-tags">
                        {role !== 'user' && (course.is_required ?
                            <span className="yanyuan-train-course-tag required">必修</span> :
                            <span className="yanyuan-train-course-tag">选修</span>
                        )}
                        {role === 'user' && course.is_public && <span className="yanyuan-train-course-tag public">公开普及</span>}
                        <span className="yanyuan-train-course-tag">{course.category}</span>
                    </div>

                    {(course.enrolled && role === 'actor') ? (
                        <React.Fragment>
                            <div className="yanyuan-train-course-bar-wrap">
                                <div className="yanyuan-train-course-bar" style={{ width: course.progress + '%' }} />
                            </div>
                            <div className="yanyuan-train-course-bottom">
                                <span className="yanyuan-train-course-progress">
                                    {course.completed_lessons}/{course.total_lessons} 课时 · {course.progress}%
                                </span>
                                <button className={'yanyuan-train-course-btn ' + (course.progress >= 100 ? 'enroll' : 'continue')}>
                                    {course.progress >= 100 ? '已完成' : '继续学习'}
                                </button>
                            </div>
                        </React.Fragment>
                    ) : (
                        <div className="yanyuan-train-course-bottom" style={{ marginTop: 'auto' }}>
                            <span className="yanyuan-train-course-progress">{course.total_lessons} 课时</span>
                            <button className={role === 'user' ? 'yanyuan-train-course-btn view-btn' : 'yanyuan-train-course-btn enroll'}>
                                {role === 'user' ? '免登录试看' : '立即报名'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    var renderAdminView = function () {
        return (
            <React.Fragment>
                <div className="yanyuan-train-admin-stats">
                    <div className="yanyuan-train-admin-stat-card">
                        <div className="stat-num">4</div><div className="stat-label">进行中课程</div>
                    </div>
                    <div className="yanyuan-train-admin-stat-card">
                        <div className="stat-num">1,250</div><div className="stat-label">今日活跃人数</div>
                    </div>
                    <div className="yanyuan-train-admin-stat-card pending">
                        <div className="stat-num">15</div><div className="stat-label">待批阅试卷</div>
                    </div>
                </div>

                <div className="yanyuan-train-section-title">管理工具操作</div>
                <div className="yanyuan-train-admin-grid">
                    <div className="admin-grid-item" onClick={() => { navigateTo('/prototypes/yanyuan-app-training-admin'); emitEvent('on_admin_entry_click', '培训考核台'); }}>
                        <div className="admin-grid-icon blue"><BookOpen size={24} /></div>
                        <div className="admin-grid-label">培训考务管理</div>
                    </div>
                    <div className="admin-grid-item" onClick={() => emitEvent('on_admin_entry_click', '题库维护')}>
                        <div className="admin-grid-icon purple"><LayoutList size={24} /></div>
                        <div className="admin-grid-label">题库查卷维护</div>
                    </div>
                    <div className="admin-grid-item" onClick={() => navigateTo('/prototypes/yanyuan-app-training-admin')}>
                        <div className="admin-grid-icon red"><FileCheck2 size={24} /></div>
                        <div className="admin-grid-label">试卷人工批阅</div>
                        <div className="admin-grid-badge">15</div>
                    </div>
                </div>

                <div className="yanyuan-train-section-title" style={{ marginTop: '20px' }}>近期待办提醒</div>
                <div className="yanyuan-train-notices">
                    {adminTodos.map(todo => (
                        <div key={todo.id} className="yanyuan-train-notice-item">
                            <div className="notice-icon"><CheckCircle2 size={16} /></div>
                            <div className="notice-content">
                                <div className="notice-title">{todo.title}</div>
                                <div className="notice-time">{todo.time}</div>
                            </div>
                            <ChevronRight size={16} className="notice-arrow" />
                        </div>
                    ))}
                </div>
            </React.Fragment>
        );
    };

    var renderActorUserView = function () {
        var currentCourses = courseTab === 0 ? myCourses : allCourses;
        if (role === 'user') currentCourses = allCourses.filter(c => c.is_public);
        if (activeCategory !== '全部') {
            currentCourses = currentCourses.filter(c => c.category === activeCategory);
        }

        return (
            <React.Fragment>
                {role === 'user' && (
                    <div className="yanyuan-train-user-banner" onClick={() => emitEvent('on_auth_guide_click')}>
                        <Lock size={18} className="banner-icon" />
                        <div className="banner-text">完成演员认证即可解锁全部专属专业培训，点击去认证</div>
                        <ChevronRight size={16} className="banner-arrow" />
                    </div>
                )}

                {role === 'actor' && (
                    <div className="yanyuan-train-progress-card">
                        <div className="yanyuan-train-ring-wrap">
                            <svg viewBox="0 0 66 66">
                                <circle className="yanyuan-train-ring-bg" cx="33" cy="33" r={radius} />
                                <circle className="yanyuan-train-ring-bar" cx="33" cy="33" r={radius}
                                    strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                            </svg>
                            <span className="yanyuan-train-ring-text">{completedCount}/{totalCount}</span>
                        </div>
                        <div className="yanyuan-train-progress-info">
                            <div className="yanyuan-train-progress-title">我的学习进度</div>
                            <div className="yanyuan-train-progress-sub">已完成 {completedCount} 门课程，继续加油！</div>
                        </div>
                    </div>
                )}

                {role === 'actor' ? (
                    <div className="yanyuan-train-tabs">
                        <div className={'yanyuan-train-tab' + (courseTab === 0 ? ' active' : '')} onClick={() => { setCourseTab(0); setActiveCategory('全部'); }}>我的课程</div>
                        <div className={'yanyuan-train-tab' + (courseTab === 1 ? ' active' : '')} onClick={() => { setCourseTab(1); setActiveCategory('全部'); }}>推荐课程</div>
                    </div>
                ) : (
                    <div className="yanyuan-train-tabs" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <div className="yanyuan-train-tab active">面对社会公开试听课程</div>
                    </div>
                )}

                <div className="yanyuan-train-toolbar">
                    <div className="yanyuan-train-search"><Search size={16} /><input type="text" placeholder="搜索课程名称" /></div>
                    <div className="yanyuan-train-filter-btn"><Filter size={16} /> 筛选</div>
                </div>

                <div className="yanyuan-train-category-scroll">
                    <div className="yanyuan-train-category-wrapper">
                        {CATEGORIES.map(cat => (
                            <div key={cat} className={'yanyuan-train-category-pill' + (activeCategory === cat ? ' active' : '')}
                                onClick={() => setActiveCategory(cat)}>
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="yanyuan-train-list">
                    {currentCourses.length > 0 ? currentCourses.map(renderCourseCard) : (
                        <div className="yanyuan-train-empty">
                            <div className="yanyuan-train-empty-icon">📚</div>
                            <div className="yanyuan-train-empty-text">暂无课程</div>
                        </div>
                    )}
                </div>
            </React.Fragment>
        );
    };

    return (
        <div className="yanyuan-train-container">
            <div className="yanyuan-train-scroll">
                <div className="yanyuan-train-header">{config.pageTitle}</div>
                {role === 'admin' ? renderAdminView() : renderActorUserView()}
            </div>
            <div className="yanyuan-train-tab-bar">
                {config.tabs.map(function (tab, index) {
                    var Icon = tab.icon;
                    return (
                        <div key={tab.label}
                            className={'yanyuan-train-tab-item' + (currentTab === index ? ' active' : '')}
                            onClick={() => handleTabChange(index, tab.path)}>
                            <div className="yanyuan-train-tab-icon"><Icon size={22} /></div>
                            <div className="yanyuan-train-tab-label">{tab.label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default Component;
