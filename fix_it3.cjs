const fs = require('fs');
const file = 'src/prototypes/yanyuan-app-home/index.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/initialValue: '寮犳槑杩\? \},/, "initialValue: '寮犳槑杩?' },");
txt = txt.replace(/desc: '灏侀潰鍥\? \},/, "desc: '灏侀潰鍥?' },");
txt = txt.replace(/鍔¤繘搴︺€\?\}/, "鍔¤繘搴︺€?'}");
txt = txt.replace(/瀵笺€\?\/p>/, "瀵笺€?</p>");
txt = txt.replace(/鍔涖€\?\/p>/, "鍔涖€?</p>");

fs.writeFileSync(file, txt);
