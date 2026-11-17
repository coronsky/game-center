const {E,solveAny}=require('./engine.js'); const fs=require('fs');
const [,, g, optJ, maxSeed, want]=process.argv; const o=JSON.parse(optJ); const out=[];
for(let seed=1;seed<=+maxSeed&&out.length<+want;seed++){ const s=E[g].init(seed,o); const r=solveAny(E[g],s,120000);
  if(r.ok){ out.push([seed,r.nodes]); } }
fs.writeFileSync('/tmp/pool_'+process.argv[5+1]+'.json',JSON.stringify(out));
console.log(process.argv[6],out.length);
