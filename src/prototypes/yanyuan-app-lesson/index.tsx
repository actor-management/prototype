/**
 * @name 演艺人才平台 - 课程学习页
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.5.2
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, Play, Pause, Maximize2, Volume2, List, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_lesson_complete', desc: '课时完成时触发' },
    { name: 'on_quiz_submit', desc: '提交课后习题' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [
    { name: 'playing', desc: '是否正在播放' },
    { name: 'progress', desc: '播放进度百分比' }
];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var chapters = [
    {
        id: 'ch-1', title: '第一章 艺德概论', lessons: [
            { id: 'l-1', title: '1.1 什么是艺德', duration: '15:30', done: true },
            { id: 'l-2', title: '1.2 演员职业道德准则', duration: '20:45', done: true },
            { id: 'l-3', title: '1.3 艺德案例分析', duration: '18:20', done: false, current: true }
        ]
    },
    {
        id: 'ch-2', title: '第二章 行业规范', lessons: [
            { id: 'l-4', title: '2.1 演出行业法律法规', duration: '22:10', done: false },
            { id: 'l-5', title: '2.2 合同与权益保护', duration: '19:30', done: false }
        ]
    }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppLesson(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var playingState = useState(false);
    var playing = playingState[0];
    var setPlaying = playingState[1];
    var showOutlineState = useState(false);
    var showOutline = showOutlineState[0];
    var setShowOutline = showOutlineState[1];
    var progressVal = useState(35);
    var progress = progressVal[0];

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) {
                if (n === 'playing') return playing;
                if (n === 'progress') return progress;
                return undefined;
            },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [playing, progress]);

    return (
        <div className="yals-container">
            {/* 视频播放区 */}
            <div className="yals-video-area">
                <div className="yals-video-placeholder">
                    <button className="yals-play-btn" onClick={function () { setPlaying(function (p) { return !p; }); }}>
                        {playing ? <Pause size={32} /> : <Play size={32} />}
                    </button>
                </div>
                <div className="yals-video-controls">
                    <div className="yals-progress-bar">
                        <div className="yals-progress-fill" style={{ width: progress + '%' }} />
                    </div>
                    <div className="yals-controls-row">
                        <span className="yals-time">05:25 / 18:20</span>
                        <div className="yals-controls-right">
                            <button className="yals-ctrl-btn"><Volume2 size={18} /></button>
                            <select className="yals-speed">
                                <option>1.0x</option>
                                <option>1.25x</option>
                                <option>1.5x</option>
                                <option>2.0x</option>
                            </select>
                            <button className="yals-ctrl-btn"><Maximize2 size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 课时信息 */}
            <div className="yals-scroll">
                <div className="yals-lesson-info">
                    <h1 className="yals-lesson-title">1.3 艺德案例分析</h1>
                    <div className="yals-lesson-meta">
                        <span className="yals-lesson-chapter">第一章 艺德概论</span>
                        <span className="yals-lesson-duration"><Clock size={12} /> 18:20</span>
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="yals-actions">
                    <button className="yals-action-btn outline" onClick={function () { setShowOutline(true); }}>
                        <List size={18} />
                        <span>课程大纲</span>
                    </button>
                    <button className="yals-action-btn primary" onClick={function () { emitEvent('on_lesson_complete'); }}>
                        <span>下一课时</span>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* 课后习题提示 */}
                <div className="yals-quiz-hint">
                    <div className="yals-quiz-hint-icon">📝</div>
                    <div className="yals-quiz-hint-text">
                        <div className="yals-quiz-hint-title">课后习题</div>
                        <div className="yals-quiz-hint-desc">本课时学习完成后会弹出相关习题</div>
                    </div>
                </div>
            </div>

            {/* 课程大纲弹窗 */}
            {showOutline && (
                <div className="yals-outline-mask" onClick={function () { setShowOutline(false); }}>
                    <div className="yals-outline-panel" onClick={function (e) { e.stopPropagation(); }}>
                        <div className="yals-outline-header">
                            <h3>课程大纲</h3>
                            <button onClick={function () { setShowOutline(false); }}>✕</button>
                        </div>
                        <div className="yals-outline-list">
                            {chapters.map(function (ch) {
                                return (
                                    <div key={ch.id} className="yals-outline-chapter">
                                        <div className="yals-outline-ch-title">{ch.title}</div>
                                        {ch.lessons.map(function (l: any) {
                                            return (
                                                <div key={l.id} className={'yals-outline-lesson' + (l.current ? ' current' : '')}>
                                                    {l.done ? <CheckCircle2 size={16} className="yals-outline-done" /> : <Circle size={16} className="yals-outline-pending" />}
                                                    <span className="yals-outline-lesson-title">{l.title}</span>
                                                    <span className="yals-outline-duration">{l.duration}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Component;
