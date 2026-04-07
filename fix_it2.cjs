const fs = require('fs');
const file = 'src/prototypes/yanyuan-app-home/index.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/鑳\?\/div>/g, "鑳?</div>");
txt = txt.replace(/璇\?\/button>/g, "璇?</button>");
txt = txt.replace(/'鍘诲鎵\?/g, "'鍘诲鎵?'");
txt = txt.replace(/'鍘诲鐞\?}/g, "'鍘诲鐞?'}");
txt = txt.replace(/鍙\?\/p>/g, "鍙?</p>");

fs.writeFileSync(file, txt);
