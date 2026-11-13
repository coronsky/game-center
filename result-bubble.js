// 結果ダイアログ：ひとりで遊んだとき、コロンかムーンが1人だけ出て、吹き出しでひとこと。
// 各ゲームの showResult(o) の最後で window.soloAvatar(o) を呼ぶ。対戦（winner が 1/2）のときは何もしない。
(function(){
  // 1つのセリフ＝2行以内（1行10文字前後）。行ごとに改行し、行の途中では折り返さない。
  const CLEAR=[
    ['おめでとう！','ゴールしたよ！'],['やったね！','ナイスプレイ！'],['すごーい！','じょうずだね！'],['ゴール！','おめでとう！'],
    ['いいちょうし！','つぎもがんばろう！'],['ナイス！','さすがだね！'],['やったー！','クリアだよ！'],['えらい！','よくがんばったね！'],
    ['おみごと！','ぱちぱちぱち！'],['できたね！','かっこいい！'],['さすが！','つよいね！'],['いいね！','かんぺきだよ！'],
    ['くりあ！','おめでとう！'],['じょうず！','なかなかやるね！'],['やったね！','ムーンもびっくり！'],['やったね！','コロンもびっくり！'],
    ['ばんざーい！','よくできました！'],['ひらめいたね！','あたまいいね！'],['かんたんかな？','すごいすごい！'],['ごうかく！','はなまるだよ！'],
    ['きもちいい！','すっきりしたね！'],['たのしかった！','またあそぼうね！'],['いいしょうぶ！','おつかれさま！'],['ナイスファイト！','おめでとう！'],
    ['すてき！','かがやいてるよ！'],['やるじゃん！','おめでとう！'],['がんばったね！','えらいえらい！'],['じぶんをほめよう！','よくやったね！'],
    ['わーい！','みんなでよろこぼう！'],['クリアおめでとう！','つぎもたのしみ！'],['ばっちり！','いいかんじ！'],['ベストをつくしたね！','かっこいいよ！'],
    ['ぐっじょぶ！','たいしたものだね！'],['ふふっ、やったね！','うれしいな！'],['じゅんちょう！','このちょうし！'],['てがはやいね！','あっぱれ！'],
    ['しんけんだったね！','かんどうしたよ！'],['ひとやすみしよう！','よくがんばった！'],['もういっかい？','まだまだいけるよ！'],['ごほうびだよ！','おいしいおやつを！']
  ];
  const PERFECT=[
    ['パーフェクト！','かんぺきおめでとう！'],['すごーい！','ぜんぶゲットだね！'],['さいこう！','かんぺきだよ！'],['かんぺき！','おめでとう！'],
    ['やったー！','★３つだよ！'],['てんさい！','ぱちぱちぱち！'],['かんぺきすぎる！','かっこいい！'],['おめでとう！','ごうかくだよ！'],
    ['ぴかぴか★★★','まぶしいよ！'],['はなまる！','だいせいこう！'],['ミラクル！','いうことなし！'],['ぜんぶとれたね！','すごすぎる！'],
    ['まんてん！','おめでとう！'],['おみごと！','パーフェクトだよ！'],['さいきょう！','チャンピオンだね！'],['ブラボー！','かんどうしたよ！'],
    ['すばらしい！','かんぺきだね！'],['よくできました！','はなまるあげる！'],['きらきら★★★','ごほうびだよ！'],['かんぺきな','プレイだったよ！'],
    ['きょうは','さいこうのひだね！'],['ムーンも','おおよろこび！'],['コロンも','おおよろこび！'],['ほしがいっぱい！','おめでとう！'],
    ['ひゃくてん！','まんてんだよ！'],['うでまえ','プロきゅうだね！'],['やったね！','パーフェクトだ！'],['しびれたよ！','かっこよすぎる！'],
    ['ぜんぶ','ねらいどおり！'],['ほんとに','すごいよ！']
  ];
  const SORRY=[
    ['どんまい！','つぎはいけるよ！'],['だいじょうぶ！','もういっかい！'],['おしかった〜！','あとすこしだよ！'],['あきらめないで！','きっとできるよ！'],
    ['ざんねん…','でもいいちょうし！'],['まだまだ！','つぎでとりかえそう！'],['ドンマイ！','つぎもがんばろう！'],['ちょっと','きゅうけいしよう！'],
    ['つぎは','きっとうまくいくよ！'],['しっぱいは','せいこうのもと！'],['いまのは','れんしゅうだよ！'],['ふぅ…むずかしいね','でもたのしいね！'],
    ['ゆっくり','かんがえてみよう！'],['ヒントを','つかってもいいよ！'],['たいせつなのは','たのしむこと！'],['なんどでも','ちょうせんしよう！'],
    ['あとちょっと！','おしかったね！'],['いきをすって','もういちど！'],['きにしない！','つぎがあるよ！'],['ころんでも','またたてるよ！'],
    ['コロンが','おうえんしてるよ！'],['ムーンが','おうえんしてるよ！'],['きっと','コツがつかめるよ！'],['ひらめきは','ふいにくるよ！'],
    ['すこしずつ','うまくなってるよ！'],['ちからを','ぬいてみよう！'],['のこりは','あしたのたのしみ！'],['わたしたちは','いつでもみかただよ！'],
    ['もういっかいで','ぜったいいける！'],['おやつをたべて','きぶんてんかん！']
  ];
  const DRAW=[
    ['ひきわけ！','いいしょうぶだったね！'],['なかよし','ひきわけだね！'],['どっちも','よくがんばった！'],['こんどは','かてるかな？'],
    ['いいしょうぶ！','またやろうね！'],['おたがい','ナイスプレイ！']
  ];
  const SORRY_RE=/ざんねん|残念|失敗|しっぱい|じかん(ぎれ|切れ)|時間切れ|おしい|ゲームオーバー|もう一回|もういっかい|まけ|負け|あきらめ|タイムアップ|ミス|届かな|とどかな|ならなかった/;
  const DRAW_RE=/ステイルメイト|引き分け|ひきわけ|キングだけ|ドロー/;

  function pick(list,key){
    let last=-1;try{last=+sessionStorage.getItem('rb_'+key)}catch(e){}
    let i;do{i=Math.random()*list.length|0}while(i===last&&list.length>1);
    try{sessionStorage.setItem('rb_'+key,i)}catch(e){}
    return list[i];
  }
  // CSS（各ゲームの .result .avs に重ねる）
  const st=document.createElement('style');
  st.textContent=
   '.result .avs.solo-on>:not(.solo-wrap){display:none!important}'+
   '.result .avs.solo-on{display:flex!important;justify-content:center;align-items:center;gap:16px;margin:6px 0 10px}'+
   '.result .avs .solo-wrap{display:flex;align-items:center;gap:14px}'+
   '.result .avs .solo-wrap .solo{text-align:center;font-weight:900;font-size:14px;flex:0 0 auto}'+
   '.result .avs .solo-wrap .ph{width:80px;height:80px;border-radius:50%;background-size:cover;background-position:center;border:4px solid #f0c35a;box-shadow:0 4px 10px rgba(0,0,0,.18);margin:0 auto 4px}'+
   '.result .avs .solo-wrap .solo.sad .ph{border-color:#9aa;filter:grayscale(.35)}'+
   '.result .avs .solo-wrap .bub2{position:relative;background:#fff;border:3px solid #f0c35a;border-radius:16px;padding:8px 12px;font-weight:900;font-size:15px;line-height:1.35;color:#5b3a14;text-align:left;box-shadow:0 3px 8px rgba(0,0,0,.15);animation:rbIn .4s ease-out}'+
   '.result .avs .solo-wrap .bub2.sad{border-color:#8a8fa8;color:#33364a}'+
   '.result .avs .solo-wrap .bub2 span{display:block;white-space:nowrap}'+
   '.result .avs .solo-wrap .bub2:before{content:"";position:absolute;left:-12px;top:50%;margin-top:-8px;border:8px solid transparent;border-right:12px solid #f0c35a;border-left:0}'+
   '.result .avs .solo-wrap .bub2.sad:before{border-right-color:#8a8fa8}'+
   '.result .avs .solo-wrap .bub2:after{content:"";position:absolute;left:-7px;top:50%;margin-top:-6px;border:6px solid transparent;border-right:9px solid #fff;border-left:0}'+
   '@keyframes rbIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}';
  document.head.appendChild(st);

  window.soloAvatar=function(o){
    const av=document.querySelector('#mRes .avs')||document.querySelector('.result .avs');
    if(!av)return false;
    const old=av.querySelector('.solo-wrap');if(old)old.remove();
    av.classList.remove('solo-on');
    if(getComputedStyle(av).display==='none')return false;   // このゲームは丸写真を出さない
    if(o&&o.winner)return false;                       // 対戦・勝者あり → 従来どおり
    const text=String(o&&o.title||'')+' '+String(o&&o.msg||'')+' '+String(o&&o.score||'');
    let kind='clear',list=CLEAR;
    if(DRAW_RE.test(text)){kind='draw';list=DRAW}
    else if(SORRY_RE.test(text)){kind='sorry';list=SORRY}
    else if(/★★★/.test(String(o&&o.msg||''))){kind='perfect';list=PERFECT}
    const who=Math.random()<.5?'colon':'moon',nm=who==='colon'?'コロン':'ムーン',lines=pick(list,kind);
    const sad=kind==='sorry';
    const w=document.createElement('div');w.className='solo-wrap';
    w.innerHTML='<div class="solo'+(sad?' sad':'')+'"><div class="ph" style="background-image:var(--'+who+')"></div>'+nm+'</div><div class="bub2'+(sad?' sad':'')+'">'+lines.map(t=>'<span>'+t+'</span>').join('')+'</div>';
    av.appendChild(w);av.classList.add('solo-on');
    return true;
  };
})();
