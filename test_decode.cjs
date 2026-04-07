const iconv = require('iconv-lite');
const fs = require('fs');
let txt = fs.readFileSync('src/prototypes/yanyuan-app-home/index.tsx', 'utf8');

// Try taking a line and recovering it
let sample = txt.split('\n').find(l => l.includes('鐢ㄦ埛鍚'));
console.log('Original:', sample);
let recovered = iconv.decode(iconv.encode(sample, 'gbk'), 'utf8');
console.log('Recovered:', recovered);
