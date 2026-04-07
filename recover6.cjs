const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

txt = txt.replace(/\{currentRole === 'user' \? '消息动态' : '待办事项'\}/g, "{currentRole === 'user' ? '消息动态' : '待处理事项'}");

fs.writeFileSync('src/prototypes/yanyuan-app-home/index.tsx', txt);
console.log('recover6 done');
