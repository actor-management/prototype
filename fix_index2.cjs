const fs = require('fs');
const file = 'd:/项目文件/yanyuan/src/prototypes/yanyuan-app-home/index.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/'短视频,/g, "'短视频',");
txt = txt.replace(/'待缴费,/g, "'待缴费',");
txt = txt.replace(/'待审核,/g, "'待审核',");
txt = txt.replace(/'已认证[^']*?,/g, "'已认证',");
txt = txt.replace(/'审核中,/g, "'审核中',");
txt = txt.replace(/'已驳回,/g, "'已驳回',");
txt = txt.replace(/'未认证,/g, "'未认证',");
txt = txt.replace(/'未认证;/g, "'未认证';");

// ensure the authLabel map handles status properly
txt = txt.replace(/return map\[status\] \|\| '未认证;/g, "return map[status] || '未认证';");
txt = txt.replace(/return '未认证;/g, "return '未认证';");
txt = txt.replace(/'鐭棰?,/g, "'短视频',"); // another variant of the corruption
txt = txt.replace(/'鐭棰\?,/g, "'短视频',");

fs.writeFileSync(file, txt);
