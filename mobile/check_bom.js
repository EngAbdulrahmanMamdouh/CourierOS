const fs = require('fs');
const buf = fs.readFileSync('package.json');
console.log('len', buf.length);
console.log('bytes', buf.slice(0,4).toJSON().data);
console.log('stringStart', buf.slice(0,4).toString('utf8'));
