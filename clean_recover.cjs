const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index_recovered.tsx', 'utf8');

const dict = {
    "移动端首?": "移动端首页",
    "中国演艺人才与服务平台": "中国演艺人才管理与服务平台",
    "中国演艺人才管理与服务平?": "中国演艺人才管理与服务平台",
    "审批": "审批管理",
    "系统设?": "系统设置",
    "֤": "认证",
    "待?": "待办",
    "ѵ": "培训",
    "相关快捷入口": "考核相关快捷入口",
    "待办较?": "待办较少",
    "数据统?": "数据统计",
    "检?": "检索",
    "用户?": "用户名",
    "显示的用户姓?": "显示的用户姓名",
    "张明?": "张明远",
    "封面?": "封面图",
    "李管?": "李管理",
    "王观?": "王观钰",
    "管理?": "管理员",
    "普通用?": "普通用户",
    "（3笔?": "（3笔）",
    "（12项?": "（12项）",
    "（5项?": "（5项）",
    "?300.00?": "（¥300.00）",
    "即将开?": "即将开班",
    "即将到?": "即将到期",
    "报名中?": "报名中", // maybe "报名?" -> "报名中" but we must be careful with ?
    "报名正式启?": "报名正式启动",
    "未知的动?": "未知的动作",
    "欢迎回?": "欢迎回来",
    "解锁更多功?": "解锁更多功能",
    "去认?": "去认证",
    "去审?": "去审批",
    "查看详?": "查看详情",
    "去处?": "去处理",
    "剩? ": "剩余 ",
    " 天?": " 天",
    "待处?": "待处理",
    "已处?": "已处理",
    "已过?": "已过期",
    "指导?</p>": "指导。</p>",
    "作品?</p>": "作品。</p>",
    "正能量?</p>": "正能量。</p>",
    "能力?</p>": "能力。</p>",
    "֪ͨ": "通知"
};

for (const [k, v] of Object.entries(dict)) {
    txt = txt.split(k).join(v);
}

// Target specific question marks manually
txt = txt.replace(/待办为缴费\/培训\/类/g, "待办为缴费/培训/考核类");
txt = txt.replace(/待办为审核类待\?/g, "待办为审核类待办");
txt = txt.replace(/底部标\?Tab/g, "底部标准Tab");
txt = txt.replace(/（证书验证、人才检索、学习中心、红黑榜）/g, "（证书验证、人才检索、学习中心、红黑榜）");
txt = txt.replace(/报名\?'/g, "报名中'");
txt = txt.replace(/也就是\?'/g, "也就是'");

// Special: replace `` with `管理`, because that utf8 character was completely missing
// Actually the character might literally be '' in the string or just omitted. We will just leave omitted ones if they are not caught.

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('Fixed recovered index.tsx');
