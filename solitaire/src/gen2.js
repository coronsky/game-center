const {E,solveAny}=require('./engine.js'); const fs=require('fs');
const [,, g, optJ, from, to, tag]=process.argv; const o=JSON.parse(optJ); const out=[];
for(let seed=+from;seed<=+to;seed++){ const r=solveAny(E[g],E[g].init(seed,o),60000); if(r.ok){ out.push([seed,r.nodes]); fs.writeFileSync('/tmp/part_'+tag+'.json',JSON.stringify(out)); } }
fs.writeFileSync('/tmp/part_'+tag+'.json',JSON.stringify(out)); console.log('done',tag,out.length);
