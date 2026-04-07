/**
 * @name 演艺人才平台 - 考试成绩
 *
 * 参考资料：
 * - /src/docs/中国演艺人才管理与服务平台需求规格说明书.md §5.5.5
 */

import './style.css';
import React, { useImperativeHandle, forwardRef } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, RotateCcw } from 'lucide-react';
import type { KeyDesc, DataDesc, ConfigItem, Action, EventItem, AxureProps, AxureHandle } from '../../common/axure-types';

var EVENT_LIST: EventItem[] = [{ name: 'on_action', desc: '操作按钮点击' }];
var ACTION_LIST: Action[] = [];
var VAR_LIST: KeyDesc[] = [{ name: 'passed', desc: '是否通过' }];
var CONFIG_LIST: ConfigItem[] = [];
var DATA_LIST: DataDesc[] = [];

function navigateTo(path: string) { window.location.href = path; }

var dimensions = [
    { name: '艺德修养', score: 88, max: 100 },
    { name: '法律法规', score: 72, max: 100 },
    { name: '行业规范', score: 80, max: 100 },
    { name: '职业素养', score: 92, max: 100 },
    { name: '社会责任', score: 85, max: 100 }
];

var Component = forwardRef<AxureHandle, AxureProps>(function YanyuanAppExamResult(innerProps, ref) {
    var totalScore = 83;
    var passed = totalScore >= 60;

    useImperativeHandle(ref, function () {
        return {
            getVar: function (n: string) { return n === 'passed' ? passed : undefined; },
            fireAction: function () { },
            eventList: EVENT_LIST, actionList: ACTION_LIST, varList: VAR_LIST, configList: CONFIG_LIST, dataList: DATA_LIST
        };
    }, [passed]);

    return (
        <div className="yaer-container">
            <div className="yaer-scroll">
                <div className="yaer-header">
                    <button className="yaer-back" onClick={function () { navigateTo('/prototypes/yanyuan-app-exam-list'); }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="yaer-header-title">考试成绩</h1>
                    <div style={{ width: 40 }} />
                </div>

                {/* 成绩卡片 */}
                <div className={'yaer-score-card ' + (passed ? 'passed' : 'failed')}>
                    <div className="yaer-score-icon">
                        {passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                    </div>
                    <div className="yaer-score-num">{totalScore}</div>
                    <div className="yaer-score-label">总分</div>
                    <div className={'yaer-score-badge ' + (passed ? 'passed' : 'failed')}>
                        {passed ? '考核通过' : '未通过'}
                    </div>
                    <div className="yaer-score-meta">
                        艺德修养考核（第二季度） · 合格线 60分
                    </div>
                </div>

                {/* 各维度得分 */}
                <div className="yaer-section">
                    <h2 className="yaer-section-title">各维度得分</h2>
                    <div className="yaer-dims">
                        {dimensions.map(function (dim) {
                            var pct = Math.round((dim.score / dim.max) * 100);
                            return (
                                <div key={dim.name} className="yaer-dim-row">
                                    <span className="yaer-dim-name">{dim.name}</span>
                                    <div className="yaer-dim-bar-wrap">
                                        <div className="yaer-dim-bar" style={{ width: pct + '%' }}>
                                            <div className={'yaer-dim-bar-fill' + (pct >= 80 ? ' high' : pct >= 60 ? ' mid' : ' low')} />
                                        </div>
                                    </div>
                                    <span className="yaer-dim-score">{dim.score}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className="yaer-actions">
                    <button className="yaer-action-btn outline" onClick={function () { navigateTo('/prototypes/yanyuan-app-exam-list'); }}>
                        <BookOpen size={18} />
                        <span>查看解析</span>
                    </button>
                    {!passed && (
                        <button className="yaer-action-btn primary" onClick={function () { navigateTo('/prototypes/yanyuan-app-exam-list'); }}>
                            <RotateCcw size={18} />
                            <span>重新报名</span>
                        </button>
                    )}
                    <button className="yaer-action-btn ghost" onClick={function () { navigateTo('/prototypes/yanyuan-app-exam-list'); }}>
                        返回考核列表
                    </button>
                </div>
            </div>
        </div>
    );
});

export default Component;
