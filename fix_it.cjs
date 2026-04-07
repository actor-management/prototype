const fs = require('fs');
const file = 'src/prototypes/yanyuan-app-home/index.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Remove duplicate CONFIG_LIST with garbled text
txt = txt.replace(/var CONFIG_LIST: ConfigItem\[\] = \[\s*\{\s*type: 'input', attributeId: 'user_name'[\s\S]*?\];/s, '');

// 2. Fix unclosed quotes in role map
txt = txt.replace(/([a-z]+): ('[^'\r\n]+)\?,/g, "$1: $2?',");
txt = txt.replace(/([a-z]+): ('[^'\r\n]+)\? \};/g, "$1: $2?' };");

// 3. Fix unclosed quotes in getAuthLabel
txt = txt.replace(/none: '未认证\s*(\r?\n)/g, "none: '未认证'$1");

// 4. Fix unclosed quotes in getDaysRemaining
txt = txt.replace(/return '宸茶繃鏈\?;/g, "return '宸茶繃鏈?';");
txt = txt.replace(/return '鍓╀綑 ' \+ diff \+ ' 澶\?;/g, "return '鍓╀綑 ' + diff + ' 澶?';");

// 5. Fix missing closing tags
txt = txt.replace(/銆\?\/p>/g, "銆?</p>");
txt = txt.replace(/\?\/span>/g, "?</span>");
txt = txt.replace(/瀵兼潈<\/p>/g, "瀵兼潈</p>");

// Write back
fs.writeFileSync(file, txt);
console.log('Fixed file');
