const fs = require('fs');
let file = 'd:/项目文件/yanyuan/src/prototypes/yanyuan-app-home/index.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/var VAR_LIST: KeyDesc\[\] = \[\s*\{[^\[]*?\];/s, `var VAR_LIST: KeyDesc[] = [
  { name: 'current_tab', desc: 'tab' },
  { name: 'todo_count', desc: 'count' },
  { name: 'current_role', desc: 'role' }
];

var CONFIG_LIST: ConfigItem[] = [
  { type: 'input', attributeId: 'user_name', displayName: 'username', info: 'username', initialValue: 'Zhang' },
  { type: 'input', attributeId: 'user_avatar', displayName: 'avatar', info: 'avatar', initialValue: '' },
  { type: 'select', attributeId: 'auth_status', displayName: 'auth', info: 'auth', initialValue: 'authenticated' }
];`);

text = text.replace(/\{ name: 'cover_image', desc: '[^']*?' \},/s, `{ name: 'cover_image', desc: 'cover' },`);
text = text.replace(/'灏侀封面[^']*?'/s, `'cover'`);
text = text.replace(/'褰撳墠閫変腑Tab[^']*?'/s, `'tab'`);

fs.writeFileSync(file, text);
