// ===== 設定・カロリー =====
const MET={'クロール':8.3,'平泳ぎ':5.3,'背泳ぎ':4.8,'バタフライ':13.8,'水中ウォーキング(前歩き)':4.5,'水中ウォーキング(後ろ歩き)':4.5,'水中ウォーキング(横歩き)':4.5,'アクアジョギング':9.8,'ビート板キック':6,'水中スクワット':5.3,'水中もも上げ':5.3,'アクアビクス':5.5,'水中ストレッチ':2.5,'自由遊泳':6,
'ランニング(トレッドミル)':8.3,'エアロバイク':6.8,'クロストレーナー':5,'ローイングマシン':7,'バーピー':8,'ジャンピングジャック':7.7,'縄跳び':11.8,'ウォールシット':3.5,'プランク':3.8,'サイドプランク':3.8,'ケトルベルスイング':9.8,'クリーン':6,'スナッチ':6,'ファーマーズウォーク':6,'ジャンプスクワット':8,'マウンテンクライマー':8,
'デッドリフト':6,'バーベルスクワット':6,'フロントスクワット':6,'ベンチプレス':6,'スモウデッドリフト':6,'ルーマニアンデッドリフト':6};
function metOf(e){if(MET[e])return MET[e];const c=catOf(e),p=partOf(e);if(p==='腹')return 2.8;return {自重:3.8,フリーウェイト:5,マシン:3.5,ケーブル:3.5,プール:5}[c]||4}
function hours(s){const u=unitOf(s.ex);return u==='min'||u==='swim'?s.r/60:u==='sec'?s.r/3600:(s.r*3.5+30)/3600}
const bodyW=()=>+(db.prof?.weight)||0;
function kcal(s){const W=bodyW();if(!W)return null;return Math.round(metOf(s.ex)*(W+(unitOf(s.ex)==='bw'?0:0))*hours(s)*10)/10}
function kcalTxt(s){const k=kcal(s);return k==null?'':(k>=10?Math.round(k):k)+'kcal'}
function kcalDay(k){const L=db.logs[k]||[];if(!L.length)return'';if(!bodyW())return `<div class="kday" onclick="event.stopPropagation();settings()">🔥 体重を設定すると消費カロリー（目安）を表示します ›</div>`;const t=L.reduce((a,s)=>a+kcal(s),0);return `<div class="kday">🔥 約 ${Math.round(t)} kcal <small>（目安）</small></div>`}
const gear=()=>`<button class="chatb" onclick="openChat()" aria-label="チャット">💬</button><button class="gear" onclick="settings()" aria-label="設定">⚙️</button>`;
function settings(){const p=db.prof||{};sheet(`<h3>⚙️ プロフィール・設定</h3><div class="form"><label>年齢<input id="pa" type="number" inputmode="numeric" value="${p.age||''}" placeholder="例：35"></label><label>性別<select id="ps">${['','男性','女性','その他'].map(x=>`<option ${x===p.sex?'selected':''}>${x}</option>`).join('')}</select></label><label>身長 (cm)<input id="ph" type="number" inputmode="decimal" value="${p.height||''}" placeholder="例：170"></label><label>体重 (kg)<input id="pw" type="number" inputmode="decimal" value="${p.weight||''}" placeholder="例：65"></label><label>休憩タイマー (秒)<input id="pr" type="number" inputmode="numeric" value="${db.rest||90}"></label></div><button class="big sub" onclick="charaSheet()">🎨 キャラクターの形・色・表示</button><label class="tgl"><input type="checkbox" ${chara().hide?"checked":""} onchange="setChara({hide:this.checked})"> キャラクターを表示しない</label><p class="note">消費カロリーはMET値×体重×時間で計算した目安です。</p><div class="row2"><button class="big sub" onclick="closeS()">閉じる</button><button class="big" onclick="saveProf()">保存</button></div>`)}
function saveProf(){db.prof={age:+$('#pa').value||'',sex:$('#ps').value,height:+$('#ph').value||'',weight:+$('#pw').value||''};db.rest=+$('#pr').value||90;save();closeS();render();say(bodyW()?'保存したよ！カロリーの目安も出せるようになったよ 🔥':'保存したよ！')}
// ===== プラン（今日やるメニュー） =====
function planHtml(){const P=db.plan;if(!P||P.k!==today())return'';const L=db.logs[today()]||[];let all=0,dn=0;
const rows=P.items.map((it,i)=>{const done=Math.min(it.sets,L.filter(s=>s.ex===it.ex&&s.t>=P.t).length);all+=it.sets;dn+=done;return `<div class="pi ${done>=it.sets?'ok':''}"><span onclick="pick('${it.ex}')"><b>${it.ex}</b><small>${it.sets}セット × ${tgt(it)}・休憩${it.rest}秒</small></span><em>${done}/${it.sets}</em><button onclick="planDo(${i})" ${done>=it.sets?'disabled':''}>✓</button></div>`}).join('');
return `<div class="card plan"><h3>📋 ${P.name} <small>${dn}/${all}</small><button class="mini" onclick="db.plan=null;save();render()">終了</button></h3><div class="pbar"><i style="width:${all?dn/all*100:0}%"></i></div>${rows}</div>`}
const tgt=it=>{const u=unitOf(it.ex);return u==='sec'?it.reps+'秒':u==='min'||u==='swim'?it.reps+'分':it.reps+'回'};
function planDo(i){const it=db.plan.items[i];cur=it.ex;db.cur=it.ex;const u=unitOf(it.ex),p=prevOf(it.ex),t=(db.logs[today()]||[]).filter(s=>s.ex===it.ex).at(-1),s=t||p?.sets.at(-1);w=u==='kg'?(s?s.w:w):(s&&u==='bw'?s.w:0);r=it.reps;dd=0;rec.rest=it.rest;rec();
const P=db.plan,L=db.logs[today()];if(P.items.every(x=>L.filter(s=>s.ex===x.ex&&s.t>=P.t).length>=x.sets))setTimeout(()=>say(line('menuDone',{name:P.name}),'happy'),50)}
function startMenu(id){const m=db.menus.find(x=>x.id===id);db.plan={k:today(),t:Date.now(),name:m.name,items:m.items.map(x=>({...x}))};save();go('today');say(line('menuStart',{name:m.name}))}
// ===== メニュー作成 =====
let gen=null,editId=null,mf=null;
const POOL={gym:{chest:['チェストプレス','ベンチプレス','ダンベルプレス'],back:['ラットプルダウン','シーテッドロー','ダンベルロー'],legs:['レッグプレス','バーベルスクワット','ブルガリアンスクワット'],ham:['レッグカール','ルーマニアンデッドリフト','ルーマニアンデッドリフト'],sh:['マシンショルダープレス','ダンベルショルダープレス','ダンベルショルダープレス'],lat:['サイドレイズ','サイドレイズ','サイドレイズ'],bi:['ダンベルカール','ダンベルカール','バーベルカール'],tri:['トライセプスプレスダウン','トライセプスプレスダウン','ライイングトライセプスエクステンション'],glute:['アブダクション','ヒップスラスト','ヒップスラスト'],abs:['アブドミナル','プランク','ハンギングレッグレイズ'],fly:['ペックフライ','ダンベルフライ','インクラインダンベルプレス'],row2:['マシンロー','バーベルロー','バーベルロー'],ext:['レッグエクステンション','レッグエクステンション','レッグエクステンション'],cardio:['エアロバイク','クロストレーナー','ランニング(トレッドミル)']},
home:{chest:['膝つき腕立て伏せ','腕立て伏せ','デクラインプッシュアップ'],back:['バックエクステンション','斜め懸垂','懸垂'],legs:['スクワット','ランジ','ブルガリアンスクワット'],ham:['ヒップリフト','ヒップリフト','ヒップリフト'],sh:['パイクプッシュアップ','パイクプッシュアップ','パイクプッシュアップ'],tri:['ベンチディップス','ベンチディップス','ダイヤモンドプッシュアップ'],glute:['クラムシェル','ドンキーキック','ドンキーキック'],abs:['クランチ','プランク','レッグレイズ'],calf:['カーフレイズ','カーフレイズ','カーフレイズ'],cardio:['ステップアップ','ジャンピングジャック','バーピー']}};
function genMenus(o){const age=+o.age||30,old=age>=60,lv={初心者:0,中級者:1,上級者:2}[o.level]??0;
let g=o.goal,pl=o.place||'ジム';if(g==='自宅だけ'){g='健康維持・体力づくり';pl='自宅'}if(g==='プール中心'){g='健康維持・体力づくり';pl='プール'}
const M=g==='筋肉アップ',D=g==='ダイエット',days=+o.days||2;
let sets=M?[3,4,4][lv]:D?[2,3,3][lv]:2,reps=M?(lv?8:10):D?15:12,rest=M?[90,120,150][lv]:D?[45,30,30][lv]:60,sec=M?[30,45,60][lv]:D?[30,40,45][lv]:[20,30,30][lv];
if(old){sets=Math.min(sets,M?3:2);rest+=30;sec=Math.min(sec,30);reps=Math.max(reps,10)}
const avoid=old?['バーピー','ジャンプスクワット','バーベルスクワット','ルーマニアンデッドリフト','懸垂','ハンギングレッグレイズ','マウンテンクライマー','ジャンピングジャック','デクラインプッシュアップ','ダイヤモンドプッシュアップ']:[];
const tag=M?'筋力UP':D?'脂肪燃焼':'健康';
const it=(e,s=sets,rp,rs=rest)=>{if(avoid.includes(e))e={バーピー:'スクワット',ジャンプスクワット:'スクワット',バーベルスクワット:'レッグプレス',ルーマニアンデッドリフト:'レッグカール',懸垂:'ラットプルダウン',ハンギングレッグレイズ:'クランチ',マウンテンクライマー:'ヒップリフト',ジャンピングジャック:'ステップアップ',デクラインプッシュアップ:'腕立て伏せ',ダイヤモンドプッシュアップ:'腕立て伏せ'}[e]||e;const u=unitOf(e);return{ex:e,sets:u==='min'||u==='swim'?1:s,reps:rp??(u==='sec'?sec:u==='min'||u==='swim'?15:(u==='bw'&&D?reps+5:reps)),rest:rs}};
const L=(a,b,c)=>[a,b,c][lv];
const out=[];
if(pl==='プール'){const sw=lv?'クロール':'平泳ぎ',P=(e,m,s=1,r=60)=>({ex:avoid.includes(e)?'水中ウォーキング(前歩き)':e,sets:s,reps:m,rest:r});
if(D){out.push({name:'プール 脂肪燃焼',items:[P('水中ウォーキング(前歩き)',10),P('アクアジョギング',L(10,15,20)),P(sw,L(10,15,20)),P('水中もも上げ',10),P('ビート板キック',10),P('水中ストレッチ',5)]},{name:'プール インターバル',items:[P('水中ウォーキング(前歩き)',5),P('アクアジョギング',3,L(3,4,5),30),P('水中もも上げ',2,L(3,4,5),30),P(sw,10),P('水中ストレッチ',5)]})}
else if(M){out.push({name:'プール 筋力UP（水の抵抗）',items:[P('水中ウォーキング(前歩き)',5),P('水中スクワット',3,L(3,3,4),60),P('水中もも上げ',3,L(3,3,4),60),P('ビート板キック',3,3,60),P(lv>1?'バタフライ':sw,L(2,3,4),3,90),P('水中ストレッチ',5)]},{name:'プール スイム強化',items:[P('水中ウォーキング(前歩き)',5),P('クロール',L(3,4,5),3,90),P('平泳ぎ',L(2,3,3),3,90),P('背泳ぎ',2,3,60),P('水中ストレッチ',5)]})}
else{out.push({name:'プール 健康ウォーク',items:[P('水中ウォーキング(前歩き)',10),P('水中ウォーキング(後ろ歩き)',5),P('水中ウォーキング(横歩き)',5),P('水中もも上げ',5),P('水中スクワット',5),P('水中ストレッチ',5)]},{name:'プール 体力づくり',items:[P('水中ウォーキング(前歩き)',10),P('アクアジョギング',L(5,10,10)),P(sw,L(10,15,20)),P('アクアビクス',10),P('水中ストレッチ',5)]})}
return out}
const dd=a=>a.map(m=>{const s=new Set();m.items=m.items.filter(x=>!s.has(x.ex)&&s.add(x.ex));return m});
if(pl==='自宅'){
if(D){out.push({name:'自宅 脂肪燃焼サーキット',items:[it('スクワット',sets,20,20),it('ジャンピングジャック',sets,30,20),it(lv?'腕立て伏せ':'膝つき腕立て伏せ',sets,12,20),it('マウンテンクライマー',sets,20,20),it('ランジ',sets,16,20),lv?it('バーピー',sets,10,20):it('ワイドスクワット',sets,20,20),it('プランク',sets,undefined,30)]},{name:'自宅 下半身＋有酸素',items:[it('ワイドスクワット'),it('ヒップリフト'),it('ランジ'),it('カーフレイズ',sets,20),it('ステップアップ',sets,30,30),it('ジャンピングジャック',sets,40,30)]})}
else if(M){const ch=L('腕立て伏せ','デクラインプッシュアップ','ダイヤモンドプッシュアップ');if(days<=2)out.push({name:'自宅 筋力UP 全身',items:[it('ブルガリアンスクワット'),it(ch),it(L('斜め懸垂','斜め懸垂','懸垂')),it('パイクプッシュアップ'),it('ヒップリフト'),it('レッグレイズ')]});
out.push({name:'自宅 筋力UP 上半身',items:[it(ch),it('ワイドプッシュアップ'),it(L('斜め懸垂','懸垂','懸垂')),it(L('パイクプッシュアップ','パイクプッシュアップ','逆立ち腕立て伏せ')),it('ベンチディップス'),it('スーパーマン')]},{name:'自宅 筋力UP 下半身',items:[it('ブルガリアンスクワット'),it(lv?'ジャンプスクワット':'スクワット'),it('ヒップリフト'),it('ランジ'),it('カーフレイズ',sets,20),it('レッグレイズ')]})}
else{out.push({name:'自宅 健康 全身',items:[it('スクワット'),it(lv?'腕立て伏せ':'膝つき腕立て伏せ'),it('バックエクステンション'),it('ヒップリフト'),it('プランク'),it('ステップアップ',1,20)]},{name:'自宅 健康 下半身＋体幹',items:[it('スクワット'),it('ワイドスクワット'),it('ヒップリフト'),it('クラムシェル'),it('カーフレイズ'),it('クランチ')]})}
return dd(out)}
// ジム
const card=(m)=>({ex:L('エアロバイク','クロストレーナー','ランニング(トレッドミル)'),sets:1,reps:m,rest:60});
if(M){out.push({name:'ジム 筋力UP 全身',items:[it(L('レッグプレス','バーベルスクワット','バーベルスクワット')),it(L('チェストプレス','ベンチプレス','ベンチプレス')),it(L('ラットプルダウン','ラットプルダウン','デッドリフト')),it(L('マシンショルダープレス','ダンベルショルダープレス','ダンベルショルダープレス')),it('シーテッドロー'),it(L('アブドミナル','ハンギングレッグレイズ','ハンギングレッグレイズ'))]});
if(days>=4&&lv)out.push({name:'3分割① 胸・肩・三頭',items:[it('ベンチプレス'),it('インクラインダンベルプレス'),it('ダンベルショルダープレス'),it('サイドレイズ'),it('トライセプスプレスダウン')]},{name:'3分割② 背中・二頭',items:[it('デッドリフト'),it('ラットプルダウン'),it('バーベルロー'),it('フェイスプル'),it('ダンベルカール')]},{name:'3分割③ 脚・お尻・腹',items:[it('バーベルスクワット'),it('ルーマニアンデッドリフト'),it('レッグエクステンション'),it('ヒップスラスト'),it('ハンギングレッグレイズ')]});
else if(days>=2)out.push({name:'ジム 筋力UP 上半身',items:[it(L('チェストプレス','ベンチプレス','ベンチプレス')),it('ラットプルダウン'),it('シーテッドロー'),it(L('マシンショルダープレス','ダンベルショルダープレス','ダンベルショルダープレス')),it('ダンベルカール'),it('トライセプスプレスダウン')]},{name:'ジム 筋力UP 下半身',items:[it(L('レッグプレス','バーベルスクワット','バーベルスクワット')),it('レッグカール'),it('レッグエクステンション'),it('ヒップスラスト'),it('カーフレイズマシン'),it('アブドミナル')]})}
else if(D){out.push({name:'ジム 脂肪燃焼サーキット',items:[it('レッグプレス',sets,15,30),it('チェストプレス',sets,15,30),it('ラットプルダウン',sets,15,30),it('アダクション',sets,15,30),it('シーテッドロー',sets,15,30),it('アブドミナル',sets,20,30),card(L(15,20,25))]},{name:'ジム 有酸素＋下半身',items:[card(10),it('レッグプレス'),it('レッグカール'),it('アブダクション'),it('カーフレイズマシン'),card(L(15,20,25))]})}
else{out.push({name:'ジム 健康 全身',items:[it('レッグプレス'),it('チェストプレス'),it('ラットプルダウン'),it('シーテッドロー'),it('アブドミナル'),card(15)]});if(days>=2)out.push({name:'ジム 健康 下半身＋有酸素',items:[it('レッグプレス'),it('レッグカール'),it('アダクション'),it('アブダクション'),card(20)]})}
return out}
const SEL=(id,arr,v)=>`<select id="${id}">${arr.map(x=>`<option ${String(x)===String(v)?'selected':''}>${x}</option>`).join('')}</select>`;
function menuView(){$('#hdr').innerHTML=gear()+'メニュー<small>目的に合わせて自動作成・編集できます</small>';db.menus=db.menus||[];
if(editId){const m=db.menus.find(x=>x.id===editId);if(m)return menuEdit(m);editId=null}
const p=db.prof||{};mf=mf||{goal:'筋肉アップ',place:'ジム',level:'初心者',days:2};if(mf.goal==='自宅だけ'){mf.goal='健康維持・体力づくり';mf.place='自宅'}if(mf.goal==='プール中心'){mf.goal='健康維持・体力づくり';mf.place='プール'}
$('#view').innerHTML=`<div class="card"><h3>✨ メニューを作る</h3><div class="form">
<label>目的${SEL('mg',['筋肉アップ','ダイエット','健康維持・体力づくり'],mf.goal)}</label><label>場所${SEL('mp',['ジム','自宅','プール'],mf.place)}</label>
<label>経験${SEL('ml',['初心者','中級者','上級者'],mf.level)}</label>
<label>週の回数${SEL('md',[1,2,3,4,5,6],mf.days)}</label>
<label>年齢<input id="ma" type="number" inputmode="numeric" value="${p.age||''}" placeholder="例：35"></label>
<label>性別${SEL('mx',['','男性','女性','その他'],p.sex||'')}</label></div>
<button class="big" onclick="doGen()">メニューを作成</button><p class="note">※ 一般的な目安です。医療的なアドバイスではありません。持病・ケガがある方や体調に不安がある方は医師に相談し、痛みを感じたら中止してください。</p></div>
${gen?`<h3>おすすめメニュー（${gen.length}件）</h3>`+gen.map((m,i)=>`<div class="card">${menuCard(m)}<div class="row2"><button class="big sub" onclick="saveGen(${i},1)">保存して編集</button><button class="big" onclick="saveGen(${i})">保存</button></div></div>`).join(''):''}
<h3>保存したメニュー</h3>${db.menus.length?db.menus.map(m=>`<div class="card">${menuCard(m)}<div class="row2"><button class="big sub" onclick="editId='${m.id}';render()">✏️ 編集</button><button class="big" onclick="startMenu('${m.id}')">▶ このメニューで始める</button></div></div>`).join(''):'<div class="empty">まだありません。上で作成するか、空のメニューから作れます。</div>'}
<button class="big sub" onclick="newMenu()">＋ 空のメニューを作る</button>`}
function menuCard(m){return `<h3>${m.name}</h3>${m.items.map(x=>`<div class="mi"><i class="dot" style="background:${PARTS[partOf(x.ex)]}"></i>${x.ex}<small>${x.sets}×${tgt(x)}</small></div>`).join('')}`}
function doGen(){mf={goal:$('#mg').value,place:$('#mp').value,level:$('#ml').value,days:$('#md').value};db.prof={...(db.prof||{}),age:+$('#ma').value||db.prof?.age||'',sex:$('#mx').value};save();gen=genMenus({...mf,age:db.prof.age});render();say(`${gen.length}つ作ったよ！気に入ったら保存してね ✨`)}
const uid=()=>Math.random().toString(36).slice(2,9);
function saveGen(i,ed){const m={...gen[i],id:uid(),items:gen[i].items.map(x=>({...x}))};db.menus.push(m);save();if(ed)editId=m.id;render();if(!ed)say('保存したよ！')}
function newMenu(){const m={id:uid(),name:'マイメニュー',items:[]};db.menus.push(m);save();editId=m.id;render()}
function menuEdit(m){edM=m;
$('#view').innerHTML=`<div class="card"><label class="form">メニュー名<input value="${m.name}" onchange="edM.name=this.value.replace(/[<>&\x27\x22]/g,'');save()"></label></div>
${m.items.map((x,i)=>`<div class="card ei"><div class="eh"><b>${i+1}. ${x.ex}</b><span><button onclick="mvIt(${i},-1)" ${i?'':'disabled'}>↑</button><button onclick="mvIt(${i},1)" ${i<m.items.length-1?'':'disabled'}>↓</button><button onclick="swapIt(${i})">🔁</button><button onclick="rmIt(${i})">🗑️</button></span></div>
<div class="ec">${sm(i,'sets','セット',1)}${sm(i,'reps',{sec:'秒',min:'分',swim:'分'}[unitOf(x.ex)]||'回',unitOf(x.ex)==='sec'?5:1)}${sm(i,'rest','休憩秒',15)}</div></div>`).join('')}
<button class="big sub" onclick="swapIt(-1)">＋ 種目を追加</button>
<div class="row2"><button class="big sub" onclick="if(confirm('このメニューを削除しますか？')){db.menus=db.menus.filter(x=>x.id!=='${m.id}');editId=null;save();render()}">削除</button><button class="big sub" onclick="editId=null;render()">完了</button></div>
<button class="big" onclick="startMenu('${m.id}')">▶ このメニューで始める</button>`;edM=m}
let edM=null;
const sm=(i,k,l,st)=>`<div class="sm"><small>${l}</small><div><button onclick="chIt(${i},'${k}',-${st})">−</button><b>${edM0(i,k)}</b><button onclick="chIt(${i},'${k}',${st})">＋</button></div></div>`;
const edM0=(i,k)=>db.menus.find(x=>x.id===editId).items[i][k];
function chIt(i,k,d){const it=edM.items[i];it[k]=Math.max(k==='rest'?0:1,it[k]+d);save();render()}
function mvIt(i,d){const a=edM.items;[a[i],a[i+d]]=[a[i+d],a[i]];save();render()}
function rmIt(i){edM.items.splice(i,1);save();render()}
function swapIt(i){swapI=i;sheet(`<h3>${i<0?'種目を追加':'種目を入れ替え'}</h3><input id="sq" type="search" placeholder="🔍 検索（例：プレス、プール）" oninput="swl()"><div id="swl" class="swl"></div><button class="big sub" onclick="closeS()">キャンセル</button>`);swl()}
let swapI=-1;
function swl(){const q=($('#sq')?.value||'').trim();$('#swl').innerHTML=db.ex.filter(e=>!q||e.includes(q)||partOf(e).includes(q)||catOf(e).includes(q)).slice(0,80).map(e=>`<button class="chip" onclick="swapTo('${e}')"><i class="dot" style="background:${PARTS[partOf(e)]};display:inline-block;margin-right:6px"></i>${e}</button>`).join('')}
function swapTo(e){const u=unitOf(e),rp=u==='sec'?30:u==='min'||u==='swim'?10:10;if(swapI<0)edM.items.push({ex:e,sets:u==='min'||u==='swim'?1:3,reps:rp,rest:60});else{const it=edM.items[swapI];it.ex=e;it.reps=rp;if(u==='min'||u==='swim')it.sets=1}save();closeS();render()}
