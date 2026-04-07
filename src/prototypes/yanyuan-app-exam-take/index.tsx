/**
 * @name 演艺人才平台 - 在线考试
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.5.4
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Clock, Grid3X3, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [
    { name: 'on_submit', desc: '交卷' },
    { name: 'on_answer', desc: '选择答案' }
];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [
    { name: 'current_index', desc: '当前题号' },
    { name: 'remaining_time', desc: '剩余时间（秒）' }
];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var questions = [
    {
        id: 1, type: '单选', stem: '以下哪项不属于演员职业道德的基本要求？', options: [
            { label: 'A', content: '敬业爱岗，精益求精' },
            { label: 'B', content: '遵纪守法，诚实守信' },
            { label: 'C', content: '追求流量，博取眼球' },
            { label: 'D', content: '服务人民，奉献社会' }
        ]
    },
    {
        id: 2, type: '单选', stem: '演员在公开场合发表言论应遵循的首要原则是什么？', options: [
            { label: 'A', content: '追求热度和话题性' },
            { label: 'B', content: '社会主义核心价值观' },
            { label: 'C', content: '个人表达自由至上' },
            { label: 'D', content: '迎合粉丝需求' }
        ]
    },
    {
        id: 3, type: '判断', stem: '演员因个人原因中途退出已签约的演出项目，不需要承担任何法律责任。', options: [
            { label: 'A', content: '正确' },
            { label: 'B', content: '错误' }
        ]
    },
    {
        id: 4, type: '单选', stem: '《营业性演出管理条例》规定，演出经纪机构应当自领取营业执照之日起多少日内，向所在地省级文化部门申请备案？', options: [
            { label: 'A', content: '10日' },
            { label: 'B', content: '20日' },
            { label: 'C', content: '30日' },
            { label: 'D', content: '60日' }
        ]
    },
    {
        id: 5, type: '多选', stem: '以下属于演员合法权益的有哪些？（多选）', options: [
            { label: 'A', content: '获得约定报酬的权利' },
            { label: 'B', content: '署名权' },
            { label: 'C', content: '拒绝危险表演的权利' },
            { label: 'D', content: '单方面修改演出合同的权利' }
        ]
    }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppExamTake(innerProps, ref) {
    var onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };
    var indexState = useState(0);
    var currentIndex = indexState[0];
    var setCurrentIndex = indexState[1];
    var answersState = useState<Record<number, string[]>>({});
    var answers = answersState[0];
    var setAnswers = answersState[1];
    var showCardState = useState(false);
    var showCard = showCardState[0];
    var setShowCard = showCardState[1];
    var showConfirmState = useState(false);
    var showConfirm = showConfirmState[0];
    var setShowConfirm = showConfirmState[1];

    var emitEvent = useCallback(function (n: string, p?: string) {
        try { onEventHandler(n, p); } catch (e) { /* */ }
    }, [onEventHandler]);

    var q = questions[currentIndex];
    var isMultiple = q.type === '多选';

    var handleSelectOption = useCallback(function (label: string) {
        setAnswers(function (prev) {
            var qid = questions[currentIndex].id;
            if (isMultiple) {
                var existing = prev[qid] || [];
                var idx = existing.indexOf(label);
                if (idx >= 0) {
                    var next = existing.slice();
                    next.splice(idx, 1);
                    return Object.assign({}, prev, { [qid]: next });
                }
                return Object.assign({}, prev, { [qid]: existing.concat([label]) });
            }
            return Object.assign({}, prev, { [qid]: [label] });
        });
        emitEvent('on_answer', label);
    }, [currentIndex, isMultiple, emitEvent]);

    var answeredCount = Object.keys(answers).length;

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) {
                if (n === 'current_index') return currentIndex;
                if (n === 'remaining_time') return 2580;
                return undefined;
            },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [currentIndex]);

    return (
        <div className="yaet-container">
            {/* 顶部信息栏 */}
            <div className="yaet-top-bar">
                <div className="yaet-exam-name">艺德修养考核（第二季度）</div>
                <div className="yaet-timer">
                    <Clock size={14} />
                    <span>43:00</span>
                </div>
            </div>

            {/* 题目区 */}
            <div className="yaet-scroll">
                <div className="yaet-question">
                    <div className="yaet-q-header">
                        <span className="yaet-q-num">第 {currentIndex + 1} 题</span>
                        <span className="yaet-q-type">{q.type}</span>
                    </div>
                    <div className="yaet-q-stem">{q.stem}</div>
                    <div className="yaet-q-options">
                        {q.options.map(function (opt) {
                            var selected = (answers[q.id] || []).indexOf(opt.label) >= 0;
                            return (
                                <div
                                    key={opt.label}
                                    className={'yaet-option' + (selected ? ' selected' : '')}
                                    onClick={function () { handleSelectOption(opt.label); }}
                                >
                                    <span className={'yaet-option-label' + (selected ? ' selected' : '')}>{opt.label}</span>
                                    <span className="yaet-option-content">{opt.content}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 底部操作栏 */}
            <div className="yaet-bottom-bar">
                <button
                    className="yaet-nav-btn"
                    disabled={currentIndex === 0}
                    onClick={function () { setCurrentIndex(function (i) { return Math.max(0, i - 1); }); }}
                >
                    <ChevronLeft size={18} /> 上一题
                </button>
                <button className="yaet-card-btn" onClick={function () { setShowCard(true); }}>
                    <Grid3X3 size={18} />
                    <span>{answeredCount}/{questions.length}</span>
                </button>
                {currentIndex < questions.length - 1 ? (
                    <button className="yaet-nav-btn primary" onClick={function () { setCurrentIndex(function (i) { return Math.min(questions.length - 1, i + 1); }); }}>
                        下一题 <ChevronRight size={18} />
                    </button>
                ) : (
                    <button className="yaet-nav-btn submit" onClick={function () { setShowConfirm(true); }}>
                        <Send size={16} /> 交卷
                    </button>
                )}
            </div>

            {/* 答题卡弹窗 */}
            {showCard && (
                <div className="yaet-card-mask" onClick={function () { setShowCard(false); }}>
                    <div className="yaet-card-panel" onClick={function (e) { e.stopPropagation(); }}>
                        <div className="yaet-card-header">
                            <h3>答题卡</h3>
                            <span>已答 {answeredCount}/{questions.length}</span>
                        </div>
                        <div className="yaet-card-grid">
                            {questions.map(function (item, i) {
                                var answered = !!answers[item.id];
                                return (
                                    <div
                                        key={item.id}
                                        className={'yaet-card-cell' + (answered ? ' done' : '') + (i === currentIndex ? ' current' : '')}
                                        onClick={function () { setCurrentIndex(i); setShowCard(false); }}
                                    >
                                        {i + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 交卷确认弹窗 */}
            {showConfirm && (
                <div className="yaet-card-mask" onClick={function () { setShowConfirm(false); }}>
                    <div className="yaet-confirm-panel" onClick={function (e) { e.stopPropagation(); }}>
                        <h3>确认交卷？</h3>
                        <p>已答 {answeredCount}/{questions.length} 题，{questions.length - answeredCount > 0 ? '还有 ' + (questions.length - answeredCount) + ' 题未作答。' : '全部已作答。'}</p>
                        <div className="yaet-confirm-btns">
                            <button className="yaet-confirm-cancel" onClick={function () { setShowConfirm(false); }}>继续答题</button>
                            <button className="yaet-confirm-ok" onClick={function () { emitEvent('on_submit'); navigateTo('/prototypes/yanyuan-app-exam-result'); }}>确认交卷</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Component;
