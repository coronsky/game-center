// Coron & Moon ゲームセンター：バックアップ・データ引っ越し（全ゲーム共通）
(()=>{
const APP='coron-moon-game-center', PREFIX=/^mc/;
const $=id=>document.getElementById(id);
function collect(){ const d={}; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(PREFIX.test(k)) d[k]=localStorage.getItem(k); } }catch(e){} return d; }
function pack(){ return {app:APP,v:1,date:new Date().toISOString(),data:collect()}; }
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const dec=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/\s+/g,'')))));
function today(){const d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
function summary(data){ const n=Object.keys(data).length; let coins=null; try{ coins=JSON.parse(data.mcgc_p||'{}').coins; }catch(e){}
  return `${n}件の記録`+(coins!=null?`・コイン ${coins}`:''); }
const css=`
.mcb-open{display:block;width:100%;margin-top:12px;border:2px dashed #b98a52;background:rgba(255,250,240,.9);color:#5a3d2b;border-radius:16px;padding:11px;font:inherit;font-weight:900;font-size:14px;cursor:pointer}
.mcb-m{position:fixed;inset:0;z-index:200;background:rgba(20,10,5,.55);display:none;align-items:center;justify-content:center;padding:14px}
.mcb-m.show{display:flex}
.mcb-c{width:100%;max-width:420px;max-height:90vh;overflow:auto;background:#fbf6ec;color:#5a3d2b;border:3px solid #c9a06a;border-radius:22px;padding:18px 16px;font-family:"Zen Maru Gothic",sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.3)}
.mcb-c h3{margin:0 0 6px;text-align:center;font-size:19px;color:#4a6342}
.mcb-c .s{font-size:12px;color:#8d735b;text-align:center;margin-bottom:12px;line-height:1.6}
.mcb-c .sec{background:#fff;border:1.5px solid #ecdcc4;border-radius:14px;padding:10px;margin-bottom:10px}
.mcb-c .sec b{display:block;font-size:14px;margin-bottom:4px}
.mcb-c .sec small{display:block;font-size:11.5px;color:#8d735b;line-height:1.5;margin-bottom:8px}
.mcb-c .row{display:flex;gap:8px}
.mcb-c button{flex:1;border:none;border-radius:14px;padding:10px 6px;font:inherit;font-weight:900;font-size:13.5px;cursor:pointer;background:#56705A;color:#fff}
.mcb-c button.c{background:#efe2cb;color:#5a3d2b}
.mcb-c button.r{background:#c0392b}
.mcb-c textarea{width:100%;height:70px;border:1.5px solid #d9c6a8;border-radius:10px;padding:6px;font-size:11px;font-family:monospace;box-sizing:border-box;margin-bottom:8px;color:#5a3d2b;background:#fffdf8}
.mcb-c .msg{min-height:18px;text-align:center;font-size:12.5px;font-weight:900;color:#4a6342;margin:4px 0}
.mcb-c .msg.err{color:#c0392b}
.mcb-cf{display:none;background:#fff4f1;border:2px solid #e8a79c;border-radius:14px;padding:10px;margin-bottom:10px;font-size:13px;line-height:1.6}
.mcb-cf.show{display:block}`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
const m=document.createElement('div'); m.className='mcb-m'; m.id='mcbM';
m.innerHTML=`<div class="mcb-c">
 <h3>💾 バックアップ・データ引っ越し</h3>
 <div class="s">全部のゲームの記録（コイン・ランク・成績・★・バッジ・設定）をまとめて保存できます。<br>機種変更や、別のスマホ・パソコンへの引っ越しに使えます。</div>
 <div class="mcb-cf" id="mcbCf"></div>
 <div class="sec"><b>① ファイルで保存</b><small>記録をファイルに保存します。新しい端末で「ファイルから読み込む」を押して選びます。</small>
  <div class="row"><button id="mcbSave">⬇️ ファイルに保存</button><button class="c" id="mcbLoad">📂 ファイルから読み込む</button></div></div>
 <div class="sec"><b>② 引っ越しコード</b><small>コードをコピーして、LINEやメモで新しい端末に送り、貼り付けて読み込みます。</small>
  <textarea id="mcbOut" readonly placeholder="「コードを作る」を押してね"></textarea>
  <div class="row"><button id="mcbMake">🔑 コードを作る</button><button class="c" id="mcbCopy">📋 コピー</button></div>
  <textarea id="mcbIn" placeholder="ここに引っ越しコードを貼り付け" style="margin-top:8px"></textarea>
  <div class="row"><button class="c" id="mcbRead">📥 コードを読み込む</button></div></div>
 <div class="msg" id="mcbMsg"></div>
 <div class="row"><button class="c" id="mcbClose">とじる</button></div>
 <input type="file" id="mcbFile" accept=".json,application/json" style="display:none">
</div>`;
document.body.appendChild(m);
const msg=(t,err)=>{const e=$('mcbMsg'); e.textContent=t; e.classList.toggle('err',!!err);};
function open(){ msg(`いまの記録：${summary(collect())}`); $('mcbCf').classList.remove('show'); m.classList.add('show'); }
function close(){ m.classList.remove('show'); }
function ask(obj){ if(!obj||obj.app!==APP||!obj.data){ msg('このファイル・コードは読み込めません',true); return; }
  const cf=$('mcbCf'); const d=new Date(obj.date);
  cf.innerHTML=`<b>この記録で上書きしますか？</b><br>${isNaN(d)?'':d.toLocaleString('ja-JP')+' に保存'}・${summary(obj.data)}<br>いまの記録は消えます。<div class="row" style="margin-top:8px"><button class="r" id="mcbYes">上書きする</button><button class="c" id="mcbNo">やめる</button></div>`;
  cf.classList.add('show');
  $('mcbNo').onclick=()=>{cf.classList.remove('show'); msg('やめました');};
  $('mcbYes').onclick=()=>{ try{ const ks=[]; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); if(PREFIX.test(k)) ks.push(k);} ks.forEach(k=>localStorage.removeItem(k));
      for(const k in obj.data) if(PREFIX.test(k)) localStorage.setItem(k,obj.data[k]); }catch(e){ msg('保存できませんでした（ブラウザの設定を確認してね）',true); return; }
    cf.classList.remove('show'); msg('読み込みました！ページを開き直します…'); setTimeout(()=>location.reload(),900); };
}
$('mcbSave').onclick=()=>{ const blob=new Blob([JSON.stringify(pack(),null,1)],{type:'application/json'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=`coron-moon-backup-${today()}.json`; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000); msg('ファイルを保存しました'); };
$('mcbLoad').onclick=()=>$('mcbFile').click();
$('mcbFile').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ ask(JSON.parse(r.result)); }catch(err){ msg('ファイルが読めませんでした',true); } }; r.readAsText(f); e.target.value=''; };
$('mcbMake').onclick=()=>{ $('mcbOut').value=enc(pack()); msg('コードを作りました。コピーして送ってね'); };
$('mcbCopy').onclick=async()=>{ const t=$('mcbOut'); if(!t.value) t.value=enc(pack()); try{ await navigator.clipboard.writeText(t.value); msg('コピーしました'); }catch(e){ t.select(); msg('コードを長押ししてコピーしてね'); } };
$('mcbRead').onclick=()=>{ const v=$('mcbIn').value.trim(); if(!v){ msg('コードを貼り付けてね',true); return; } try{ ask(dec(v)); }catch(e){ msg('コードが正しくありません',true); } };
$('mcbClose').onclick=close; m.addEventListener('click',e=>{if(e.target===m)close()});
// 各ページの設定画面にボタンを追加
const card=document.querySelector('#mSet .card');
if(card){ const b=document.createElement('button'); b.className='mcb-open'; b.textContent='💾 データのバックアップ・引っ越し'; b.onclick=e=>{e.stopPropagation(); open();}; card.appendChild(b); }
window.MCBackup={open,collect};
})();
