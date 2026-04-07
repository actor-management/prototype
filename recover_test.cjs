const fs = require('fs');
const iconv = require('iconv-lite');
const file = 'src/prototypes/yanyuan-app-home/index.tsx';
let txt = fs.readFileSync(file, 'utf8');

// The file currently has UTF-8 bytes that represent GBK sequences.
// Let's encode back to GBK and see what happens to question marks
// Note: actually the question marks were inserted by my string replacement
// Let's first read the file, run iconv
let recovered = iconv.decode(iconv.encode(txt, 'gbk'), 'utf8');

fs.writeFileSync('src/prototypes/yanyuan-app-home/index_recovered.tsx', recovered);
console.log('Written to index_recovered.tsx');
