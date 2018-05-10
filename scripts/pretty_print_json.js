let fs = require('fs');
let path = process.argv[2];

let json_string = fs.readFileSync(path,'utf8');
let parsed = JSON.parse(json_string);

json_string = JSON.stringify(parsed,null,2);
console.log(json_string);