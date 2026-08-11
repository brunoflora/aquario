const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||'/home/user/bmf/aquario-ciclideos/index.html','utf8');

function parseBlock(re){
  const m=src.match(re); if(!m) return {};
  const out={};
  m[1].replace(/(--[\w-]+)\s*:\s*([^;]+);/g,(_,k,v)=>{out[k.trim()]=v.trim();});
  return out;
}
const light=parseBlock(/:root\s*\{([\s\S]*?)\n  \}/);
const dark=parseBlock(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n  \}/);

function toRGB(c){
  c=c.trim();
  let m=c.match(/^#([0-9a-f]{6})$/i);
  if(m){const n=parseInt(m[1],16);return[n>>16&255,n>>8&255,n&255,1];}
  m=c.match(/^#([0-9a-f]{3})$/i);
  if(m){const h=m[1];return[parseInt(h[0]+h[0],16),parseInt(h[1]+h[1],16),parseInt(h[2]+h[2],16),1];}
  m=c.match(/rgba?\(([^)]+)\)/);
  if(m){const p=m[1].split(',').map(s=>parseFloat(s));return[p[0],p[1],p[2],p[3]===undefined?1:p[3]];}
  return null;
}
function over(fg,bg){ // composite fg (with alpha) over opaque bg
  const a=fg[3];
  return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a),1];
}
function lum(c){
  const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
  return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);
}
function ratio(a,b){const L1=lum(a),L2=lum(b);return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);}

// pares que a UI realmente usa: [nome, tokenFg, tokenBgOpaco, tokenBgSoftOpcional, tipo]
const PAIRS=[
 ['corpo sobre surface','--text','--surface',null,'text'],
 ['corpo sobre bg','--text','--bg',null,'text'],
 ['corpo sobre surface-2','--text','--surface-2',null,'text'],
 ['muted sobre surface','--text-muted','--surface',null,'text'],
 ['muted sobre bg','--text-muted','--bg',null,'text'],
 ['muted sobre surface-2','--text-muted','--surface-2',null,'text'],
 ['accent sobre surface','--accent','--surface',null,'text'],
 ['accent sobre bg','--accent','--bg',null,'text'],
 ['accent sobre accent-soft','--accent','--accent-soft','--surface','text'],
 ['good sobre good-soft','--good','--good-soft','--surface','text'],
 ['warn sobre warn-soft','--warn','--warn-soft','--surface','text'],
 ['bad sobre bad-soft','--bad','--bad-soft','--surface','text'],
 ['good sobre surface','--good','--surface',null,'text'],
 ['warn sobre surface','--warn','--surface',null,'text'],
 ['bad sobre surface','--bad','--surface',null,'text'],
 ['surface sobre accent (botao primario)','--surface','--accent',null,'text'],
 ['field-border sobre surface (LIMITE DE CAMPO)','--field-border','--surface',null,'ui'],
 ['field-border sobre surface-2','--field-border','--surface-2',null,'ui'],
 ['outline sobre surface (chip/botao)','--outline','--surface',null,'ui'],
 ['outline-variant sobre surface (divisoria decorativa)','--outline-variant','--surface',null,'deco'],
 ['accent sobre surface (foco/barra)','--accent','--surface',null,'ui'],
];

function audit(name,vars){
  console.log('\n===== '+name+' =====');
  let fails=0;
  for(const [label,fgK,bgK,baseK,kind] of PAIRS){
    const bgRaw=toRGB(vars[bgK]); if(!bgRaw){console.log('  ?? '+label+' (token ausente)');continue;}
    const base=baseK?toRGB(vars[baseK]):null;
    const bg=bgRaw[3]<1?over(bgRaw, base||toRGB(vars['--surface'])):bgRaw;
    let fg=toRGB(vars[fgK]); if(!fg){console.log('  ?? '+label);continue;}
    if(fg[3]<1) fg=over(fg,bg);
    const r=ratio(fg,bg);
    if(kind==='deco'){const rr=ratio(fg,bg);console.log('  INFO  '+rr.toFixed(2)+':1  (decorativa — isenta de 1.4.11)  '+label);continue;}
    const need=kind==='ui'?3:4.5;
    const ok=r>=need;
    if(!ok)fails++;
    console.log('  '+(ok?'PASS':'FAIL')+'  '+r.toFixed(2)+':1  (min '+need+')  '+label);
  }
  console.log('  --> '+fails+' reprovacoes');
  return fails;
}
const f1=audit('LIGHT',light);
const f2=audit('DARK',dark);
console.log('\nTOTAL REPROVACOES: '+(f1+f2));
